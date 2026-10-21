import React, { useState, useMemo, useEffect } from "react";
import { 
  Dish, FilterState, DayMealPlan, UserHealthProfile, PortionType, VisualDisplayMode,
  ShoppingListItem, ShoppingItemCategory, MealDiaryDay
} from "./types";
import { WORLD_500_DISHES } from "./data/worldDishesCatalog";
import { Sidebar, ActiveTabType } from "./components/Sidebar";
import { TimeOfDayMealRecommender } from "./components/TimeOfDayMealRecommender";
import { WeatherDemandMealRecommender } from "./components/WeatherDemandMealRecommender";
import { DishCard } from "./components/DishCard";
import { DishDetailModal } from "./components/DishDetailModal";
import { MealFilterBar } from "./components/MealFilterBar";
import { FridgePantryFinder } from "./components/FridgePantryFinder";
import { DailyMealPlanner } from "./components/DailyMealPlanner";
import { WheelOfFortune } from "./components/WheelOfFortune";
import { HealthProfileModal } from "./components/HealthProfileModal";
import { SavedMealsView } from "./components/SavedMealsView";
import { DailyNutritionTip } from "./components/DailyNutritionTip";
import { ShoppingList } from "./components/ShoppingList";
import { FoodDiary } from "./components/FoodDiary";
import { 
  extractDayPlanIngredients, extractDishIngredients, mergeShoppingItems, inferIngredientCategory 
} from "./utils/shoppingListHelper";
import { generateInitialMealDiary, createDiaryFromMealPlan } from "./utils/mealDiaryHelper";
import { 
  Sparkles, ChefHat, HeartPulse, Flame, Compass, 
  ArrowUp, ShieldCheck, CheckCircle2 
} from "lucide-react";
import { calculatePortionMultiplier } from "./utils/nutritionCalculator";

const INITIAL_FILTER: FilterState = {
  searchQuery: "",
  selectedMeal: "all",
  selectedRegion: "all",
  selectedPortion: "single",
  selectedPriceTier: "all",
  selectedTastes: [],
  selectedHealthProfiles: [],
  excludedAllergens: [],
  maxCalories: 950,
  maxPrepTime: 120
};

