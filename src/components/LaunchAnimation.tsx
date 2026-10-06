import React, { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { FONTS } from '../theme/tokens';

// Plays once at cold start, on top of the first real screen. The native splash is just the
// plain background colour (no static logo), so this animation is the only logo the user sees.
const SPLASH_ICON = require('../../assets/splash-icon.png');
const ICON = 150; // final on-screen size of the icon tile
const TILE = 0.71; // the rounded tile spans ~71% of splash-icon.png
const SPLASH_BG = '#F4F6FB'; // must match expo.splash.backgroundColor, even in dark mode

export const LaunchAnimation = ({ onDone }: { onDone: () => void }) => {
    const { width, height } = useWindowDimensions();
    const { colors } = useTheme();

    const iconScale = useRef(new Animated.Value(0.4)).current; // relative to screen width
    const iconOpacity = useRef(new Animated.Value(0)).current;
    const iconY = useRef(new Animated.Value(0)).current;
    const burst = useRef(new Animated.Value(0)).current;
    const title = useRef(new Animated.Value(0)).current;
    const exit = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        let cancelled = false;
        const small = ICON / (width * TILE);
        const native = { useNativeDriver: true };
        const finish = () => !cancelled && onDone();

        AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
            if (cancelled) return;
            if (reduce) {
                iconScale.setValue(small);
                iconOpacity.setValue(1);
                Animated.timing(exit, { toValue: 1, duration: 250, ...native }).start(finish);
                return;
            }
            Animated.sequence([
                // Icon settles from the native splash size into a crisp app icon
                Animated.parallel([
                    Animated.timing(iconScale, { toValue: small * 0.88, duration: 420, easing: Easing.bezier(0.6, 0, 0.2, 1), ...native }),
                    Animated.timing(iconOpacity, { toValue: 1, duration: 300, ...native }),
                ]),
                Animated.parallel([
                    Animated.spring(iconScale, { toValue: small, friction: 4, tension: 140, ...native }),
                    // Colour bursts out from behind the icon
                    Animated.timing(burst, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), ...native }),
                    Animated.sequence([
                        Animated.delay(160),
                        Animated.parallel([
                            Animated.timing(iconY, { toValue: -40, duration: 420, easing: Easing.out(Easing.back(1.6)), ...native }),
                            Animated.timing(title, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), ...native }),
                        ]),
                    ]),
                ]),
                Animated.delay(380),
                // Lift off and reveal the home screen underneath
                Animated.timing(exit, { toValue: 1, duration: 420, easing: Easing.in(Easing.cubic), ...native }),
            ]).start(finish);
        });
        return () => {
            cancelled = true;
        };
    }, [width, onDone, iconScale, iconOpacity, iconY, burst, title, exit]);

    const diameter = Math.hypot(width, height) * 1.1;
    const burstScale = burst.interpolate({ inputRange: [0, 1], outputRange: [0.01, 1] });
    const overlayOpacity = exit.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
    const overlayScale = exit.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });

    return (
        <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, styles.center, { backgroundColor: SPLASH_BG, opacity: overlayOpacity, transform: [{ scale: overlayScale }] }]}
        >
            <Animated.View
                style={{
                    position: 'absolute',
                    width: diameter,
                    height: diameter,
                    borderRadius: diameter / 2,
                    overflow: 'hidden',
                    transform: [{ scale: burstScale }],
                }}
            >
                <LinearGradient colors={[colors.accent, colors.accentGrad]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={StyleSheet.absoluteFill} />
            </Animated.View>

            <Animated.View
                style={[
                    styles.tile,
                    { width: width * TILE, height: width * TILE, borderRadius: width * TILE * 0.23 },
                    { opacity: iconOpacity, transform: [{ translateY: iconY }, { scale: iconScale }] },
                ]}
            >
                <Animated.Image source={SPLASH_ICON} style={{ width, height: width }} resizeMode="contain" />
            </Animated.View>

            <Animated.View
                style={[
                    styles.titleWrap,
                    {
                        opacity: title,
                        transform: [{ translateY: title.interpolate({ inputRange: [0, 1], outputRange: [104, 78] }) }],
                    },
                ]}
            >
                <Animated.Text style={[styles.title, { color: colors.onAccent }]}>FreshCheck</Animated.Text>
                <View style={[styles.underline, { backgroundColor: colors.onAccent }]} />
            </Animated.View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    center: { alignItems: 'center', justifyContent: 'center', zIndex: 100 },
    tile: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
    titleWrap: { position: 'absolute', alignItems: 'center' },
    title: { fontFamily: FONTS.displayBold, fontSize: 40, letterSpacing: -1.4 },
    underline: { width: 46, height: 5, borderRadius: 3, marginTop: 8, opacity: 0.85 },
});
