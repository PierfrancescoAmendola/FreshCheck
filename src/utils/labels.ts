import { StorageLocation } from '../types';
import { TKey, Params } from '../i18n';

type T = (key: TKey, params?: Params) => string;

export const locationName = (loc: StorageLocation | undefined, t: T): string => {
    if (!loc) return t('loc_fridge');
    if (loc.builtIn) return t(`loc_${loc.builtIn}` as TKey);
    return loc.name ?? '';
};
