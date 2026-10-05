import React, { ReactNode, useRef } from 'react';
import { GestureResponderEvent, Keyboard, TextInput, View } from 'react-native';

type Focused = ReturnType<typeof TextInput.State.currentlyFocusedInput>;

// Closes the keyboard whenever the user taps anywhere outside the focused text field,
// including on buttons and inside scroll views. It only listens (onTouchStart/End
// bubble through the whole React tree), so it never steals a tap from the target.
export const KeyboardDismissRoot = ({ children }: { children: ReactNode }) => {
    const start = useRef<{ input: Focused; x: number; y: number } | null>(null);

    const onTouchStart = (e: GestureResponderEvent) => {
        const input = TextInput.State.currentlyFocusedInput();
        start.current = input ? { input, x: e.nativeEvent.pageX, y: e.nativeEvent.pageY } : null;
    };

    const onTouchEnd = () => {
        const s = start.current;
        start.current = null;
        if (!s) return;
        // Let the tap land first: if it moved focus to another field, keep the keyboard.
        setTimeout(() => {
            if (TextInput.State.currentlyFocusedInput() !== s.input) return;
            s.input?.measureInWindow((x, y, w, h) => {
                const inside = s.x >= x && s.x <= x + w && s.y >= y && s.y <= y + h;
                if (!inside) Keyboard.dismiss();
            });
        }, 60);
    };

    return (
        <View style={{ flex: 1 }} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            {children}
        </View>
    );
};
