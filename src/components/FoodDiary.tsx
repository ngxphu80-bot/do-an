// src/components/FoodDiary.tsx
import React, { useState, useMemo } from "react";
import { 
  MealDiaryDay, MealDiarySlot, DayMealPlan, Dish, VisualDisplayMode, DiaryMood, UserHealthProfile 
} from "../types";
import { 
  BookOpen, Calendar, CheckCircle2, Circle, Flame, Droplets, Smile, 
  Plus, Trash2, Copy, Check, ChevronLeft, ChevronRight, Apple, 
  Utensils, Sparkles, AlertCircle, ShoppingCart, RefreshCw, Eye, Edit3
} from "lucide-react";
import { DishIllustration } from "./DishIllustration";
import { getCustomDishImage } from "../utils/customImageStore";
import { 
  formatDiaryDateDisplay, getTodayIsoDate, getYesterdayIsoDate, 
  exportDiaryToText, recalculateDiaryDay, createDiaryFromMealPlan 
} from "../utils/mealDiaryHelper";

interface FoodDiaryProps {
  diaryDays: MealDiaryDay[];
  onUpdateDiaryDays: (updated: MealDiaryDay[]) => void;
  savedPlans: DayMealPlan[];
  currentDayPlan: DayMealPlan;
  allDishes: Dish[];
  onSelectDetail: (dish: Dish) => void;
  onAddPlanToShoppingList?: (plan: DayMealPlan) => void;
  userProfile?: UserHealthProfile;
  displayMode?: VisualDisplayMode;
  onNavigateToPlanner?: () => void;
}

