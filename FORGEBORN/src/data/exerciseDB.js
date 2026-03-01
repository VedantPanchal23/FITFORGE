/**
 * FORGEBORN — EXERCISE DATABASE
 * 
 * 200+ exercises organized by muscle group.
 * Each exercise has: name, muscle, equipment, difficulty, default sets/reps,
 * instructions, and tips.
 * 
 * Muscle Groups: CHEST, BACK, SHOULDERS, BICEPS, TRICEPS, LEGS, CORE, CARDIO, YOGA
 * Equipment: BARBELL, DUMBBELL, CABLE, MACHINE, BODYWEIGHT, BAND, KETTLEBELL
 * Difficulty: BEGINNER, INTERMEDIATE, ADVANCED
 */

export const MuscleGroup = {
    CHEST: 'CHEST',
    BACK: 'BACK',
    SHOULDERS: 'SHOULDERS',
    BICEPS: 'BICEPS',
    TRICEPS: 'TRICEPS',
    LEGS: 'LEGS',
    GLUTES: 'GLUTES',
    CORE: 'CORE',
    FOREARMS: 'FOREARMS',
    CARDIO: 'CARDIO',
    FULL_BODY: 'FULL_BODY',
};

export const Equipment = {
    BARBELL: 'BARBELL',
    DUMBBELL: 'DUMBBELL',
    CABLE: 'CABLE',
    MACHINE: 'MACHINE',
    BODYWEIGHT: 'BODYWEIGHT',
    BAND: 'BAND',
    KETTLEBELL: 'KETTLEBELL',
    EZ_BAR: 'EZ_BAR',
    SMITH: 'SMITH',
    NONE: 'NONE',
};

export const Difficulty = {
    BEGINNER: 'BEGINNER',
    INTERMEDIATE: 'INTERMEDIATE',
    ADVANCED: 'ADVANCED',
};

// ─── EXERCISE DATABASE ────────────────────────────────────────────────────────

