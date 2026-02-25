/**
 * FORGEBORN — ONBOARDING SCREEN
 * 
 * Multi-step questionnaire that collects everything needed
 * to forge the user's personalized plan.
 * 
 * 9 Steps:
 * 1. Name
 * 2. Gender
 * 3. Body stats (Age, Weight, Height)
 * 4. Fitness Goal
 * 5. Experience Level
 * 6. Training Days
 * 7. Cardio Preference
 * 8. Yoga & Injuries
 * 9. Diet & Meals
 * 
 * After completion, the system OWNS you.
 */

import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Vibration,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { colors } from '../theme/colors';
import { textStyles } from '../theme/typography';
import { spacing, screen } from '../theme/spacing';
import useUserStore, {
    FitnessGoal,
    ExperienceLevel,
    Gender,
    DietPreference,
    CardioType,
    InjuryArea,
} from '../../store/userStore';

const { width } = Dimensions.get('window');
const TOTAL_STEPS = 9;

// ─── Option Button Component ────────────────────────────────────────────────
const OptionButton = ({ label, sublabel, selected, onPress, danger, containerStyle }) => (
    <TouchableOpacity
        style={[
            styles.optionButton,
            selected && styles.optionButtonActive,
            danger && selected && styles.optionButtonDanger,
            containerStyle,
        ]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <Text style={[
            styles.optionText,
            selected && styles.optionTextActive,
        ]}>
            {label}
        </Text>
        {sublabel && (
            <Text style={[
                styles.optionSublabel,
                selected && styles.optionSublabelActive,
            ]}>
                {sublabel}
            </Text>
        )}
    </TouchableOpacity>
);

// ─── Number Input Component ──────────────────────────────────────────────────
const NumberInput = ({ label, value, onChangeText, unit, placeholder }) => (
    <View style={styles.numberInputContainer}>
        <Text style={styles.numberInputLabel}>{label}</Text>
        <View style={styles.numberInputRow}>
            <TextInput
                style={styles.numberInput}
                value={value}
                onChangeText={onChangeText}
                keyboardType="number-pad"
                placeholder={placeholder}
                placeholderTextColor={colors.textDim}
                maxLength={4}
            />
            {unit && <Text style={styles.numberInputUnit}>{unit}</Text>}
        </View>
    </View>
);

// ─── Main Onboarding Screen ──────────────────────────────────────────────────
const OnboardingScreen = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const progressAnim = useRef(new Animated.Value(0)).current;

    // Form state
    const [name, setName] = useState('');
    const [gender, setGender] = useState(null);
    const [age, setAge] = useState('');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [fitnessGoals, setFitnessGoals] = useState([]);
    const [experienceLevel, setExperienceLevel] = useState(null);
    const [trainingDays, setTrainingDays] = useState(5);
    const [wantsCardio, setWantsCardio] = useState(null);
    const [cardioTypes, setCardioTypes] = useState([]);
    const [wantsYoga, setWantsYoga] = useState(null);
    const [injuries, setInjuries] = useState([InjuryArea.NONE]);
    const [dietPreference, setDietPreference] = useState(null);
    const [mealsPerDay, setMealsPerDay] = useState(4);

    const updateProfile = useUserStore((s) => s.updateProfile);
    const completeOnboarding = useUserStore((s) => s.completeOnboarding);

    const animateProgress = (nextStep) => {
        Animated.timing(progressAnim, {
            toValue: (nextStep + 1) / TOTAL_STEPS,
            duration: 300,
            useNativeDriver: false,
        }).start();
    };

    const nextStep = () => {
        if (step < TOTAL_STEPS - 1) {
            Vibration.vibrate(30);
            const next = step + 1;
            setStep(next);
            animateProgress(next);
        }
    };

    const prevStep = () => {
        if (step > 0) {
            Vibration.vibrate(20);
            const prev = step - 1;
            setStep(prev);
            animateProgress(prev);
        }
    };

    const canProceed = () => {
        switch (step) {
            case 0: return name.trim().length >= 2;
            case 1: return gender !== null;
            case 2: return age && weight && height;
            case 3: return fitnessGoals.length > 0;
            case 4: return experienceLevel !== null;
            case 5: return trainingDays >= 3 && trainingDays <= 7;
            case 6: return wantsCardio !== null; // must choose yes or no
            case 7: return wantsYoga !== null; // must choose yes or no
            case 8: return dietPreference !== null;
            default: return false;
        }
    };

    const handleFinish = () => {
        Vibration.vibrate([0, 50, 100, 50, 100, 50, 200]);

        updateProfile({
            name: name.trim().toUpperCase(),
            gender,
            age: parseInt(age, 10),
            weight: parseFloat(weight),
            height: parseFloat(height),
            fitnessGoal: fitnessGoals,
            experienceLevel,
            trainingDaysPerWeek: trainingDays,
            wantsCardio: wantsCardio === true,
            cardioTypes: wantsCardio === true ? cardioTypes : [],
            wantsYoga: wantsYoga === true,
            injuries,
            dietPreference,
            mealsPerDay,
        });

        completeOnboarding();
        onComplete && onComplete();
    };

    const toggleInjury = (injury) => {
        Vibration.vibrate(20);
        if (injury === InjuryArea.NONE) {
            setInjuries([InjuryArea.NONE]);
            return;
        }

        let newInjuries = injuries.filter(i => i !== InjuryArea.NONE);
        if (newInjuries.includes(injury)) {
            newInjuries = newInjuries.filter(i => i !== injury);
            if (newInjuries.length === 0) newInjuries = [InjuryArea.NONE];
        } else {
            newInjuries.push(injury);
        }
        setInjuries(newInjuries);
    };

    // ─── Step Content Renderers ──────────────────────────────────────────────

    const renderStep0_Name = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>WHAT'S YOUR NAME,{'\n'}WARRIOR?</Text>
            <Text style={styles.stepSubtitle}>This is permanent.</Text>
            <TextInput
                style={styles.nameInput}
                value={name}
                onChangeText={setName}
                placeholder="YOUR NAME"
                placeholderTextColor={colors.textDim}
                autoCapitalize="characters"
                autoFocus
                maxLength={20}
            />
        </View>
    );

    const renderStep1_Gender = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>GENDER</Text>
            <Text style={styles.stepSubtitle}>For accurate calorie calculations.</Text>
            <View style={styles.optionsGrid}>
                <OptionButton
                    label="MALE"
                    sublabel="♂"
                    selected={gender === Gender.MALE}
                    onPress={() => { setGender(Gender.MALE); Vibration.vibrate(30); }}
                />
                <OptionButton
                    label="FEMALE"
                    sublabel="♀"
                    selected={gender === Gender.FEMALE}
                    onPress={() => { setGender(Gender.FEMALE); Vibration.vibrate(30); }}
                />
            </View>
        </View>
    );

    const renderStep2_BodyStats = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>YOUR BODY</Text>
            <Text style={styles.stepSubtitle}>We need these numbers to forge your perfect plan.</Text>
            <NumberInput label="AGE" value={age} onChangeText={setAge} unit="years" placeholder="25" />
            <NumberInput label="WEIGHT" value={weight} onChangeText={setWeight} unit="kg" placeholder="70" />
            <NumberInput label="HEIGHT" value={height} onChangeText={setHeight} unit="cm" placeholder="175" />
        </View>
    );

    const renderStep3_Goal = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>WHAT DO YOU{'\n'}WANT TO BUILD?</Text>
            <Text style={styles.stepSubtitle}>Choose your path. Select multiple.</Text>
            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false} nestedScrollEnabled>
                {[
                    { key: FitnessGoal.FULL_BODY, label: 'FULL BODY', sub: 'Complete balanced training' },
                    { key: FitnessGoal.MUSCLE_GAIN, label: 'MUSCLE GAIN', sub: 'Maximum mass building' },
                    { key: FitnessGoal.WEIGHT_LOSS, label: 'WEIGHT LOSS', sub: 'Burn fat, get shredded' },
                    { key: FitnessGoal.STRENGTH, label: 'PURE STRENGTH', sub: 'Squat, Bench, Deadlift' },
                    { key: FitnessGoal.CALISTHENICS, label: 'CALISTHENICS', sub: 'Master bodyweight' },
                    { key: FitnessGoal.UPPER_BODY, label: 'UPPER BODY', sub: 'Chest, Back, Arms, Shoulders' },
                    { key: FitnessGoal.LOWER_BODY, label: 'LOWER BODY', sub: 'Legs, Glutes, Calves' },
                    { key: FitnessGoal.BACK_FOCUSED, label: 'BACK FOCUSED', sub: 'Wide, thick, strong back' },
                    { key: FitnessGoal.ARM_FOCUSED, label: 'ARM FOCUSED', sub: 'Biceps, Triceps, Forearms' },
                    { key: FitnessGoal.CORE_ABS, label: 'CORE / ABS', sub: 'Rock-solid midsection' },
                ].map(item => (
                    <OptionButton
                        key={item.key}
                        label={item.label}
                        sublabel={item.sub}
                        selected={fitnessGoals.includes(item.key)}
                        onPress={() => {
                            Vibration.vibrate(30);
                            setFitnessGoals(prev =>
                                prev.includes(item.key)
                                    ? prev.filter(g => g !== item.key)
                                    : [...prev, item.key]
                            );
                        }}
                    />
                ))}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );

    const renderStep4_Experience = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>YOUR LEVEL</Text>
            <Text style={styles.stepSubtitle}>Be honest. The system adjusts everything.</Text>
            <View style={styles.optionsGrid}>
                {[
                    { key: ExperienceLevel.BEGINNER, label: 'BEGINNER', sub: '0-6 months training' },
                    { key: ExperienceLevel.INTERMEDIATE, label: 'INTERMEDIATE', sub: '6-18 months' },
                    { key: ExperienceLevel.ADVANCED, label: 'ADVANCED', sub: '18+ months' },
                    { key: ExperienceLevel.BEAST, label: 'BEAST', sub: '3+ years, serious' },
                ].map(item => (
                    <OptionButton
                        key={item.key}
                        label={item.label}
                        sublabel={item.sub}
                        selected={experienceLevel === item.key}
                        onPress={() => { setExperienceLevel(item.key); Vibration.vibrate(30); }}
                    />
                ))}
            </View>
        </View>
    );

    const renderStep5_TrainingDays = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>HOW MANY DAYS{'\n'}CAN YOU TRAIN?</Text>
            <Text style={styles.stepSubtitle}>Be realistic. Consistency beats intensity.</Text>
            <View style={styles.daysSelector}>
                {[3, 4, 5, 6, 7].map(day => (
                    <TouchableOpacity
                        key={day}
                        style={[
                            styles.dayButton,
                            trainingDays === day && styles.dayButtonActive,
                        ]}
                        onPress={() => { setTrainingDays(day); Vibration.vibrate(30); }}
                    >
                        <Text style={[
                            styles.dayNumber,
                            trainingDays === day && styles.dayNumberActive,
                        ]}>
                            {day}
                        </Text>
                        <Text style={[
                            styles.dayLabel,
                            trainingDays === day && styles.dayLabelActive,
                        ]}>
                            DAYS
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <Text style={styles.dayHint}>
                {trainingDays === 3 && 'Full body each session. Great for beginners.'}
                {trainingDays === 4 && 'Upper/Lower split. Solid balanced program.'}
                {trainingDays === 5 && 'Push/Pull/Legs + Upper/Lower. High volume.'}
                {trainingDays === 6 && 'Push/Pull/Legs ×2. Maximum frequency.'}
                {trainingDays === 7 && 'Every day. Rest is for the weak.'}
            </Text>
        </View>
    );

    const renderStep6_Cardio = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>CARDIO?</Text>
            <Text style={styles.stepSubtitle}>Added to your training for endurance & heart health.</Text>
            <View style={styles.toggleRow}>
                <OptionButton
                    label="YES"
                    selected={wantsCardio === true}
                    onPress={() => { setWantsCardio(true); Vibration.vibrate(30); }}
                    containerStyle={styles.toggleButton}
                />
                <OptionButton
                    label="NO"
                    selected={wantsCardio === false}
                    onPress={() => { setWantsCardio(false); setCardioTypes([]); Vibration.vibrate(30); }}
                    containerStyle={styles.toggleButton}
                />
            </View>

            {wantsCardio && (
                <>
                    <Text style={[styles.stepSubtitle, { marginTop: spacing[4] }]}>
                        CHOOSE YOUR WEAPONS (select multiple)
                    </Text>
                    <View style={styles.optionsGrid}>
                        {[
                            { key: CardioType.RUNNING, label: 'RUNNING', sub: '🏃' },
                            { key: CardioType.CYCLING, label: 'CYCLING', sub: '🚴' },
                            { key: CardioType.SWIMMING, label: 'SWIMMING', sub: '🏊' },
                            { key: CardioType.JUMP_ROPE, label: 'JUMP ROPE', sub: '⚡' },
                            { key: CardioType.WALKING, label: 'WALKING', sub: '🚶' },
                            { key: CardioType.HIIT, label: 'HIIT', sub: '🔥' },
                        ].map(item => (
                            <OptionButton
                                key={item.key}
                                label={item.label}
                                sublabel={item.sub}
                                selected={cardioTypes.includes(item.key)}
                                onPress={() => {
                                    Vibration.vibrate(30);
                                    setCardioTypes(prev =>
                                        prev.includes(item.key)
                                            ? prev.filter(c => c !== item.key)
                                            : [...prev, item.key]
                                    );
                                }}
                            />
                        ))}
                    </View>
                </>
            )}
        </View>
    );

    const renderStep7_YogaInjuries = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>YOGA & INJURIES</Text>

            <Text style={styles.sectionTitle}>WANT YOGA / MOBILITY?</Text>
            <View style={styles.toggleRow}>
                <OptionButton
                    label="YES"
                    selected={wantsYoga === true}
                    onPress={() => { setWantsYoga(true); Vibration.vibrate(30); }}
                    containerStyle={styles.toggleButton}
                />
                <OptionButton
                    label="NO"
                    selected={wantsYoga === false}
                    onPress={() => { setWantsYoga(false); Vibration.vibrate(30); }}
                    containerStyle={styles.toggleButton}
                />
            </View>

            <Text style={[styles.sectionTitle, { marginTop: spacing[6] }]}>
                ANY INJURIES?
            </Text>
            <Text style={styles.stepSubtitle}>
                We'll adjust exercises to protect you.
            </Text>
            <View style={styles.optionsGrid}>
                {[
                    { key: InjuryArea.NONE, label: 'NO INJURIES', sub: 'I\'m solid' },
                    { key: InjuryArea.SHOULDER, label: 'SHOULDER', sub: 'Pain or instability' },
                    { key: InjuryArea.KNEE, label: 'KNEE', sub: 'Pain during squats/lunges' },
                    { key: InjuryArea.LOWER_BACK, label: 'LOWER BACK', sub: 'Disc or muscle issue' },
                    { key: InjuryArea.WRIST, label: 'WRIST', sub: 'Pain during push-ups' },
                    { key: InjuryArea.ANKLE, label: 'ANKLE', sub: 'Sprain or weakness' },
                ].map(item => (
                    <OptionButton
                        key={item.key}
                        label={item.label}
                        sublabel={item.sub}
                        selected={injuries.includes(item.key)}
                        onPress={() => toggleInjury(item.key)}
                        danger={item.key !== InjuryArea.NONE}
                    />
                ))}
            </View>
        </View>
    );

    const renderStep8_Diet = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>FUEL YOUR FORGE</Text>

            <Text style={styles.sectionTitle}>DIET PREFERENCE</Text>
            <View style={styles.optionsGrid}>
                {[
                    { key: DietPreference.NO_PREFERENCE, label: 'NO PREFERENCE', sub: 'I eat everything' },
                    { key: DietPreference.NON_VEG, label: 'NON-VEG', sub: 'Chicken, fish, eggs, meat' },
                    { key: DietPreference.VEGETARIAN, label: 'VEGETARIAN', sub: 'No meat, eggs ok' },
                    { key: DietPreference.VEGAN, label: 'VEGAN', sub: 'No animal products' },
                    { key: DietPreference.KETO, label: 'KETO', sub: 'High fat, low carb' },
                ].map(item => (
                    <OptionButton
                        key={item.key}
                        label={item.label}
                        sublabel={item.sub}
                        selected={dietPreference === item.key}
                        onPress={() => { setDietPreference(item.key); Vibration.vibrate(30); }}
                    />
                ))}
            </View>

            <Text style={[styles.sectionTitle, { marginTop: spacing[6] }]}>
                MEALS PER DAY
            </Text>
            <View style={styles.daysSelector}>
                {[3, 4, 5, 6].map(num => (
                    <TouchableOpacity
                        key={num}
                        style={[
                            styles.dayButton,
                            mealsPerDay === num && styles.dayButtonActive,
                        ]}
                        onPress={() => { setMealsPerDay(num); Vibration.vibrate(30); }}
                    >
                        <Text style={[
                            styles.dayNumber,
                            mealsPerDay === num && styles.dayNumberActive,
                        ]}>
                            {num}
                        </Text>
                        <Text style={[
                            styles.dayLabel,
                            mealsPerDay === num && styles.dayLabelActive,
                        ]}>
                            MEALS
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderCurrentStep = () => {
        switch (step) {
            case 0: return renderStep0_Name();
            case 1: return renderStep1_Gender();
            case 2: return renderStep2_BodyStats();
            case 3: return renderStep3_Goal();
            case 4: return renderStep4_Experience();
            case 5: return renderStep5_TrainingDays();
            case 6: return renderStep6_Cardio();
            case 7: return renderStep7_YogaInjuries();
            case 8: return renderStep8_Diet();
            default: return null;
        }
    };

    const isLastStep = step === TOTAL_STEPS - 1;

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Progress bar */}
            <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                    <Animated.View
                        style={[
                            styles.progressFill,
                            {
                                width: progressAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0%', '100%'],
                                }),
                            },
                        ]}
                    />
                </View>
                <Text style={styles.progressText}>
                    {step + 1} / {TOTAL_STEPS}
                </Text>
            </View>

            {/* Step content */}
            <ScrollView
                style={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {renderCurrentStep()}
            </ScrollView>

            {/* Navigation buttons */}
            <View style={styles.navContainer}>
                {step > 0 ? (
                    <TouchableOpacity style={styles.backButton} onPress={prevStep}>
                        <Text style={styles.backText}>← BACK</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.backButton} />
                )}

                {isLastStep ? (
                    <TouchableOpacity
                        style={[styles.nextButton, styles.forgeButton, !canProceed() && styles.nextButtonDisabled]}
                        onPress={handleFinish}
                        disabled={!canProceed()}
                    >
                        <Text style={styles.forgeText}>FORGE MY PLAN ⚔️</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
                        onPress={nextStep}
                        disabled={!canProceed()}
                    >
                        <Text style={styles.nextText}>NEXT →</Text>
                    </TouchableOpacity>
                )}
            </View>
        </KeyboardAvoidingView>
    );
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },

    // Progress
    progressContainer: {
        paddingTop: screen.paddingTop,
        paddingHorizontal: screen.paddingHorizontal,
        paddingBottom: spacing[3],
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[3],
    },
    progressTrack: {
        flex: 1,
        height: 4,
        backgroundColor: colors.surface,
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary,
    },
    progressText: {
        ...textStyles.caption,
        color: colors.textDim,
        width: 40,
        textAlign: 'right',
    },

    // Content
    scrollContent: {
        flex: 1,
        paddingHorizontal: screen.paddingHorizontal,
    },
    stepContent: {
        paddingTop: spacing[4],
        paddingBottom: spacing[8],
    },

    // Typography
    stepTitle: {
        ...textStyles.h1,
        color: colors.text,
        marginBottom: spacing[2],
        lineHeight: 38,
    },
    stepSubtitle: {
        ...textStyles.body,
        color: colors.textDim,
        marginBottom: spacing[5],
    },
    sectionTitle: {
        ...textStyles.label,
        color: colors.textSecondary,
        marginBottom: spacing[3],
    },

    // Name input
    nameInput: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderBottomColor: colors.primary,
        borderBottomWidth: 2,
        padding: spacing[4],
        color: colors.text,
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: 2,
        textAlign: 'center',
    },

    // Option buttons
    optionsGrid: {
        gap: spacing[2],
    },
    optionsList: {
        flex: 1,
        gap: spacing[2],
    },
    optionButton: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[4],
        marginBottom: spacing[2],
    },
    optionButtonActive: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryMuted,
    },
    optionButtonDanger: {
        borderColor: colors.warning,
        backgroundColor: 'rgba(255, 68, 0, 0.1)',
    },
    optionText: {
        ...textStyles.label,
        color: colors.textSecondary,
        fontSize: 14,
    },
    optionTextActive: {
        color: colors.text,
    },
    optionSublabel: {
        ...textStyles.caption,
        color: colors.textDim,
        marginTop: spacing[1],
    },
    optionSublabelActive: {
        color: colors.textSecondary,
    },

    // Number inputs
    numberInputContainer: {
        marginBottom: spacing[4],
    },
    numberInputLabel: {
        ...textStyles.label,
        color: colors.textSecondary,
        marginBottom: spacing[2],
    },
    numberInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
    },
    numberInput: {
        flex: 1,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderBottomColor: colors.primary,
        borderBottomWidth: 2,
        padding: spacing[4],
        color: colors.text,
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        maxWidth: 150,
    },
    numberInputUnit: {
        ...textStyles.label,
        color: colors.textDim,
    },

    // Days selector
    daysSelector: {
        flexDirection: 'row',
        gap: spacing[2],
        justifyContent: 'center',
    },
    dayButton: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: spacing[4],
    },
    dayButtonActive: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryMuted,
    },
    dayNumber: {
        fontSize: 28,
        fontWeight: '900',
        color: colors.textSecondary,
    },
    dayNumberActive: {
        color: colors.primary,
    },
    dayLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        marginTop: spacing[1],
    },
    dayLabelActive: {
        color: colors.textSecondary,
    },
    dayHint: {
        ...textStyles.body,
        color: colors.textDim,
        textAlign: 'center',
        marginTop: spacing[4],
    },

    // Toggle row
    toggleRow: {
        flexDirection: 'row',
        gap: spacing[2],
    },
    toggleButton: {
        flex: 1,
    },

    // Navigation
    navContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: screen.paddingHorizontal,
        paddingVertical: spacing[4],
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.background,
    },
    backButton: {
        paddingVertical: spacing[3],
        paddingHorizontal: spacing[4],
        minWidth: 80,
    },
    backText: {
        ...textStyles.buttonSmall,
        color: colors.textDim,
    },
    nextButton: {
        backgroundColor: colors.primary,
        paddingVertical: spacing[3],
        paddingHorizontal: spacing[6],
    },
    nextButtonDisabled: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    nextText: {
        ...textStyles.button,
        color: colors.text,
    },
    forgeButton: {
        paddingHorizontal: spacing[8],
    },
    forgeText: {
        ...textStyles.button,
        color: colors.text,
        fontSize: 16,
    },
});

export default OnboardingScreen;
