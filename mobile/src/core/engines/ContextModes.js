/**
 * Context Mode Engine
 * Adjusts meal generation based on real-life scenarios
 */

const CONTEXT_MODES = {
    normal: {
        name: 'Normal Mode',
        icon: 'sun',
        description: 'Regular day with normal cooking time',
        rules: {
            macroTolerance: 0.1 // 10% tolerance
        }
    },
    restaurant: {
        name: 'Restaurant Mode',
        icon: 'map-pin',
        description: 'Eating out - focus on protein estimation',
        rules: {
            simplifyPortions: true,
            prioritizeProtein: true,
            allowFlexibleMacros: true,
            macroTolerance: 0.3 // 30% tolerance when eating out
        },
        tips: [
            'Order grilled over fried',
            'Ask for sauces on the side',
            'Double protein, skip the rice/naan',
            'Opt for dal/raita as sides'
        ]
    },
    quick: {
        name: 'Quick Meals Mode',
        icon: 'zap',
        description: 'Short on time - fast prep options',
        rules: {
            maxPrepTime: 10, // minutes
            preferReadyToEat: true,
            filterTags: ['quick', 'no_cook', 'ready_made', 'instant']
        },
        suggestions: [
            'Protein shake + banana',
            'Greek yogurt + nuts',
            'Boiled eggs + bread',
            'Paneer sandwich',
            'Sprouts chaat'
        ]
    },
    low_time: {
        name: 'Low Time Mode',
        icon: 'clock',
        description: 'Very busy schedule - minimal cooking',
        rules: {
            mealCount: 2, // Combine meals
            skipSnacks: true,
            preferShakes: true,
            maxPrepTime: 5
        },
        tips: [
            'Prep meals the night before',
            'Use a meal replacement shake if needed',
            'Keep grab-and-go options ready'
        ]
    },
    budget: {
        name: 'Budget Mode',
        icon: 'dollar-sign',
        description: 'Cost-conscious eating',
        rules: {
            preferBudget: true,
            maxCostPerMeal: 100, // INR
            excludeExpensive: ['protein_powder', 'exotic_fruits', 'imported', 'salmon', 'avocado']
        },
        tips: [
            'Focus on dal, eggs, and local proteins',
            'Seasonal vegetables are cheaper',
            'Buy in bulk for staples',
            'Sprouts are affordable and nutritious'
        ]
    },
    travel: {
        name: 'Travel Mode',
        icon: 'briefcase',
        description: 'On the go - portable foods',
        rules: {
            preferPortable: true,
            maintainCalories: true,
            relaxProteinTarget: 0.8, // 80% of normal
            noRefrigeration: true
        },
        suggestions: [
            'Protein bars',
            'Dry fruits and nuts',
            'Peanut butter sachets',
            'Roasted chana',
            'Upma/poha packets'
        ]
    },
    social: {
        name: 'Social Event Mode',
        icon: 'users',
        description: 'Party or gathering - damage control',
        rules: {
            focusProtein: true,
            reduceCarbs: true,
            allowCheatMargin: true,
            macroTolerance: 0.4 // 40% tolerance for social events
        },
        tips: [
            'Eat a protein-rich snack before the event',
            'Start with salads and grilled items',
            'Limit alcohol - it adds empty calories',
            'One dessert is fine, skip seconds'
        ]
    }
};

/**
 * Get rules for a specific context mode
 * @param {string} mode - mode identifier
 * @returns {object|null} mode configuration or null
 */
function getContextModeRules(mode) {
    return CONTEXT_MODES[mode] || null;
}

/**
 * Get all available context modes
 * @returns {object} all context modes
 */
function getAllContextModes() {
    return Object.entries(CONTEXT_MODES).map(([id, config]) => ({
        id,
        name: config.name,
        icon: config.icon,
        description: config.description
    }));
}

/**
 * Apply context mode filters to available foods
 * @param {array} availableFoods - list of available foods
 * @param {string} mode - context mode to apply
 * @returns {array} filtered food list
 */