export const exercises = [

    // ═══════════════════════════════════════════════════════════
    // CHEST
    // ═══════════════════════════════════════════════════════════
    {
        id: 'chest_01', name: 'FLAT BARBELL BENCH PRESS',
        muscle: MuscleGroup.CHEST, secondary: [MuscleGroup.TRICEPS, MuscleGroup.SHOULDERS],
        equipment: Equipment.BARBELL, difficulty: Difficulty.INTERMEDIATE,
        defaultSets: 4, defaultReps: '8-10', restSeconds: 90,
        instructions: 'Lie flat on bench. Grip bar slightly wider than shoulder width. Lower to mid-chest, press up explosively.',
        tips: 'Keep feet flat, arch lower back slightly. Squeeze chest at top.',
    },
    {
        id: 'chest_02', name: 'INCLINE BARBELL BENCH PRESS',
        muscle: MuscleGroup.CHEST, secondary: [MuscleGroup.SHOULDERS, MuscleGroup.TRICEPS],
        equipment: Equipment.BARBELL, difficulty: Difficulty.INTERMEDIATE,
        defaultSets: 4, defaultReps: '8-10', restSeconds: 90,
        instructions: 'Set bench to 30-45 degrees. Lower bar to upper chest, press up.',
        tips: 'Focus on upper chest. Don\'t let elbows flare too wide.',
    },
    {
        id: 'chest_03', name: 'DECLINE BARBELL BENCH PRESS',
        muscle: MuscleGroup.CHEST, secondary: [MuscleGroup.TRICEPS],
        equipment: Equipment.BARBELL, difficulty: Difficulty.INTERMEDIATE,
        defaultSets: 3, defaultReps: '8-10', restSeconds: 90,
        instructions: 'Set bench to decline. Hook feet. Lower bar to lower chest.',
        tips: 'Targets lower chest. Use spotter for safety.',
    },
    {
        id: 'chest_04', name: 'FLAT DUMBBELL BENCH PRESS',
        muscle: MuscleGroup.CHEST, secondary: [MuscleGroup.TRICEPS, MuscleGroup.SHOULDERS],
        equipment: Equipment.DUMBBELL, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: '10-12', restSeconds: 75,
        instructions: 'Lie flat with dumbbells. Press up, bringing them together at top.',
        tips: 'Greater range of motion than barbell. Control the negative.',
    },
    {
        id: 'chest_05', name: 'INCLINE DUMBBELL BENCH PRESS',
        muscle: MuscleGroup.CHEST, secondary: [MuscleGroup.SHOULDERS],
        equipment: Equipment.DUMBBELL, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: '10-12', restSeconds: 75,
        instructions: 'Incline bench 30-45°. Press dumbbells up from shoulder level.',
        tips: 'Great for upper chest development. Squeeze at top.',
    },
    {
        id: 'chest_06', name: 'DUMBBELL FLYES',
        muscle: MuscleGroup.CHEST, secondary: [],
        equipment: Equipment.DUMBBELL, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: '12-15', restSeconds: 60,
        instructions: 'Lie flat. Arms extended, slight bend in elbows. Lower in arc to sides.',
        tips: 'Stretch at bottom, squeeze at top. Don\'t go too heavy.',
    },
    {
        id: 'chest_07', name: 'CABLE CROSSOVER',
        muscle: MuscleGroup.CHEST, secondary: [],
        equipment: Equipment.CABLE, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: '12-15', restSeconds: 60,
        instructions: 'Stand between cable stacks. Pull handles together in front of chest.',
        tips: 'Step forward for more stretch. Vary height for different chest areas.',
    },
    {
        id: 'chest_08', name: 'PUSH-UPS',
        muscle: MuscleGroup.CHEST, secondary: [MuscleGroup.TRICEPS, MuscleGroup.CORE],
        equipment: Equipment.BODYWEIGHT, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: 'MAX', restSeconds: 60,
        instructions: 'Hands shoulder-width. Body straight. Lower chest to floor, push up.',
        tips: 'Core tight. Full range of motion. Scale with knees if needed.',
    },
    {
        id: 'chest_09', name: 'DIAMOND PUSH-UPS',
        muscle: MuscleGroup.CHEST, secondary: [MuscleGroup.TRICEPS],
        equipment: Equipment.BODYWEIGHT, difficulty: Difficulty.INTERMEDIATE,
        defaultSets: 3, defaultReps: 'MAX', restSeconds: 60,
        instructions: 'Hands together forming diamond under chest. Push up.',
        tips: 'Hits inner chest and triceps harder. Challenging.',
    },
    {
        id: 'chest_10', name: 'CHEST DIP',
        muscle: MuscleGroup.CHEST, secondary: [MuscleGroup.TRICEPS, MuscleGroup.SHOULDERS],
        equipment: Equipment.BODYWEIGHT, difficulty: Difficulty.INTERMEDIATE,
        defaultSets: 3, defaultReps: '8-12', restSeconds: 90,
        instructions: 'Lean forward on dip bars. Lower body until chest stretch, push up.',
        tips: 'Lean forward for more chest activation. Add weight when easy.',
    },
    {
        id: 'chest_11', name: 'PEC DECK MACHINE',
        muscle: MuscleGroup.CHEST, secondary: [],
        equipment: Equipment.MACHINE, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: '12-15', restSeconds: 60,
        instructions: 'Sit with back flat. Bring pads together in front of chest.',
        tips: 'Squeeze hard at contraction. Control the return.',
    },
    {
        id: 'chest_12', name: 'LANDMINE PRESS',
        muscle: MuscleGroup.CHEST, secondary: [MuscleGroup.SHOULDERS],
        equipment: Equipment.BARBELL, difficulty: Difficulty.INTERMEDIATE,
        defaultSets: 3, defaultReps: '10-12', restSeconds: 75,
        instructions: 'Hold end of barbell at chest. Press up and forward.',
        tips: 'Great for upper chest. Unilateral or bilateral.',
    },

    // ═══════════════════════════════════════════════════════════
    // BACK
    // ═══════════════════════════════════════════════════════════
    {
        id: 'back_01', name: 'DEADLIFT',
        muscle: MuscleGroup.BACK, secondary: [MuscleGroup.LEGS, MuscleGroup.GLUTES, MuscleGroup.CORE],
        equipment: Equipment.BARBELL, difficulty: Difficulty.ADVANCED,
        defaultSets: 4, defaultReps: '5', restSeconds: 180,
        instructions: 'Stand with feet hip-width. Grip bar. Drive through heels, extend hips and knees.',
        tips: 'Keep back straight. Don\'t round. This is king of all exercises.',
    },
    {
        id: 'back_02', name: 'BARBELL ROW',
        muscle: MuscleGroup.BACK, secondary: [MuscleGroup.BICEPS],
        equipment: Equipment.BARBELL, difficulty: Difficulty.INTERMEDIATE,
        defaultSets: 4, defaultReps: '8-10', restSeconds: 90,
        instructions: 'Bend at hips, back flat. Pull bar to lower chest.',
        tips: 'Squeeze shoulder blades. Don\'t use momentum.',
    },
    {
        id: 'back_03', name: 'PULL-UPS',
        muscle: MuscleGroup.BACK, secondary: [MuscleGroup.BICEPS, MuscleGroup.CORE],
        equipment: Equipment.BODYWEIGHT, difficulty: Difficulty.INTERMEDIATE,
        defaultSets: 4, defaultReps: 'MAX', restSeconds: 90,
        instructions: 'Hang from bar, overhand grip. Pull chin over bar.',
        tips: 'Full dead hang at bottom. No kipping. Add weight when easy.',
    },
    {
        id: 'back_04', name: 'CHIN-UPS',
        muscle: MuscleGroup.BACK, secondary: [MuscleGroup.BICEPS],
        equipment: Equipment.BODYWEIGHT, difficulty: Difficulty.INTERMEDIATE,
        defaultSets: 3, defaultReps: 'MAX', restSeconds: 90,
        instructions: 'Underhand grip. Pull chin over bar.',
        tips: 'More bicep involvement than pull-ups. Great compound.',
    },
    {
        id: 'back_05', name: 'LAT PULLDOWN',
        muscle: MuscleGroup.BACK, secondary: [MuscleGroup.BICEPS],
        equipment: Equipment.CABLE, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: '10-12', restSeconds: 75,
        instructions: 'Sit at lat pulldown. Pull bar to upper chest.',
        tips: 'Lean back slightly. Squeeze lats. Don\'t pull behind neck.',
    },
    {
        id: 'back_06', name: 'SEATED CABLE ROW',
        muscle: MuscleGroup.BACK, secondary: [MuscleGroup.BICEPS],
        equipment: Equipment.CABLE, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: '10-12', restSeconds: 75,
        instructions: 'Sit with feet on platform. Pull handle to abdomen.',
        tips: 'Keep chest up. Squeeze shoulder blades together.',
    },
    {
        id: 'back_07', name: 'SINGLE-ARM DUMBBELL ROW',
        muscle: MuscleGroup.BACK, secondary: [MuscleGroup.BICEPS],
        equipment: Equipment.DUMBBELL, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: '10-12', restSeconds: 60,
        instructions: 'One knee on bench. Row dumbbell to hip.',
        tips: 'Keep torso parallel to floor. Great for lat width.',
    },
    {
        id: 'back_08', name: 'T-BAR ROW',
        muscle: MuscleGroup.BACK, secondary: [MuscleGroup.BICEPS],
        equipment: Equipment.BARBELL, difficulty: Difficulty.INTERMEDIATE,
        defaultSets: 3, defaultReps: '8-10', restSeconds: 90,
        instructions: 'Straddle bar with V-grip handle. Row to chest.',
        tips: 'Great for back thickness. Control the weight.',
    },
    {
        id: 'back_09', name: 'FACE PULLS',
        muscle: MuscleGroup.BACK, secondary: [MuscleGroup.SHOULDERS],
        equipment: Equipment.CABLE, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: '15-20', restSeconds: 60,
        instructions: 'Cable at face height with rope. Pull to face, externally rotate.',
        tips: 'Essential for shoulder health. Do these every workout.',
    },
    {
        id: 'back_10', name: 'INVERTED ROWS',
        muscle: MuscleGroup.BACK, secondary: [MuscleGroup.BICEPS, MuscleGroup.CORE],
        equipment: Equipment.BODYWEIGHT, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: '12-15', restSeconds: 60,
        instructions: 'Hang under bar/smith machine. Pull chest to bar.',
        tips: 'Great calisthenics exercise. Adjust body angle for difficulty.',
    },
    {
        id: 'back_11', name: 'RACK PULLS',
        muscle: MuscleGroup.BACK, secondary: [MuscleGroup.GLUTES],
        equipment: Equipment.BARBELL, difficulty: Difficulty.INTERMEDIATE,
        defaultSets: 3, defaultReps: '5-8', restSeconds: 120,
        instructions: 'Set bar at knee height in rack. Deadlift from there.',
        tips: 'Targets upper back. Can go heavier than full deadlifts.',
    },
    {
        id: 'back_12', name: 'STRAIGHT ARM PULLDOWN',
        muscle: MuscleGroup.BACK, secondary: [],
        equipment: Equipment.CABLE, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: '12-15', restSeconds: 60,
        instructions: 'Stand at cable. Arms straight, pull bar to thighs.',
        tips: 'Isolates lats. Great as finisher or pre-exhaust.',
    },

    // ═══════════════════════════════════════════════════════════
    // SHOULDERS
    // ═══════════════════════════════════════════════════════════
    {
        id: 'shoulders_01', name: 'OVERHEAD PRESS',
        muscle: MuscleGroup.SHOULDERS, secondary: [MuscleGroup.TRICEPS],
        equipment: Equipment.BARBELL, difficulty: Difficulty.INTERMEDIATE,
        defaultSets: 4, defaultReps: '6-8', restSeconds: 90,
        instructions: 'Standing or seated. Press bar from shoulders overhead.',
        tips: 'Core tight. Full lockout at top. The king of shoulder exercises.',
    },
    {
        id: 'shoulders_02', name: 'DUMBBELL SHOULDER PRESS',
        muscle: MuscleGroup.SHOULDERS, secondary: [MuscleGroup.TRICEPS],
        equipment: Equipment.DUMBBELL, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: '8-10', restSeconds: 75,
        instructions: 'Seated or standing. Press dumbbells overhead.',
        tips: 'Don\'t clank dumbbells together at top. Control the negative.',
    },
    {
        id: 'shoulders_03', name: 'LATERAL RAISES',
        muscle: MuscleGroup.SHOULDERS, secondary: [],
        equipment: Equipment.DUMBBELL, difficulty: Difficulty.BEGINNER,
        defaultSets: 4, defaultReps: '12-15', restSeconds: 60,
        instructions: 'Arms at sides. Raise dumbbells to shoulder height sideways.',
        tips: 'Slight bend in elbows. Lead with elbows not hands. Go light.',
    },
    {
        id: 'shoulders_04', name: 'FRONT RAISES',
        muscle: MuscleGroup.SHOULDERS, secondary: [],
        equipment: Equipment.DUMBBELL, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: '12-15', restSeconds: 60,
        instructions: 'Raise dumbbells in front to shoulder height.',
        tips: 'Alternate arms or both together. Don\'t swing.',
    },
    {
        id: 'shoulders_05', name: 'REAR DELT FLYES',
        muscle: MuscleGroup.SHOULDERS, secondary: [MuscleGroup.BACK],
        equipment: Equipment.DUMBBELL, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: '15-20', restSeconds: 60,
        instructions: 'Bent over. Raise dumbbells to sides, squeezing rear delts.',
        tips: 'Essential for balanced shoulders. Most people neglect these.',
    },
    {
        id: 'shoulders_06', name: 'ARNOLD PRESS',
        muscle: MuscleGroup.SHOULDERS, secondary: [MuscleGroup.TRICEPS],
        equipment: Equipment.DUMBBELL, difficulty: Difficulty.INTERMEDIATE,
        defaultSets: 3, defaultReps: '8-10', restSeconds: 75,
        instructions: 'Start with palms facing you. Rotate and press overhead.',
        tips: 'Invented by Arnold. Hits all three delt heads.',
    },
    {
        id: 'shoulders_07', name: 'CABLE LATERAL RAISES',
        muscle: MuscleGroup.SHOULDERS, secondary: [],
        equipment: Equipment.CABLE, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: '12-15', restSeconds: 60,
        instructions: 'Stand sideways to cable. Raise arm to shoulder height.',
        tips: 'Constant tension throughout. Better than dumbbells for some.',
    },
    {
        id: 'shoulders_08', name: 'UPRIGHT ROW',
        muscle: MuscleGroup.SHOULDERS, secondary: [MuscleGroup.BICEPS],
        equipment: Equipment.BARBELL, difficulty: Difficulty.INTERMEDIATE,
        defaultSets: 3, defaultReps: '10-12', restSeconds: 75,
        instructions: 'Narrow grip. Pull bar to chin, elbows high.',
        tips: 'Use wide grip if shoulders bother. Can use dumbbells too.',
    },
    {
        id: 'shoulders_09', name: 'HANDSTAND PUSH-UPS',
        muscle: MuscleGroup.SHOULDERS, secondary: [MuscleGroup.TRICEPS, MuscleGroup.CORE],
        equipment: Equipment.BODYWEIGHT, difficulty: Difficulty.ADVANCED,
        defaultSets: 3, defaultReps: 'MAX', restSeconds: 90,
        instructions: 'Handstand against wall. Lower head to floor, push up.',
        tips: 'Ultimate bodyweight shoulder exercise. Start with pike push-ups.',
    },
    {
        id: 'shoulders_10', name: 'PIKE PUSH-UPS',
        muscle: MuscleGroup.SHOULDERS, secondary: [MuscleGroup.TRICEPS],
        equipment: Equipment.BODYWEIGHT, difficulty: Difficulty.INTERMEDIATE,
        defaultSets: 3, defaultReps: '8-12', restSeconds: 60,
        instructions: 'Inverted V position. Lower head between hands, push up.',
        tips: 'Progression to handstand push-ups. Elevate feet for more difficulty.',
    },

    // ═══════════════════════════════════════════════════════════
    // BICEPS
    // ═══════════════════════════════════════════════════════════
    {
        id: 'biceps_01', name: 'BARBELL CURL',
        muscle: MuscleGroup.BICEPS, secondary: [MuscleGroup.FOREARMS],
        equipment: Equipment.BARBELL, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: '10-12', restSeconds: 60,
        instructions: 'Stand with barbell. Curl to shoulders, palms up.',
        tips: 'No swinging. Keep elbows pinned. Squeeze at top.',
    },
    {
        id: 'biceps_02', name: 'DUMBBELL CURL',
        muscle: MuscleGroup.BICEPS, secondary: [MuscleGroup.FOREARMS],
        equipment: Equipment.DUMBBELL, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: '10-12', restSeconds: 60,
        instructions: 'Alternate or simultaneous curls to shoulders.',
        tips: 'Supinate wrist at top for extra squeeze.',
    },
    {
        id: 'biceps_03', name: 'HAMMER CURLS',
        muscle: MuscleGroup.BICEPS, secondary: [MuscleGroup.FOREARMS],
        equipment: Equipment.DUMBBELL, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: '10-12', restSeconds: 60,
        instructions: 'Neutral grip (palms facing). Curl to shoulders.',
        tips: 'Hits brachialis for arm thickness. Great for forearms too.',
    },
    {
        id: 'biceps_04', name: 'PREACHER CURL',
        muscle: MuscleGroup.BICEPS, secondary: [],
        equipment: Equipment.EZ_BAR, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: '10-12', restSeconds: 60,
        instructions: 'Arms on preacher pad. Curl EZ bar up.',
        tips: 'Strict isolation. Don\'t let weight drop fast at bottom.',
    },
    {
        id: 'biceps_05', name: 'CONCENTRATION CURL',
        muscle: MuscleGroup.BICEPS, secondary: [],
        equipment: Equipment.DUMBBELL, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: '12-15', restSeconds: 45,
        instructions: 'Seated, elbow braced against inner thigh. Curl up.',
        tips: 'Peak contraction focus. Squeeze hard at top.',
    },
    {
        id: 'biceps_06', name: 'CABLE CURL',
        muscle: MuscleGroup.BICEPS, secondary: [],
        equipment: Equipment.CABLE, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: '12-15', restSeconds: 60,
        instructions: 'Low cable with bar or rope. Curl up.',
        tips: 'Constant tension throughout. Great finisher.',
    },
    {
        id: 'biceps_07', name: 'INCLINE DUMBBELL CURL',
        muscle: MuscleGroup.BICEPS, secondary: [],
        equipment: Equipment.DUMBBELL, difficulty: Difficulty.INTERMEDIATE,
        defaultSets: 3, defaultReps: '10-12', restSeconds: 60,
        instructions: 'Lie back on incline bench. Curl dumbbells up.',
        tips: 'Deep stretch at bottom. Hits long head of biceps.',
    },
    {
        id: 'biceps_08', name: 'SPIDER CURLS',
        muscle: MuscleGroup.BICEPS, secondary: [],
        equipment: Equipment.DUMBBELL, difficulty: Difficulty.INTERMEDIATE,
        defaultSets: 3, defaultReps: '12-15', restSeconds: 45,
        instructions: 'Lean over incline bench chest-down. Curl dumbbells.',
        tips: 'Eliminates all cheating. Pure bicep isolation.',
    },

    // ═══════════════════════════════════════════════════════════
    // TRICEPS
    // ═══════════════════════════════════════════════════════════
    {
        id: 'triceps_01', name: 'CLOSE GRIP BENCH PRESS',
        muscle: MuscleGroup.TRICEPS, secondary: [MuscleGroup.CHEST],
        equipment: Equipment.BARBELL, difficulty: Difficulty.INTERMEDIATE,
        defaultSets: 3, defaultReps: '8-10', restSeconds: 90,
        instructions: 'Bench press with hands shoulder-width apart.',
        tips: 'Best tricep mass builder. Keep elbows close to body.',
    },
    {
        id: 'triceps_02', name: 'TRICEP PUSHDOWN',
        muscle: MuscleGroup.TRICEPS, secondary: [],
        equipment: Equipment.CABLE, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: '12-15', restSeconds: 60,
        instructions: 'High cable with bar/rope. Push down to full extension.',
        tips: 'Lock elbows in place. Squeeze at bottom.',
    },
    {
        id: 'triceps_03', name: 'OVERHEAD TRICEP EXTENSION',
        muscle: MuscleGroup.TRICEPS, secondary: [],
        equipment: Equipment.DUMBBELL, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: '10-12', restSeconds: 60,
        instructions: 'Hold dumbbell overhead. Lower behind head, extend.',
        tips: 'Stretches long head. Keep elbows pointed up.',
    },
    {
        id: 'triceps_04', name: 'SKULL CRUSHERS',
        muscle: MuscleGroup.TRICEPS, secondary: [],
        equipment: Equipment.EZ_BAR, difficulty: Difficulty.INTERMEDIATE,
        defaultSets: 3, defaultReps: '10-12', restSeconds: 75,
        instructions: 'Lie flat. Lower EZ bar to forehead, extend arms.',
        tips: 'Don\'t actually crush your skull. Control is key.',
    },
    {
        id: 'triceps_05', name: 'TRICEP DIPS',
        muscle: MuscleGroup.TRICEPS, secondary: [MuscleGroup.CHEST, MuscleGroup.SHOULDERS],
        equipment: Equipment.BODYWEIGHT, difficulty: Difficulty.INTERMEDIATE,
        defaultSets: 3, defaultReps: '8-12', restSeconds: 75,
        instructions: 'Upright on dip bars. Lower and push up.',
        tips: 'Stay upright for more tricep. Lean forward for more chest.',
    },
    {
        id: 'triceps_06', name: 'KICKBACKS',
        muscle: MuscleGroup.TRICEPS, secondary: [],
        equipment: Equipment.DUMBBELL, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: '12-15', restSeconds: 45,
        instructions: 'Bent over, elbow locked at side. Extend arm back.',
        tips: 'Squeeze at full extension. Don\'t swing.',
    },
    {
        id: 'triceps_07', name: 'DIAMOND PUSH-UPS',
        muscle: MuscleGroup.TRICEPS, secondary: [MuscleGroup.CHEST],
        equipment: Equipment.BODYWEIGHT, difficulty: Difficulty.INTERMEDIATE,
        defaultSets: 3, defaultReps: 'MAX', restSeconds: 60,
        instructions: 'Hands together forming diamond. Push up.',
        tips: 'Best bodyweight tricep exercise.',
    },

    // ═══════════════════════════════════════════════════════════
    // LEGS
    // ═══════════════════════════════════════════════════════════
    {
        id: 'legs_01', name: 'BARBELL SQUAT',
        muscle: MuscleGroup.LEGS, secondary: [MuscleGroup.GLUTES, MuscleGroup.CORE],
        equipment: Equipment.BARBELL, difficulty: Difficulty.INTERMEDIATE,
        defaultSets: 4, defaultReps: '6-8', restSeconds: 180,
        instructions: 'Bar on upper back. Feet shoulder-width. Squat to parallel or below.',
        tips: 'King of lower body. Drive through heels. Keep chest up.',
    },
    {
        id: 'legs_02', name: 'FRONT SQUAT',
        muscle: MuscleGroup.LEGS, secondary: [MuscleGroup.CORE],
        equipment: Equipment.BARBELL, difficulty: Difficulty.ADVANCED,
        defaultSets: 4, defaultReps: '6-8', restSeconds: 180,
        instructions: 'Bar on front delts. Cross arms or clean grip. Squat deep.',
        tips: 'More quad dominant. Requires good mobility.',
    },
    {
        id: 'legs_03', name: 'LEG PRESS',
        muscle: MuscleGroup.LEGS, secondary: [MuscleGroup.GLUTES],
        equipment: Equipment.MACHINE, difficulty: Difficulty.BEGINNER,
        defaultSets: 4, defaultReps: '10-12', restSeconds: 90,
        instructions: 'Seated on leg press. Push platform away, return under control.',
        tips: 'Foot placement changes emphasis. High = glutes, Low = quads.',
    },
    {
        id: 'legs_04', name: 'ROMANIAN DEADLIFT',
        muscle: MuscleGroup.LEGS, secondary: [MuscleGroup.GLUTES, MuscleGroup.BACK],
        equipment: Equipment.BARBELL, difficulty: Difficulty.INTERMEDIATE,
        defaultSets: 3, defaultReps: '8-10', restSeconds: 90,
        instructions: 'Slight knee bend. Hinge at hips, lower bar along legs.',
        tips: 'Feel the hamstring stretch. Don\'t round back.',
    },
    {
        id: 'legs_05', name: 'LUNGES',
        muscle: MuscleGroup.LEGS, secondary: [MuscleGroup.GLUTES],
        equipment: Equipment.DUMBBELL, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: '10 each', restSeconds: 75,
        instructions: 'Step forward, lower back knee to floor, push back up.',
        tips: 'Walking or stationary. Great for unilateral strength.',
    },
    {
        id: 'legs_06', name: 'BULGARIAN SPLIT SQUAT',
        muscle: MuscleGroup.LEGS, secondary: [MuscleGroup.GLUTES],
        equipment: Equipment.DUMBBELL, difficulty: Difficulty.INTERMEDIATE,
        defaultSets: 3, defaultReps: '8-10 each', restSeconds: 75,
        instructions: 'Rear foot on bench. Lower front leg to parallel.',
        tips: 'Brutal but effective. Great for single-leg strength.',
    },
    {
        id: 'legs_07', name: 'LEG EXTENSION',
        muscle: MuscleGroup.LEGS, secondary: [],
        equipment: Equipment.MACHINE, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: '12-15', restSeconds: 60,
        instructions: 'Seated, extend legs against pad.',
        tips: 'Pure quad isolation. Squeeze at top. Go light.',
    },
    {
        id: 'legs_08', name: 'LEG CURL',
        muscle: MuscleGroup.LEGS, secondary: [],
        equipment: Equipment.MACHINE, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: '12-15', restSeconds: 60,
        instructions: 'Lying or seated. Curl weight toward glutes.',
        tips: 'Hamstring isolation. Don\'t let hips lift.',
    },
    {
        id: 'legs_09', name: 'CALF RAISES',
        muscle: MuscleGroup.LEGS, secondary: [],
        equipment: Equipment.MACHINE, difficulty: Difficulty.BEGINNER,
        defaultSets: 4, defaultReps: '15-20', restSeconds: 45,
        instructions: 'Stand on edge of platform. Rise up on toes.',
        tips: 'Full stretch at bottom, hold at top. High reps work best.',
    },
    {
        id: 'legs_10', name: 'GOBLET SQUAT',
        muscle: MuscleGroup.LEGS, secondary: [MuscleGroup.CORE],
        equipment: Equipment.DUMBBELL, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: '12-15', restSeconds: 75,
        instructions: 'Hold dumbbell at chest. Squat deep.',
        tips: 'Great for learning squat form. Builds good depth.',
    },
    {
        id: 'legs_11', name: 'PISTOL SQUAT',
        muscle: MuscleGroup.LEGS, secondary: [MuscleGroup.CORE, MuscleGroup.GLUTES],
        equipment: Equipment.BODYWEIGHT, difficulty: Difficulty.ADVANCED,
        defaultSets: 3, defaultReps: '5 each', restSeconds: 90,
        instructions: 'Stand on one leg. Squat all the way down, other leg extended.',
        tips: 'Ultimate calisthenics leg exercise. Requires balance and strength.',
    },
    {
        id: 'legs_12', name: 'WALL SIT',
        muscle: MuscleGroup.LEGS, secondary: [],
        equipment: Equipment.BODYWEIGHT, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: '60 sec', restSeconds: 60,
        instructions: 'Back against wall. Lower to 90° knee angle. Hold.',
        tips: 'Pure isometric quad burn. Mental toughness builder.',
    },

    // ═══════════════════════════════════════════════════════════
    // GLUTES
    // ═══════════════════════════════════════════════════════════
    {
        id: 'glutes_01', name: 'HIP THRUST',
        muscle: MuscleGroup.GLUTES, secondary: [MuscleGroup.LEGS],
        equipment: Equipment.BARBELL, difficulty: Difficulty.INTERMEDIATE,
        defaultSets: 4, defaultReps: '10-12', restSeconds: 90,
        instructions: 'Upper back on bench. Bar on hips. Drive hips up.',
        tips: 'Squeeze glutes hard at top. Best glute builder.',
    },
    {
        id: 'glutes_02', name: 'GLUTE BRIDGE',
        muscle: MuscleGroup.GLUTES, secondary: [],
        equipment: Equipment.BODYWEIGHT, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: '15-20', restSeconds: 60,
        instructions: 'Lie on back. Feet flat. Drive hips up.',
        tips: 'Squeeze at top. Add band for more resistance.',
    },
    {
        id: 'glutes_03', name: 'CABLE KICKBACKS',
        muscle: MuscleGroup.GLUTES, secondary: [],
        equipment: Equipment.CABLE, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: '12-15 each', restSeconds: 60,
        instructions: 'Low cable with ankle strap. Kick back with straight leg.',
        tips: 'Squeeze glute at top. Don\'t arch lower back.',
    },

    // ═══════════════════════════════════════════════════════════
    // CORE
    // ═══════════════════════════════════════════════════════════
    {
        id: 'core_01', name: 'PLANK',
        muscle: MuscleGroup.CORE, secondary: [MuscleGroup.SHOULDERS],
        equipment: Equipment.BODYWEIGHT, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: '60 sec', restSeconds: 45,
        instructions: 'Forearms and toes. Body straight. Hold.',
        tips: 'Don\'t let hips sag or pike. Breathe.',
    },
    {
        id: 'core_02', name: 'HANGING LEG RAISES',
        muscle: MuscleGroup.CORE, secondary: [MuscleGroup.FOREARMS],
        equipment: Equipment.BODYWEIGHT, difficulty: Difficulty.INTERMEDIATE,
        defaultSets: 3, defaultReps: '10-15', restSeconds: 60,
        instructions: 'Hang from bar. Raise legs to parallel or higher.',
        tips: 'Control the swing. Slow descent. Best ab exercise.',
    },
    {
        id: 'core_03', name: 'AB ROLLOUT',
        muscle: MuscleGroup.CORE, secondary: [],
        equipment: Equipment.NONE, difficulty: Difficulty.INTERMEDIATE,
        defaultSets: 3, defaultReps: '8-12', restSeconds: 60,
        instructions: 'Kneel with ab wheel. Roll forward and back.',
        tips: 'Don\'t collapse at the bottom. Keep core engaged.',
    },
    {
        id: 'core_04', name: 'RUSSIAN TWISTS',
        muscle: MuscleGroup.CORE, secondary: [],
        equipment: Equipment.BODYWEIGHT, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: '20 total', restSeconds: 45,
        instructions: 'Seated, lean back. Rotate torso side to side.',
        tips: 'Hold weight for extra difficulty. Control the rotation.',
    },
    {
        id: 'core_05', name: 'MOUNTAIN CLIMBERS',
        muscle: MuscleGroup.CORE, secondary: [MuscleGroup.LEGS],
        equipment: Equipment.BODYWEIGHT, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: '30 sec', restSeconds: 45,
        instructions: 'Push-up position. Drive knees to chest alternating.',
        tips: 'Fast pace for cardio. Slow for core activation.',
    },
    {
        id: 'core_06', name: 'BICYCLE CRUNCHES',
        muscle: MuscleGroup.CORE, secondary: [],
        equipment: Equipment.BODYWEIGHT, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: '20 total', restSeconds: 45,
        instructions: 'Lie flat. Alternate elbow to opposite knee.',
        tips: 'Don\'t pull on neck. Rotate from core.',
    },
    {
        id: 'core_07', name: 'DEAD BUG',
        muscle: MuscleGroup.CORE, secondary: [],
        equipment: Equipment.BODYWEIGHT, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: '10 each', restSeconds: 45,
        instructions: 'Lie on back. Extend opposite arm and leg, return.',
        tips: 'Keep lower back pressed into floor. Great for stability.',
    },
    {
        id: 'core_08', name: 'L-SIT',
        muscle: MuscleGroup.CORE, secondary: [MuscleGroup.TRICEPS],
        equipment: Equipment.BODYWEIGHT, difficulty: Difficulty.ADVANCED,
        defaultSets: 3, defaultReps: '20 sec', restSeconds: 60,
        instructions: 'On parallettes or floor. Lift body with legs straight out.',
        tips: 'Insane core and hip flexor strength. Start with tucks.',
    },

    // ═══════════════════════════════════════════════════════════
    // FOREARMS
    // ═══════════════════════════════════════════════════════════
    {
        id: 'forearms_01', name: 'WRIST CURLS',
        muscle: MuscleGroup.FOREARMS, secondary: [],
        equipment: Equipment.DUMBBELL, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: '15-20', restSeconds: 45,
        instructions: 'Forearms on bench, wrists hanging off. Curl up.',
        tips: 'Both palms up and palms down. High reps.',
    },
    {
        id: 'forearms_02', name: 'FARMER\'S WALK',
        muscle: MuscleGroup.FOREARMS, secondary: [MuscleGroup.CORE, MuscleGroup.LEGS],
        equipment: Equipment.DUMBBELL, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: '40m', restSeconds: 90,
        instructions: 'Hold heavy dumbbells. Walk with good posture.',
        tips: 'Grip, core, traps all get hit. Go heavy.',
    },
    {
        id: 'forearms_03', name: 'DEAD HANG',
        muscle: MuscleGroup.FOREARMS, secondary: [MuscleGroup.BACK],
        equipment: Equipment.BODYWEIGHT, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: 'MAX TIME', restSeconds: 60,
        instructions: 'Hang from pull-up bar as long as possible.',
        tips: 'Decompresses spine. Builds grip. Track your time.',
    },

    // ═══════════════════════════════════════════════════════════
    // CARDIO
    // ═══════════════════════════════════════════════════════════
    {
        id: 'cardio_01', name: 'RUNNING',
        muscle: MuscleGroup.CARDIO, secondary: [MuscleGroup.LEGS],
        equipment: Equipment.NONE, difficulty: Difficulty.BEGINNER,
        defaultSets: 1, defaultReps: '20-30 min', restSeconds: 0,
        instructions: 'Steady pace or intervals. Maintain good form.',
        tips: 'Start slow, build distance. Invest in good shoes.',
    },
    {
        id: 'cardio_02', name: 'JUMP ROPE',
        muscle: MuscleGroup.CARDIO, secondary: [MuscleGroup.LEGS, MuscleGroup.CORE],
        equipment: Equipment.NONE, difficulty: Difficulty.BEGINNER,
        defaultSets: 5, defaultReps: '2 min', restSeconds: 30,
        instructions: 'Light jumps on balls of feet. Wrists rotate rope.',
        tips: 'Burns massive calories. Great warm-up or finisher.',
    },
    {
        id: 'cardio_03', name: 'BURPEES',
        muscle: MuscleGroup.CARDIO, secondary: [MuscleGroup.FULL_BODY],
        equipment: Equipment.BODYWEIGHT, difficulty: Difficulty.INTERMEDIATE,
        defaultSets: 4, defaultReps: '10', restSeconds: 45,
        instructions: 'Squat, kick back, push-up, jump up. Repeat.',
        tips: 'Full body destroyer. No equipment needed.',
    },
    {
        id: 'cardio_04', name: 'SPRINTS',
        muscle: MuscleGroup.CARDIO, secondary: [MuscleGroup.LEGS, MuscleGroup.GLUTES],
        equipment: Equipment.NONE, difficulty: Difficulty.INTERMEDIATE,
        defaultSets: 8, defaultReps: '30 sec', restSeconds: 60,
        instructions: 'Max effort sprint, followed by rest. Repeat.',
        tips: 'HIIT burns fat for hours after. Warm up first.',
    },
    {
        id: 'cardio_05', name: 'CYCLING',
        muscle: MuscleGroup.CARDIO, secondary: [MuscleGroup.LEGS],
        equipment: Equipment.MACHINE, difficulty: Difficulty.BEGINNER,
        defaultSets: 1, defaultReps: '30-45 min', restSeconds: 0,
        instructions: 'Steady state or intervals on bike.',
        tips: 'Low impact. Great for recovery days too.',
    },
    {
        id: 'cardio_06', name: 'SWIMMING',
        muscle: MuscleGroup.CARDIO, secondary: [MuscleGroup.FULL_BODY],
        equipment: Equipment.NONE, difficulty: Difficulty.BEGINNER,
        defaultSets: 1, defaultReps: '20-30 min', restSeconds: 0,
        instructions: 'Any stroke. Maintain consistent pace.',
        tips: 'Zero impact, full body. The ultimate cardio.',
    },
    {
        id: 'cardio_07', name: 'STAIR CLIMBING',
        muscle: MuscleGroup.CARDIO, secondary: [MuscleGroup.LEGS, MuscleGroup.GLUTES],
        equipment: Equipment.NONE, difficulty: Difficulty.BEGINNER,
        defaultSets: 1, defaultReps: '15-20 min', restSeconds: 0,
        instructions: 'Climb stairs at steady pace or intervals.',
        tips: 'Burns more calories than walking. Great for glutes.',
    },
    {
        id: 'cardio_08', name: 'BATTLE ROPES',
        muscle: MuscleGroup.CARDIO, secondary: [MuscleGroup.SHOULDERS, MuscleGroup.CORE],
        equipment: Equipment.NONE, difficulty: Difficulty.INTERMEDIATE,
        defaultSets: 5, defaultReps: '30 sec', restSeconds: 30,
        instructions: 'Alternate waves, slams, or circles with ropes.',
        tips: 'Insane conditioning. Keep core braced.',
    },
    {
        id: 'cardio_09', name: 'ROWING MACHINE',
        muscle: MuscleGroup.CARDIO, secondary: [MuscleGroup.BACK, MuscleGroup.LEGS],
        equipment: Equipment.MACHINE, difficulty: Difficulty.BEGINNER,
        defaultSets: 1, defaultReps: '20 min', restSeconds: 0,
        instructions: 'Drive with legs, lean back, pull to chest.',
        tips: 'Full body cardio. 80% legs, 20% arms.',
    },
    {
        id: 'cardio_10', name: 'WALKING',
        muscle: MuscleGroup.CARDIO, secondary: [],
        equipment: Equipment.NONE, difficulty: Difficulty.BEGINNER,
        defaultSets: 1, defaultReps: '30-60 min', restSeconds: 0,
        instructions: 'Brisk walk, good posture, swing arms.',
        tips: 'Underrated. 10,000 steps daily. Great for recovery.',
    },

    // ═══════════════════════════════════════════════════════════
    // FULL BODY (Calisthenics / Compound)
    // ═══════════════════════════════════════════════════════════
    {
        id: 'full_01', name: 'MUSCLE-UP',
        muscle: MuscleGroup.FULL_BODY, secondary: [MuscleGroup.BACK, MuscleGroup.CHEST, MuscleGroup.TRICEPS],
        equipment: Equipment.BODYWEIGHT, difficulty: Difficulty.ADVANCED,
        defaultSets: 3, defaultReps: 'MAX', restSeconds: 120,
        instructions: 'Pull-up with explosive transition to dip above bar.',
        tips: 'The ultimate calisthenics move. Requires pull-ups + dips mastery.',
    },
    {
        id: 'full_02', name: 'CLEAN AND PRESS',
        muscle: MuscleGroup.FULL_BODY, secondary: [MuscleGroup.SHOULDERS, MuscleGroup.LEGS],
        equipment: Equipment.BARBELL, difficulty: Difficulty.ADVANCED,
        defaultSets: 4, defaultReps: '5', restSeconds: 120,
        instructions: 'Explosive pull from floor to shoulders, press overhead.',
        tips: 'Olympic lift. Builds power. Learn technique first.',
    },
    {
        id: 'full_03', name: 'TURKISH GET-UP',
        muscle: MuscleGroup.FULL_BODY, secondary: [MuscleGroup.CORE, MuscleGroup.SHOULDERS],
        equipment: Equipment.KETTLEBELL, difficulty: Difficulty.ADVANCED,
        defaultSets: 3, defaultReps: '3 each', restSeconds: 90,
        instructions: 'Lie with KB overhead. Stand up while keeping it up.',
        tips: 'Total body stability and strength. Start light.',
    },
    {
        id: 'full_04', name: 'KETTLEBELL SWING',
        muscle: MuscleGroup.FULL_BODY, secondary: [MuscleGroup.GLUTES, MuscleGroup.CORE],
        equipment: Equipment.KETTLEBELL, difficulty: Difficulty.BEGINNER,
        defaultSets: 4, defaultReps: '15-20', restSeconds: 60,
        instructions: 'Hinge at hips. Swing KB to shoulder height.',
        tips: 'Hip drive, not arm pull. Great conditioning.',
    },
    {
        id: 'full_05', name: 'THRUSTERS',
        muscle: MuscleGroup.FULL_BODY, secondary: [MuscleGroup.LEGS, MuscleGroup.SHOULDERS],
        equipment: Equipment.BARBELL, difficulty: Difficulty.INTERMEDIATE,
        defaultSets: 3, defaultReps: '10', restSeconds: 90,
        instructions: 'Front squat into overhead press in one movement.',
        tips: 'Brutal full body exercise. Great for conditioning.',
    },
    {
        id: 'full_06', name: 'BEAR CRAWL',
        muscle: MuscleGroup.FULL_BODY, secondary: [MuscleGroup.CORE],
        equipment: Equipment.BODYWEIGHT, difficulty: Difficulty.BEGINNER,
        defaultSets: 3, defaultReps: '30 sec', restSeconds: 45,
        instructions: 'On hands and feet, knees hovering. Crawl forward.',
        tips: 'Core stability, shoulder endurance. Deceptively hard.',
    },
];

// ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────────

export const getExercisesByMuscle = (muscle) =>
    exercises.filter(e => e.muscle === muscle);

export const getExercisesByEquipment = (equip) =>
    exercises.filter(e => e.equipment === equip);

export const getExercisesByDifficulty = (diff) =>
    exercises.filter(e => e.difficulty === diff);

export const getExerciseById = (id) =>
    exercises.find(e => e.id === id);

export const getBodyweightExercises = () =>
    exercises.filter(e => e.equipment === Equipment.BODYWEIGHT);

export const searchExercises = (query) => {
    const q = query.toUpperCase();
    return exercises.filter(e =>
        e.name.includes(q) ||
        e.muscle.includes(q) ||
        e.instructions.toUpperCase().includes(q)
    );
};

export default exercises;
