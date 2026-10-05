// Extracts candidate expiry dates from OCR text. Pure function, no network.

export interface DateCandidate {
    date: Date;
    score: number;
    raw: string;
}

const MONTHS: Record<string, number> = {};
const addMonths = (names: string[][]) =>
    names.forEach((list, i) => list.forEach((n) => (MONTHS[n] = i)));

addMonths([
    ['jan', 'january', 'gen', 'gennaio', 'ene', 'enero', 'janv', 'janvier', 'januar', 'jan.', 'janeiro', 'januari', 'sty', 'styczen'],
    ['feb', 'february', 'febbraio', 'febrero', 'fev', 'fevr', 'fevrier', 'februar', 'fevereiro', 'februari', 'lut', 'luty'],
    ['mar', 'march', 'marzo', 'mars', 'marz', 'mrz', 'marco', 'maart', 'maa', 'marzec'],
    ['apr', 'april', 'aprile', 'abr', 'abril', 'avr', 'avril', 'kwi', 'kwiecien'],
    ['may', 'mag', 'maggio', 'mayo', 'mai', 'mei', 'maj'],
    ['jun', 'june', 'giu', 'giugno', 'junio', 'juin', 'juni', 'junho', 'cze', 'czerwiec'],
    ['jul', 'july', 'lug', 'luglio', 'julio', 'juil', 'juillet', 'juli', 'julho', 'lip', 'lipiec'],
    ['aug', 'august', 'ago', 'agosto', 'aout', 'augustus', 'sie', 'sierpien'],
    ['sep', 'sept', 'september', 'set', 'settembre', 'septiembre', 'septembre', 'setembro', 'wrz', 'wrzesien'],
    ['oct', 'october', 'ott', 'ottobre', 'octubre', 'octobre', 'okt', 'oktober', 'out', 'outubro', 'paz', 'pazdziernik'],
    ['nov', 'november', 'novembre', 'noviembre', 'novembro', 'lis', 'listopad'],
    ['dec', 'december', 'dic', 'dicembre', 'diciembre', 'decembre', 'dez', 'dezember', 'dezembro', 'gru', 'grudzien'],
]);

// Month names sorted longest first so "sept" wins over "sep"
const MONTH_ALT = Object.keys(MONTHS)
    .map((n) => n.replace('.', '\\.'))
    .sort((a, b) => b.length - a.length)
    .join('|');
const WORD_DATE_SOURCE = `(\\d{1,2})?\\s*\\b(${MONTH_ALT})\\b\\.?\\s*(\\d{1,2}(?:\\s*,\\s*|\\s+))?(\\d{4}|\\d{2})(?!\\d)`;

const EXPIRY_HINTS = [
    'exp', 'best before', 'bb', 'bbe', 'use by', 'best by', 'sell by',
    'scad', 'consumarsi', 'entro', 'tmc', 'cad', 'consumir', 'consumo preferente',
    'dlc', 'ddm', 'dluo', 'a consommer', 'mhd', 'mindestens', 'haltbar', 'verbrauchen',
    'val', 'validade', 'consumir ate', 'tht', 'tgt', 'houdbaar', 'spozyc', 'najlepiej', 'termin',
    '賞味', '消費', '유통', '소비',
];
const PRODUCTION_HINTS = ['prod', 'pack', 'lot', 'fabbr', 'confez', 'elab', 'herg', 'fab', '製造', '제조'];

const fold = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').normalize('NFC');

// Fix common OCR confusions next to digits (O->0, I/l->1, S->5)
const cleanDigits = (s: string) =>
    s
        .replace(/(\d)[oO]/g, '$10')
        .replace(/[oO](\d)/g, '0$1')
        .replace(/(\d)[Il|]/g, '$11')
        .replace(/[Il|](\d)/g, '1$1');

const fullYear = (y: number) => (y < 100 ? 2000 + y : y);

