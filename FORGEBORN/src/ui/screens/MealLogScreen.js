import React, { useState, useMemo } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    StatusBar,
    TouchableOpacity,
    TextInput,
    FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { Card, Typography, Button } from '../components';
import { foodDatabase, getAllCategories, searchFoods, getFoodsByCategory } from '../../data/foodDB';
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
                onPress={() => setSelectedFood(isSelected ? null : food)}
                activeOpacity={0.7}
            >
                <Card style={[styles.foodCard, isSelected && styles.foodCardSelected]}>
                    <View style={styles.foodHeader}>
                        <View style={styles.foodInfo}>
                            <Typography variant="headline">{food.name}</Typography>
                            <Typography variant="caption" color={colors.textDim} style={{ marginTop: 2 }}>{food.servingSize}</Typography>
                        </View>
                        <View style={styles.foodNutrition}>
                            <Typography variant="title2">{food.calories}</Typography>
                            <Typography variant="caption" color={colors.textDim}>Cal</Typography>
                        </View>
                    </View>

                    {isSelected && (
                        <View style={styles.expandedInfo}>
                            <View style={styles.macroRow}>
                                <View style={styles.macroItem}>
                                    <Typography variant="subheadline" color={colors.protein || colors.primary}>{food.protein}g</Typography>
                                    <Typography variant="caption" color={colors.textDim}>Protein</Typography>
                                </View>
                                <View style={styles.macroItem}>
                                    <Typography variant="subheadline" color={colors.carbs || colors.warning}>{food.carbs}g</Typography>
                                    <Typography variant="caption" color={colors.textDim}>Carbs</Typography>
                                </View>
                                <View style={styles.macroItem}>
                                    <Typography variant="subheadline" color={colors.fats || colors.danger}>{food.fats}g</Typography>
                                    <Typography variant="caption" color={colors.textDim}>Fats</Typography>
                                </View>
                            </View>

                            <View style={styles.qtyRow}>
                                <View style={styles.qtyControls}>
                                    <TouchableOpacity
                                        style={styles.qtyBtn}
                                        onPress={() => setQuantity(String(Math.max(0.5, (parseFloat(quantity) || 1) - 0.5)))}
                                    >
                                        <Ionicons name="remove" size={18} color={colors.textSecondary} />
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
                                        <Ionicons name="add" size={18} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flex: 1, marginLeft: spacing[4] }}>
                                    <Button
                                        title="Add"
                                        onPress={() => handleLog(food)}
                                        icon={<Ionicons name="add-circle" size={18} color={colors.textInverse} />}
                                    />
                                </View>
                            </View>
                        </View>
                    )}
                </Card>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingRight: spacing[4] }}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Typography variant="largeTitle">Add {mealType}</Typography>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={20} color={colors.textSecondary} />
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
                            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Category chips */}
            <View>
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
                        <Typography variant="caption" color={!selectedCategory ? colors.textInverse : colors.textSecondary}>All</Typography>
                    </TouchableOpacity>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
                            onPress={() => { setSelectedCategory(cat); setSearch(''); }}
                        >
                            <Typography variant="caption" color={selectedCategory === cat ? colors.textInverse : colors.textSecondary}>
                                {cat}
                            </Typography>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Recent foods quick-add */}
            {recentFoods.length > 0 && search.length === 0 && !selectedCategory && (
                <View style={styles.recentSection}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[1], marginBottom: spacing[2] }}>
                        <Ionicons name="flash" size={16} color={colors.primary} />
                        <Typography variant="subheadline" color={colors.textSecondary}>Quick Add</Typography>
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
                                <Typography variant="caption" color={colors.primary} numberOfLines={1} style={{ maxWidth: 100 }}>{food.name}</Typography>
                                <Typography variant="caption" color={colors.primary} style={{ opacity: 0.7, marginLeft: 4 }}>{food.calories} cal</Typography>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Results count */}
            <Typography variant="caption" color={colors.textDim} style={styles.resultCount}>
                {filteredFoods.length} items found
            </Typography>

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
    container: {
        flex: 1,
        backgroundColor: colors.background
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing[4],
        paddingTop: spacing[10],
        paddingBottom: spacing[4],
    },

    // Search
    searchContainer: {
        paddingHorizontal: spacing[4],
        marginBottom: spacing[4],
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceLight,
        borderRadius: radius.md,
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[3],
        gap: spacing[2],
    },
    searchInput: {
        flex: 1,
        color: colors.text,
        fontSize: 16,
    },

    // Categories
    categoryScroll: {
        maxHeight: 48,
        marginBottom: spacing[2]
    },
    categoryContent: {
        paddingHorizontal: spacing[4],
        gap: spacing[2],
    },
    categoryChip: {
        paddingVertical: spacing[2],
        paddingHorizontal: spacing[4],
        borderRadius: radius.full,
        backgroundColor: colors.surfaceLight,
        borderWidth: 1,
        borderColor: colors.borderLight,
        justifyContent: 'center',
    },
    categoryChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },

    // Result count
    resultCount: {
        paddingHorizontal: spacing[4],
        marginBottom: spacing[2],
    },

    // Recent foods
    recentSection: {
        paddingHorizontal: spacing[4],
        marginTop: spacing[2],
        marginBottom: spacing[4],
    },
    recentScroll: {
        gap: spacing[2],
    },
    recentChip: {
        flexDirection: 'row',
        backgroundColor: colors.primaryMuted || 'rgba(16, 185, 129, 0.1)',
        borderRadius: radius.full,
        paddingVertical: spacing[2],
        paddingHorizontal: spacing[4],
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },

    // Food list
    listContent: {
        paddingHorizontal: spacing[4],
        paddingBottom: spacing[10],
    },
    foodCard: {
        marginBottom: spacing[3],
        padding: spacing[4],
    },
    foodCardSelected: {
        borderColor: colors.primary,
        borderWidth: 1.5,
    },
    foodHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    foodInfo: { flex: 1, paddingRight: spacing[2] },
    foodNutrition: {
        alignItems: 'flex-end',
    },

    // Expanded
    expandedInfo: {
        marginTop: spacing[4],
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
        paddingTop: spacing[4],
    },
    macroRow: {
        flexDirection: 'row',
        gap: spacing[6],
        marginBottom: spacing[5],
    },
    macroItem: {
        alignItems: 'flex-start',
    },

    // Quantity
    qtyRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    qtyControls: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceLight,
        borderRadius: radius.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    qtyBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.surfaceLight,
    },
    qtyInput: {
        width: 48,
        height: 40,
        backgroundColor: colors.surfaceLight,
        color: colors.text,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: colors.borderLight,
    },
});

export default MealLogScreen;
