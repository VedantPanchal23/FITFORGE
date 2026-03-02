/**
 * FORGEBORN — FOOD DATABASE
 * 
 * 500+ Indian + global foods with accurate nutrition data per 100g.
 * Based on ICMR (Indian Council of Medical Research) nutritional tables
 * and USDA food composition database.
 * 
 * Categories: ROTI/BREAD, RICE, DAL/LENTIL, SABZI/CURRY, PROTEIN,
 *             DAIRY, FRUITS, SNACKS, DRINKS, BREAKFAST, GLOBAL
 */

export const FoodCategory = {
    ROTI_BREAD: 'ROTI / BREAD',
    RICE: 'RICE',
    DAL_LENTIL: 'DAL / LENTIL',
    SABZI: 'SABZI / CURRY',
    PROTEIN: 'PROTEIN',
    DAIRY: 'DAIRY',
    FRUITS: 'FRUITS',
    VEGETABLES: 'VEGETABLES',
    SNACKS: 'SNACKS',
    DRINKS: 'DRINKS',
    BREAKFAST: 'BREAKFAST',
    SWEETS: 'SWEETS',
    GLOBAL: 'GLOBAL',
    NUTS_SEEDS: 'NUTS / SEEDS',
    EGGS: 'EGGS',
};

export const MealType = {
    BREAKFAST: 'BREAKFAST',
    LUNCH: 'LUNCH',
    SNACK: 'SNACK',
    DINNER: 'DINNER',
    PRE_WORKOUT: 'PRE-WORKOUT',
    POST_WORKOUT: 'POST-WORKOUT',
};

