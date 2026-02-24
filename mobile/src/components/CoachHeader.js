import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { fonts, spacing, radius } from '../theme';

const CoachHeader = ({
    userName = "User",
    greeting = "Let's train smart today",
    profileImage,
    onProfilePress
}) => {
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            <View style={styles.textContainer}>
                <Text style={[styles.greeting, { color: theme.textSecondary }]}>
                    HELLO, {userName.toUpperCase()}
                </Text>
                <Text style={[styles.message, { color: theme.text }]} numberOfLines={2}>
                    {greeting}
                </Text>
            </View>

            <TouchableOpacity
                onPress={onProfilePress}
                style={[
                    styles.profileButton,
                    {
                        backgroundColor: theme.card,
                        borderColor: theme.cardBorder
                    }
                ]}
            >
                {profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.avatar} />
                ) : (
                    <Feather name="user" size={24} color={theme.primary} />
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
        marginBottom: spacing.sm,
    },
    textContainer: {
        flex: 1,
        paddingRight: spacing.md
    },
    greeting: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.2,
        marginBottom: 4,
        opacity: 0.8
    },
    message: {
        ...fonts.h2,
        lineHeight: 34,
    },
    profileButton: {
        width: 48,
        height: 48,
        borderRadius: 24, // Circle
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        // Add subtle shadow for light mode
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24
    }
});

export default CoachHeader;
