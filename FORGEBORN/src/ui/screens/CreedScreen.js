/**
 * FORGEBORN — CREED SCREEN
 * 
 * The first thing the user sees.
 * Not onboarding. Not welcome.
 * THE CREED.
 * 
 * This is a contract with yourself.
 * Once accepted, it never shows again.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
    StatusBar,
    Vibration,
} from 'react-native';
import { colors } from '../theme/colors';
import { textStyles } from '../theme/typography';
import { spacing, screen } from '../theme/spacing';

const { width, height } = Dimensions.get('window');

// THE CREED - Each line is a commitment
const CREED_LINES = [
    'THERE IS NO TOMORROW.',
    'I DO NOT LOSE.',
    'I EXECUTE.',
    'THIS IS MY JOB.',
    'THIS IS WHAT I DO.',
    'I BUILT THIS.',
];

const CreedScreen = ({ onCommit }) => {
    const [currentLine, setCurrentLine] = useState(0);
    const [showButton, setShowButton] = useState(false);
    const [isCommitting, setIsCommitting] = useState(false);

    // Animation values for each line
    const lineAnimations = useRef(
        CREED_LINES.map(() => ({
            opacity: new Animated.Value(0),
            translateY: new Animated.Value(30),
            scale: new Animated.Value(0.9),
        }))
    ).current;

    // Button animation
    const buttonOpacity = useRef(new Animated.Value(0)).current;
    const buttonScale = useRef(new Animated.Value(0.8)).current;

    // Pulse animation for button
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Start the creed animation sequence
        animateCreed();
    }, []);

    const animateCreed = () => {
        // Animate each line with delay
        CREED_LINES.forEach((_, index) => {
            const delay = index * 800; // 800ms between each line

            setTimeout(() => {
                setCurrentLine(index);

                // Vibrate on each line
                Vibration.vibrate(50);

                Animated.parallel([
                    Animated.timing(lineAnimations[index].opacity, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.timing(lineAnimations[index].translateY, {
                        toValue: 0,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.spring(lineAnimations[index].scale, {
                        toValue: 1,
                        friction: 4,
                        tension: 50,
                        useNativeDriver: true,
                    }),
                ]).start();
            }, delay);
        });

        // Show button after all lines
        setTimeout(() => {
            setShowButton(true);
            Vibration.vibrate([0, 100, 50, 100]); // Double vibrate

            Animated.parallel([
                Animated.timing(buttonOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.spring(buttonScale, {
                    toValue: 1,
                    friction: 4,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                // Start pulse animation
                startPulse();
            });
        }, CREED_LINES.length * 800 + 500);
    };

    const startPulse = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    const handleCommit = () => {
        if (isCommitting) return;

        setIsCommitting(true);
        Vibration.vibrate([0, 50, 100, 50, 100, 50, 200]); // Escalating vibration

        // Flash the screen red
        // Then trigger commit
        setTimeout(() => {
            onCommit && onCommit();
        }, 300);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.background} />

            {/* Background glow effect */}
            <View style={styles.glowContainer}>
                <View style={[styles.glow, isCommitting && styles.glowActive]} />
            </View>

            {/* Creed lines */}
            <View style={styles.creedContainer}>
                {CREED_LINES.map((line, index) => (
                    <Animated.Text
                        key={index}
                        style={[
                            styles.creedLine,
                            index === currentLine && styles.creedLineActive,
                            {
                                opacity: lineAnimations[index].opacity,
                                transform: [
                                    { translateY: lineAnimations[index].translateY },
                                    { scale: lineAnimations[index].scale },
                                ],
                            },
                        ]}
                    >
                        {line}
                    </Animated.Text>
                ))}
            </View>

            {/* Commit button */}
            {showButton && (
                <Animated.View
                    style={[
                        styles.buttonContainer,
                        {
                            opacity: buttonOpacity,
                            transform: [
                                { scale: Animated.multiply(buttonScale, pulseAnim) },
                            ],
                        },
                    ]}
                >
                    <TouchableOpacity
                        style={[
                            styles.commitButton,
                            isCommitting && styles.commitButtonActive,
                        ]}
                        onPress={handleCommit}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.commitButtonText}>
                            {isCommitting ? 'SEALING...' : 'I COMMIT'}
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.warningText}>
                        THIS CANNOT BE UNDONE
                    </Text>
                </Animated.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: screen.paddingHorizontal,
    },

    glowContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },

    glow: {
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: width * 0.4,
        backgroundColor: colors.primaryMuted,
        opacity: 0.3,
    },

    glowActive: {
        backgroundColor: colors.primary,
        opacity: 0.5,
    },

    creedContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 100,
    },

    creedLine: {
        ...textStyles.creed,
        color: colors.textDim,
        textAlign: 'center',
        marginVertical: spacing[2],
    },

    creedLineActive: {
        color: colors.text,
    },

    buttonContainer: {
        position: 'absolute',
        bottom: 80,
        alignItems: 'center',
    },

    commitButton: {
        backgroundColor: colors.primary,
        paddingVertical: spacing[4],
        paddingHorizontal: spacing[10],
        borderWidth: 2,
        borderColor: colors.primary,
    },

    commitButtonActive: {
        backgroundColor: colors.primaryDark,
    },

    commitButtonText: {
        ...textStyles.button,
        color: colors.text,
        fontSize: 20,
    },

    warningText: {
        ...textStyles.caption,
        color: colors.danger,
        marginTop: spacing[3],
        opacity: 0.7,
    },
});

export default CreedScreen;
