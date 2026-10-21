import React, { useState, useMemo, useEffect } from "react";
import { Dish, DayMealPlan, UserHealthProfile, VisualDisplayMode, MealType } from "../types";
import { 
  Calendar, RotateCcw, Shuffle, Sparkles, Flame, DollarSign, 
  CheckCircle, Plus, Bookmark, Apple, ArrowRight, ShieldCheck, 
  Heart, Search, X, Check, Scale, Activity, Info, ShoppingCart, BookOpen, Clock 
} from "lucide-react";
import { formatVND, evaluateMealBalance, calculateBMR, calculateTDEE } from "../utils/nutritionCalculator";
import { generateSmartHarmoniousPlan, MEAL_PLAN_THEMES, MealPlanTheme } from "../utils/mealPlanGenerator";
import { getCurrentTimeOfDayInfo, TimeOfDayInfo } from "../utils/timeOfDayHelper";
import { DishCard } from "./DishCard";
import { DishIllustration } from "./DishIllustration";

interface DailyMealPlannerProps {
  allDishes: Dish[];
  currentPlan: DayMealPlan;
  onUpdatePlan: (newPlan: DayMealPlan) => void;
  onSelectDetail: (dish: Dish) => void;
  userProfile?: UserHealthProfile;
  onSaveDayPlan: (plan: DayMealPlan) => void;
  isSavedPlan: boolean;
  displayMode?: VisualDisplayMode;
  onAddPlanToShoppingList?: (plan: DayMealPlan) => void;
  onNavigateToShopping?: () => void;
  onLogPlanToDiary?: (plan: DayMealPlan, targetDate?: string) => void;
  onNavigateToDiary?: () => void;
}

type SlotKey = "breakfast" | "lunch" | "afternoon" | "dinner" | "dessert";

