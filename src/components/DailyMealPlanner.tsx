import React, { useState, useMemo } from "react";
import { Dish, DayMealPlan, UserHealthProfile, VisualDisplayMode, MealType } from "../types";
import { 
  Calendar, RotateCcw, Shuffle, Sparkles, Flame, DollarSign, 
  CheckCircle, Plus, Bookmark, Apple, ArrowRight, ShieldCheck, 
  Heart, Search, X, Check, Scale, Activity, Info
} from "lucide-react";
import { formatVND, evaluateMealBalance, calculateBMR, calculateTDEE } from "../utils/nutritionCalculator";
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
  displayMode = "icon"
}) => {
  const [slotPickerModal, setSlotPickerModal] = useState<SlotKey | null>(null);
  const [pickerSearchQuery, setPickerSearchQuery] = useState<string>("");

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

  // Generate completely fresh full day plan with strict slot classifications
  const generateNewFullDay = () => {
    const breakfasts = getSlotPool("breakfast");
    const mains = getSlotPool("lunch");
    const snacks = getSlotPool("afternoon");
    const desserts = getSlotPool("dessert");

    const b = breakfasts[Math.floor(Math.random() * breakfasts.length)] || allDishes[0];
    const l = mains[Math.floor(Math.random() * mains.length)] || allDishes[1];
    
    // Dinner should preferably be a different dish from lunch
    let dPool = mains.filter(m => m.id !== l.id);
    if (dPool.length === 0) dPool = mains;
    const d = dPool[Math.floor(Math.random() * dPool.length)] || allDishes[2];

    const aft = snacks[Math.floor(Math.random() * snacks.length)] || allDishes[3];
    const des = desserts[Math.floor(Math.random() * desserts.length)] || allDishes[4];

    updatePlanDishes({
      breakfast: b,
      lunch: l,
      afternoonSnack: aft,
      dinner: d,
      dessert: des
    });
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

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onSaveDayPlan(currentPlan)}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition-all ${
              isSavedPlan
                ? "bg-emerald-600 text-white shadow-emerald-600/30"
                : "bg-white text-slate-800 hover:bg-amber-50"
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSavedPlan ? "fill-current" : ""}`} />
            <span>{isSavedPlan ? "Đã Lưu Thực Đơn Này" : "Lưu Thực Đơn Cả Ngày"}</span>
          </button>

          <button
            onClick={generateNewFullDay}
            className="px-5 py-2.5 rounded-2xl bg-slate-950 hover:bg-black text-white text-xs sm:text-sm font-bold shadow-lg transition-transform active:scale-95 flex items-center gap-2"
          >
            <Shuffle className="w-4 h-4 text-amber-400" />
            <span>Đổi Thực Đơn Mới 100%</span>
          </button>
        </div>
      </div>

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

          return (
            <div
              key={slot.key}
              id={`meal-slot-${slot.key}`}
              className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-2xs hover:border-amber-300 transition-all space-y-3"
            >
              {/* Slot Header */}
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{slot.icon}</span>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                      <span>{slot.name}</span>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        {slot.percentTarget}
                      </span>
                    </h3>
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
