import { mergeDateReadings, parseExpiryDates } from '../utils/ocrDate';
import { NOW } from './helpers';

beforeEach(() => jest.useFakeTimers({ now: NOW }));
afterEach(() => jest.useRealTimers());

const best = (text: string, monthFirst = false) => {
    const c = parseExpiryDates(text, monthFirst)[0];
    return c ? `${c.date.getFullYear()}-${String(c.date.getMonth() + 1).padStart(2, '0')}-${String(c.date.getDate()).padStart(2, '0')}` : null;
};

describe('reading expiry dates from package text', () => {
    it.each([
        ['Da consumarsi preferibilmente entro il 12/05/2027', '2027-05-12'],
        ['SCAD. 12.05.27', '2027-05-12'],
        ['EXP 2027-05-12', '2027-05-12'],
        ['BEST BEFORE 12 MAY 2027', '2027-05-12'],
        ['Consumir preferentemente antes del 3 ene 2027', '2027-01-03'],
        ['À consommer de préférence avant le 15 févr. 2027', '2027-02-15'],
        ['mindestens haltbar bis 30.11.2026', '2026-11-30'],
        ['Ten minste houdbaar tot 01-12-2026', '2026-12-01'],
        ['Najlepiej spożyć przed 07.01.2027', '2027-01-07'],
        ['Consumir de preferência antes de 09/03/2027', '2027-03-09'],
        ['賞味期限 2027.05.12', '2027-05-12'],
        ['賞味期限 2027年5月12日', '2027-05-12'],
        ['유통기한 2027.05.12까지', '2027-05-12'],
        ['소비기한 2027년 5월 12일', '2027-05-12'],
    ])('%s', (text, expected) => {
        expect(best(text)).toBe(expected);
    });

    it('month-only dates mean the end of that month', () => {
        expect(best('Best before end 02/2027')).toBe('2027-02-28');
        expect(best('TMC 11.2026')).toBe('2026-11-30');
    });

    it('prefers the expiry date over the production date', () => {
        expect(best('PROD 01/09/2026\nEXP 01/03/2027')).toBe('2027-03-01');
        expect(best('LOT L2609 FABBR. 15.09.2026 SCAD. 15.12.2026')).toBe('2026-12-15');
    });

    it('US devices read month first', () => {
        expect(best('EXP 05/12/2027', true)).toBe('2027-05-12');
        expect(best('EXP 05/12/2027', false)).toBe('2027-12-05');
    });

    it('fixes OCR lookalike characters inside numbers but not inside words', () => {
        expect(best('SCAD 12.O5.2O27')).toBe('2027-05-12');
        expect(best('EXP l2/05/2027')).toBe('2027-05-12');
        expect(best('12 OTT 2026')).toBe('2026-10-12');
    });

    it('reads compact and spaced dot-matrix codes next to an expiry label', () => {
        expect(best('EXP 120527')).toBe('2027-05-12');
        expect(best('EXP 20270512')).toBe('2027-05-12');
        expect(best('BB 12 05 2027')).toBe('2027-05-12');
        // Without a label a bare number is not a date
        expect(best('CODE 120527')).toBeNull();
    });

    it('ignores impossible or implausible dates', () => {
        expect(best('31/02/2027')).toBeNull();
        expect(best('12/13/2027')).not.toBe('2027-13-12');
        expect(best('EXP 01/01/2019')).toBeNull();
        expect(best('EXP 01/01/2040')).toBeNull();
        expect(best('')).toBeNull();
        expect(best('Nessuna data qui, solo testo')).toBeNull();
    });

    it('a date confirmed by several image variants wins', () => {
        const a = parseExpiryDates('12/05/2027 03/06/2027');
        const b = parseExpiryDates('03/06/2027');
        const merged = mergeDateReadings([a, b]);
        expect(merged[0].date.getMonth()).toBe(5);
    });
});
