import React from 'react';
import {
    Apple,
    Beef,
    Croissant,
    CupSoda,
    Fish,
    Milk,
    Package,
    Refrigerator,
    Snowflake,
    Warehouse,
    Wheat,
    MapPin,
} from 'lucide-react-native';
import { CategoryId, StorageLocation } from '../types';

export const CategoryIcon = ({ category, size = 20, color }: { category: CategoryId; size?: number; color: string }) => {
    const props = { size, color, strokeWidth: 1.8 };
    switch (category) {
        case 'dairy':
            return <Milk {...props} />;
        case 'meat':
            return <Beef {...props} />;
        case 'fish':
            return <Fish {...props} />;
        case 'fruitVeg':
            return <Apple {...props} />;
        case 'bakery':
            return <Croissant {...props} />;
        case 'pantry':
            return <Wheat {...props} />;
        case 'frozen':
            return <Snowflake {...props} />;
        case 'drinks':
            return <CupSoda {...props} />;
        default:
            return <Package {...props} />;
    }
};

export const LocationIcon = ({ location, size = 16, color }: { location?: StorageLocation; size?: number; color: string }) => {
    const props = { size, color, strokeWidth: 1.8 };
    switch (location?.builtIn) {
        case 'fridge':
            return <Refrigerator {...props} />;
        case 'freezer':
            return <Snowflake {...props} />;
        case 'pantry':
            return <Warehouse {...props} />;
        default:
            return <MapPin {...props} />;
    }
};
