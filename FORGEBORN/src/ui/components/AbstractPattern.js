import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../theme';

const AbstractPattern = ({ primaryColor = colors.primary, style }) => {
    const floatAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, {
                    toValue: 1,
                    duration: 4000,
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim, {
                    toValue: 0,
                    duration: 4000,
                    useNativeDriver: true,
                })
            ])
        ).start();
    }, []);

    const translateY = floatAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -10]
    });

    return (
        <View style={style}>
            <Animated.View style={{ transform: [{ translateY }] }}>
                <Svg width="180" height="180" viewBox="0 0 200 200" fill="none">
                    <Defs>
                        <LinearGradient id="paint0_linear" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
                            <Stop stopColor={primaryColor} stopOpacity="0.2" />
                            <Stop offset="1" stopColor={primaryColor} stopOpacity="0.0" />
                        </LinearGradient>
                    </Defs>

                    {/* Abstract overlapping shapes */}
                    <Path
                        d="M160 100C160 133.137 133.137 160 100 160C66.8629 160 40 133.137 40 100C40 66.8629 66.8629 40 100 40C133.137 40 160 66.8629 160 100Z"
                        fill="url(#paint0_linear)"
                    />
                    <Path
                        d="M130 70C130 92.0914 112.091 110 90 110C67.9086 110 50 92.0914 50 70C50 47.9086 67.9086 30 90 30C112.091 30 130 47.9086 130 70Z"
                        fill={primaryColor}
                        fillOpacity="0.1"
                    />
                    <Path
                        d="M150 140C150 156.569 136.569 170 120 170C103.431 170 90 156.569 90 140C90 123.431 103.431 110 120 110C136.569 110 150 123.431 150 140Z"
                        fill={primaryColor}
                        fillOpacity="0.15"
                    />

                    {/* Grid/Dots */}
                    <Path d="M40 160H42V162H40V160Z" fill={primaryColor} fillOpacity="0.4" />
                    <Path d="M60 160H62V162H60V160Z" fill={primaryColor} fillOpacity="0.2" />
                    <Path d="M40 140H42V142H40V140Z" fill={primaryColor} fillOpacity="0.3" />

                    <Path d="M160 40H162V42H160V40Z" fill={primaryColor} fillOpacity="0.4" />
                    <Path d="M140 40H142V42H140V40Z" fill={primaryColor} fillOpacity="0.2" />
                    <Path d="M160 60H162V62H160V60Z" fill={primaryColor} fillOpacity="0.3" />
                </Svg>
            </Animated.View>
        </View>
    );
};

export default AbstractPattern;
