import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Animated, Modal, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Svg, { Polygon, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import useHabitStore from '../../store/habitStore';
import SoundEngine from '../../utils/SoundEngine';
import { colors, radius, spacing } from '../theme';
import Typography from './Typography';

export default function LevelUpModal() {
    const level = useHabitStore(s => s.level);
    const prevLevelRef = useRef(level);
    const [visible, setVisible] = useState(false);

    const scaleAnim = useRef(new Animated.Value(0.5)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (level > prevLevelRef.current && prevLevelRef.current > 0) {
            // Leveled up!
            setVisible(true);
            SoundEngine.play('streak');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 4,
                    tension: 50,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start();
        }
        prevLevelRef.current = level;
    }, [level]);

    const handleClose = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: 0.8,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            })
        ]).start(() => setVisible(false));
    };

    if (!visible) return null;

    return (
        <Modal transparent animationType="none" visible={visible}>
            <View style={styles.container}>
                <Animated.View style={[StyleSheet.absoluteFill, { opacity: opacityAnim }]}>
                    <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFill} />
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.4)' }]} />
                </Animated.View>

                <Animated.View style={[styles.content, {
                    opacity: opacityAnim,
                    transform: [{ scale: scaleAnim }]
                }]}>
                    {/* Abstract SVG Diamond (Data Art) */}
                    <View style={styles.svgContainer}>
                        <Svg width="160" height="160" viewBox="0 0 100 100">
                            <Defs>
                                <SvgLinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                                    <Stop offset="0" stopColor={colors.warning} stopOpacity="1" />
                                    <Stop offset="1" stopColor="#FDE68A" stopOpacity="1" />
                                </SvgLinearGradient>
                            </Defs>
                            <Polygon
                                points="50,5 95,50 50,95 5,50"
                                fill="url(#grad)"
                                stroke="#FFFFFF"
                                strokeWidth="2"
                                opacity="0.9"
                            />
                            <Polygon
                                points="50,15 80,50 50,85 20,50"
                                fill="none"
                                stroke="rgba(255,255,255,0.7)"
                                strokeWidth="1"
                            />
                        </Svg>
                        <View style={styles.levelBadge}>
                            <Typography variant="title1" style={{ fontSize: 40, color: colors.surface, fontWeight: '900' }} tabularNums>
                                {level}
                            </Typography>
                        </View>
                    </View>

                    <Typography variant="largeTitle" color={colors.text} style={{ marginTop: spacing[6], textAlign: 'center' }}>
                        LEVEL UP
                    </Typography>
                    <Typography variant="body" color={colors.textSecondary} style={{ marginTop: spacing[2], textAlign: 'center', maxWidth: 280 }}>
                        Your discipline expands. You have forged a stronger version of yourself.
                    </Typography>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleClose}
                        activeOpacity={0.8}
                    >
                        <Typography variant="headline" color={colors.surface}>Continue</Typography>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        padding: spacing[6],
    },
    svgContainer: {
        width: 160,
        height: 160,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.warning,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 30,
        elevation: 10,
    },
    levelBadge: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        marginTop: spacing[10],
        backgroundColor: colors.primary,
        paddingVertical: spacing[4],
        paddingHorizontal: spacing[10],
        borderRadius: radius.full,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 4,
    }
});