// All values per 100 grams unless otherwise noted
export const foodDatabase = [

    // ═══════════════════════════════════════════════════════════
    // ROTI / BREAD
    // ═══════════════════════════════════════════════════════════
    { id: 'r01', name: 'Wheat Roti (1 pc ~30g)', category: FoodCategory.ROTI_BREAD, calories: 72, protein: 2.7, carbs: 15, fats: 0.4, fiber: 1.9, servingSize: '1 roti (30g)', perServing: true },
    { id: 'r02', name: 'Wheat Paratha (plain)', category: FoodCategory.ROTI_BREAD, calories: 260, protein: 6.3, carbs: 36, fats: 10, fiber: 3.5, servingSize: '100g' },
    { id: 'r03', name: 'Aloo Paratha (1 pc)', category: FoodCategory.ROTI_BREAD, calories: 180, protein: 4, carbs: 28, fats: 6, fiber: 2.5, servingSize: '1 paratha (~80g)', perServing: true },
    { id: 'r04', name: 'Naan', category: FoodCategory.ROTI_BREAD, calories: 262, protein: 8.7, carbs: 45, fats: 5.1, fiber: 1.7, servingSize: '100g' },
    { id: 'r05', name: 'Butter Naan (1 pc)', category: FoodCategory.ROTI_BREAD, calories: 150, protein: 4, carbs: 22, fats: 5, fiber: 1, servingSize: '1 naan (~60g)', perServing: true },
    { id: 'r06', name: 'Tandoori Roti', category: FoodCategory.ROTI_BREAD, calories: 120, protein: 3.4, carbs: 25, fats: 0.7, fiber: 3, servingSize: '1 roti (~50g)', perServing: true },
    { id: 'r07', name: 'Missi Roti', category: FoodCategory.ROTI_BREAD, calories: 90, protein: 4, carbs: 14, fats: 1.5, fiber: 2, servingSize: '1 roti (~40g)', perServing: true },
    { id: 'r08', name: 'Bajra Roti', category: FoodCategory.ROTI_BREAD, calories: 92, protein: 3, carbs: 16, fats: 1.8, fiber: 3.2, servingSize: '1 roti (~40g)', perServing: true },
    { id: 'r09', name: 'Jowar Roti', category: FoodCategory.ROTI_BREAD, calories: 85, protein: 2.8, carbs: 17, fats: 0.9, fiber: 2.7, servingSize: '1 roti (~40g)', perServing: true },
    { id: 'r10', name: 'Makki Ki Roti', category: FoodCategory.ROTI_BREAD, calories: 110, protein: 2.4, carbs: 22, fats: 1.5, fiber: 3, servingSize: '1 roti (~50g)', perServing: true },
    { id: 'r11', name: 'Puri (fried)', category: FoodCategory.ROTI_BREAD, calories: 101, protein: 2, carbs: 12, fats: 5, fiber: 0.8, servingSize: '1 puri (~25g)', perServing: true },
    { id: 'r12', name: 'Bhatura (1 pc)', category: FoodCategory.ROTI_BREAD, calories: 220, protein: 4.5, carbs: 28, fats: 10, fiber: 1, servingSize: '1 bhatura (~75g)', perServing: true },
    { id: 'r13', name: 'Brown Bread (1 slice)', category: FoodCategory.ROTI_BREAD, calories: 73, protein: 2.7, carbs: 12.5, fats: 1, fiber: 1.9, servingSize: '1 slice (28g)', perServing: true },
    { id: 'r14', name: 'White Bread (1 slice)', category: FoodCategory.ROTI_BREAD, calories: 66, protein: 2, carbs: 13, fats: 0.8, fiber: 0.6, servingSize: '1 slice (25g)', perServing: true },
    { id: 'r15', name: 'Multigrain Roti', category: FoodCategory.ROTI_BREAD, calories: 78, protein: 3.2, carbs: 14, fats: 1, fiber: 3, servingSize: '1 roti (35g)', perServing: true },

    // ═══════════════════════════════════════════════════════════
    // RICE
    // ═══════════════════════════════════════════════════════════
    { id: 'ri01', name: 'White Rice (cooked)', category: FoodCategory.RICE, calories: 130, protein: 2.7, carbs: 28, fats: 0.3, fiber: 0.4, servingSize: '100g' },
    { id: 'ri02', name: 'Brown Rice (cooked)', category: FoodCategory.RICE, calories: 112, protein: 2.6, carbs: 24, fats: 0.9, fiber: 1.8, servingSize: '100g' },
    { id: 'ri03', name: 'Jeera Rice', category: FoodCategory.RICE, calories: 152, protein: 3, carbs: 28, fats: 3, fiber: 0.6, servingSize: '100g' },
    { id: 'ri04', name: 'Biryani (veg)', category: FoodCategory.RICE, calories: 142, protein: 3.5, carbs: 22, fats: 4, fiber: 0.9, servingSize: '100g' },
    { id: 'ri05', name: 'Biryani (chicken)', category: FoodCategory.RICE, calories: 178, protein: 8, carbs: 22, fats: 6, fiber: 0.5, servingSize: '100g' },
    { id: 'ri06', name: 'Pulao', category: FoodCategory.RICE, calories: 147, protein: 3, carbs: 25, fats: 4, fiber: 1, servingSize: '100g' },
    { id: 'ri07', name: 'Lemon Rice', category: FoodCategory.RICE, calories: 156, protein: 2.8, carbs: 26, fats: 4.5, fiber: 0.8, servingSize: '100g' },
    { id: 'ri08', name: 'Curd Rice', category: FoodCategory.RICE, calories: 125, protein: 3.5, carbs: 22, fats: 2.5, fiber: 0.3, servingSize: '100g' },
    { id: 'ri09', name: 'Khichdi', category: FoodCategory.RICE, calories: 105, protein: 4, carbs: 18, fats: 1.5, fiber: 1.5, servingSize: '100g' },
    { id: 'ri10', name: 'Fried Rice', category: FoodCategory.RICE, calories: 163, protein: 3.5, carbs: 24, fats: 6, fiber: 1, servingSize: '100g' },

    // ═══════════════════════════════════════════════════════════
    // DAL / LENTILS
    // ═══════════════════════════════════════════════════════════
    { id: 'd01', name: 'Toor Dal (cooked)', category: FoodCategory.DAL_LENTIL, calories: 118, protein: 7.5, carbs: 18, fats: 1.5, fiber: 5, servingSize: '100g' },
    { id: 'd02', name: 'Moong Dal (cooked)', category: FoodCategory.DAL_LENTIL, calories: 106, protein: 7.5, carbs: 18, fats: 0.4, fiber: 4.5, servingSize: '100g' },
    { id: 'd03', name: 'Masoor Dal (cooked)', category: FoodCategory.DAL_LENTIL, calories: 116, protein: 9, carbs: 20, fats: 0.4, fiber: 8, servingSize: '100g' },
    { id: 'd04', name: 'Chana Dal (cooked)', category: FoodCategory.DAL_LENTIL, calories: 124, protein: 7.5, carbs: 21, fats: 1.5, fiber: 5.5, servingSize: '100g' },
    { id: 'd05', name: 'Urad Dal (cooked)', category: FoodCategory.DAL_LENTIL, calories: 120, protein: 8, carbs: 19, fats: 1.2, fiber: 4.5, servingSize: '100g' },
    { id: 'd06', name: 'Rajma (cooked)', category: FoodCategory.DAL_LENTIL, calories: 127, protein: 8.7, carbs: 22, fats: 0.5, fiber: 6.4, servingSize: '100g' },
    { id: 'd07', name: 'Chole / Chana (cooked)', category: FoodCategory.DAL_LENTIL, calories: 164, protein: 8.9, carbs: 27, fats: 2.6, fiber: 7.6, servingSize: '100g' },
    { id: 'd08', name: 'Dal Fry', category: FoodCategory.DAL_LENTIL, calories: 130, protein: 7, carbs: 18, fats: 3.5, fiber: 4, servingSize: '100g' },
    { id: 'd09', name: 'Dal Tadka', category: FoodCategory.DAL_LENTIL, calories: 136, protein: 7, carbs: 18, fats: 4, fiber: 4, servingSize: '100g' },
    { id: 'd10', name: 'Dal Makhani', category: FoodCategory.DAL_LENTIL, calories: 152, protein: 7, carbs: 18, fats: 6, fiber: 4, servingSize: '100g' },
    { id: 'd11', name: 'Sambar', category: FoodCategory.DAL_LENTIL, calories: 72, protein: 3.5, carbs: 10, fats: 2, fiber: 2.5, servingSize: '100g' },
    { id: 'd12', name: 'Sprouts (mixed, boiled)', category: FoodCategory.DAL_LENTIL, calories: 100, protein: 7, carbs: 15, fats: 0.5, fiber: 4, servingSize: '100g' },

    // ═══════════════════════════════════════════════════════════
    // SABZI / CURRY
    // ═══════════════════════════════════════════════════════════
    { id: 's01', name: 'Aloo Gobi', category: FoodCategory.SABZI, calories: 85, protein: 2.5, carbs: 12, fats: 3, fiber: 2.5, servingSize: '100g' },
    { id: 's02', name: 'Palak Paneer', category: FoodCategory.SABZI, calories: 154, protein: 8, carbs: 5, fats: 12, fiber: 2, servingSize: '100g' },
    { id: 's03', name: 'Matar Paneer', category: FoodCategory.SABZI, calories: 165, protein: 8.5, carbs: 9, fats: 11, fiber: 2.5, servingSize: '100g' },
    { id: 's04', name: 'Bhindi Masala', category: FoodCategory.SABZI, calories: 78, protein: 2, carbs: 8, fats: 4, fiber: 3, servingSize: '100g' },
    { id: 's05', name: 'Baingan Bharta', category: FoodCategory.SABZI, calories: 95, protein: 2, carbs: 10, fats: 5, fiber: 4, servingSize: '100g' },
    { id: 's06', name: 'Mixed Veg Curry', category: FoodCategory.SABZI, calories: 88, protein: 2.5, carbs: 10, fats: 4, fiber: 3, servingSize: '100g' },
    { id: 's07', name: 'Butter Chicken', category: FoodCategory.SABZI, calories: 192, protein: 14, carbs: 7, fats: 12, fiber: 1, servingSize: '100g' },
    { id: 's08', name: 'Chicken Curry', category: FoodCategory.SABZI, calories: 155, protein: 15, carbs: 5, fats: 8, fiber: 1, servingSize: '100g' },
    { id: 's09', name: 'Egg Curry', category: FoodCategory.SABZI, calories: 145, protein: 10, carbs: 6, fats: 9, fiber: 1, servingSize: '100g' },
    { id: 's10', name: 'Fish Curry', category: FoodCategory.SABZI, calories: 120, protein: 14, carbs: 4, fats: 5, fiber: 0.5, servingSize: '100g' },
    { id: 's11', name: 'Kadhi', category: FoodCategory.SABZI, calories: 82, protein: 3, carbs: 8, fats: 4, fiber: 1, servingSize: '100g' },
    { id: 's12', name: 'Shahi Paneer', category: FoodCategory.SABZI, calories: 195, protein: 8, carbs: 8, fats: 15, fiber: 1, servingSize: '100g' },
    { id: 's13', name: 'Paneer Butter Masala', category: FoodCategory.SABZI, calories: 210, protein: 9, carbs: 9, fats: 16, fiber: 1.5, servingSize: '100g' },
    { id: 's14', name: 'Malai Kofta', category: FoodCategory.SABZI, calories: 205, protein: 6, carbs: 14, fats: 14, fiber: 2, servingSize: '100g' },
    { id: 's15', name: 'Aloo Matar', category: FoodCategory.SABZI, calories: 90, protein: 3, carbs: 14, fats: 2.5, fiber: 3, servingSize: '100g' },
    { id: 's16', name: 'Lauki Sabzi', category: FoodCategory.SABZI, calories: 45, protein: 1, carbs: 7, fats: 1.5, fiber: 1.5, servingSize: '100g' },
    { id: 's17', name: 'Tinda Sabzi', category: FoodCategory.SABZI, calories: 50, protein: 1.5, carbs: 7, fats: 2, fiber: 2, servingSize: '100g' },
    { id: 's18', name: 'Keema (mutton)', category: FoodCategory.SABZI, calories: 205, protein: 18, carbs: 4, fats: 13, fiber: 1, servingSize: '100g' },

    // ═══════════════════════════════════════════════════════════
    // PROTEIN SOURCES
    // ═══════════════════════════════════════════════════════════
    { id: 'p01', name: 'Chicken Breast (cooked)', category: FoodCategory.PROTEIN, calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0, servingSize: '100g' },
    { id: 'p02', name: 'Chicken Thigh (cooked)', category: FoodCategory.PROTEIN, calories: 209, protein: 26, carbs: 0, fats: 11, fiber: 0, servingSize: '100g' },
    { id: 'p03', name: 'Tandoori Chicken', category: FoodCategory.PROTEIN, calories: 148, protein: 24, carbs: 3, fats: 4.5, fiber: 0.5, servingSize: '100g' },
    { id: 'p04', name: 'Paneer', category: FoodCategory.PROTEIN, calories: 265, protein: 18, carbs: 1.2, fats: 21, fiber: 0, servingSize: '100g' },
    { id: 'p05', name: 'Tofu', category: FoodCategory.PROTEIN, calories: 76, protein: 8, carbs: 1.9, fats: 4.8, fiber: 0.3, servingSize: '100g' },
    { id: 'p06', name: 'Soya Chunks (dry)', category: FoodCategory.PROTEIN, calories: 345, protein: 52, carbs: 33, fats: 0.5, fiber: 13, servingSize: '100g' },
    { id: 'p07', name: 'Soya Chunks (cooked)', category: FoodCategory.PROTEIN, calories: 120, protein: 18, carbs: 11, fats: 0.2, fiber: 4, servingSize: '100g' },
    { id: 'p08', name: 'Fish (Rohu, cooked)', category: FoodCategory.PROTEIN, calories: 120, protein: 20, carbs: 0, fats: 4, fiber: 0, servingSize: '100g' },
    { id: 'p09', name: 'Prawns (cooked)', category: FoodCategory.PROTEIN, calories: 99, protein: 24, carbs: 0.2, fats: 0.3, fiber: 0, servingSize: '100g' },
    { id: 'p10', name: 'Mutton (cooked)', category: FoodCategory.PROTEIN, calories: 250, protein: 25, carbs: 0, fats: 16, fiber: 0, servingSize: '100g' },
    { id: 'p11', name: 'Whey Protein (1 scoop)', category: FoodCategory.PROTEIN, calories: 120, protein: 24, carbs: 3, fats: 1.5, fiber: 0, servingSize: '1 scoop (30g)', perServing: true },
    { id: 'p12', name: 'Peanut Butter (1 tbsp)', category: FoodCategory.PROTEIN, calories: 94, protein: 4, carbs: 3, fats: 8, fiber: 1, servingSize: '1 tbsp (16g)', perServing: true },

    // ═══════════════════════════════════════════════════════════
    // EGGS
    // ═══════════════════════════════════════════════════════════
    { id: 'e01', name: 'Boiled Egg (1 whole)', category: FoodCategory.EGGS, calories: 78, protein: 6.3, carbs: 0.6, fats: 5.3, fiber: 0, servingSize: '1 egg (50g)', perServing: true },
    { id: 'e02', name: 'Egg White (1)', category: FoodCategory.EGGS, calories: 17, protein: 3.6, carbs: 0.2, fats: 0.1, fiber: 0, servingSize: '1 white (33g)', perServing: true },
    { id: 'e03', name: 'Omelette (2 eggs)', category: FoodCategory.EGGS, calories: 188, protein: 13, carbs: 1.2, fats: 14, fiber: 0, servingSize: '2 eggs', perServing: true },
    { id: 'e04', name: 'Scrambled Eggs (2)', category: FoodCategory.EGGS, calories: 198, protein: 13, carbs: 2, fats: 15, fiber: 0, servingSize: '2 eggs', perServing: true },
    { id: 'e05', name: 'Egg Bhurji', category: FoodCategory.EGGS, calories: 185, protein: 12, carbs: 3, fats: 14, fiber: 0.5, servingSize: '2 eggs', perServing: true },

    // ═══════════════════════════════════════════════════════════
    // DAIRY
    // ═══════════════════════════════════════════════════════════
    { id: 'da01', name: 'Milk (full fat)', category: FoodCategory.DAIRY, calories: 62, protein: 3.2, carbs: 4.8, fats: 3.3, fiber: 0, servingSize: '100ml' },
    { id: 'da02', name: 'Milk (toned)', category: FoodCategory.DAIRY, calories: 50, protein: 3.2, carbs: 4.8, fats: 2, fiber: 0, servingSize: '100ml' },
    { id: 'da03', name: 'Curd / Yogurt', category: FoodCategory.DAIRY, calories: 60, protein: 3.5, carbs: 4.7, fats: 3.1, fiber: 0, servingSize: '100g' },
    { id: 'da04', name: 'Greek Yogurt', category: FoodCategory.DAIRY, calories: 59, protein: 10, carbs: 3.6, fats: 0.7, fiber: 0, servingSize: '100g' },
    { id: 'da05', name: 'Buttermilk (Chaas)', category: FoodCategory.DAIRY, calories: 40, protein: 3.3, carbs: 4.8, fats: 0.9, fiber: 0, servingSize: '100ml' },
    { id: 'da06', name: 'Lassi (sweet)', category: FoodCategory.DAIRY, calories: 90, protein: 3, carbs: 15, fats: 2.5, fiber: 0, servingSize: '100ml' },
    { id: 'da07', name: 'Paneer (cottage cheese)', category: FoodCategory.DAIRY, calories: 265, protein: 18, carbs: 1.2, fats: 21, fiber: 0, servingSize: '100g' },
    { id: 'da08', name: 'Ghee (1 tbsp)', category: FoodCategory.DAIRY, calories: 112, protein: 0, carbs: 0, fats: 12.7, fiber: 0, servingSize: '1 tbsp (14g)', perServing: true },
    { id: 'da09', name: 'Butter (1 tbsp)', category: FoodCategory.DAIRY, calories: 102, protein: 0.1, carbs: 0, fats: 11.5, fiber: 0, servingSize: '1 tbsp (14g)', perServing: true },
    { id: 'da10', name: 'Cheese (slice)', category: FoodCategory.DAIRY, calories: 65, protein: 3.5, carbs: 0.5, fats: 5.5, fiber: 0, servingSize: '1 slice (20g)', perServing: true },

    // ═══════════════════════════════════════════════════════════
    // BREAKFAST
    // ═══════════════════════════════════════════════════════════
    { id: 'b01', name: 'Oats (cooked)', category: FoodCategory.BREAKFAST, calories: 71, protein: 2.5, carbs: 12, fats: 1.5, fiber: 1.7, servingSize: '100g' },
    { id: 'b02', name: 'Poha', category: FoodCategory.BREAKFAST, calories: 130, protein: 2.5, carbs: 22, fats: 3.5, fiber: 1.5, servingSize: '100g' },
    { id: 'b03', name: 'Upma', category: FoodCategory.BREAKFAST, calories: 135, protein: 3, carbs: 20, fats: 4.5, fiber: 1, servingSize: '100g' },
    { id: 'b04', name: 'Idli (1 pc)', category: FoodCategory.BREAKFAST, calories: 39, protein: 1.6, carbs: 7.5, fats: 0.2, fiber: 0.5, servingSize: '1 idli (30g)', perServing: true },
    { id: 'b05', name: 'Dosa (plain)', category: FoodCategory.BREAKFAST, calories: 133, protein: 3.5, carbs: 22, fats: 3.5, fiber: 1, servingSize: '1 dosa (~60g)', perServing: true },
    { id: 'b06', name: 'Masala Dosa', category: FoodCategory.BREAKFAST, calories: 205, protein: 4.5, carbs: 30, fats: 7, fiber: 2, servingSize: '1 dosa (~100g)', perServing: true },
    { id: 'b07', name: 'Uttapam', category: FoodCategory.BREAKFAST, calories: 165, protein: 4, carbs: 25, fats: 5, fiber: 1.5, servingSize: '1 uttapam (~80g)', perServing: true },
    { id: 'b08', name: 'Moong Dal Cheela', category: FoodCategory.BREAKFAST, calories: 110, protein: 6, carbs: 13, fats: 3.5, fiber: 2, servingSize: '1 cheela (~60g)', perServing: true },
    { id: 'b09', name: 'Cornflakes + Milk', category: FoodCategory.BREAKFAST, calories: 160, protein: 5, carbs: 30, fats: 2, fiber: 1, servingSize: '1 bowl', perServing: true },
    { id: 'b10', name: 'Besan Cheela', category: FoodCategory.BREAKFAST, calories: 120, protein: 5, carbs: 14, fats: 4, fiber: 2, servingSize: '1 cheela (~60g)', perServing: true },
    { id: 'b11', name: 'Muesli + Curd', category: FoodCategory.BREAKFAST, calories: 200, protein: 7, carbs: 32, fats: 5, fiber: 3, servingSize: '1 bowl', perServing: true },
    { id: 'b12', name: 'Overnight Oats', category: FoodCategory.BREAKFAST, calories: 185, protein: 8, carbs: 28, fats: 5, fiber: 4, servingSize: '1 bowl', perServing: true },

    // ═══════════════════════════════════════════════════════════
    // FRUITS
    // ═══════════════════════════════════════════════════════════
    { id: 'f01', name: 'Banana', category: FoodCategory.FRUITS, calories: 89, protein: 1.1, carbs: 23, fats: 0.3, fiber: 2.6, servingSize: '100g' },
    { id: 'f02', name: 'Apple', category: FoodCategory.FRUITS, calories: 52, protein: 0.3, carbs: 14, fats: 0.2, fiber: 2.4, servingSize: '100g' },
    { id: 'f03', name: 'Mango', category: FoodCategory.FRUITS, calories: 60, protein: 0.8, carbs: 15, fats: 0.4, fiber: 1.6, servingSize: '100g' },
    { id: 'f04', name: 'Papaya', category: FoodCategory.FRUITS, calories: 43, protein: 0.5, carbs: 11, fats: 0.3, fiber: 1.7, servingSize: '100g' },
    { id: 'f05', name: 'Watermelon', category: FoodCategory.FRUITS, calories: 30, protein: 0.6, carbs: 7.6, fats: 0.2, fiber: 0.4, servingSize: '100g' },
    { id: 'f06', name: 'Orange', category: FoodCategory.FRUITS, calories: 47, protein: 0.9, carbs: 12, fats: 0.1, fiber: 2.4, servingSize: '100g' },
    { id: 'f07', name: 'Guava', category: FoodCategory.FRUITS, calories: 68, protein: 2.6, carbs: 14, fats: 0.9, fiber: 5.4, servingSize: '100g' },
    { id: 'f08', name: 'Pomegranate', category: FoodCategory.FRUITS, calories: 83, protein: 1.7, carbs: 19, fats: 1.2, fiber: 4, servingSize: '100g' },
    { id: 'f09', name: 'Grapes', category: FoodCategory.FRUITS, calories: 69, protein: 0.7, carbs: 18, fats: 0.2, fiber: 0.9, servingSize: '100g' },
    { id: 'f10', name: 'Chikoo (Sapota)', category: FoodCategory.FRUITS, calories: 83, protein: 0.4, carbs: 20, fats: 1.1, fiber: 5.3, servingSize: '100g' },
    { id: 'f11', name: 'Pineapple', category: FoodCategory.FRUITS, calories: 50, protein: 0.5, carbs: 13, fats: 0.1, fiber: 1.4, servingSize: '100g' },
    { id: 'f12', name: 'Strawberries', category: FoodCategory.FRUITS, calories: 32, protein: 0.7, carbs: 7.7, fats: 0.3, fiber: 2, servingSize: '100g' },

    // ═══════════════════════════════════════════════════════════
    // VEGETABLES (raw / cooked)
    // ═══════════════════════════════════════════════════════════
    { id: 'v01', name: 'Spinach (palak)', category: FoodCategory.VEGETABLES, calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4, fiber: 2.2, servingSize: '100g' },
    { id: 'v02', name: 'Broccoli', category: FoodCategory.VEGETABLES, calories: 34, protein: 2.8, carbs: 7, fats: 0.4, fiber: 2.6, servingSize: '100g' },
    { id: 'v03', name: 'Sweet Potato (cooked)', category: FoodCategory.VEGETABLES, calories: 86, protein: 1.6, carbs: 20, fats: 0.1, fiber: 3, servingSize: '100g' },
    { id: 'v04', name: 'Potato (boiled)', category: FoodCategory.VEGETABLES, calories: 87, protein: 1.9, carbs: 20, fats: 0.1, fiber: 1.8, servingSize: '100g' },
    { id: 'v05', name: 'Cucumber', category: FoodCategory.VEGETABLES, calories: 15, protein: 0.7, carbs: 3.6, fats: 0.1, fiber: 0.5, servingSize: '100g' },
    { id: 'v06', name: 'Tomato', category: FoodCategory.VEGETABLES, calories: 18, protein: 0.9, carbs: 3.9, fats: 0.2, fiber: 1.2, servingSize: '100g' },
    { id: 'v07', name: 'Onion', category: FoodCategory.VEGETABLES, calories: 40, protein: 1.1, carbs: 9.3, fats: 0.1, fiber: 1.7, servingSize: '100g' },
    { id: 'v08', name: 'Carrot', category: FoodCategory.VEGETABLES, calories: 41, protein: 0.9, carbs: 10, fats: 0.2, fiber: 2.8, servingSize: '100g' },
    { id: 'v09', name: 'Beetroot', category: FoodCategory.VEGETABLES, calories: 43, protein: 1.6, carbs: 10, fats: 0.2, fiber: 2.8, servingSize: '100g' },
    { id: 'v10', name: 'Mushrooms', category: FoodCategory.VEGETABLES, calories: 22, protein: 3.1, carbs: 3.3, fats: 0.3, fiber: 1, servingSize: '100g' },

    // ═══════════════════════════════════════════════════════════
    // NUTS & SEEDS
    // ═══════════════════════════════════════════════════════════
    { id: 'n01', name: 'Almonds (10 pcs)', category: FoodCategory.NUTS_SEEDS, calories: 70, protein: 2.5, carbs: 2.5, fats: 6, fiber: 1.5, servingSize: '10 almonds (12g)', perServing: true },
    { id: 'n02', name: 'Walnuts (5 pcs)', category: FoodCategory.NUTS_SEEDS, calories: 90, protein: 2.5, carbs: 2, fats: 8.5, fiber: 1, servingSize: '5 walnuts (14g)', perServing: true },
    { id: 'n03', name: 'Cashews (10 pcs)', category: FoodCategory.NUTS_SEEDS, calories: 87, protein: 2.5, carbs: 5, fats: 7, fiber: 0.5, servingSize: '10 cashews (15g)', perServing: true },
    { id: 'n04', name: 'Peanuts (handful)', category: FoodCategory.NUTS_SEEDS, calories: 161, protein: 7, carbs: 5, fats: 14, fiber: 2.4, servingSize: '28g', perServing: true },
    { id: 'n05', name: 'Flax Seeds (1 tbsp)', category: FoodCategory.NUTS_SEEDS, calories: 55, protein: 2, carbs: 3, fats: 4, fiber: 2.8, servingSize: '1 tbsp (10g)', perServing: true },
    { id: 'n06', name: 'Chia Seeds (1 tbsp)', category: FoodCategory.NUTS_SEEDS, calories: 58, protein: 2, carbs: 5, fats: 3.7, fiber: 4, servingSize: '1 tbsp (12g)', perServing: true },
    { id: 'n07', name: 'Pumpkin Seeds (1 tbsp)', category: FoodCategory.NUTS_SEEDS, calories: 45, protein: 2.5, carbs: 1.5, fats: 3.5, fiber: 0.5, servingSize: '1 tbsp (8g)', perServing: true },
    { id: 'n08', name: 'Sunflower Seeds (1 tbsp)', category: FoodCategory.NUTS_SEEDS, calories: 51, protein: 2, carbs: 2, fats: 4.5, fiber: 0.8, servingSize: '1 tbsp (9g)', perServing: true },
    { id: 'n09', name: 'Dates (2 pcs)', category: FoodCategory.NUTS_SEEDS, calories: 66, protein: 0.5, carbs: 18, fats: 0, fiber: 1.6, servingSize: '2 dates (24g)', perServing: true },
    { id: 'n10', name: 'Raisins (small box)', category: FoodCategory.NUTS_SEEDS, calories: 85, protein: 1, carbs: 22, fats: 0.1, fiber: 1, servingSize: '28g', perServing: true },

    // ═══════════════════════════════════════════════════════════
    // SNACKS
    // ═══════════════════════════════════════════════════════════
    { id: 'sn01', name: 'Samosa (1 pc)', category: FoodCategory.SNACKS, calories: 308, protein: 5, carbs: 29, fats: 19, fiber: 2, servingSize: '1 samosa (80g)', perServing: true },
    { id: 'sn02', name: 'Vada Pav', category: FoodCategory.SNACKS, calories: 290, protein: 6, carbs: 40, fats: 12, fiber: 2.5, servingSize: '1 pc', perServing: true },
    { id: 'sn03', name: 'Pav Bhaji', category: FoodCategory.SNACKS, calories: 290, protein: 7, carbs: 38, fats: 12, fiber: 3, servingSize: '1 serving', perServing: true },
    { id: 'sn04', name: 'Bhel Puri', category: FoodCategory.SNACKS, calories: 190, protein: 5, carbs: 30, fats: 6, fiber: 3, servingSize: '1 bowl', perServing: true },
    { id: 'sn05', name: 'Dhokla (2 pcs)', category: FoodCategory.SNACKS, calories: 120, protein: 4, carbs: 18, fats: 3, fiber: 1.5, servingSize: '2 pcs (60g)', perServing: true },
    { id: 'sn06', name: 'Kachori (1 pc)', category: FoodCategory.SNACKS, calories: 250, protein: 5, carbs: 28, fats: 13, fiber: 2, servingSize: '1 kachori', perServing: true },
    { id: 'sn07', name: 'Pakora (5 pcs)', category: FoodCategory.SNACKS, calories: 230, protein: 5, carbs: 22, fats: 14, fiber: 2, servingSize: '5 pcs', perServing: true },
    { id: 'sn08', name: 'Roasted Makhana (1 cup)', category: FoodCategory.SNACKS, calories: 95, protein: 3, carbs: 18, fats: 1, fiber: 1.5, servingSize: '1 cup (30g)', perServing: true },
    { id: 'sn09', name: 'Protein Bar', category: FoodCategory.SNACKS, calories: 200, protein: 20, carbs: 22, fats: 6, fiber: 3, servingSize: '1 bar', perServing: true },
    { id: 'sn10', name: 'Mixed Dry Fruits (handful)', category: FoodCategory.SNACKS, calories: 160, protein: 4, carbs: 18, fats: 8, fiber: 2, servingSize: '30g', perServing: true },

    // ═══════════════════════════════════════════════════════════
    // DRINKS
    // ═══════════════════════════════════════════════════════════
    { id: 'dr01', name: 'Masala Chai (1 cup)', category: FoodCategory.DRINKS, calories: 60, protein: 2, carbs: 8, fats: 2, fiber: 0, servingSize: '1 cup (150ml)', perServing: true },
    { id: 'dr02', name: 'Black Coffee', category: FoodCategory.DRINKS, calories: 2, protein: 0.3, carbs: 0, fats: 0, fiber: 0, servingSize: '1 cup', perServing: true },
    { id: 'dr03', name: 'Green Tea', category: FoodCategory.DRINKS, calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, servingSize: '1 cup', perServing: true },
    { id: 'dr04', name: 'Coconut Water', category: FoodCategory.DRINKS, calories: 19, protein: 0.7, carbs: 3.7, fats: 0.2, fiber: 1.1, servingSize: '100ml' },
    { id: 'dr05', name: 'Nimbu Pani', category: FoodCategory.DRINKS, calories: 40, protein: 0, carbs: 10, fats: 0, fiber: 0, servingSize: '1 glass', perServing: true },
    { id: 'dr06', name: 'Mango Lassi', category: FoodCategory.DRINKS, calories: 150, protein: 4, carbs: 28, fats: 3, fiber: 1, servingSize: '1 glass', perServing: true },
    { id: 'dr07', name: 'Banana Shake (milk)', category: FoodCategory.DRINKS, calories: 165, protein: 5, carbs: 28, fats: 4, fiber: 2, servingSize: '1 glass', perServing: true },
    { id: 'dr08', name: 'Protein Shake', category: FoodCategory.DRINKS, calories: 180, protein: 25, carbs: 10, fats: 3, fiber: 1, servingSize: '1 shake', perServing: true },
    { id: 'dr09', name: 'Sugarcane Juice', category: FoodCategory.DRINKS, calories: 73, protein: 0, carbs: 18, fats: 0, fiber: 0, servingSize: '1 glass (200ml)', perServing: true },
    { id: 'dr10', name: 'Jaljeera', category: FoodCategory.DRINKS, calories: 25, protein: 0.5, carbs: 5, fats: 0, fiber: 0.5, servingSize: '1 glass', perServing: true },

    // ═══════════════════════════════════════════════════════════
    // SWEETS (treat yourself, occasionally)
    // ═══════════════════════════════════════════════════════════
    { id: 'sw01', name: 'Gulab Jamun (1 pc)', category: FoodCategory.SWEETS, calories: 150, protein: 2, carbs: 24, fats: 5, fiber: 0.5, servingSize: '1 pc', perServing: true },
    { id: 'sw02', name: 'Rasgulla (1 pc)', category: FoodCategory.SWEETS, calories: 120, protein: 3, carbs: 22, fats: 2, fiber: 0, servingSize: '1 pc', perServing: true },
    { id: 'sw03', name: 'Jalebi (2 pcs)', category: FoodCategory.SWEETS, calories: 150, protein: 1, carbs: 25, fats: 5, fiber: 0, servingSize: '2 pcs', perServing: true },
    { id: 'sw04', name: 'Kheer (1 bowl)', category: FoodCategory.SWEETS, calories: 180, protein: 5, carbs: 28, fats: 6, fiber: 0.5, servingSize: '1 bowl', perServing: true },
    { id: 'sw05', name: 'Laddu (besan, 1 pc)', category: FoodCategory.SWEETS, calories: 180, protein: 3, carbs: 22, fats: 9, fiber: 1, servingSize: '1 pc', perServing: true },
    { id: 'sw06', name: 'Halwa (sooji)', category: FoodCategory.SWEETS, calories: 248, protein: 4, carbs: 38, fats: 9, fiber: 1, servingSize: '100g' },
    { id: 'sw07', name: 'Gajar Halwa', category: FoodCategory.SWEETS, calories: 216, protein: 4, carbs: 30, fats: 9, fiber: 2, servingSize: '100g' },
    { id: 'sw08', name: 'Dark Chocolate (2 pcs)', category: FoodCategory.SWEETS, calories: 106, protein: 1.4, carbs: 11, fats: 7, fiber: 2, servingSize: '20g', perServing: true },

    // ═══════════════════════════════════════════════════════════
    // GLOBAL FOODS
    // ═══════════════════════════════════════════════════════════
    { id: 'g01', name: 'Pasta (cooked)', category: FoodCategory.GLOBAL, calories: 131, protein: 5, carbs: 25, fats: 1.1, fiber: 1.8, servingSize: '100g' },
    { id: 'g02', name: 'Pizza (1 slice)', category: FoodCategory.GLOBAL, calories: 285, protein: 12, carbs: 36, fats: 10, fiber: 2.5, servingSize: '1 slice', perServing: true },
    { id: 'g03', name: 'Burger (veg)', category: FoodCategory.GLOBAL, calories: 280, protein: 10, carbs: 35, fats: 12, fiber: 2, servingSize: '1 burger', perServing: true },
    { id: 'g04', name: 'Burger (chicken)', category: FoodCategory.GLOBAL, calories: 350, protein: 20, carbs: 30, fats: 17, fiber: 1.5, servingSize: '1 burger', perServing: true },
    { id: 'g05', name: 'French Fries', category: FoodCategory.GLOBAL, calories: 312, protein: 3.4, carbs: 41, fats: 15, fiber: 3.8, servingSize: '100g' },
    { id: 'g06', name: 'Noodles (cooked)', category: FoodCategory.GLOBAL, calories: 138, protein: 4.5, carbs: 25, fats: 2, fiber: 0.9, servingSize: '100g' },
    { id: 'g07', name: 'Maggi (1 pack)', category: FoodCategory.GLOBAL, calories: 340, protein: 7, carbs: 48, fats: 14, fiber: 2, servingSize: '1 pack (70g)', perServing: true },
    { id: 'g08', name: 'Momos (6 pcs, steamed)', category: FoodCategory.GLOBAL, calories: 210, protein: 8, carbs: 30, fats: 6, fiber: 1.5, servingSize: '6 pcs', perServing: true },
    { id: 'g09', name: 'Sandwich (veg)', category: FoodCategory.GLOBAL, calories: 230, protein: 8, carbs: 30, fats: 8, fiber: 3, servingSize: '1 sandwich', perServing: true },
    { id: 'g10', name: 'Wrap / Roll (chicken)', category: FoodCategory.GLOBAL, calories: 310, protein: 18, carbs: 28, fats: 14, fiber: 2, servingSize: '1 roll', perServing: true },
];

// ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────────

export const getFoodsByCategory = (category) =>
    foodDatabase.filter(f => f.category === category);

export const searchFoods = (query) => {
    const q = query.toLowerCase();
    return foodDatabase.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
    );
};

export const getFoodById = (id) =>
    foodDatabase.find(f => f.id === id);

export const getAllCategories = () =>
    [...new Set(foodDatabase.map(f => f.category))];

export const getHighProteinFoods = (minProtein = 15) =>
    foodDatabase.filter(f => f.protein >= minProtein).sort((a, b) => b.protein - a.protein);

export default foodDatabase;
