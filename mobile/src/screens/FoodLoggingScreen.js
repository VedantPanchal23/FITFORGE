import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, FlatList, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { spacing, fonts, radius } from '../theme';
import { ms, fs, hp, wp, sizes } from '../utils/responsive';
import * as PFT from '../services/PFTBridge';

const MEAL_TYPES = [
    { id: 'breakfast', label: 'Breakfast', icon: 'sun' },
    { id: 'lunch', label: 'Lunch', icon: 'coffee' },
    { id: 'dinner', label: 'Dinner', icon: 'moon' },
    { id: 'snack', label: 'Snack', icon: 'package' }
];

export default function FoodLoggingScreen({ navigation, route }) {
    const { theme } = useTheme();
    const preselectedMeal = route?.params?.mealType || 'lunch';
    const today = new Date().toISOString().split('T')[0];

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedMeal, setSelectedMeal] = useState(preselectedMeal);
    const [selectedFood, setSelectedFood] = useState(null);
    const [quantity, setQuantity] = useState('100');
    const [loggedFoods, setLoggedFoods] = useState([]);
    const [isCustomFood, setIsCustomFood] = useState(false);
    const [customFood, setCustomFood] = useState({ name: '', calories: '', protein: '', carbs: '', fats: '' });

    useEffect(() => {
        loadLoggedFoods();
    }, [selectedMeal]); // Re-fetch when meal type changes

    useEffect(() => {
        if (searchQuery.length >= 2) {
            const results = PFT.searchFoods(searchQuery);
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    const loadLoggedFoods = async () => {
        const logs = await PFT.getFoodLogsByMeal(today, selectedMeal);
        setLoggedFoods(logs);
    };

    const handleSelectFood = (food) => {
        setSelectedFood(food);
        setSearchQuery(food.name);
        setSearchResults([]);
    };

    const handleLogFood = async () => {
        let foodToLog;

        if (isCustomFood) {
            if (!customFood.name) {
                Alert.alert('Error', 'Please enter food name');
                return;
            }
            foodToLog = {
                name: customFood.name,
                quantity_grams: parseInt(quantity) || 100,
                calories: parseInt(customFood.calories) || 0,
                protein: parseFloat(customFood.protein) || 0,
                carbs: parseFloat(customFood.carbs) || 0,
                fats: parseFloat(customFood.fats) || 0,
                source: 'custom'
            };
        } else if (selectedFood) {
            foodToLog = {
                ...selectedFood,
                quantity_grams: parseInt(quantity) || 100
            };
        } else {
            Alert.alert('Error', 'Please select a food first');
            return;
        }

        await PFT.logFood(today, selectedMeal, foodToLog);

        // Reset and refresh
        setSelectedFood(null);
        setSearchQuery('');
        setQuantity('100');
        setCustomFood({ name: '', calories: '', protein: '', carbs: '', fats: '' });
        setIsCustomFood(false);
        loadLoggedFoods();

        Alert.alert('Success', `${foodToLog.name} logged to ${selectedMeal}!`);
    };

    const handleDeleteLog = async (id) => {
        Alert.alert('Delete Food?', 'Remove this item from log?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    await PFT.deleteFoodLog(id);
                    loadLoggedFoods();
                }
            }
        ]);
    };

    const calculatePreview = () => {
        if (isCustomFood) {
            return {
                calories: parseInt(customFood.calories) || 0,
                protein: parseFloat(customFood.protein) || 0,
                carbs: parseFloat(customFood.carbs) || 0,
                fats: parseFloat(customFood.fats) || 0
            };
        }
        if (!selectedFood?.per_100g) return null;
        const mult = (parseInt(quantity) || 100) / 100;
        return {
            calories: Math.round(selectedFood.per_100g.calories * mult),
            protein: Math.round(selectedFood.per_100g.protein * mult * 10) / 10,
            carbs: Math.round(selectedFood.per_100g.carbs * mult * 10) / 10,
            fats: Math.round(selectedFood.per_100g.fats * mult * 10) / 10
        };
    };

    const preview = calculatePreview();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Feather name="arrow-left" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>Log Food</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Meal Type Selector */}
                <View style={styles.mealSelector}>
                    {MEAL_TYPES.map(meal => (
                        <TouchableOpacity
                            key={meal.id}
                            style={[
                                styles.mealChip,
                                {
                                    backgroundColor: selectedMeal === meal.id ? theme.primary : theme.card,
                                    borderColor: selectedMeal === meal.id ? theme.primary : theme.cardBorder
                                }
                            ]}
                            onPress={() => {
                                setSelectedMeal(meal.id);
                                setTimeout(loadLoggedFoods, 100);
                            }}
                        >
                            <Feather name={meal.icon} size={14} color={selectedMeal === meal.id ? '#FFF' : theme.textSecondary} />
                            <Text style={[styles.mealChipText, { color: selectedMeal === meal.id ? '#FFF' : theme.textSecondary }]}>
                                {meal.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Toggle Custom Food */}
                <View style={styles.toggleRow}>
                    <TouchableOpacity
                        style={[styles.toggleBtn, { backgroundColor: !isCustomFood ? theme.primary : theme.card }]}
                        onPress={() => setIsCustomFood(false)}
                    >
                        <Text style={{ color: !isCustomFood ? '#FFF' : theme.textSecondary }}>Search Food</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleBtn, { backgroundColor: isCustomFood ? theme.primary : theme.card }]}
                        onPress={() => setIsCustomFood(true)}
                    >
                        <Text style={{ color: isCustomFood ? '#FFF' : theme.textSecondary }}>Add Custom</Text>
                    </TouchableOpacity>
                </View>

                {!isCustomFood ? (
                    <>
                        {/* Search Bar */}
                        <View style={[styles.searchContainer, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                            <Feather name="search" size={18} color={theme.textSecondary} />
                            <TextInput
                                style={[styles.searchInput, { color: theme.text }]}
                                placeholder="Search foods... (dal, roti, paneer)"
                                placeholderTextColor={theme.textTertiary}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => { setSearchQuery(''); setSelectedFood(null); }}>
                                    <Feather name="x" size={18} color={theme.textSecondary} />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <View style={[styles.resultsContainer, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                                {searchResults.slice(0, 8).map((food, i) => (
                                    <TouchableOpacity
                                        key={food.id || i}
                                        style={[styles.resultItem, { borderBottomColor: theme.cardBorder }]}
                                        onPress={() => handleSelectFood(food)}
                                    >
                                        <View>
                                            <Text style={[styles.resultName, { color: theme.text }]}>{food.name}</Text>
                                            <Text style={[styles.resultMeta, { color: theme.textSecondary }]}>
                                                {food.per_100g?.calories} cal | {food.per_100g?.protein}g P | {food.per_100g?.carbs}g C | {food.per_100g?.fats}g F (per 100g)
                                            </Text>
                                        </View>
                                        <Feather name="plus-circle" size={20} color={theme.primary} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {/* Quantity Input */}
                        {selectedFood && (
                            <View style={[styles.quantityCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                                <Text style={[styles.selectedFoodName, { color: theme.text }]}>{selectedFood.name}</Text>
                                <View style={styles.quantityRow}>
                                    <Text style={[styles.quantityLabel, { color: theme.textSecondary }]}>Quantity (grams):</Text>
                                    <TextInput
                                        style={[styles.quantityInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.cardBorder }]}
                                        value={quantity}
                                        onChangeText={setQuantity}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                        )}
                    </>
                ) : (
                    /* Custom Food Entry */
                    <View style={[styles.customCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                        <Text style={[styles.customLabel, { color: theme.text }]}>Custom Food Details</Text>
                        <TextInput
                            style={[styles.customInput, { backgroundColor: theme.background, color: theme.text }]}
                            placeholder="Food Name (e.g., Mom's Dal)"
                            placeholderTextColor={theme.textTertiary}
                            value={customFood.name}
                            onChangeText={(v) => setCustomFood({ ...customFood, name: v })}
                        />
                        <View style={styles.customRow}>
                            <TextInput
                                style={[styles.customSmallInput, { backgroundColor: theme.background, color: theme.text }]}
                                placeholder="Calories"
                                placeholderTextColor={theme.textTertiary}
                                value={customFood.calories}
                                onChangeText={(v) => setCustomFood({ ...customFood, calories: v })}
                                keyboardType="numeric"
                            />
                            <TextInput
                                style={[styles.customSmallInput, { backgroundColor: theme.background, color: theme.text }]}
                                placeholder="Protein (g)"
                                placeholderTextColor={theme.textTertiary}
                                value={customFood.protein}
                                onChangeText={(v) => setCustomFood({ ...customFood, protein: v })}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={styles.customRow}>
                            <TextInput
                                style={[styles.customSmallInput, { backgroundColor: theme.background, color: theme.text }]}
                                placeholder="Carbs (g)"
                                placeholderTextColor={theme.textTertiary}
                                value={customFood.carbs}
                                onChangeText={(v) => setCustomFood({ ...customFood, carbs: v })}
                                keyboardType="numeric"
                            />
                            <TextInput
                                style={[styles.customSmallInput, { backgroundColor: theme.background, color: theme.text }]}
                                placeholder="Fats (g)"
                                placeholderTextColor={theme.textTertiary}
                                value={customFood.fats}
                                onChangeText={(v) => setCustomFood({ ...customFood, fats: v })}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                )}

                {/* Preview & Log Button */}
                {(selectedFood || isCustomFood) && (
                    <View style={[styles.previewCard, { backgroundColor: theme.primary + '10', borderColor: theme.primary }]}>
                        <Text style={[styles.previewTitle, { color: theme.primary }]}>NUTRITION PREVIEW</Text>
                        {preview && (
                            <View style={styles.previewRow}>
                                <View style={styles.previewItem}>
                                    <Text style={[styles.previewValue, { color: theme.caloriesColor }]}>{preview.calories}</Text>
                                    <Text style={[styles.previewLabel, { color: theme.textSecondary }]}>kcal</Text>
                                </View>
                                <View style={styles.previewItem}>
                                    <Text style={[styles.previewValue, { color: theme.proteinColor }]}>{preview.protein}g</Text>
                                    <Text style={[styles.previewLabel, { color: theme.textSecondary }]}>Protein</Text>
                                </View>
                                <View style={styles.previewItem}>
                                    <Text style={[styles.previewValue, { color: theme.carbsColor }]}>{preview.carbs}g</Text>
                                    <Text style={[styles.previewLabel, { color: theme.textSecondary }]}>Carbs</Text>
                                </View>
                                <View style={styles.previewItem}>
                                    <Text style={[styles.previewValue, { color: theme.fatsColor }]}>{preview.fats}g</Text>
                                    <Text style={[styles.previewLabel, { color: theme.textSecondary }]}>Fats</Text>
                                </View>
                            </View>
                        )}
                        <TouchableOpacity
                            style={[styles.logBtn, { backgroundColor: theme.primary }]}
                            onPress={handleLogFood}
                        >
                            <Feather name="plus" size={18} color="#FFF" />
                            <Text style={styles.logBtnText}>Log This Food</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Already Logged Foods */}
                <View style={styles.loggedSection}>
                    <Text style={[styles.loggedTitle, { color: theme.textSecondary }]}>
                        LOGGED FOR {selectedMeal.toUpperCase()} ({loggedFoods.length} items)
                    </Text>
                    {loggedFoods.map((log, i) => (
                        <View key={log.id || i} style={[styles.loggedItem, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.loggedName, { color: theme.text }]}>{log.food_name}</Text>
                                <Text style={[styles.loggedMeta, { color: theme.textSecondary }]}>
                                    {log.quantity_grams}g • {log.calories} cal | {log.protein}g P
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => handleDeleteLog(log.id)}>
                                <Feather name="trash-2" size={18} color={theme.error} />
                            </TouchableOpacity>
                        </View>
                    ))}
                    {loggedFoods.length === 0 && (
                        <Text style={[styles.emptyText, { color: theme.textTertiary }]}>
                            No foods logged for {selectedMeal} yet
                        </Text>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: ms(16) },
    title: { fontSize: fs(18), fontWeight: '700' },
    scroll: { padding: ms(16), paddingTop: 0 },
    mealSelector: { flexDirection: 'row', gap: ms(6), marginBottom: ms(14), flexWrap: 'wrap' },
    mealChip: { flex: 1, minWidth: wp(70), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minHeight: sizes.touchTarget, padding: ms(10), borderRadius: ms(8), borderWidth: 1, gap: ms(4) },
    mealChipText: { fontSize: fs(11), fontWeight: '600' },
    toggleRow: { flexDirection: 'row', gap: ms(8), marginBottom: ms(14) },
    toggleBtn: { flex: 1, minHeight: sizes.touchTarget, padding: ms(10), borderRadius: ms(8), alignItems: 'center', justifyContent: 'center' },
    searchContainer: { flexDirection: 'row', alignItems: 'center', minHeight: sizes.touchTarget, padding: ms(12), borderRadius: ms(8), borderWidth: 1, gap: ms(8), marginBottom: ms(10) },
    searchInput: { flex: 1, fontSize: fs(15), minHeight: hp(20) },
    resultsContainer: { borderRadius: ms(8), borderWidth: 1, marginBottom: ms(14), overflow: 'hidden' },
    resultItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: sizes.touchTarget, padding: ms(12), borderBottomWidth: 1 },
    resultName: { fontSize: fs(14), fontWeight: '500' },
    resultMeta: { fontSize: fs(11), marginTop: ms(3) },
    quantityCard: { borderRadius: ms(8), borderWidth: 1, padding: ms(14), marginBottom: ms(14) },
    selectedFoodName: { fontSize: fs(15), fontWeight: '600', marginBottom: ms(10) },
    quantityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    quantityLabel: { fontSize: fs(13) },
    quantityInput: { width: wp(70), minHeight: sizes.touchTarget, padding: ms(8), borderRadius: ms(8), borderWidth: 1, textAlign: 'center', fontSize: fs(15), fontWeight: '600' },
    customCard: { borderRadius: ms(8), borderWidth: 1, padding: ms(14), marginBottom: ms(14) },
    customLabel: { fontSize: fs(13), fontWeight: '600', marginBottom: ms(10) },
    customInput: { minHeight: sizes.touchTarget, padding: ms(10), borderRadius: ms(8), marginBottom: ms(8), fontSize: fs(14) },
    customRow: { flexDirection: 'row', gap: ms(8), flexWrap: 'wrap' },
    customSmallInput: { flex: 1, minWidth: wp(60), minHeight: sizes.touchTarget, padding: ms(10), borderRadius: ms(8), marginBottom: ms(8), fontSize: fs(14) },
    previewCard: { borderRadius: ms(8), borderWidth: 1, padding: ms(14), marginBottom: ms(14) },
    previewTitle: { fontSize: fs(11), fontWeight: '700', marginBottom: ms(10), letterSpacing: 1 },
    previewRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: ms(14), flexWrap: 'wrap' },
    previewItem: { alignItems: 'center', minWidth: wp(60), marginBottom: ms(6) },
    previewValue: { fontSize: fs(16), fontWeight: '700' },
    previewLabel: { fontSize: fs(10), marginTop: ms(2) },
    logBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minHeight: sizes.touchTarget, padding: ms(12), borderRadius: ms(8), gap: ms(6) },
    logBtnText: { color: '#FFF', fontSize: fs(15), fontWeight: '600' },
    loggedSection: { marginTop: ms(8), marginBottom: hp(32) },
    loggedTitle: { fontSize: fs(11), fontWeight: '700', marginBottom: ms(10), letterSpacing: 0.5 },
    loggedItem: { flexDirection: 'row', alignItems: 'center', minHeight: sizes.touchTarget, padding: ms(12), borderRadius: ms(8), borderWidth: 1, marginBottom: ms(6) },
    loggedName: { fontSize: fs(14), fontWeight: '500' },
    loggedMeta: { fontSize: fs(11), marginTop: ms(2) },
    emptyText: { fontSize: fs(13), fontStyle: 'italic', textAlign: 'center', padding: ms(18) }
});
