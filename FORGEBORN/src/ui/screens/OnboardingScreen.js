import React, { useState, useRef } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Vibration,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
} from 'react-native';
import { colors, spacing, radius } from '../theme';
import { Typography, Button } from '../components';
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
        <Typography
            variant="body"
            style={[
                { fontWeight: '700' },
                selected ? { color: danger ? colors.danger : colors.primaryDark } : { color: colors.textSecondary }
            ]}
        >
            {label}
        </Typography>
        {sublabel && (
            <Typography
                variant="caption"
                style={[
                    { marginTop: spacing[1] },
                    selected ? { color: danger ? colors.danger : colors.text } : { color: colors.textDim }
                ]}
            >
                {sublabel}
            </Typography>
        )}
    </TouchableOpacity>
);

// ─── Number Input Component ──────────────────────────────────────────────────
const NumberInput = ({ label, value, onChangeText, unit, placeholder }) => (
    <View style={styles.numberInputContainer}>
        <Typography variant="label" color={colors.textSecondary} style={{ marginBottom: spacing[2] }}>
            {label}
        </Typography>
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
            {unit && <Typography variant="body" color={colors.textDim}>{unit}</Typography>}
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
            <Typography variant="largeTitle" style={styles.stepTitle}>What's your name?</Typography>
            <Typography variant="body" color={colors.textDim} style={styles.stepSubtitle}>This is the name you will go by.</Typography>
            <TextInput
                style={styles.nameInput}
                value={name}
                onChangeText={setName}
                placeholder="YOUR NAME"
                placeholderTextColor={colors.textDim}
                autoFocus
                maxLength={20}
            />
        </View>
    );

    const renderStep1_Gender = () => (
        <View style={styles.stepContent}>
            <Typography variant="largeTitle" style={styles.stepTitle}>Gender</Typography>
            <Typography variant="body" color={colors.textDim} style={styles.stepSubtitle}>For accurate calorie and macro calculations.</Typography>
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
            <Typography variant="largeTitle" style={styles.stepTitle}>Your Body</Typography>
            <Typography variant="body" color={colors.textDim} style={styles.stepSubtitle}>We need these numbers to forge your perfect plan.</Typography>
            <NumberInput label="AGE" value={age} onChangeText={setAge} unit="years" placeholder="25" />
            <NumberInput label="WEIGHT" value={weight} onChangeText={setWeight} unit="kg" placeholder="70" />
            <NumberInput label="HEIGHT" value={height} onChangeText={setHeight} unit="cm" placeholder="175" />
        </View>
    );

    const renderStep3_Goal = () => (
        <View style={styles.stepContent}>
            <Typography variant="largeTitle" style={styles.stepTitle}>Goals</Typography>
            <Typography variant="body" color={colors.textDim} style={styles.stepSubtitle}>Choose your path. Select multiple.</Typography>
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
            <Typography variant="largeTitle" style={styles.stepTitle}>Your Level</Typography>
            <Typography variant="body" color={colors.textDim} style={styles.stepSubtitle}>Be honest. The system adjusts everything for you.</Typography>
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
            <Typography variant="largeTitle" style={styles.stepTitle}>Training Days</Typography>
            <Typography variant="body" color={colors.textDim} style={styles.stepSubtitle}>How many days per week can you realistically train?</Typography>
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
                        <Typography
                            variant="largeTitle"
                            style={trainingDays === day ? { color: colors.primaryDark } : { color: colors.textSecondary }}
                        >
                            {day}
                        </Typography>
                        <Typography
                            variant="caption"
                            style={[{ marginTop: spacing[1] }, trainingDays === day ? { color: colors.text } : { color: colors.textDim }]}
                        >
                            DAYS
                        </Typography>
                    </TouchableOpacity>
                ))}
            </View>
            <Typography variant="body" color={colors.textSecondary} style={styles.dayHint}>
                {trainingDays === 3 && 'Full body each session. Great for beginners.'}
                {trainingDays === 4 && 'Upper/Lower split. Solid balanced program.'}
                {trainingDays === 5 && 'Push/Pull/Legs + Upper/Lower. High volume.'}
                {trainingDays === 6 && 'Push/Pull/Legs ×2. Maximum frequency.'}
                {trainingDays === 7 && 'Every day. Rest is for the weak.'}
            </Typography>
        </View>
    );

    const renderStep6_Cardio = () => (
        <View style={styles.stepContent}>
            <Typography variant="largeTitle" style={styles.stepTitle}>Cardio?</Typography>
            <Typography variant="body" color={colors.textDim} style={styles.stepSubtitle}>Added to your training for endurance & heart health.</Typography>
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
                    <Typography variant="label" color={colors.textSecondary} style={{ marginTop: spacing[6], marginBottom: spacing[3] }}>
                        CHOOSE YOUR WEAPONS
                    </Typography>
                    <View style={styles.optionsGrid}>
                        {[
                            { key: CardioType.RUNNING, label: 'RUNNING', sub: 'ENDURANCE' },
                            { key: CardioType.CYCLING, label: 'CYCLING', sub: 'LOW IMPACT' },
                            { key: CardioType.SWIMMING, label: 'SWIMMING', sub: 'FULL BODY' },
                            { key: CardioType.JUMP_ROPE, label: 'JUMP ROPE', sub: 'EXPLOSIVE' },
                            { key: CardioType.WALKING, label: 'WALKING', sub: 'RECOVERY' },
                            { key: CardioType.HIIT, label: 'HIIT', sub: 'INTENSE' },
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
            <Typography variant="largeTitle" style={styles.stepTitle}>Mobility & Injuries</Typography>

            <Typography variant="label" color={colors.textSecondary} style={{ marginBottom: spacing[3] }}>
                WANT YOGA / MOBILITY?
            </Typography>
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

            <Typography variant="label" color={colors.textSecondary} style={{ marginTop: spacing[8], marginBottom: spacing[1] }}>
                ANY INJURIES?
            </Typography>
            <Typography variant="caption" color={colors.textDim} style={{ marginBottom: spacing[3] }}>
                We'll adjust exercises to protect you.
            </Typography>
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
            <Typography variant="largeTitle" style={styles.stepTitle}>Fuel Your Forge</Typography>

            <Typography variant="label" color={colors.textSecondary} style={{ marginBottom: spacing[3] }}>
                DIET PREFERENCE
            </Typography>
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

            <Typography variant="label" color={colors.textSecondary} style={{ marginTop: spacing[8], marginBottom: spacing[3] }}>
                MEALS PER DAY
            </Typography>
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
                        <Typography
                            variant="largeTitle"
                            style={mealsPerDay === num ? { color: colors.primaryDark } : { color: colors.textSecondary }}
                        >
                            {num}
                        </Typography>
                        <Typography
                            variant="caption"
                            style={[{ marginTop: spacing[1] }, mealsPerDay === num ? { color: colors.text } : { color: colors.textDim }]}
                        >
                            MEALS
                        </Typography>
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
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

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
                <Typography variant="caption" color={colors.textDim} style={{ width: 40, textAlign: 'right' }}>
                    {step + 1} / {TOTAL_STEPS}
                </Typography>
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
                    <Button
                        title="← Back"
                        onPress={prevStep}
                        variant="ghost"
                        style={{ paddingHorizontal: spacing[2] }}
                        textStyle={{ color: colors.textSecondary }}
                    />
                ) : (
                    <View style={{ width: 80 }} />
                )}

                {isLastStep ? (
                    <Button
                        title="FORGE MY PLAN"
                        onPress={handleFinish}
                        disabled={!canProceed()}
                        style={{ paddingHorizontal: spacing[8] }}
                    />
                ) : (
                    <Button
                        title="Next →"
                        onPress={nextStep}
                        disabled={!canProceed()}
                        style={!canProceed() ? { backgroundColor: colors.border } : {}}
                        textStyle={!canProceed() ? { color: colors.textDim } : {}}
                    />
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
        paddingTop: spacing[14], // For status bar area
        paddingHorizontal: spacing[6],
        paddingBottom: spacing[4],
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[3],
    },
    progressTrack: {
        flex: 1,
        height: 8,
        backgroundColor: colors.surface,
        borderRadius: radius.full,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: radius.full,
    },

    // Content
    scrollContent: {
        flex: 1,
        paddingHorizontal: spacing[6],
    },
    stepContent: {
        paddingTop: spacing[4],
        paddingBottom: spacing[12],
    },

    // Typography
    stepTitle: {
        marginBottom: spacing[2],
    },
    stepSubtitle: {
        marginBottom: spacing[8],
    },

    // Name input
    nameInput: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing[5],
        color: colors.text,
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
    },

    // Option buttons
    optionsGrid: {
        gap: spacing[3],
    },
    optionsList: {
        flex: 1,
        gap: spacing[3],
    },
    optionButton: {
        backgroundColor: colors.surface,
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing[5],
        marginBottom: spacing[1],
    },
    optionButtonActive: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryLight,
    },
    optionButtonDanger: {
        borderColor: colors.danger,
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
    },

    // Number inputs
    numberInputContainer: {
        marginBottom: spacing[6],
    },
    numberInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[3],
    },
    numberInput: {
        flex: 1,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing[4],
        color: colors.text,
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        maxWidth: 160,
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
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: radius.md,
        paddingVertical: spacing[5],
    },
    dayButtonActive: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryLight,
    },
    dayHint: {
        textAlign: 'center',
        marginTop: spacing[6],
        fontStyle: 'italic',
    },

    // Toggle row
    toggleRow: {
        flexDirection: 'row',
        gap: spacing[3],
    },
    toggleButton: {
        flex: 1,
    },

    // Navigation
    navContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing[6],
        paddingVertical: spacing[4],
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
        backgroundColor: colors.background,
        paddingBottom: Platform.OS === 'ios' ? spacing[8] : spacing[4],
    },
});

export default OnboardingScreen;
