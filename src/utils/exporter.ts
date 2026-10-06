import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { FoodItem, HistoryEntry, ShoppingItem, StorageLocation } from '../types';

export interface Backup {
    app: 'freshcheck';
    version: 2;
    exportedAt: string;
    items: FoodItem[];
    history: HistoryEntry[];
    shopping: ShoppingItem[];
    locations: StorageLocation[];
}

const stamp = () => new Date().toISOString().slice(0, 10);

const shareFile = async (name: string, content: string, mimeType: string) => {
    const file = new File(Paths.cache, name);
    if (file.exists) file.delete();
    file.create();
    file.write(content);
    await Sharing.shareAsync(file.uri, { mimeType, dialogTitle: name });
};

const csvCell = (v: unknown) => {
    const s = v === undefined || v === null ? '' : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const exportCsv = async (items: FoodItem[], history: HistoryEntry[]) => {
    const rows = [
        ['type', 'name', 'category', 'location', 'expiry_or_date', 'price', 'outcome'],
        ...items.map((i) => ['item', i.name, i.category, i.locationId, i.expirationDate.slice(0, 10), i.price ?? '', '']),
        ...history.map((h) => ['history', h.name, h.category, '', h.date.slice(0, 10), h.price, h.outcome]),
    ];
    await shareFile(`freshcheck-${stamp()}.csv`, rows.map((r) => r.map(csvCell).join(',')).join('\n'), 'text/csv');
};

export const exportBackup = async (data: Omit<Backup, 'app' | 'version' | 'exportedAt'>) => {
    const backup: Backup = { app: 'freshcheck', version: 2, exportedAt: new Date().toISOString(), ...data };
    await shareFile(`freshcheck-backup-${stamp()}.json`, JSON.stringify(backup), 'application/json');
};

export const pickBackup = async (): Promise<Backup | null | 'invalid'> => {
    const res = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/plain', '*/*'], copyToCacheDirectory: true });
    if (res.canceled || !res.assets?.[0]) return null;
    try {
        const parsed = JSON.parse(await new File(res.assets[0].uri).text());
        if (parsed?.app !== 'freshcheck' || !Array.isArray(parsed.items)) return 'invalid';
        return parsed as Backup;
    } catch {
        return 'invalid';
    }
};