const DEFAULT_HEALTH_PROFILE: UserHealthProfile = {
  age: 26,
  gender: "female",
  weightKg: 52,
  heightCm: 160,
  activityLevel: "moderate",
  goal: "maintain",
  condition: "weight_loss",
  selectedHealthConditions: ["weight_loss"],
  allergies: [],
  bmr: 1320,
  tdee: 2046,
  targetDailyCalories: 2000
};

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTabType>("explore");
  const [filter, setFilter] = useState<FilterState>(INITIAL_FILTER);
  const [selectedDishForDetail, setSelectedDishForDetail] = useState<Dish | null>(null);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState<boolean>(false);
  const [visibleDishesCount, setVisibleDishesCount] = useState<number>(24);

  // Visual display mode: "photo" (ảnh thực tế) or "icon"
  const [visualMode, setVisualMode] = useState<VisualDisplayMode>(() => {
    try {
      const saved = localStorage.getItem("hon_nay_an_gi_visual_mode");
      return (saved === "icon" ? "icon" : "photo") as VisualDisplayMode;
    } catch {
      return "photo";
    }
  });

  const handleToggleVisualMode = (mode: VisualDisplayMode) => {
    setVisualMode(mode);
    try {
      localStorage.setItem("hon_nay_an_gi_visual_mode", mode);
    } catch {}
  };

  // Persistence: Saved dishes
  const [savedDishes, setSavedDishes] = useState<Dish[]>(() => {
    try {
      const saved = localStorage.getItem("hon_nay_an_gi_saved_dishes");
      return saved ? JSON.parse(saved) : [WORLD_500_DISHES[0], WORLD_500_DISHES[3], WORLD_500_DISHES[6]];
    } catch {
      return [WORLD_500_DISHES[0], WORLD_500_DISHES[3]];
    }
  });

  // Persistence: User health profile
  const [userProfile, setUserProfile] = useState<UserHealthProfile>(() => {
    try {
      const saved = localStorage.getItem("hon_nay_an_gi_user_profile");
      return saved ? JSON.parse(saved) : DEFAULT_HEALTH_PROFILE;
    } catch {
      return DEFAULT_HEALTH_PROFILE;
    }
  });

  // Persistence: Saved day plans
  const [savedDayPlans, setSavedDayPlans] = useState<DayMealPlan[]>(() => {
    try {
      const saved = localStorage.getItem("hon_nay_an_gi_saved_day_plans");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Initial Current Day Plan
  const [currentDayPlan, setCurrentDayPlan] = useState<DayMealPlan>(() => {
    const b = WORLD_500_DISHES.find(d => d.mealTypes.includes("breakfast")) || WORLD_500_DISHES[0];
    const l = WORLD_500_DISHES.find(d => d.mealTypes.includes("main")) || WORLD_500_DISHES[1];
    const aft = WORLD_500_DISHES.find(d => d.mealTypes.includes("afternoon")) || WORLD_500_DISHES[2];
    const d = WORLD_500_DISHES.find(d => d.mealTypes.includes("main") && d.id !== l.id) || WORLD_500_DISHES[3];
    const des = WORLD_500_DISHES.find(d => d.mealTypes.includes("dessert")) || WORLD_500_DISHES[4];

    const dishes = [b, l, aft, d, des];
    return {
      id: "day-plan-initial",
      title: "Thực Đơn Chuẩn Cân Bằng",
      date: new Date().toLocaleDateString("vi-VN"),
      breakfast: b,
      lunch: l,
      afternoonSnack: aft,
      dinner: d,
      dessert: des,
      totalCalories: dishes.reduce((s, x) => s + x.calories, 0),
      totalCostVND: dishes.reduce((s, x) => s + x.estimatedCostVND, 0),
      totalProtein: dishes.reduce((s, x) => s + x.protein, 0),
      totalCarbs: dishes.reduce((s, x) => s + x.carbs, 0),
      totalFat: dishes.reduce((s, x) => s + x.fat, 0),
      totalFiber: dishes.reduce((s, x) => s + x.fiber, 0)
    };
  });

  // Save to localStorage when state updates
  useEffect(() => {
    try {
      localStorage.setItem("hon_nay_an_gi_saved_dishes", JSON.stringify(savedDishes));
    } catch {}
  }, [savedDishes]);

  useEffect(() => {
    try {
      localStorage.setItem("hon_nay_an_gi_user_profile", JSON.stringify(userProfile));
    } catch {}
  }, [userProfile]);

  useEffect(() => {
    try {
      localStorage.setItem("hon_nay_an_gi_saved_day_plans", JSON.stringify(savedDayPlans));
    } catch {}
  }, [savedDayPlans]);

  // Persistence: Custom logo (exact user image file, unedited)
  const [customLogo, setCustomLogo] = useState<string>(() => {
    try {
      return localStorage.getItem("hon_nay_an_gi_custom_app_logo") || "";
    } catch {
      return "";
    }
  });

  const handleUploadLogo = (logoUrl: string) => {
    setCustomLogo(logoUrl);
    try {
      localStorage.setItem("hon_nay_an_gi_custom_app_logo", logoUrl);
    } catch {}
  };

  // Persistence: Food Diary (Nhật Ký Ăn Uống)
  const [mealDiary, setMealDiary] = useState<MealDiaryDay[]>(() => {
    try {
      const saved = localStorage.getItem("hon_nay_an_gi_meal_diary");
      if (saved) return JSON.parse(saved);
    } catch {}
    return generateInitialMealDiary(currentDayPlan, userProfile?.targetDailyCalories || 2000);
  });

  useEffect(() => {
    try {
      localStorage.setItem("hon_nay_an_gi_meal_diary", JSON.stringify(mealDiary));
    } catch {}
  }, [mealDiary]);

  const handleLogPlanToDiary = (plan: DayMealPlan, targetDateStr?: string) => {
    const target = targetDateStr || new Date().toISOString().split("T")[0];
    const newEntry = createDiaryFromMealPlan(
      plan,
      target,
      userProfile?.targetDailyCalories || 2000,
      false
    );

    setMealDiary(prev => {
      const filtered = prev.filter(d => d.date !== target);
      return [newEntry, ...filtered].sort((a, b) => b.date.localeCompare(a.date));
    });
  };

  // Persistence: Shopping List items
  const [shoppingItems, setShoppingItems] = useState<ShoppingListItem[]>(() => {
    try {
      const saved = localStorage.getItem("hon_nay_an_gi_shopping_list");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem("hon_nay_an_gi_shopping_list", JSON.stringify(shoppingItems));
    } catch {}
  }, [shoppingItems]);

  // Shopping list handlers
  const handleToggleShoppingItem = (id: string) => {
    setShoppingItems(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const handleDeleteShoppingItem = (id: string) => {
    setShoppingItems(prev => prev.filter(item => item.id !== id));
  };

  const handleClearCompletedShopping = () => {
    setShoppingItems(prev => prev.filter(item => !item.checked));
  };

  const handleClearAllShopping = () => {
    setShoppingItems([]);
  };

  const handleAddCustomShoppingItem = (
    name: string,
    amount: string,
    category: ShoppingItemCategory,
    sourceName?: string
  ) => {
    const newItem: ShoppingListItem = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      amount: amount || "Vừa đủ",
      category,
      sourceType: "custom",
      sourceName: sourceName || "Tự thêm",
      checked: false,
      addedAt: new Date().toISOString()
    };
    setShoppingItems(prev => mergeShoppingItems(prev, [newItem]));
  };

  const handleImportFromDayPlan = (plan: DayMealPlan = currentDayPlan) => {
    const extracted = extractDayPlanIngredients(plan);
    setShoppingItems(prev => mergeShoppingItems(prev, extracted));
  };

  const handleImportMissingFromPantry = (
    missing?: { name: string; amount: string; category?: string; sourceName?: string }[]
  ) => {
    if (missing && missing.length > 0) {
      const newItems: ShoppingListItem[] = missing.map(m => ({
        id: `pantry-item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: m.name,
        amount: m.amount || "Vừa đủ",
        category: (m.category as ShoppingItemCategory) || inferIngredientCategory(m.name),
        sourceType: "pantry_missing",
        sourceName: m.sourceName || "Tủ lạnh - Món gợi ý",
        checked: false,
        addedAt: new Date().toISOString()
      }));
      setShoppingItems(prev => mergeShoppingItems(prev, newItems));
    } else {
      // Default: extract from current day plan
      const extracted = extractDayPlanIngredients(currentDayPlan);
      setShoppingItems(prev => mergeShoppingItems(prev, extracted));
    }
  };

  const handleAddDishToShoppingList = (dish: Dish, portion: PortionType = "single") => {
    const mult = calculatePortionMultiplier(portion);
    const extracted = extractDishIngredients(dish, mult);
    setShoppingItems(prev => mergeShoppingItems(prev, extracted));
  };

  // Toggle favorite dish
  const handleToggleSave = (dish: Dish) => {
    const exists = savedDishes.some(d => d.id === dish.id);
    if (exists) {
      setSavedDishes(savedDishes.filter(d => d.id !== dish.id));
    } else {
      setSavedDishes([dish, ...savedDishes]);
    }
  };

  const isDishSaved = (dish: Dish) => {
    return savedDishes.some(d => d.id === dish.id);
  };

  // Add a dish into specific slot of the current day plan
  const handleAddToMealPlan = (dish: Dish, mealSlot: "breakfast" | "lunch" | "afternoon" | "dinner" | "dessert") => {
    const updated = { ...currentDayPlan };
    if (mealSlot === "breakfast") updated.breakfast = dish;
    if (mealSlot === "lunch") updated.lunch = dish;
    if (mealSlot === "afternoon") updated.afternoonSnack = dish;
    if (mealSlot === "dinner") updated.dinner = dish;
    if (mealSlot === "dessert") updated.dessert = dish;

    const dishes = [updated.breakfast, updated.lunch, updated.afternoonSnack, updated.dinner, updated.dessert].filter(Boolean) as Dish[];
    updated.totalCalories = dishes.reduce((s, d) => s + d.calories, 0);
    updated.totalCostVND = dishes.reduce((s, d) => s + d.estimatedCostVND, 0);
    updated.totalProtein = dishes.reduce((s, d) => s + d.protein, 0);
    updated.totalCarbs = dishes.reduce((s, d) => s + d.carbs, 0);
    updated.totalFat = dishes.reduce((s, d) => s + d.fat, 0);
    updated.totalFiber = dishes.reduce((s, d) => s + d.fiber, 0);

    setCurrentDayPlan(updated);
    setActiveTab("daily_plan");
  };

  // Save current day plan to historical archive
  const handleSaveDayPlan = (plan: DayMealPlan) => {
    const isAlreadySaved = savedDayPlans.some(p => p.id === plan.id);
    if (!isAlreadySaved) {
      setSavedDayPlans([plan, ...savedDayPlans]);
    }
  };

  const handleDeleteDayPlan = (id: string) => {
    setSavedDayPlans(savedDayPlans.filter(p => p.id !== id));
  };

  const handleApplyDayPlan = (plan: DayMealPlan) => {
    setCurrentDayPlan(plan);
    setActiveTab("daily_plan");
  };

  // Update profile and synchronize filter
  const handleSaveProfile = (newProfile: UserHealthProfile) => {
    setUserProfile(newProfile);
    // Apply user allergies and all selected health conditions to filter
    const activeConditions = newProfile.selectedHealthConditions && newProfile.selectedHealthConditions.length > 0
      ? newProfile.selectedHealthConditions
      : (newProfile.condition ? [newProfile.condition] : []);

    setFilter(prev => ({
      ...prev,
      excludedAllergens: Array.from(new Set([...prev.excludedAllergens, ...newProfile.allergies])),
      selectedHealthProfiles: activeConditions.length > 0 
        ? Array.from(new Set([...prev.selectedHealthProfiles, ...activeConditions]))
        : prev.selectedHealthProfiles
    }));
  };

  // Filter Algorithm over 500 dishes
  const filteredDishes = useMemo(() => {
    return WORLD_500_DISHES.filter(dish => {
      // 1. Search query
      if (filter.searchQuery.trim()) {
        const query = filter.searchQuery.toLowerCase().trim();
        const inName = dish.name.toLowerCase().includes(query);
        const inNative = dish.nativeName?.toLowerCase().includes(query) || false;
        const inDesc = dish.description.toLowerCase().includes(query);
        const inCountry = dish.country.toLowerCase().includes(query);
        const inIngredients = dish.keyIngredients.some(k => k.toLowerCase().includes(query)) ||
                              dish.ingredients.some(i => i.name.toLowerCase().includes(query));
        if (!inName && !inNative && !inDesc && !inCountry && !inIngredients) {
          return false;
        }
      }

      // 2. Meal type filter
      if (filter.selectedMeal !== "all") {
        if (!dish.mealTypes.includes(filter.selectedMeal)) {
          return false;
        }
      }

      // 3. Region filter (asian vs western)
      if (filter.selectedRegion !== "all") {
        if (dish.region !== filter.selectedRegion) {
          return false;
        }
      }

      // 4. Taste multi-select filter (if any selected, dish must contain at least one)
      if (filter.selectedTastes.length > 0) {
        const hasTaste = filter.selectedTastes.some(t => dish.tastes.includes(t));
        if (!hasTaste) return false;
      }

      // 5. Health profiles (diet, gym, pregnancy, hypertension, etc.)
      if (filter.selectedHealthProfiles.length > 0) {
        const matchesHealth = filter.selectedHealthProfiles.some(hp => dish.dietarySuitability.includes(hp));
        if (!matchesHealth) return false;
      }

      // 6. Strict Allergen Exclusion (NO seafood, NO peanuts, etc.)
      if (filter.excludedAllergens.length > 0) {
        const hasAllergen = filter.excludedAllergens.some(alg => dish.allergens.includes(alg));
        if (hasAllergen) return false;
      }

      // 7. Max Calories filter (per single serving)
      if (dish.calories > filter.maxCalories) {
        return false;
      }

      // 8. Price Tier filter
      if (filter.selectedPriceTier !== "all") {
        if (filter.selectedPriceTier === "budget" && dish.estimatedCostVND >= 45000) return false;
        if (filter.selectedPriceTier === "medium" && (dish.estimatedCostVND < 45000 || dish.estimatedCostVND > 110000)) return false;
        if (filter.selectedPriceTier === "luxury" && dish.estimatedCostVND <= 110000) return false;
      }

      return true;
    });
  }, [filter]);

  const portionMultiplier = calculatePortionMultiplier(filter.selectedPortion);

  return (
    <div className="min-h-screen bg-amber-50/40 text-slate-800 font-sans selection:bg-amber-200">
      
      {/* Vertical Left Sidebar Navigation (Thanh menu dọc lề bên trái) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedDishes.length}
        shoppingCount={shoppingItems.filter(i => !i.checked).length}
        diaryCount={mealDiary.length}
        openHealthModal={() => setIsHealthModalOpen(true)}
        totalDishesCount={WORLD_500_DISHES.length}
        visualMode={visualMode}
        onToggleVisualMode={handleToggleVisualMode}
        customLogo={customLogo}
        onUploadLogo={handleUploadLogo}
        userProfile={userProfile}
      />

      {/* Main Content Container with left margin on desktop to accommodate vertical sidebar */}
      <div className="md:ml-64 lg:ml-72 flex flex-col min-h-screen pb-16 md:pb-0">
        
        {/* Main Content Area */}
        <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

          {/* Tab 1: Explore & Filter 500 Dishes */}
          {activeTab === "explore" && (
            <div className="space-y-6">
              
              {/* Đưa ra món ăn đúng thời điểm và thời gian ăn */}
              <TimeOfDayMealRecommender
                allDishes={WORLD_500_DISHES}
                onSelectDish={(dish) => setSelectedDishForDetail(dish)}
                onFilterMealType={(meal) => {
                  setFilter((prev) => ({ ...prev, selectedMeal: meal }));
                  const el = document.getElementById("dishes-catalog-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                displayMode={visualMode}
              />

              {/* Daily Nutrition Tip based on user's current goal */}
              <DailyNutritionTip
                userProfile={userProfile}
                onOpenHealthModal={() => setIsHealthModalOpen(true)}
                onSelectDish={(dish) => setSelectedDishForDetail(dish)}
                onApplyConditionFilter={(condition) => {
                  setFilter((prev) => ({
                  ...prev,
                  selectedHealthProfiles: prev.selectedHealthProfiles.includes(condition)
                    ? prev.selectedHealthProfiles
                    : [...prev.selectedHealthProfiles, condition]
                }));
              }}
              allDishes={WORLD_500_DISHES}
            />

            {/* Cute Hero Intro for Indecisive Eaters */}
            <div className="bg-linear-to-r from-amber-500 via-orange-400 to-yellow-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-extrabold mb-3">
                  <ChefHat className="w-4 h-4 text-amber-100" />
                  <span>Cứu Tinh Cho Người Hay Phân Vân Về Bữa Ăn</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-2 leading-tight">
                  Khám Phá Hơn 500 Món Ăn Ngon Khắp Thế Giới
                </h1>
                <p className="text-xs sm:text-sm text-amber-50 font-medium leading-relaxed max-w-xl">
                  Chọn lọc theo bữa sáng, bữa chính, tráng miệng, khẩu phần, chuẩn calo khoa học, định lượng nguyên liệu chi tiết và loại bỏ 100% dị ứng thực phẩm.
                </p>

                {/* Feature Chips */}
                <div className="flex items-center gap-2 pt-4 flex-wrap text-xs font-bold">
                  <span className="bg-white/25 backdrop-blur-xs px-3 py-1 rounded-full flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Chuẩn Calo BMR / TDEE</span>
                  </span>
                  <span className="bg-white/25 backdrop-blur-xs px-3 py-1 rounded-full flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Gợi Ý Theo Tủ Lạnh Sẵn Có</span>
                  </span>
                  <span className="bg-white/25 backdrop-blur-xs px-3 py-1 rounded-full flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Linh Hoạt 1 Người - Tiệc Lớn</span>
                  </span>
                </div>
              </div>

              <div className="relative z-10 flex flex-col gap-2 shrink-0">
                <button
                  onClick={() => setActiveTab("weather")}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-xs sm:text-sm shadow-lg hover:from-amber-600 hover:to-orange-600 transition-transform active:scale-95 flex items-center gap-2"
                >
                  <span>🌤️ Gợi Ý Món Theo Thời Tiết & Nhu Cầu</span>
                </button>
                <button
                  onClick={() => setActiveTab("wheel")}
                  className="px-5 py-2.5 rounded-2xl bg-slate-950 text-white font-bold text-xs sm:text-sm shadow-md hover:bg-black transition-transform active:scale-95 flex items-center gap-2"
                >
                  <span>🎡 Vòng Quay &quot;Hôm Nay Ăn Gì&quot;</span>
                </button>
                <button
                  onClick={() => setActiveTab("pantry")}
                  className="px-5 py-2.5 rounded-2xl bg-white text-amber-800 font-bold text-xs sm:text-sm shadow-xs hover:bg-amber-50 transition-transform active:scale-95 flex items-center gap-2 border border-amber-200"
                >
                  <span>🧊 Nấu Theo Tủ Lạnh Sẵn Có</span>
                </button>
              </div>

              {/* Decorative Background icon */}
              <div className="absolute right-4 -bottom-6 text-9xl opacity-15 pointer-events-none select-none hidden sm:block">
                🍜
              </div>
            </div>

            {/* Comprehensive Filter Bar */}
            <div id="dishes-catalog-section" className="scroll-mt-4">
              <MealFilterBar
                filter={filter}
                onFilterChange={setFilter}
                onResetFilter={() => setFilter(INITIAL_FILTER)}
                totalFilteredCount={filteredDishes.length}
                visualMode={visualMode}
                onToggleVisualMode={handleToggleVisualMode}
              />
            </div>

            {/* Grid of Dishes */}
            {filteredDishes.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center">
                <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-700 text-base mb-1">
                  Không tìm thấy món ăn phù hợp với bộ lọc
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                  Bạn hãy thử nới lỏng giới hạn calo hoặc bỏ bớt các tiêu chí lọc khẩu vị / dị ứng để khám phá thêm món ngon nhé!
                </p>
                <button
                  onClick={() => setFilter(INITIAL_FILTER)}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20"
                >
                  Đặt Lại Bộ Lọc Ban Đầu
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                  {filteredDishes.slice(0, visibleDishesCount).map((dish) => (
                    <DishCard
                      key={dish.id}
                      dish={dish}
                      isSaved={isDishSaved(dish)}
                      onToggleSave={handleToggleSave}
                      onSelectDetail={(d) => setSelectedDishForDetail(d)}
                      portionMultiplier={portionMultiplier}
                      selectedPortion={filter.selectedPortion}
                      displayMode="icon"
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {visibleDishesCount < filteredDishes.length && (
                  <div className="text-center pt-8 pb-4">
                    <button
                      id="btn-load-more-dishes"
                      onClick={() => setVisibleDishesCount(prev => prev + 24)}
                      className="px-8 py-3.5 rounded-2xl bg-white hover:bg-amber-50 text-amber-800 border-2 border-amber-200 font-extrabold text-sm shadow-sm hover:shadow-md transition-all active:scale-95 inline-flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Xem Thêm 24 Món Nữa (Còn {filteredDishes.length - visibleDishesCount} món)</span>
                    </button>
                  </div>
                )}
              </>
            )}

          </div>
        )}

        {/* Tab: AI Weather & Demand Meal Recommender */}
        {activeTab === "weather" && (
          <WeatherDemandMealRecommender
            allDishes={WORLD_500_DISHES}
            onSelectDish={(d) => setSelectedDishForDetail(d)}
            onSaveDish={handleToggleSave}
            savedDishIds={savedDishes.map(d => d.id)}
          />
        )}

        {/* Tab 2: Daily Meal Planner */}
        {activeTab === "daily_plan" && (
          <DailyMealPlanner
            allDishes={WORLD_500_DISHES}
            currentPlan={currentDayPlan}
            onUpdatePlan={setCurrentDayPlan}
            onSelectDetail={(d) => setSelectedDishForDetail(d)}
            userProfile={userProfile}
            onSaveDayPlan={handleSaveDayPlan}
            isSavedPlan={savedDayPlans.some(p => p.id === currentDayPlan.id)}
            displayMode={visualMode}
            onAddPlanToShoppingList={(plan) => handleImportFromDayPlan(plan)}
            onNavigateToShopping={() => setActiveTab("shopping")}
            onLogPlanToDiary={handleLogPlanToDiary}
            onNavigateToDiary={() => setActiveTab("diary")}
          />
        )}

        {/* Tab 3: Smart Fridge & Pantry Matcher */}
        {activeTab === "pantry" && (
          <FridgePantryFinder
            allDishes={WORLD_500_DISHES}
            onSelectDetail={(d) => setSelectedDishForDetail(d)}
            isSaved={isDishSaved}
            onToggleSave={handleToggleSave}
            displayMode={visualMode}
            onAddMissingToShoppingList={(missingItems) => handleImportMissingFromPantry(missingItems)}
            onNavigateToShopping={() => setActiveTab("shopping")}
          />
        )}

        {/* Tab 4: Wheel of Fortune (Hôm Nay Ăn Gì) */}
        {activeTab === "wheel" && (
          <WheelOfFortune
            allDishes={WORLD_500_DISHES}
            onSelectDetail={(d) => setSelectedDishForDetail(d)}
            isSaved={isDishSaved}
            onToggleSave={handleToggleSave}
            displayMode={visualMode}
          />
        )}

        {/* Tab 5: Saved & Grocery Management */}
        {activeTab === "saved" && (
          <SavedMealsView
            savedDishes={savedDishes}
            onToggleSave={handleToggleSave}
            onSelectDetail={(d) => setSelectedDishForDetail(d)}
            savedDayPlans={savedDayPlans}
            onDeleteDayPlan={handleDeleteDayPlan}
            onApplyDayPlan={handleApplyDayPlan}
            onLogPlanToDiary={(plan) => {
              handleLogPlanToDiary(plan);
              setActiveTab("diary");
            }}
            displayMode={visualMode}
          />
        )}

        {/* Tab 6: Shopping List & Checklist */}
        {activeTab === "shopping" && (
          <ShoppingList
            items={shoppingItems}
            onToggleItem={handleToggleShoppingItem}
            onDeleteItem={handleDeleteShoppingItem}
            onClearCompleted={handleClearCompletedShopping}
            onClearAll={handleClearAllShopping}
            onAddItem={handleAddCustomShoppingItem}
            onImportFromDayPlan={() => handleImportFromDayPlan(currentDayPlan)}
            onImportFromPantry={() => handleImportMissingFromPantry()}
            currentDayPlan={currentDayPlan}
          />
        )}

        {/* Tab 7: Food Diary & Meal History (Nhật Ký Ăn Uống) */}
        {activeTab === "diary" && (
          <FoodDiary
            diaryDays={mealDiary}
            onUpdateDiaryDays={setMealDiary}
            savedPlans={savedDayPlans}
            currentDayPlan={currentDayPlan}
            allDishes={WORLD_500_DISHES}
            onSelectDetail={(d) => setSelectedDishForDetail(d)}
            onAddPlanToShoppingList={(plan) => handleImportFromDayPlan(plan)}
            userProfile={userProfile}
            displayMode={visualMode}
            onNavigateToPlanner={() => setActiveTab("daily_plan")}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-amber-100 py-8 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <div className="flex items-center justify-center gap-2 font-bold text-slate-700">
            <img 
              src={customLogo || "/app-logo.jpg"} 
              alt="Logo" 
              className="h-5 w-auto max-h-5 object-contain inline-block select-none" 
              referrerPolicy="no-referrer"
            />
            <span>Hôm Nay Ăn Gì?</span>
            <span>•</span>
            <span>Kho Tàng 500+ Món Ăn Thế Giới & Chuyên Gia Dinh Dưỡng</span>
          </div>
          <p className="text-slate-400">
            Thiết kế khoa học cho người phân vân về bữa ăn: Quản lý Calo tiêu chuẩn, công thức nguyên liệu có sẵn, lọc dị ứng an toàn & cân bằng dinh dưỡng.
          </p>
        </div>
      </footer>
      </div>

      {/* Dish Detail Recipe Modal */}
      <DishDetailModal
        dish={selectedDishForDetail}
        isOpen={!!selectedDishForDetail}
        onClose={() => setSelectedDishForDetail(null)}
        isSaved={selectedDishForDetail ? isDishSaved(selectedDishForDetail) : false}
        onToggleSave={handleToggleSave}
        onAddToMealPlan={handleAddToMealPlan}
        displayMode={visualMode}
        onAddDishToShoppingList={handleAddDishToShoppingList}
      />

      {/* Health Profile & BMR/TDEE Calculator Modal */}
      <HealthProfileModal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
        currentProfile={userProfile}
        onSaveProfile={handleSaveProfile}
      />

    </div>
  );
}
export default App;