const makeDate = (y: number, m: number, d: number | null): Date | null => {
    const year = fullYear(y);
    if (year < 2000 || year > 2100 || m < 0 || m > 11) return null;
    // Month-only dates mean "end of month"
    const day = d ?? new Date(year, m + 1, 0).getDate();
    if (day < 1 || day > 31) return null;
    const date = new Date(year, m, day, 12);
    return date.getMonth() === m ? date : null;
};

export const parseExpiryDates = (text: string, monthFirst = false): DateCandidate[] => {
    const lines = cleanDigits(text).split(/\n+/);
    const found: DateCandidate[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    lines.forEach((line, idx) => {
        const context = fold(`${lines[idx - 1] ?? ''} ${line}`);
        const hasExpiry = EXPIRY_HINTS.some((h) => context.includes(h));
        const hasProduction = PRODUCTION_HINTS.some((h) => context.includes(h));
        const l = fold(line);

        const push = (date: Date | null, raw: string, base: number) => {
            if (!date) return;
            let score = base;
            if (hasExpiry) score += 5;
            if (hasProduction && !hasExpiry) score -= 4;
            const diffDays = (date.getTime() - today.getTime()) / 86400000;
            if (diffDays < -60 || diffDays > 365 * 6) return;
            if (diffDays >= -1 && diffDays <= 365 * 3) score += 2;
            found.push({ date, score, raw });
        };

        let m: RegExpExecArray | null;

        // yyyy-mm-dd / yyyy.mm.dd / yyyy年m月d日 / yyyy년 m월 d일
        const isoRe = /(20\d{2})\s*[-./年년]\s*(\d{1,2})\s*[-./月월]\s*(\d{1,2})/g;
        while ((m = isoRe.exec(l))) push(makeDate(+m[1], +m[2] - 1, +m[3]), m[0], 3);

        // dd/mm/yyyy, dd.mm.yy, dd-mm-yy (or mm/dd for US locales)
        const dmyRe = /(?:^|[^\d])(\d{1,2})\s?[-./]\s?(\d{1,2})\s?[-./]\s?(\d{4}|\d{2})(?!\d)/g;
        while ((m = dmyRe.exec(l))) {
            const a = +m[1];
            const b = +m[2];
            const y = +m[3];
            const [day, month] = monthFirst && a <= 12 ? [b, a] : [a, b];
            push(makeDate(y, month - 1, day), m[0].trim(), 3);
            // Ambiguous: also offer the swapped reading with lower score
            if (a <= 12 && b <= 12 && a !== b) push(makeDate(y, (monthFirst ? b : a) - 1, monthFirst ? a : b), m[0].trim(), 0);
        }

        // dd MMM yyyy / dd MMM yy / MMM dd yyyy / MMM yyyy
        const wordRe = new RegExp(WORD_DATE_SOURCE, 'g');
        while ((m = wordRe.exec(l))) {
            const month = MONTHS[m[2]];
            if (month === undefined) continue;
            const day = m[1] ? +m[1] : m[3] ? parseInt(m[3], 10) : null;
            push(makeDate(+m[4], month, day), m[0].trim(), 2);
        }

        // mm/yyyy or mm.yy (no day)
        const myRe = /(?:^|[^\d./-])(\d{1,2})\s?[./-]\s?(20\d{2}|\d{2})(?![\d./-])/g;
        while ((m = myRe.exec(l))) {
            const month = +m[1];
            if (month >= 1 && month <= 12) push(makeDate(+m[2], month - 1, null), m[0].trim(), 1);
        }
    });

    // Dedupe by day, keep the best score
    const byDay = new Map<string, DateCandidate>();
    for (const c of found) {
        const key = c.date.toDateString();
        const prev = byDay.get(key);
        if (!prev || c.score > prev.score) byDay.set(key, c);
    }
    return [...byDay.values()].sort((a, b) => b.score - a.score || a.date.getTime() - b.date.getTime());
};