function applyContextMode(availableFoods, mode) {
    const config = getContextModeRules(mode);
    if (!config || !config.rules) return availableFoods;

    let filtered = [...availableFoods];
    const rules = config.rules;

    // Filter by tags if specified
    if (rules.filterTags && rules.filterTags.length > 0) {
        const tagFiltered = filtered.filter(f =>
            f.tags?.some(t => rules.filterTags.includes(t.toLowerCase()))
        );
        // Only apply tag filter if it returns results, otherwise keep all foods
        if (tagFiltered.length > 0) {
            filtered = tagFiltered;
        }
    }

    // Filter by prep time
    if (rules.maxPrepTime) {
        const prepFiltered = filtered.filter(f =>
            (f.prep_time_mins || 0) <= rules.maxPrepTime
        );
        if (prepFiltered.length > 0) {
            filtered = prepFiltered;
        }
    }

    // Sort by cost for budget mode
    if (rules.preferBudget) {
        filtered.sort((a, b) => (a.cost_inr || 50) - (b.cost_inr || 50));
    }

    // Exclude expensive items
    if (rules.excludeExpensive && rules.excludeExpensive.length > 0) {
        filtered = filtered.filter(f =>
            !rules.excludeExpensive.some(e =>
                f.id?.toLowerCase().includes(e.toLowerCase()) ||
                f.name?.toLowerCase().includes(e.toLowerCase())
            )
        );
    }

    // Filter for portable foods (travel mode)
    if (rules.preferPortable) {
        const portableFiltered = filtered.filter(f =>
            f.portable === true || f.tags?.includes('portable') || f.tags?.includes('dry')
        );
        if (portableFiltered.length > 0) {
            filtered = portableFiltered;
        }
    }

    // No refrigeration requirement
    if (rules.noRefrigeration) {
        filtered = filtered.filter(f =>
            f.needs_refrigeration !== true
        );
    }

    return filtered;
}

/**
 * Adjust macro targets based on context mode
 * @param {object} macroTargets - original targets { calories, protein, carbs, fats }
 * @param {string} mode - context mode
 * @returns {object} adjusted macro targets with tolerance ranges
 */
function adjustMacrosForContext(macroTargets, mode) {
    const config = getContextModeRules(mode);
    if (!config || !config.rules) {
        return {
            ...macroTargets,
            tolerance: 0.1,
            min: multiplyMacros(macroTargets, 0.9),
            max: multiplyMacros(macroTargets, 1.1)
        };
    }

    const tolerance = config.rules.macroTolerance || 0.1;
    let adjusted = { ...macroTargets };

    // Adjust protein target for travel/social modes
    if (config.rules.relaxProteinTarget) {
        adjusted.protein = Math.round(adjusted.protein * config.rules.relaxProteinTarget);
    }

    // Focus on protein for social events (reduce carbs)
    if (config.rules.focusProtein && config.rules.reduceCarbs) {
        adjusted.carbs = Math.round(adjusted.carbs * 0.7);
        // Redistribute some calories to fats for satiety
        adjusted.fats = Math.round(adjusted.fats * 1.1);
    }

    return {
        ...adjusted,
        tolerance,
        min: multiplyMacros(adjusted, 1 - tolerance),
        max: multiplyMacros(adjusted, 1 + tolerance)
    };
}

/**
 * Get tips and suggestions for a context mode
 * @param {string} mode - context mode
 * @returns {object} tips and suggestions
 */
function getContextModeTips(mode) {
    const config = getContextModeRules(mode);
    if (!config) return { tips: [], suggestions: [] };

    return {
        tips: config.tips || [],
        suggestions: config.suggestions || [],
        description: config.description
    };
}

// Helper function
function multiplyMacros(macros, multiplier) {
    return {
        calories: Math.round((macros.calories || 0) * multiplier),
        protein: Math.round((macros.protein || 0) * multiplier),
        carbs: Math.round((macros.carbs || 0) * multiplier),
        fats: Math.round((macros.fats || 0) * multiplier)
    };
}

module.exports = {
    CONTEXT_MODES,
    getContextModeRules,
    getAllContextModes,
    applyContextMode,
    adjustMacrosForContext,
    getContextModeTips
};