export const DailyMealPlanner: React.FC<DailyMealPlannerProps> = ({
  allDishes,
  currentPlan,
  onUpdatePlan,
  onSelectDetail,
  userProfile,
  onSaveDayPlan,
  isSavedPlan,
  displayMode = "icon",
  onAddPlanToShoppingList,
  onNavigateToShopping,
  onLogPlanToDiary,
  onNavigateToDiary
}) => {
  const [slotPickerModal, setSlotPickerModal] = useState<SlotKey | null>(null);
  const [pickerSearchQuery, setPickerSearchQuery] = useState<string>("");

  // Live time of day tracking for meal recommendations
  const [currentTimeInfo, setCurrentTimeInfo] = useState<TimeOfDayInfo>(() => getCurrentTimeOfDayInfo());
  const [currentTimeStr, setCurrentTimeStr] = useState<string>(() => {
    return new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeInfo(getCurrentTimeOfDayInfo());
      setCurrentTimeStr(new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }));
    }, 20000);
    return () => clearInterval(timer);
  }, []);

  const currentActiveSlotKey: SlotKey = useMemo(() => {
    if (currentTimeInfo.period === "breakfast") return "breakfast";
    if (currentTimeInfo.period === "lunch") return "lunch";
    if (currentTimeInfo.period === "afternoon") return "afternoon";
    if (currentTimeInfo.period === "dinner") return "dinner";
    return "dessert";
  }, [currentTimeInfo.period]);

  // Precise Daily Target Kcal Calculation based on Mifflin-St Jeor formula
  const { bmr, tdee, targetDailyKcal, goalLabel } = useMemo(() => {
    if (!userProfile) {
      return {
        bmr: 1350,
        tdee: 2000,
        targetDailyKcal: 2000,
        goalLabel: "Duy trì vóc dáng"
      };
    }

    const calculatedBMR = Math.round(calculateBMR(userProfile));
    const calculatedTDEE = Math.round(calculateTDEE(userProfile));
    let target = calculatedTDEE;
    let label = "Duy trì vóc dáng";

    if (userProfile.goal === "lose_weight") {
      target = Math.max(1200, calculatedTDEE - 450);
      label = "Giảm cân / Đốt mỡ (-450 kcal)";
    } else if (userProfile.goal === "gain_weight") {
      target = calculatedTDEE + 500;
      label = "Tăng cân an toàn (+500 kcal)";
    } else if (userProfile.goal === "gain_muscle") {
      target = calculatedTDEE + 300;
      label = "Tăng cơ Gym (+300 kcal)";
    }

    return {
      bmr: calculatedBMR,
      tdee: calculatedTDEE,
      targetDailyKcal: target,
      goalLabel: label
    };
  }, [userProfile]);

  const currentTotalCal = currentPlan.totalCalories;
  const calPercent = Math.round((currentTotalCal / targetDailyKcal) * 100);
  const calDifference = currentTotalCal - targetDailyKcal;

  const planDishes: Dish[] = [
    currentPlan.breakfast,
    currentPlan.lunch,
    ...(currentPlan.afternoonSnack ? [currentPlan.afternoonSnack] : []),
    currentPlan.dinner,
    ...(currentPlan.dessert ? [currentPlan.dessert] : [])
  ].filter(Boolean);

  const balanceEval = evaluateMealBalance(planDishes);

  // Exact meal pools by classification
  const getSlotPool = (slot: SlotKey): Dish[] => {
    if (slot === "breakfast") {
      return allDishes.filter(d => d.mealTypes.includes("breakfast"));
    }
    if (slot === "lunch") {
      return allDishes.filter(d => d.mealTypes.includes("main"));
    }
    if (slot === "afternoon") {
      return allDishes.filter(d => d.mealTypes.includes("afternoon") || d.mealTypes.includes("snack"));
    }
    if (slot === "dinner") {
      return allDishes.filter(d => d.mealTypes.includes("main"));
    }
    if (slot === "dessert") {
      return allDishes.filter(d => d.mealTypes.includes("dessert"));
    }
    return allDishes;
  };

  // Recalculate totals helper
  const updatePlanDishes = (updatedDishes: {
    breakfast: Dish;
    lunch: Dish;
    afternoonSnack?: Dish;
    dinner: Dish;
    dessert?: Dish;
  }) => {
    const dishes = [
      updatedDishes.breakfast,
      updatedDishes.lunch,
      updatedDishes.afternoonSnack,
      updatedDishes.dinner,
      updatedDishes.dessert
    ].filter(Boolean) as Dish[];

    const updatedPlan: DayMealPlan = {
      ...currentPlan,
      ...updatedDishes,
      totalCalories: dishes.reduce((s, d) => s + d.calories, 0),
      totalCostVND: dishes.reduce((s, d) => s + d.estimatedCostVND, 0),
      totalProtein: dishes.reduce((s, d) => s + d.protein, 0),
      totalCarbs: dishes.reduce((s, d) => s + d.carbs, 0),
      totalFat: dishes.reduce((s, d) => s + d.fat, 0),
      totalFiber: dishes.reduce((s, d) => s + d.fiber, 0)
    };

    onUpdatePlan(updatedPlan);
  };

  // Swap a single dish slot randomly with another dish strictly fitting that slot
  const swapSlotDish = (slot: SlotKey) => {
    const currentId = currentPlan[slot === "afternoon" ? "afternoonSnack" : slot]?.id;
    const pool = getSlotPool(slot).filter(d => d.id !== currentId);
    if (pool.length === 0) return;

    const randomDish = pool[Math.floor(Math.random() * pool.length)];
    const updated = {
      breakfast: slot === "breakfast" ? randomDish : currentPlan.breakfast,
      lunch: slot === "lunch" ? randomDish : currentPlan.lunch,
      afternoonSnack: slot === "afternoon" ? randomDish : currentPlan.afternoonSnack,
      dinner: slot === "dinner" ? randomDish : currentPlan.dinner,
      dessert: slot === "dessert" ? randomDish : currentPlan.dessert,
    };
    updatePlanDishes(updated);
  };

  // Choose a specific dish from picker modal
  const handleSelectSlotDish = (slot: SlotKey, dish: Dish) => {
    const updated = {
      breakfast: slot === "breakfast" ? dish : currentPlan.breakfast,
      lunch: slot === "lunch" ? dish : currentPlan.lunch,
      afternoonSnack: slot === "afternoon" ? dish : currentPlan.afternoonSnack,
      dinner: slot === "dinner" ? dish : currentPlan.dinner,
      dessert: slot === "dessert" ? dish : currentPlan.dessert,
    };
    updatePlanDishes(updated);
    setSlotPickerModal(null);
    setPickerSearchQuery("");
  };

  const [selectedTheme, setSelectedTheme] = useState<MealPlanTheme>("balanced");

  // Generate completely fresh full day plan with smart diversity, protein rotation & harmony
  const generateNewFullDay = (themeOverride?: MealPlanTheme) => {
    const theme = themeOverride || selectedTheme;
    const newPlan = generateSmartHarmoniousPlan(allDishes, targetDailyKcal, theme);
    onUpdatePlan(newPlan);
  };

  const mealSlots: {
    key: SlotKey;
    name: string;
    icon: string;
    timing: string;
    dish?: Dish;
    calTarget: string;
    percentTarget: string;
  }[] = [
    { key: "breakfast", name: "Bữa Sáng Khởi Đầu", icon: "🌅", timing: "06:30 - 08:00", dish: currentPlan.breakfast, calTarget: `~${Math.round(targetDailyKcal * 0.25)} kcal`, percentTarget: "25% kcal ngày" },
    { key: "lunch", name: "Bữa Trưa Cung Cấp Năng Lượng", icon: "☀️", timing: "11:30 - 13:00", dish: currentPlan.lunch, calTarget: `~${Math.round(targetDailyKcal * 0.35)} kcal`, percentTarget: "35% kcal ngày" },
    { key: "afternoon", name: "Bữa Xế Chiều Chống Đói", icon: "🍵", timing: "15:30 - 16:30", dish: currentPlan.afternoonSnack, calTarget: `~${Math.round(targetDailyKcal * 0.10)} kcal`, percentTarget: "10% kcal ngày" },
    { key: "dinner", name: "Bữa Tối Ấm Cúng Gia Đình", icon: "🌙", timing: "18:30 - 20:00", dish: currentPlan.dinner, calTarget: `~${Math.round(targetDailyKcal * 0.25)} kcal`, percentTarget: "25% kcal ngày" },
    { key: "dessert", name: "Tráng Miệng Thanh Mát", icon: "🍧", timing: "Sau bữa tối", dish: currentPlan.dessert, calTarget: `~${Math.round(targetDailyKcal * 0.05)} kcal`, percentTarget: "5% kcal ngày" },
  ];

  // Candidates for slot picker modal
  const pickerCandidates = useMemo(() => {
    if (!slotPickerModal) return [];
    const pool = getSlotPool(slotPickerModal);
    if (!pickerSearchQuery.trim()) return pool;
    const q = pickerSearchQuery.toLowerCase().trim();
    return pool.filter(d => 
      d.name.toLowerCase().includes(q) || 
      d.keyIngredients.some(k => k.toLowerCase().includes(q))
    );
  }, [slotPickerModal, pickerSearchQuery, allDishes]);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Live Time of Day Meal Banner - Đưa ra món ăn đúng thời điểm và thời gian ăn */}
      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-50 rounded-3xl p-4 sm:p-5 border border-amber-300 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-sm shrink-0">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-amber-950 uppercase tracking-wide">
                Đúng Thời Điểm & Thời Gian Ăn:
              </span>
              <span className="text-xs font-black bg-amber-500 text-white px-2.5 py-0.5 rounded-full shadow-2xs">
                {currentTimeStr} • {currentTimeInfo.icon} {currentTimeInfo.title}
              </span>
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                Khung giờ: {currentTimeInfo.timeRangeStr}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 mt-1">
              {currentTimeInfo.advice}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            const el = document.getElementById(`meal-slot-${currentActiveSlotKey}`);
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "center" });
              el.classList.add("ring-4", "ring-amber-400");
              setTimeout(() => el.classList.remove("ring-4", "ring-amber-400"), 2000);
            }
          }}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 shrink-0"
        >
          <span>Xem Món Đúng Khung Giờ Này</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold mb-2">
            <Calendar className="w-4 h-4 text-amber-200" />
            <span>Thực Đơn Khoa Học Chuẩn Calo 1 Ngày</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Lên Thực Đơn 5 Bữa Hoàn Chỉnh
          </h2>
          <p className="text-xs sm:text-sm text-amber-100 leading-relaxed">
            Phân loại chính xác 5 cữ ăn (Sáng, Trưa, Xế, Tối, Tráng miệng), cân đối chuẩn xác theo lượng kcal cần thiết trong 1 ngày của cơ thể bạn.
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full lg:w-auto">
          {/* Theme Selector Pills for Diverse Random Meals */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-bold text-amber-950 uppercase shrink-0">
              Phong cách:
            </span>
            {MEAL_PLAN_THEMES.map((t) => {
              const isSelected = selectedTheme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTheme(t.id);
                    generateNewFullDay(t.id);
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1 shadow-2xs ${
                    isSelected
                      ? "bg-amber-950 text-white shadow-sm ring-2 ring-amber-300"
                      : "bg-white/90 text-amber-950 hover:bg-white"
                  }`}
                  title={t.desc}
                >
                  <span>{t.icon}</span>
                  <span>{t.name}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onLogPlanToDiary && (
              <button
                onClick={() => {
                  onLogPlanToDiary(currentPlan);
                  if (onNavigateToDiary) onNavigateToDiary();
                }}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2 active:scale-95"
                title="Ghi nhận thực đơn này vào Nhật Ký Ăn Uống hôm nay"
              >
                <BookOpen className="w-4 h-4" />
                <span>Ghi Vào Nhật Ký</span>
              </button>
            )}

            {onAddPlanToShoppingList && (
              <button
                onClick={() => {
                  onAddPlanToShoppingList(currentPlan);
                  if (onNavigateToShopping) onNavigateToShopping();
                }}
                className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2 active:scale-95"
                title="Tự động gom toàn bộ nguyên liệu của thực đơn 5 cữ hôm nay vào Danh Sách Đi Chợ"
              >
                <ShoppingCart className="w-4 h-4 text-amber-900" />
                <span>Gom Vào Đi Chợ</span>
              </button>
            )}

            <button
              onClick={() => onSaveDayPlan(currentPlan)}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition-all ${
                isSavedPlan
                  ? "bg-emerald-600 text-white shadow-emerald-600/30"
                  : "bg-white text-slate-800 hover:bg-amber-50"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSavedPlan ? "fill-current" : ""}`} />
              <span>{isSavedPlan ? "Đã Lưu Thực Đơn" : "Lưu Thực Đơn"}</span>
            </button>

            <button
              onClick={() => generateNewFullDay()}
              className="px-5 py-2.5 rounded-2xl bg-slate-950 hover:bg-black text-white text-xs sm:text-sm font-bold shadow-lg transition-transform active:scale-95 flex items-center gap-2"
              title="Đổi thực đơn ngẫu nhiên đa dạng, không trùng đạm, cân đối calo & nhóm chất"
            >
              <Shuffle className="w-4 h-4 text-amber-400" />
              <span>Đổi Thực Đơn Đa Dạng Hài Hòa</span>
            </button>
          </div>
        </div>
      </div>

      {/* Diversity Quality Indicators */}
      <div className="bg-white/80 p-3 rounded-2xl border border-amber-200 flex items-center gap-3 flex-wrap text-xs font-semibold text-slate-700">
        <span className="font-bold text-amber-900 flex items-center gap-1 text-[11px] uppercase">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Tiêu Chuẩn Lựa Chọn Hợp Lý:</span>
        </span>
        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1 text-[11px]">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Luân chuyển nguồn đạm (Bò / Gà / Heo / Cá / Hải sản)</span>
        </span>
        <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-full flex items-center gap-1 text-[11px]">
          <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
          <span>Phối hợp hài hòa món mặn & món canh/rau</span>
        </span>
        <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full flex items-center gap-1 text-[11px]">
          <CheckCircle className="w-3.5 h-3.5 text-amber-600" />
          <span>Calo kiểm soát sát mục tiêu BMR/TDEE</span>
        </span>
      </div>

      {/* Structured Rationales: Vì sao thực đơn này là lựa chọn hợp lý & đa dạng */}
      {currentPlan.rationales && currentPlan.rationales.length > 0 && (
        <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-white rounded-3xl border border-amber-200/90 p-4 sm:p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-500 text-white rounded-xl shadow-2xs">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                Vì Sao Thực Đơn Này Là Lựa Chọn Hợp Lý & Đa Dạng?
              </h3>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tiêu chuẩn dinh dưỡng khoa học</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
            {currentPlan.rationales.map((rat, rIdx) => (
              <div 
                key={rIdx} 
                className="flex items-start gap-2.5 bg-white p-3 rounded-2xl border border-amber-100 shadow-2xs text-xs text-slate-700"
              >
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  {rIdx + 1}
                </span>
                <span className="leading-relaxed font-medium">{rat}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SCIENTIFIC DAILY KCAL & NUTRITION DASHBOARD */}
      <div className="bg-white rounded-3xl border border-amber-200/90 shadow-sm p-5 sm:p-7 space-y-6">
        
        {/* Top: Calorie Target vs Actual Plan Comparison */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          
          <div className="space-y-2 max-w-lg">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>Nhu Cầu Kcal Cần Thiết Trong 1 Ngày:</span>
              </span>
              <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200">
                {goalLabel}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-slate-900">
                {currentTotalCal}
              </span>
              <span className="text-slate-400 font-bold text-lg">/</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-700">
                {targetDailyKcal} kcal
              </span>
              <span className="text-xs text-slate-500 font-semibold ml-2">
                (Đạt {calPercent}%)
              </span>
            </div>

            {/* Calorie Evaluation message */}
            <p className="text-xs font-medium text-slate-600 leading-relaxed">
              {Math.abs(calDifference) <= 150 ? (
                <span className="text-emerald-700 font-bold">
                  ✓ Chuẩn mục tiêu xuất sắc! Tổng calo thực đơn ({currentTotalCal} kcal) khớp hoàn hảo với nhu cầu kcal hàng ngày của bạn.
                </span>
              ) : calDifference > 150 ? (
                <span className="text-amber-700 font-bold">
                  ⚡ Dư nhẹ +{calDifference} kcal so với mục tiêu. Phù hợp cho ngày tập thể thao nặng hoặc tăng cơ/tăng cân.
                </span>
              ) : (
                <span className="text-teal-700 font-bold">
                  🥗 Thâm hụt -{Math.abs(calDifference)} kcal so với nhu cầu. Tạo độ thâm hụt calo tự nhiên rất tốt để giảm mỡ an toàn.
                </span>
              )}
            </p>
          </div>

          {/* Progress bar and Scientific Stats */}
          <div className="lg:w-80 space-y-3 shrink-0 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700">Tiến độ Calo:</span>
              <span className={calPercent > 110 ? "text-rose-600" : calPercent < 80 ? "text-amber-600" : "text-emerald-600"}>
                {calPercent}% Nhu cầu
              </span>
            </div>

            <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  calPercent > 115 ? "bg-rose-500" : calPercent < 85 ? "bg-amber-500" : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(100, calPercent)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>BMR (Cơ bản): {bmr} kcal</span>
              <span>TDEE (Vận động): {tdee} kcal</span>
            </div>
          </div>

        </div>

        {/* Middle: Macro Breakdown & Estimated Cost */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-blue-50/80 p-3 rounded-2xl border border-blue-100 text-center">
            <span className="text-xs font-bold text-blue-700 block">Đạm (Protein)</span>
            <span className="text-lg sm:text-xl font-black text-blue-900">{currentPlan.totalProtein}g</span>
            <span className="text-[10px] text-blue-600 block">~{Math.round(currentPlan.totalProtein * 4)} kcal</span>
          </div>

          <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-100 text-center">
            <span className="text-xs font-bold text-amber-700 block">Carb (Tinh bột)</span>
            <span className="text-lg sm:text-xl font-black text-amber-900">{currentPlan.totalCarbs}g</span>
            <span className="text-[10px] text-amber-600 block">~{Math.round(currentPlan.totalCarbs * 4)} kcal</span>
          </div>

          <div className="bg-rose-50/80 p-3 rounded-2xl border border-rose-100 text-center">
            <span className="text-xs font-bold text-rose-700 block">Béo (Fat)</span>
            <span className="text-lg sm:text-xl font-black text-rose-900">{currentPlan.totalFat}g</span>
            <span className="text-[10px] text-rose-600 block">~{Math.round(currentPlan.totalFat * 9)} kcal</span>
          </div>

          <div className="bg-emerald-50/80 p-3 rounded-2xl border border-emerald-100 text-center">
            <span className="text-xs font-bold text-emerald-700 block">Chất Xơ</span>
            <span className="text-lg sm:text-xl font-black text-emerald-900">{currentPlan.totalFiber}g</span>
            <span className="text-[10px] text-emerald-600 block">Tiêu hóa tốt</span>
          </div>

          <div className="bg-yellow-50/80 p-3 rounded-2xl border border-yellow-200 text-center col-span-2 sm:col-span-1 flex flex-col justify-center">
            <span className="text-xs font-bold text-amber-800 block">Chi Phí Cả Ngày</span>
            <span className="text-base sm:text-lg font-black text-amber-950">{formatVND(currentPlan.totalCostVND)}</span>
            <span className="text-[10px] text-amber-700 block">Tiết kiệm & dinh dưỡng</span>
          </div>
        </div>

        {/* Bottom: Nutritional Balance Advice */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-start gap-3">
          <Apple className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-900 space-y-1">
            <strong className="font-bold text-emerald-950 block text-sm">
              Đánh Giá Cân Bằng Dinh Dưỡng Thực Đơn Hôm Nay:
            </strong>
            {balanceEval.advice.map((adv, idx) => (
              <span key={idx} className="block leading-relaxed">{adv}</span>
            ))}
          </div>
        </div>

      </div>

      {/* 5 STRICT MEAL SLOTS OF THE DAY */}
      <div className="space-y-4">
        {mealSlots.map((slot) => {
          if (!slot.dish) return null;
          const dish = slot.dish;
          const isCurrentTimeSlot = slot.key === currentActiveSlotKey;
          const pool = getSlotPool(slot.key);
          const alternatives = pool.filter(d => d.id !== dish.id).slice(0, 3);

          return (
            <div
              key={slot.key}
              id={`meal-slot-${slot.key}`}
              className={`rounded-3xl p-4 sm:p-6 transition-all space-y-3.5 ${
                isCurrentTimeSlot
                  ? "bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-white border-2 border-amber-400 shadow-md ring-4 ring-amber-400/25"
                  : "bg-white border border-slate-200/90 shadow-2xs hover:border-amber-300"
              }`}
            >
              {/* Slot Header */}
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{slot.icon}</span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm sm:text-base text-slate-900">
                        {slot.name}
                      </h3>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        {slot.percentTarget}
                      </span>
                      {isCurrentTimeSlot && (
                        <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-[10px] flex items-center gap-1 shadow-2xs animate-pulse">
                          <Clock className="w-3 h-3" />
                          <span>ĐÚNG KHUNG GIỜ ĂN BÂY GIỜ ({currentTimeStr})</span>
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">
                      Khung giờ: <strong>{slot.timing}</strong> • Nhu cầu đề xuất: <strong>{slot.calTarget}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => swapSlotDish(slot.key)}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 flex items-center gap-1.5 transition-colors"
                    title="Đổi ngẫu nhiên một món khác chuẩn phân loại này"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                    <span>Đổi Món Ngẫu Nhiên</span>
                  </button>

                  <button
                    onClick={() => {
                      setSlotPickerModal(slot.key);
                      setPickerSearchQuery("");
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors flex items-center gap-1"
                    title="Chọn món cụ thể từ danh mục chuẩn phân loại"
                  >
                    <span>Chọn Món</span>
                  </button>
                </div>
              </div>

              {/* Dish Preview horizontal card */}
              <div 
                onClick={() => onSelectDetail(dish)}
                className="flex flex-col sm:flex-row items-center gap-4 cursor-pointer group"
              >
                <div className="w-full sm:w-44 h-32 rounded-2xl overflow-hidden bg-slate-950 shrink-0 relative">
                  <DishIllustration
                    dish={dish}
                    displayMode={displayMode}
                    size="sm"
                    roundedClassName="rounded-2xl"
                  />
                  <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                    {dish.flagEmoji} {dish.country}
                  </span>
                </div>

                <div className="grow space-y-1.5 text-left w-full">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                      {formatVND(dish.estimatedCostVND)}
                    </span>
                    <span className="text-xs font-black text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-md border border-orange-200">
                      🔥 {dish.calories} kcal
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      ⏱️ {dish.prepTimeMinutes + dish.cookTimeMinutes} phút
                    </span>
                  </div>

                  <h4 className="font-extrabold text-base text-slate-900 group-hover:text-amber-600 transition-colors">
                    {dish.name}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {dish.description}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-xs text-slate-500 font-medium flex-wrap">
                    <span>Đạm: <strong className="text-blue-700 font-bold">{dish.protein}g</strong></span>
                    <span>Carbs: <strong className="text-amber-700 font-bold">{dish.carbs}g</strong></span>
                    <span>Béo: <strong className="text-rose-700 font-bold">{dish.fat}g</strong></span>
                    <span>Chất xơ: <strong className="text-emerald-700 font-bold">{dish.fiber}g</strong></span>
                  </div>
                </div>

                <div className="shrink-0 hidden lg:block">
                  <button className="px-4 py-2 rounded-xl bg-slate-50 group-hover:bg-amber-500 group-hover:text-white text-slate-700 text-xs font-bold transition-all flex items-center gap-1 shadow-2xs">
                    <span>Xem Cách Nấu</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 2-3 Lựa chọn hợp lý thay thế nhanh cùng cữ */}
              <div className="pt-3 border-t border-slate-100/90 flex items-center gap-2 flex-wrap text-xs">
                <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Gợi ý lựa chọn hợp lý khác:</span>
                </span>
                {alternatives.map((alt) => (
                  <button
                    key={alt.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectSlotDish(slot.key, alt);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-amber-100 hover:text-amber-950 border border-slate-200 text-[11px] font-bold text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
                    title={`Đổi sang ${alt.name} (${alt.calories} kcal - ${formatVND(alt.estimatedCostVND)})`}
                  >
                    <span>{alt.flagEmoji}</span>
                    <span>{alt.name}</span>
                    <span className="text-amber-600 font-semibold">({alt.calories} kcal)</span>
                  </button>
                ))}
              </div>

            </div>
          );
        })}
      </div>

      {/* Manual Slot Picker Modal */}
      {slotPickerModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border border-slate-200 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div>
                <h4 className="font-black text-lg text-slate-900">
                  Chọn Món Cho {mealSlots.find(s => s.key === slotPickerModal)?.name}
                </h4>
                <p className="text-xs text-slate-500">
                  Chỉ hiển thị các món ăn thuộc đúng phân loại này ({pickerCandidates.length} món)
                </p>
              </div>

              <button
                onClick={() => setSlotPickerModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search within slot */}
            <div className="relative shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={pickerSearchQuery}
                onChange={(e) => setPickerSearchQuery(e.target.value)}
                placeholder="Tìm món ăn hoặc nguyên liệu..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Candidate List */}
            <div className="overflow-y-auto grow space-y-2 pr-1">
              {pickerCandidates.map((dish) => (
                <div
                  key={dish.id}
                  onClick={() => handleSelectSlotDish(slotPickerModal, dish)}
                  className="p-3 rounded-2xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-950 shrink-0">
                      <DishIllustration dish={dish} displayMode="icon" size="sm" />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-slate-900 group-hover:text-amber-700">
                        {dish.name}
                      </h5>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span>{dish.flagEmoji} {dish.country}</span>
                        <span>•</span>
                        <span className="text-orange-600 font-bold">{dish.calories} kcal</span>
                        <span>•</span>
                        <span>{formatVND(dish.estimatedCostVND)}</span>
                      </div>
                    </div>
                  </div>

                  <button className="px-3 py-1.5 rounded-xl bg-amber-500 text-white font-bold text-xs group-hover:bg-amber-600 transition-colors shrink-0">
                    Chọn Món Này
                  </button>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
