import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    Dimensions,
    StatusBar,
    Vibration,
} from 'react-native';
import { colors, spacing, radius } from '../theme';
import { Typography, Button } from '../components';

const { width, height } = Dimensions.get('window');

// THE CREED - Each line is a commitment
const CREED_LINES = [
    'THERE IS NO TOMORROW.',
    'I DO NOT LOSE.',
    'I BREAK WEAKNESS.',
    'THIS IS MY JOB.',
    'THIS IS WHAT I DO.',
    'I COMMIT.',
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
            const delay = index * 1000; // 1s between each line

            setTimeout(() => {
                setCurrentLine(index);

                // Vibrate on each line
                Vibration.vibrate(50);

                Animated.parallel([
                    Animated.timing(lineAnimations[index].opacity, {
                        toValue: 1,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                    Animated.timing(lineAnimations[index].translateY, {
                        toValue: 0,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                    Animated.spring(lineAnimations[index].scale, {
                        toValue: 1,
                        friction: 5,
                        tension: 40,
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
                    duration: 800,
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
        }, CREED_LINES.length * 1000 + 500);
    };

    const startPulse = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 1200,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1200,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    const handleCommit = () => {
        if (isCommitting) return;

        setIsCommitting(true);
        Vibration.vibrate([0, 50, 100, 50, 100, 50, 300]); // Escalating vibration

        setTimeout(() => {
            onCommit && onCommit();
        }, 600);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            {/* Background glow effect (Subtle for light theme) */}
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
                    <Button
                        title={isCommitting ? 'SEALING...' : 'I COMMIT'}
                        onPress={handleCommit}
                        variant="primary"
                        style={[styles.commitButton, isCommitting && styles.commitButtonActive]}
                        textStyle={{ fontSize: 24, letterSpacing: 4, fontWeight: '900', color: colors.textInverse }}
                    />

                    <Typography variant="caption" color={colors.danger} style={styles.warningText}>
                        THIS CANNOT BE UNDONE
                    </Typography>
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
        paddingHorizontal: spacing[6],
    },

    glowContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: -1,
    },

    glow: {
        width: width * 1.2,
        height: width * 1.2,
        borderRadius: width * 0.6,
        backgroundColor: colors.surface,
        opacity: 0.5,
    },

    glowActive: {
        backgroundColor: colors.primaryLight,
        opacity: 0.8,
    },

    creedContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 120, // Make room for button
    },

    creedLine: {
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: colors.textDim, // Dim unless active
        textAlign: 'center',
        marginVertical: spacing[3],
        fontFamily: 'System', // Use default very bold system font
    },

    creedLineActive: {
        color: colors.textUrl || colors.primary, // Pop when it's the current line
        fontSize: 32, // Slightly larger when active
    },

    buttonContainer: {
        position: 'absolute',
        bottom: 80,
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: spacing[6],
    },

    commitButton: {
        width: '100%',
        paddingVertical: spacing[6],
        borderRadius: radius.full,
        backgroundColor: colors.text, // Black button in light theme for extreme contrast
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },

    commitButtonActive: {
        backgroundColor: colors.primary, // Turns primary color on click
    },

    warningText: {
        marginTop: spacing[4],
        opacity: 0.8,
        letterSpacing: 3,
        fontWeight: 'bold',
    },
});

export default CreedScreen;