export const FoodDiary: React.FC<FoodDiaryProps> = ({
  diaryDays,
  onUpdateDiaryDays,
  savedPlans,
  currentDayPlan,
  allDishes,
  onSelectDetail,
  onAddPlanToShoppingList,
  userProfile,
  displayMode = "photo",
  onNavigateToPlanner
}) => {
  const todayIso = getTodayIsoDate();
  
  // Selected day ID for active inspection
  const [selectedDayId, setSelectedDayId] = useState<string>(() => {
    if (diaryDays.length > 0) {
      // Find today first, or first entry
      const todayEntry = diaryDays.find(d => d.date === todayIso);
      return todayEntry ? todayEntry.id : diaryDays[0].id;
    }
    return "";
  });

  // Modal for logging a new plan into a date
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [logTargetDate, setLogTargetDate] = useState<string>(todayIso);
  const [selectedPlanIdToLog, setSelectedPlanIdToLog] = useState<string>(
    savedPlans.length > 0 ? savedPlans[0].id : "current"
  );
  const [logAsAllEaten, setLogAsAllEaten] = useState<boolean>(false);

  // Modal for swapping a dish in a slot
  const [swapModal, setSwapModal] = useState<{
    dayId: string;
    slotKey: "breakfast" | "lunch" | "afternoonSnack" | "dinner" | "dessert";
    currentDish: Dish;
  } | null>(null);
  const [swapSearchQuery, setSwapSearchQuery] = useState<string>("");

  // Toast / Copy notification
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Current active day
  const currentDay = useMemo(() => {
    return diaryDays.find(d => d.id === selectedDayId) || diaryDays[0];
  }, [diaryDays, selectedDayId]);

  // Target kcal
  const targetKcal = userProfile?.targetDailyCalories || 2000;

  // Toggle meal eaten
  const handleToggleEaten = (dayId: string, slotKey: "breakfast" | "lunch" | "afternoonSnack" | "dinner" | "dessert") => {
    const updatedDays = diaryDays.map(day => {
      if (day.id !== dayId) return day;
      const slot = day[slotKey];
      if (!slot) return day;
      
      const newSlot: MealDiarySlot = {
        ...slot,
        eaten: !slot.eaten,
        timeLogged: !slot.eaten && !slot.timeLogged 
          ? new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) 
          : slot.timeLogged
      };

      return recalculateDiaryDay({
        ...day,
        [slotKey]: newSlot
      });
    });

    onUpdateDiaryDays(updatedDays);
  };

  // Update water
  const handleSetWater = (dayId: string, glasses: number) => {
    const val = Math.max(0, Math.min(12, glasses));
    const updatedDays = diaryDays.map(day => {
      if (day.id !== dayId) return day;
      return { ...day, waterGlasses: val, updatedAt: new Date().toISOString() };
    });
    onUpdateDiaryDays(updatedDays);
  };

  // Update mood
  const handleSetMood = (dayId: string, mood: DiaryMood) => {
    const updatedDays = diaryDays.map(day => {
      if (day.id !== dayId) return day;
      return { ...day, mood, updatedAt: new Date().toISOString() };
    });
    onUpdateDiaryDays(updatedDays);
  };

  // Update notes
  const handleUpdateNotes = (dayId: string, notes: string) => {
    const updatedDays = diaryDays.map(day => {
      if (day.id !== dayId) return day;
      return { ...day, notes, updatedAt: new Date().toISOString() };
    });
    onUpdateDiaryDays(updatedDays);
  };

  // Update notes for an individual dish in a meal slot (cảm nhận hoặc điều chỉnh công thức cá nhân)
  const handleUpdateSlotNotes = (
    dayId: string, 
    slotKey: "breakfast" | "lunch" | "afternoonSnack" | "dinner" | "dessert",
    slotNotes: string
  ) => {
    const updatedDays = diaryDays.map(day => {
      if (day.id !== dayId) return day;
      const slot = day[slotKey];
      if (!slot) return day;
      return {
        ...day,
        [slotKey]: {
          ...slot,
          notes: slotNotes
        },
        updatedAt: new Date().toISOString()
      };
    });
    onUpdateDiaryDays(updatedDays);
  };

  // Delete day
  const handleDeleteDay = (dayId: string) => {
    const dayToDelete = diaryDays.find(d => d.id === dayId);
    if (!dayToDelete) return;
    if (confirm(`Bạn có chắc chắn muốn xóa nhật ký ngày ${dayToDelete.displayDate}?`)) {
      const remaining = diaryDays.filter(d => d.id !== dayId);
      onUpdateDiaryDays(remaining);
      if (remaining.length > 0) {
        setSelectedDayId(remaining[0].id);
      }
    }
  };

  // Create new day log from selected plan
  const handleConfirmLogPlan = () => {
    let sourcePlan: DayMealPlan = currentDayPlan;
    if (selectedPlanIdToLog !== "current") {
      const found = savedPlans.find(p => p.id === selectedPlanIdToLog);
      if (found) sourcePlan = found;
    }

    // Check if an entry already exists for this date
    const existingIndex = diaryDays.findIndex(d => d.date === logTargetDate);
    const newEntry = createDiaryFromMealPlan(sourcePlan, logTargetDate, targetKcal, logAsAllEaten);

    let updated: MealDiaryDay[];
    if (existingIndex >= 0) {
      if (confirm(`Ngày ${formatDiaryDateDisplay(logTargetDate)} đã có nhật ký. Bạn có muốn ghi đè bằng thực đơn "${sourcePlan.title}"?`)) {
        updated = [...diaryDays];
        updated[existingIndex] = newEntry;
      } else {
        return;
      }
    } else {
      updated = [newEntry, ...diaryDays].sort((a, b) => b.date.localeCompare(a.date));
    }

    onUpdateDiaryDays(updated);
    setSelectedDayId(newEntry.id);
    setShowLogModal(false);

    setCopyFeedback(`Đã ghi nhận nhật ký cho ngày ${formatDiaryDateDisplay(logTargetDate)}!`);
    setTimeout(() => setCopyFeedback(null), 3500);
  };

  // Swap dish
  const handleConfirmSwapDish = (dish: Dish) => {
    if (!swapModal) return;
    const { dayId, slotKey } = swapModal;
    
    const updatedDays = diaryDays.map(day => {
      if (day.id !== dayId) return day;
      const currentSlot = day[slotKey];
      const newSlot: MealDiarySlot = {
        dish,
        eaten: currentSlot ? currentSlot.eaten : true,
        timeLogged: currentSlot?.timeLogged || new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        actualPortion: "full"
      };

      return recalculateDiaryDay({
        ...day,
        [slotKey]: newSlot
      });
    });

    onUpdateDiaryDays(updatedDays);
    setSwapModal(null);
  };

  // Export to text
  const handleCopyDayReport = (day: MealDiaryDay) => {
    const text = exportDiaryToText(day);
    navigator.clipboard.writeText(text);
    setCopyFeedback("Đã sao chép nhật ký ăn uống vào bộ nhớ tạm!");
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  // Add plan ingredients to shopping list
  const handleAddDayToShopping = (day: MealDiaryDay) => {
    if (!onAddPlanToShoppingList) return;
    
    // Construct a pseudo DayMealPlan from the day's dishes
    const dishes: Dish[] = [];
    if (day.breakfast) dishes.push(day.breakfast.dish);
    if (day.lunch) dishes.push(day.lunch.dish);
    if (day.afternoonSnack) dishes.push(day.afternoonSnack.dish);
    if (day.dinner) dishes.push(day.dinner.dish);
    if (day.dessert) dishes.push(day.dessert.dish);

    if (dishes.length === 0) return;

    const pseudoPlan: DayMealPlan = {
      id: day.id,
      title: day.title,
      date: day.date,
      breakfast: day.breakfast?.dish || dishes[0],
      lunch: day.lunch?.dish || dishes[0],
      afternoonSnack: day.afternoonSnack?.dish,
      dinner: day.dinner?.dish || dishes[0],
      dessert: day.dessert?.dish,
      totalCalories: day.totalPlannedCalories,
      totalCostVND: dishes.reduce((s, d) => s + d.estimatedCostVND, 0),
      totalProtein: day.totalProtein,
      totalCarbs: day.totalCarbs,
      totalFat: day.totalFat,
      totalFiber: day.totalFiber
    };

    onAddPlanToShoppingList(pseudoPlan);
    setCopyFeedback(`Đã chuyển toàn bộ nguyên liệu ngày ${day.displayDate} sang Danh Sách Đi Chợ!`);
    setTimeout(() => setCopyFeedback(null), 3500);
  };

  // Filter dishes for swap modal
  const filteredSwapDishes = useMemo(() => {
    if (!swapModal) return [];
    if (!swapSearchQuery.trim()) return allDishes.slice(0, 40);
    const q = swapSearchQuery.toLowerCase().trim();
    return allDishes.filter(d => 
      d.name.toLowerCase().includes(q) ||
      d.nameEn.toLowerCase().includes(q) ||
      d.mainIngredients.some(ing => ing.toLowerCase().includes(q))
    ).slice(0, 40);
  }, [allDishes, swapModal, swapSearchQuery]);

  // Mood options
  const moodList: { id: DiaryMood; label: string; icon: string; desc: string }[] = [
    { id: "great", label: "Ngon miệng", icon: "😋", desc: "Ăn ngon, vừa miệng" },
    { id: "light", label: "Thanh nhẹ", icon: "🥗", desc: "Nhẹ bụng, dễ chịu" },
    { id: "energetic", label: "Năng động", icon: "🏃", desc: "Nhiều năng lượng" },
    { id: "full", label: "No lâu", icon: "🥩", desc: "No nê, chắc bụng" },
    { id: "tired", label: "Mệt mỏi", icon: "😴", desc: "Hơi uể oải" }
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Feedback */}
      {copyFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-slideUp border border-emerald-500">
          <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
          <span className="text-sm font-semibold">{copyFeedback}</span>
        </div>
      )}

      {/* Main Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-amber-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                Nhật Ký Ăn Uống & Lịch Sử
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Theo dõi bữa ăn từng ngày, kiểm soát calo nạp thực tế từ các Thực Đơn đã lên kế hoạch
              </p>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => setShowLogModal(true)}
            className="flex-1 md:flex-none px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-bold rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Ghi Ngày Mới Từ Thực Đơn</span>
          </button>
        </div>
      </div>

      {/* Diary Content Layout */}
      {diaryDays.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl p-12 text-center border border-amber-100 shadow-sm max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Chưa có nhật ký ăn uống nào</h3>
          <p className="text-slate-500 text-sm">
            Bạn có thể ghi nhận những gì đã ăn hôm nay hoặc các ngày trước đó dựa trên Thực Đơn 1 Ngày đã lên kế hoạch.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                const newDay = createDiaryFromMealPlan(currentDayPlan, todayIso, targetKcal, false);
                onUpdateDiaryDays([newDay]);
                setSelectedDayId(newDay.id);
              }}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm shadow-md"
            >
              Ghi Thực Đơn Hiện Tại Cho Hôm Nay
            </button>
            {onNavigateToPlanner && (
              <button
                onClick={onNavigateToPlanner}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm"
              >
                Tạo Thực Đơn Mới
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Timeline & Dates List */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-extrabold text-slate-700 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                Lịch Sử Các Ngày ({diaryDays.length})
              </h3>
              <span className="text-xs text-slate-400">Chọn ngày để xem chi tiết</span>
            </div>

            <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
              {diaryDays.map((day) => {
                const isSelected = day.id === currentDay?.id;
                const calPercent = Math.min(100, Math.round((day.totalEatenCalories / day.targetCalories) * 100));
                const completedMeals = [day.breakfast, day.lunch, day.afternoonSnack, day.dinner, day.dessert]
                  .filter(Boolean)
                  .filter(s => s?.eaten).length;
                const totalMeals = [day.breakfast, day.lunch, day.afternoonSnack, day.dinner, day.dessert]
                  .filter(Boolean).length;

                return (
                  <div
                    key={day.id}
                    onClick={() => setSelectedDayId(day.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer select-none text-left ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-400 shadow-sm ring-2 ring-amber-400/30"
                        : "bg-white hover:bg-slate-50 border-slate-100 shadow-xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-800 text-sm block">
                          {day.displayDate}
                        </span>
                        <span className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {day.title}
                        </span>
                      </div>
                      {day.mood && (
                        <span className="text-lg" title={day.mood}>
                          {moodList.find(m => m.id === day.mood)?.icon || "✨"}
                        </span>
                      )}
                    </div>

                    {/* Progress Bar & Calorie numbers */}
                    <div className="mt-3 space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-600">
                          {day.totalEatenCalories} <span className="text-[10px] text-slate-400">/ {day.targetCalories} kcal</span>
                        </span>
                        <span className={`text-[11px] ${completedMeals === totalMeals ? "text-emerald-600 font-bold" : "text-amber-600"}`}>
                          {completedMeals}/{totalMeals} bữa đã ăn
                        </span>
                      </div>
                      
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            calPercent >= 90 && calPercent <= 110
                              ? "bg-emerald-500"
                              : calPercent > 110
                              ? "bg-orange-500"
                              : "bg-amber-500"
                          }`}
                          style={{ width: `${calPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed View of Selected Day */}
          {currentDay && (
            <div className="lg:col-span-8 space-y-6">
              
              {/* Day Overview Banner */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-amber-100 space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-full">
                        {currentDay.displayDate}
                      </span>
                      <span className="text-xs text-slate-400">
                        {currentDay.date}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-800 mt-1">
                      {currentDay.title}
                    </h2>
                  </div>

                  {/* Day Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleCopyDayReport(currentDay)}
                      className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200"
                      title="Sao chép nhật ký hôm nay"
                    >
                      <Copy className="w-4 h-4" />
                      <span className="hidden sm:inline">Sao Chép</span>
                    </button>

                    {onAddPlanToShoppingList && (
                      <button
                        onClick={() => handleAddDayToShopping(currentDay)}
                        className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200"
                        title="Thêm nguyên liệu ngày này vào Đi Chợ"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span className="hidden sm:inline">Đi Chợ</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteDay(currentDay.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors border border-slate-200"
                      title="Xóa nhật ký ngày này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Macro & Nutrition Overview */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/50">
                    <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Calo Thực Nạp</span>
                    <div className="text-xl font-extrabold text-amber-700 mt-1">
                      {currentDay.totalEatenCalories} <span className="text-xs font-normal">kcal</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Mục tiêu: {currentDay.targetCalories} kcal
                    </span>
                  </div>

                  <div className="bg-rose-50/60 p-3.5 rounded-2xl border border-rose-200/50">
                    <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">Chất Đạm (Protein)</span>
                    <div className="text-xl font-extrabold text-rose-700 mt-1">
                      {currentDay.totalProtein} <span className="text-xs font-normal">g</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Xây dựng cơ bắp</span>
                  </div>

                  <div className="bg-blue-50/60 p-3.5 rounded-2xl border border-blue-200/50">
                    <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">Tinh Bột (Carbs)</span>
                    <div className="text-xl font-extrabold text-blue-700 mt-1">
                      {currentDay.totalCarbs} <span className="text-xs font-normal">g</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Cung cấp năng lượng</span>
                  </div>

                  <div className="bg-orange-50/60 p-3.5 rounded-2xl border border-orange-200/50">
                    <span className="text-[11px] font-bold text-orange-800 uppercase tracking-wider block">Chất Béo (Fat)</span>
                    <div className="text-xl font-extrabold text-orange-700 mt-1">
                      {currentDay.totalFat} <span className="text-xs font-normal">g</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Hấp thụ vitamin</span>
                  </div>

                  <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200/50 col-span-2 sm:col-span-1">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Chất Xơ (Fiber)</span>
                    <div className="text-xl font-extrabold text-emerald-700 mt-1">
                      {currentDay.totalFiber} <span className="text-xs font-normal">g</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Tiêu hóa tốt</span>
                  </div>
                </div>

                {/* Water & Mood Trackers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Water Tracker */}
                  <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                        <Droplets className="w-4 h-4 text-sky-500" />
                        Theo Dõi Nước Uống: {currentDay.waterGlasses} / 8 ly ({currentDay.waterGlasses * 250} ml)
                      </span>
                      <span className="text-[11px] text-sky-600 font-semibold">
                        {currentDay.waterGlasses >= 8 ? "Đã đạt chuẩn 2L 💧" : `Còn thiếu ${(8 - currentDay.waterGlasses) * 250}ml`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((glassIndex) => {
                        const isFilled = glassIndex <= currentDay.waterGlasses;
                        return (
                          <button
                            key={glassIndex}
                            onClick={() => handleSetWater(currentDay.id, isFilled && glassIndex === currentDay.waterGlasses ? glassIndex - 1 : glassIndex)}
                            className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                              isFilled
                                ? "bg-sky-500 text-white shadow-xs scale-105"
                                : "bg-sky-200/60 hover:bg-sky-300/60 text-sky-700"
                            }`}
                            title={`Ly ${glassIndex} (250ml)`}
                          >
                            <span className="text-xs">💧</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mood Selector */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Smile className="w-4 h-4 text-amber-500" />
                      Cảm Nhận Thể Trạng Trong Ngày:
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {moodList.map((m) => {
                        const isSelected = currentDay.mood === m.id;
                        return (
                          <button
                            key={m.id}
                            onClick={() => handleSetMood(currentDay.id, m.id)}
                            className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                              isSelected
                                ? "bg-amber-500 text-white shadow-xs font-bold"
                                : "bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200"
                            }`}
                          >
                            <span>{m.icon}</span>
                            <span>{m.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Meals List (5 bữa) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-amber-500" />
                    Lịch Trình Bữa Ăn Trong Ngày
                  </h3>
                  <span className="text-xs text-slate-500">
                    Bấm &quot;Đã ăn&quot; để tính calo thực nạp
                  </span>
                </div>

                {([
                  { key: "breakfast" as const, title: "Bữa Sáng", defaultTime: "07:30", icon: "🍳" },
                  { key: "lunch" as const, title: "Bữa Trưa", defaultTime: "12:00", icon: "🍛" },
                  { key: "afternoonSnack" as const, title: "Bữa Xế (Chiều)", defaultTime: "15:30", icon: "🥪" },
                  { key: "dinner" as const, title: "Bữa Tối", defaultTime: "19:00", icon: "🍲" },
                  { key: "dessert" as const, title: "Tráng Miệng", defaultTime: "20:30", icon: "🍉" },
                ] as const).map(({ key, title, defaultTime, icon }) => {
                  const slot = currentDay[key];
                  if (!slot) return null;
                  const dish = slot.dish;
                  const isEaten = slot.eaten;
                  const customImg = getCustomDishImage(dish.id);

                  return (
                    <div
                      key={key}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        isEaten
                          ? "bg-white border-emerald-200 shadow-xs"
                          : "bg-slate-50/70 border-slate-200/80 opacity-90"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        
                        {/* Meal Title & Status */}
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          {/* Eaten Toggle Button */}
                          <button
                            onClick={() => handleToggleEaten(currentDay.id, key)}
                            className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shrink-0 ${
                              isEaten
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                                : "bg-white hover:bg-slate-100 text-slate-600 border border-slate-300"
                            }`}
                          >
                            {isEaten ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                                <span>Đã Ăn</span>
                              </>
                            ) : (
                              <>
                                <Circle className="w-4 h-4 text-slate-400" />
                                <span>Chưa Ăn</span>
                              </>
                            )}
                          </button>

                          {/* Dish Image */}
                          <div 
                            onClick={() => onSelectDetail(dish)}
                            className="w-14 h-14 rounded-xl overflow-hidden shrink-0 cursor-pointer border border-slate-200 group relative"
                          >
                            <DishIllustration dish={dish} size="sm" className="w-full h-full" />
                          </div>

                          {/* Dish Details */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-amber-700 uppercase">
                                {icon} {title}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                • {slot.timeLogged || defaultTime}
                              </span>
                            </div>
                            <h4 
                              onClick={() => onSelectDetail(dish)}
                              className="font-extrabold text-slate-800 text-base hover:text-amber-600 cursor-pointer truncate"
                            >
                              {dish.name}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                              <span className="font-semibold text-amber-600">
                                {dish.calories} kcal
                              </span>
                              <span>•</span>
                              <span>Đạm {dish.protein}g</span>
                              <span>•</span>
                              <span>Bột {dish.carbs}g</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions for this slot */}
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            onClick={() => onSelectDetail(dish)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Công Thức</span>
                          </button>
                          <button
                            onClick={() => {
                              setSwapModal({
                                dayId: currentDay.id,
                                slotKey: key,
                                currentDish: dish
                              });
                            }}
                            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Đổi Món</span>
                          </button>
                        </div>
                      </div>

                      {/* Trường ghi chú (notes) cho mỗi món ăn: Tự ghi chép cảm nhận hoặc điều chỉnh công thức cá nhân */}
                      <div className="mt-3 pt-3 border-t border-slate-100/90 space-y-2.5">
                        <div className="flex items-center justify-between text-xs flex-wrap gap-1">
                          <label 
                            htmlFor={`slot-note-${key}`}
                            className="font-extrabold text-slate-800 flex items-center gap-1.5 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                            <span>Ghi chú món ăn & Cảm nhận / Điều chỉnh công thức cá nhân:</span>
                          </label>
                          {slot.notes ? (
                            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              ✓ Đã tự động lưu ghi chép
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium">
                              (Tự do ghi cảm nhận khẩu vị & cách biến tấu riêng)
                            </span>
                          )}
                        </div>

                        <div className="relative">
                          <textarea
                            id={`slot-note-${key}`}
                            value={slot.notes || ""}
                            onChange={(e) => handleUpdateSlotNotes(currentDay.id, key, e.target.value)}
                            placeholder="Ghi lại cảm nhận thực tế hoặc mẹo nấu lần sau (VD: Ăn no vừa đủ, ngon miệng; Lần sau bớt đường, giảm dầu mỡ, đổi sang ức gà hoặc dùng nồi chiên không dầu...)"
                            rows={2}
                            className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white rounded-2xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 resize-none transition-all leading-relaxed shadow-2xs"
                          />
                        </div>

                        {/* Thẻ gợi ý nhanh được chia 2 nhóm: Cảm nhận & Điều chỉnh công thức */}
                        <div className="space-y-1.5 pt-0.5 text-[11px]">
                          {/* Nhóm 1: Cảm nhận vị giác */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-slate-500 font-bold text-[10px] shrink-0">
                              😋 Cảm nhận:
                            </span>
                            {[
                              "Rất vừa miệng",
                              "Thanh nhẹ dễ tiêu",
                              "No lâu thoải mái",
                              "Cả nhà đều thích",
                              "⭐ 5 sao sẽ nấu lại"
                            ].map((chip, cIdx) => (
                              <button
                                key={cIdx}
                                type="button"
                                onClick={() => {
                                  const current = slot.notes ? slot.notes.trim() : "";
                                  const updated = current ? `${current} • ${chip}` : chip;
                                  handleUpdateSlotNotes(currentDay.id, key, updated);
                                }}
                                className="px-2 py-0.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 transition-colors cursor-pointer active:scale-95 text-[10px] font-semibold"
                              >
                                + {chip}
                              </button>
                            ))}
                          </div>

                          {/* Nhóm 2: Điều chỉnh công thức cá nhân */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-slate-500 font-bold text-[10px] shrink-0">
                              👨‍🍳 Đổi công thức:
                            </span>
                            {[
                              "Bớt ngọt / đường",
                              "Giảm cay",
                              "Nêm nhạt / bớt muối",
                              "Đổi sang ức gà / tôm",
                              "Tăng gấp đôi rau xanh",
                              "Dùng nồi chiên không dầu"
                            ].map((chip, cIdx) => (
                              <button
                                key={cIdx}
                                type="button"
                                onClick={() => {
                                  const current = slot.notes ? slot.notes.trim() : "";
                                  const updated = current ? `${current} • ${chip}` : chip;
                                  handleUpdateSlotNotes(currentDay.id, key, updated);
                                }}
                                className="px-2 py-0.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200/80 transition-colors cursor-pointer active:scale-95 text-[10px] font-semibold"
                              >
                                + {chip}
                              </button>
                            ))}
                            {slot.notes && (
                              <button
                                type="button"
                                onClick={() => handleUpdateSlotNotes(currentDay.id, key, "")}
                                className="px-1.5 py-0.5 rounded text-[10px] text-slate-400 hover:text-rose-600 transition-colors ml-auto"
                                title="Xóa ghi chú món này"
                              >
                                Xóa ghi chú
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Day Notes & Thoughts */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-amber-100 space-y-3">
                <span className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-amber-500" />
                  Ghi Chú Cá Nhân Về Bữa Ăn Ngày Này:
                </span>
                <textarea
                  value={currentDay.notes || ""}
                  onChange={(e) => handleUpdateNotes(currentDay.id, e.target.value)}
                  placeholder="Ghi lại cảm nhận tiêu hóa, món ăn tự nấu hay ăn ngoài, lượng nước uống..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 resize-none"
                />
              </div>

            </div>
          )}

        </div>
      )}

      {/* Modal: Ghi Thực Đơn Vào Ngày Cụ Thể */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-500" />
                Ghi Nhật Ký Từ Thực Đơn Đã Lưu
              </h3>
              <button 
                onClick={() => setShowLogModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">
              {/* Target Date Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                  1. Chọn Ngày Cần Ghi Nhật Ký:
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={logTargetDate}
                    onChange={(e) => setLogTargetDate(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setLogTargetDate(todayIso)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold ${logTargetDate === todayIso ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-700"}`}
                  >
                    Hôm Nay
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogTargetDate(getYesterdayIsoDate())}
                    className={`px-3 py-2 rounded-xl text-xs font-bold ${logTargetDate === getYesterdayIsoDate() ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-700"}`}
                  >
                    Hôm Qua
                  </button>
                </div>
              </div>

              {/* Source Plan Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                  2. Chọn Thực Đơn Để Ghi Vào:
                </label>
                <select
                  value={selectedPlanIdToLog}
                  onChange={(e) => setSelectedPlanIdToLog(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="current">
                    ⭐ Thực Đơn Đang Xem ({currentDayPlan.title} - {currentDayPlan.totalCalories} kcal)
                  </option>
                  {savedPlans.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      📁 {plan.title} ({plan.totalCalories} kcal - {plan.date})
                    </option>
                  ))}
                </select>
              </div>

              {/* Log as all eaten toggle */}
              <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/50 flex items-center justify-between cursor-pointer"
                onClick={() => setLogAsAllEaten(!logAsAllEaten)}
              >
                <div className="pr-2">
                  <span className="font-bold text-amber-900 block text-xs">
                    Đánh dấu tất cả bữa là &quot;Đã Ăn&quot; ngay lập tức
                  </span>
                  <span className="text-[11px] text-amber-700/80">
                    Phù hợp nếu bạn ghi lại lịch sử các ngày trước đó (Hôm qua, Tuần trước)
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={logAsAllEaten}
                  onChange={() => {}}
                  className="w-5 h-5 rounded text-amber-500 focus:ring-amber-400 shrink-0"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowLogModal(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleConfirmLogPlan}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm shadow-md"
              >
                Lưu Vào Nhật Ký
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Đổi món trong bữa */}
      {swapModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  Đổi Món Cho {swapModal.slotKey === "breakfast" ? "Bữa Sáng" : swapModal.slotKey === "lunch" ? "Bữa Trưa" : swapModal.slotKey === "afternoonSnack" ? "Bữa Xế" : swapModal.slotKey === "dinner" ? "Bữa Tối" : "Tráng Miệng"}
                </h3>
                <span className="text-xs text-slate-500">
                  Món hiện tại: <span className="font-semibold text-amber-700">{swapModal.currentDish.name}</span>
                </span>
              </div>
              <button 
                onClick={() => setSwapModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Search Input */}
            <div className="py-3">
              <input
                type="text"
                value={swapSearchQuery}
                onChange={(e) => setSwapSearchQuery(e.target.value)}
                placeholder="Tìm món thay thế theo tên hoặc nguyên liệu..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                autoFocus
              />
            </div>

            {/* Dish List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredSwapDishes.map((dish) => {
                const customImg = getCustomDishImage(dish.id);
                return (
                  <div
                    key={dish.id}
                    onClick={() => handleConfirmSwapDish(dish)}
                    className="p-3 rounded-xl border border-slate-100 hover:border-amber-300 hover:bg-amber-50/50 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                        <DishIllustration dish={dish} size="sm" className="w-full h-full" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 text-sm block">
                          {dish.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {dish.calories} kcal • {dish.originCountryVi}
                        </span>
                      </div>
                    </div>

                    <button className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold shadow-xs">
                      Chọn
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSwapModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
