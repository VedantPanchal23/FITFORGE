import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';
import { typography, colors } from '../theme';

export const Typography = ({
    variant = 'body', // 'largeTitle', 'title1', 'title2', 'headline', 'body', 'subheadline', 'caption', 'dataDisplay'
    color = colors.text,
    align = 'left',
    weight,
    style,
    numberOfLines,
    children,
    ...props
}) => {
    const textStyle = typography.textStyles[variant] || typography.textStyles.body;

    return (
        <RNText
            style={[
                textStyle,
                { color: color, textAlign: align },
                weight ? { fontFamily: typography.fontFamily[weight] } : {},
                style,
            ]}
            numberOfLines={numberOfLines}
            {...props}
        >
            {children}
        </RNText>
    );
};
