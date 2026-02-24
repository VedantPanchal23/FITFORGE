import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { spacing, radius, fonts } from '../theme';

const ActionButton = ({
    label,
    icon,
    onPress,
    variant = 'primary', // 'primary', 'secondary', 'glass'
    style,
    size = 'md' // 'sm', 'md', 'lg'
}) => {
    const { theme } = useTheme();

    // Size Styles
    const paddings = {
        sm: { pv: 8, ph: 16, icon: 16, fontSize: 13 },
        md: { pv: 14, ph: 24, icon: 20, fontSize: 16 },
        lg: { pv: 18, ph: 32, icon: 24, fontSize: 18 }
    };
    const currentSize = paddings[size];

    // Colors
    let colors = [theme.primary, theme.primaryLight];
    let textColor = '#FFF';
    let borderColor = 'transparent';
    let borderWidth = 0;

    if (variant === 'secondary') {
        colors = [theme.card, theme.card];
        textColor = theme.primary;
        borderColor = theme.primary;
        borderWidth = 1;
    } else if (variant === 'glass') {
        colors = theme.name === 'dark'
            ? ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
            : ['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.6)'];
        textColor = theme.text;
        borderColor = theme.glass.border;
        borderWidth = 1;
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={[styles.touchable, style]}
        >
            <LinearGradient
                colors={colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                    styles.gradient,
                    {
                        paddingVertical: currentSize.pv,
                        paddingHorizontal: currentSize.ph,
                        borderColor,
                        borderWidth,
                        borderRadius: radius.full
                    }
                ]}
            >
                {icon && (
                    <Feather
                        name={icon}
                        size={currentSize.icon}
                        color={textColor}
                        style={{ marginRight: 8 }}
                    />
                )}
                <Text style={[
                    styles.label,
                    {
                        color: textColor,
                        fontSize: currentSize.fontSize
                    }
                ]}>
                    {label}
                </Text>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    touchable: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    gradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontWeight: '700',
        letterSpacing: 0.5,
    }
});

export default ActionButton;
