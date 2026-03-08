import React, { forwardRef, useMemo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import { colors, radius, spacing } from '../theme';

const CustomBottomSheet = forwardRef(({ snapPoints = ['50%'], children, ...props }, ref) => {
    // Custom Background with Blur
    const CustomBackground = useCallback(
        ({ style }) => (
            <View style={[style, styles.backgroundContainer]}>
                <BlurView tint="light" intensity={80} style={StyleSheet.absoluteFill} />
                <View style={styles.backgroundColorOverlay} />
            </View>
        ),
        []
    );

    // Custom Backdrop (Dims screen behind the sheet)
    const renderBackdrop = useCallback(
        (backdropProps) => (
            <BottomSheetBackdrop
                {...backdropProps}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.3}
            />
        ),
        []
    );

    // Custom Handle (The little pill icon at top)
    const CustomHandle = useCallback(
        () => (
            <View style={styles.handleContainer}>
                <View style={styles.handle} />
            </View>
        ),
        []
    );

    return (
        <BottomSheetModal
            ref={ref}
            index={0}
            snapPoints={snapPoints}
            backdropComponent={renderBackdrop}
            backgroundComponent={CustomBackground}
            handleComponent={CustomHandle}
            enablePanDownToClose
            keyboardBehavior="interactive"
            keyboardBlurBehavior="restore"
            {...props}
        >
            <BottomSheetScrollView
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {children}
            </BottomSheetScrollView>
        </BottomSheetModal>
    );
});

const styles = StyleSheet.create({
    backgroundContainer: {
        borderRadius: radius.xl,
        overflow: 'hidden',
    },
    backgroundColorOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.85)', // Ensures readability over blur
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: spacing[3],
        borderTopLeftRadius: radius.xl,
        borderTopRightRadius: radius.xl,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.border,
    },
    contentContainer: {
        padding: spacing[5],
        paddingBottom: spacing[12], // Extra padding for safe area
    },
});

export default CustomBottomSheet;
