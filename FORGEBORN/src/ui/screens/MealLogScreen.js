/**
 * FORGEBORN — MEAL LOG SCREEN
 * 
 * Search food database, log meals, track portions.
 * Inspired by: HealthifyMe (Indian food search), MyFitnessPal (quick add)
 */

import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    StatusBar,
    TouchableOpacity,
    TextInput,
    FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { textStyles } from '../theme/typography';
import { spacing, screen } from '../theme/spacing';
import { foodDatabase, getAllCategories, searchFoods, getFoodsByCategory, FoodCategory } from '../../data/foodDB';
import useNutritionStore from '../../store/nutritionStore';

const MealLogScreen = ({ navigation, route }) => {
    const mealType = route?.params?.mealType || 'LUNCH';
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [quantity, setQuantity] = useState('1');
    const [selectedFood, setSelectedFood] = useState(null);

    const logFood = useNutritionStore((s) => s.logFood);
    const dailyLogs = useNutritionStore((s) => s.dailyLogs);

    // Get recent foods (last 5 unique foods from logs)
    const recentFoods = useMemo(() => {
        const seen = new Set();
        const recents = [];
        const dates = Object.keys(dailyLogs).sort().reverse();
        for (const date of dates) {
            const meals = dailyLogs[date]?.meals || {};
            for (const mealEntries of Object.values(meals)) {
                for (const entry of (mealEntries || [])) {
                    if (!seen.has(entry.foodId) && entry.food) {
                        seen.add(entry.foodId);
                        recents.push(entry.food);
                        if (recents.length >= 5) break;
                    }
                }
                if (recents.length >= 5) break;
            }
            if (recents.length >= 5) break;
        }
        return recents;
    }, [dailyLogs]);

    const categories = getAllCategories();

    const filteredFoods = useMemo(() => {
        if (search.length > 0) return searchFoods(search).slice(0, 30);
        if (selectedCategory) return getFoodsByCategory(selectedCategory);
        return foodDatabase.slice(0, 40);
    }, [search, selectedCategory]);

    const handleLog = (food) => {
        const qty = parseFloat(quantity) || 1;
        logFood(food, mealType, qty);
        setSelectedFood(null);
        setQuantity('1');
        navigation.goBack();
    };

    const renderFoodItem = ({ item: food }) => {
        const isSelected = selectedFood?.id === food.id;

        return (
            <TouchableOpacity
                style={[styles.foodCard, isSelected && styles.foodCardSelected]}
                onPress={() => setSelectedFood(isSelected ? null : food)}
                activeOpacity={0.7}
            >
                <View style={styles.foodInfo}>
                    <Text style={styles.foodName}>{food.name}</Text>
                    <Text style={styles.foodServing}>{food.servingSize}</Text>
                </View>
                <View style={styles.foodNutrition}>
                    <Text style={styles.calorieText}>{food.calories}</Text>
                    <Text style={styles.calorieLabel}>CAL</Text>
                </View>

                {isSelected && (
                    <View style={styles.expandedInfo}>
                        <View style={styles.macroRow}>
                            <View style={styles.macroItem}>
                                <Text style={[styles.macroVal, { color: colors.primary }]}>{food.protein}g</Text>
                                <Text style={styles.macroLabel}>P</Text>
                            </View>
                            <View style={styles.macroItem}>
                                <Text style={[styles.macroVal, { color: colors.warning }]}>{food.carbs}g</Text>
                                <Text style={styles.macroLabel}>C</Text>
                            </View>
                            <View style={styles.macroItem}>
                                <Text style={[styles.macroVal, { color: colors.success }]}>{food.fats}g</Text>
                                <Text style={styles.macroLabel}>F</Text>
                            </View>
                        </View>

                        <View style={styles.qtyRow}>
                            <TouchableOpacity
                                style={styles.qtyBtn}
                                onPress={() => setQuantity(String(Math.max(0.5, (parseFloat(quantity) || 1) - 0.5)))}
                            >
                                <Ionicons name="remove" size={18} color={colors.text} />
                            </TouchableOpacity>
                            <TextInput
                                style={styles.qtyInput}
                                value={quantity}
                                onChangeText={setQuantity}
                                keyboardType="numeric"
                            />
                            <TouchableOpacity
                                style={styles.qtyBtn}
                                onPress={() => setQuantity(String((parseFloat(quantity) || 1) + 0.5))}
                            >
                                <Ionicons name="add" size={18} color={colors.text} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.addBtn}
                                onPress={() => handleLog(food)}
                            >
                                <Ionicons name="add-circle" size={18} color="#000" />
                                <Text style={styles.addBtnText}>ADD</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>ADD {mealType}</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Search */}
            <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color={colors.textDim} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search food (roti, chicken, dal...)"
                    placeholderTextColor={colors.textDim}
                    value={search}
                    onChangeText={(t) => { setSearch(t); setSelectedCategory(null); }}
                    autoFocus
                />
                {search.length > 0 && (
                    <TouchableOpacity onPress={() => setSearch('')}>
                        <Ionicons name="close-circle" size={18} color={colors.textDim} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Category chips */}
            <ScrollView
                horizontal
                style={styles.categoryScroll}
                contentContainerStyle={styles.categoryContent}
                showsHorizontalScrollIndicator={false}
            >
                <TouchableOpacity
                    style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
                    onPress={() => { setSelectedCategory(null); setSearch(''); }}
                >
                    <Text style={[styles.categoryText, !selectedCategory && styles.categoryTextActive]}>ALL</Text>
                </TouchableOpacity>
                {categories.map((cat) => (
                    <TouchableOpacity
                        key={cat}
                        style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
                        onPress={() => { setSelectedCategory(cat); setSearch(''); }}
                    >
                        <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
                            {cat}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Recent foods quick-add */}
            {recentFoods.length > 0 && search.length === 0 && !selectedCategory && (
                <View style={styles.recentSection}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="flash" size={14} color={colors.primary} />
                        <Text style={styles.recentLabel}>QUICK ADD</Text>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.recentScroll}
                    >
                        {recentFoods.map((food, i) => (
                            <TouchableOpacity
                                key={`recent-${food.id}-${i}`}
                                style={styles.recentChip}
                                onPress={() => { logFood(food, mealType, 1); navigation.goBack(); }}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.recentName} numberOfLines={1}>{food.name}</Text>
                                <Text style={styles.recentCal}>{food.calories} cal</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Results count */}
            <Text style={styles.resultCount}>{filteredFoods.length} items</Text>

            {/* Food list */}
            <FlatList
                data={filteredFoods}
                renderItem={renderFoodItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: screen.paddingHorizontal,
        paddingTop: spacing[10],
        paddingBottom: spacing[2],
    },
    headerTitle: {
        ...textStyles.h3,
        color: colors.primary,
    },

    // Search
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        marginHorizontal: screen.paddingHorizontal,
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[2],
        gap: spacing[2],
    },
    searchInput: {
        flex: 1,
        color: colors.text,
        fontSize: 14,
    },

    // Categories
    categoryScroll: { maxHeight: 42, marginTop: spacing[2] },
    categoryContent: {
        paddingHorizontal: screen.paddingHorizontal,
        gap: spacing[1],
    },
    categoryChip: {
        paddingVertical: spacing[1],
        paddingHorizontal: spacing[2],
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
    },
    categoryChipActive: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryMuted,
    },
    categoryText: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 9,
    },
    categoryTextActive: {
        color: colors.primary,
    },

    // Result count
    resultCount: {
        ...textStyles.caption,
        color: colors.textDim,
        paddingHorizontal: screen.paddingHorizontal,
        marginTop: spacing[2],
        marginBottom: spacing[1],
    },

    // Recent foods
    recentSection: {
        paddingHorizontal: screen.paddingHorizontal,
        marginTop: spacing[2],
    },
    recentLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 9,
        marginBottom: spacing[1],
    },
    recentScroll: {
        gap: spacing[1],
    },
    recentChip: {
        backgroundColor: colors.primaryMuted,
        borderWidth: 1,
        borderColor: colors.primary,
        paddingVertical: spacing[2],
        paddingHorizontal: spacing[3],
        alignItems: 'center',
    },
    recentName: {
        ...textStyles.label,
        color: colors.primary,
        fontSize: 10,
        maxWidth: 90,
    },
    recentCal: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 8,
    },

    // Food list
    listContent: {
        paddingHorizontal: screen.paddingHorizontal,
        paddingBottom: spacing[10],
    },
    foodCard: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[3],
        marginBottom: spacing[1],
    },
    foodCardSelected: {
        borderColor: colors.primary,
    },
    foodInfo: { flex: 1 },
    foodName: {
        ...textStyles.label,
        color: colors.text,
        fontSize: 12,
    },
    foodServing: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 9,
        marginTop: 2,
    },
    foodNutrition: {
        position: 'absolute',
        right: spacing[3],
        top: spacing[3],
        alignItems: 'center',
    },
    calorieText: {
        fontSize: 16,
        fontWeight: '900',
        color: colors.text,
    },
    calorieLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 7,
    },

    // Expanded
    expandedInfo: {
        marginTop: spacing[3],
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: spacing[2],
    },
    macroRow: {
        flexDirection: 'row',
        gap: spacing[4],
        marginBottom: spacing[3],
    },
    macroItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[1],
    },
    macroVal: {
        fontSize: 14,
        fontWeight: '700',
    },
    macroLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 9,
    },

    // Quantity
    qtyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
    },
    qtyBtn: {
        width: 32,
        height: 32,
        backgroundColor: colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyInput: {
        width: 48,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.primary,
        color: colors.text,
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
        paddingVertical: spacing[1],
    },
    addBtn: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.primary,
        padding: spacing[2],
        gap: spacing[1],
    },
    addBtnText: {
        ...textStyles.button,
        color: '#000',
        fontSize: 12,
    },
});

export default MealLogScreen;
