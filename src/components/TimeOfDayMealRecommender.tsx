// src/components/TimeOfDayMealRecommender.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Dish, VisualDisplayMode, MealType } from "../types";
import { 
  Clock, Sparkles, ChefHat, ArrowRight, Flame, 
  Calendar, CheckCircle2, ChevronRight, Utensils
} from "lucide-react";
import { getCurrentTimeOfDayInfo, getDishesForTimePeriod, MealTimePeriod, TimeOfDayInfo } from "../utils/timeOfDayHelper";
import { DishIllustration } from "./DishIllustration";
import { getCustomDishImage } from "../utils/customImageStore";

interface TimeOfDayMealRecommenderProps {
  allDishes: Dish[];
  onSelectDish: (dish: Dish) => void;
  onFilterMealType: (meal: MealType) => void;
  displayMode?: VisualDisplayMode;
}

export const TimeOfDayMealRecommender: React.FC<TimeOfDayMealRecommenderProps> = ({
  allDishes,
  onSelectDish,
  onFilterMealType,
  displayMode = "photo"
}) => {
  const [activePeriod, setActivePeriod] = useState<MealTimePeriod>(() => getCurrentTimeOfDayInfo().period);
  const [timeInfo, setTimeInfo] = useState<TimeOfDayInfo>(() => getCurrentTimeOfDayInfo());
  const [clockStr, setClockStr] = useState<string>(() => {
    return new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  });

  // Keep live time updated
  useEffect(() => {
    const timer = setInterval(() => {
      setClockStr(new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }));
    }, 20000);
    return () => clearInterval(timer);
  }, []);

  const periodButtons: { id: MealTimePeriod; label: string; icon: string; time: string; targetMeal: MealType }[] = [
    { id: "breakfast", label: "Bữa Sáng", icon: "🌅", time: "05:00 - 10:30", targetMeal: "breakfast" },
    { id: "lunch", label: "Bữa Trưa", icon: "☀️", time: "10:30 - 14:00", targetMeal: "main" },
    { id: "afternoon", label: "Bữa Xế Chiều", icon: "🍵", time: "14:00 - 17:30", targetMeal: "afternoon" },
    { id: "dinner", label: "Bữa Tối", icon: "🌙", time: "17:30 - 21:30", targetMeal: "main" },
    { id: "late_night", label: "Bữa Khuya", icon: "✨", time: "21:30 - 05:00", targetMeal: "dessert" },
  ];

  const currentPeriodConfig = useMemo(() => {
    const d = new Date();
    // mock hours for activePeriod preview if user clicks other periods
    const hourMap: Record<MealTimePeriod, number> = {
      breakfast: 7,
      lunch: 12,
      afternoon: 15,
      dinner: 19,
      late_night: 22
    };
    const mockDate = new Date();
    mockDate.setHours(hourMap[activePeriod], 0, 0, 0);
    return getCurrentTimeOfDayInfo(mockDate);
  }, [activePeriod]);

  // Filter 6 best matching dishes for this meal period
  const recommendedDishes = useMemo(() => {
    const pool = getDishesForTimePeriod(allDishes, activePeriod);
    // Sort slightly by popularity or diverse origins
    return pool.slice(0, 6);
  }, [allDishes, activePeriod]);

  const handleApplyFilter = (targetMeal: MealType) => {
    onFilterMealType(targetMeal);
  };

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-50/40 rounded-3xl p-5 sm:p-7 border border-amber-200/90 shadow-xs space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-amber-500 text-white font-black text-xs rounded-full flex items-center gap-1.5 shadow-2xs">
              <Clock className="w-3.5 h-3.5" />
              <span>{clockStr} • Đúng Thời Điểm & Thời Gian Ăn</span>
            </span>
            <span className="text-xs font-bold text-amber-900 bg-amber-100/90 px-2.5 py-1 rounded-full border border-amber-200/80">
              {currentPeriodConfig.greeting}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 flex items-center gap-2">
            <span>{currentPeriodConfig.icon}</span>
            <span>{currentPeriodConfig.title}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            {currentPeriodConfig.subtitle}
          </p>
        </div>

        {/* Action to filter main catalog */}
        <button
          onClick={() => {
            const btn = periodButtons.find(b => b.id === activePeriod);
            if (btn) handleApplyFilter(btn.targetMeal);
          }}
          className="px-4 py-2 bg-white hover:bg-amber-50 text-amber-800 font-extrabold text-xs rounded-xl border border-amber-200 shadow-2xs flex items-center gap-1.5 transition-all self-end sm:self-auto shrink-0"
        >
          <span>Xem Tất Cả Món Giờ Này</span>
          <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
        </button>
      </div>

      {/* Period Selection Pills (Sáng, Trưa, Xế, Tối, Khuya) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {periodButtons.map((b) => {
          const isSelected = activePeriod === b.id;
          return (
            <button
              key={b.id}
              onClick={() => setActivePeriod(b.id)}
              className={`px-3 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                isSelected
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/25 font-black ring-2 ring-amber-400/40"
                  : "bg-white text-slate-600 hover:bg-amber-50/80 border border-slate-200/80"
              }`}
            >
              <span>{b.icon}</span>
              <span>{b.label}</span>
              <span className={`text-[10px] font-normal ${isSelected ? "text-amber-100" : "text-slate-400"}`}>
                ({b.time})
              </span>
            </button>
          );
        })}
      </div>

      {/* Nutrition & Timing Advice */}
      <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-amber-100 flex items-start gap-2.5 text-xs text-slate-700">
        <ChefHat className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-amber-950 font-bold">Lời khuyên thời điểm: </strong>
          {currentPeriodConfig.advice}
        </p>
      </div>

      {/* Curated Dishes Carousel / Grid for this Period */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {recommendedDishes.map((dish) => {
          const customImg = getCustomDishImage(dish.id);
          return (
            <div
              key={dish.id}
              onClick={() => onSelectDish(dish)}
              className="bg-white rounded-2xl border border-amber-100/90 hover:border-amber-400 p-2.5 shadow-2xs hover:shadow-md cursor-pointer transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-full aspect-square rounded-xl overflow-hidden mb-2 relative border border-slate-100">
                  <DishIllustration dish={dish} size="sm" className="w-full h-full" />
                  <span className="absolute bottom-1 right-1 bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                    {dish.calories} kcal
                  </span>
                </div>

                <h4 className="font-extrabold text-xs text-slate-800 line-clamp-1 group-hover:text-amber-700">
                  {dish.name}
                </h4>
                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                  {dish.country} • {dish.prepTimeMinutes + dish.cookTimeMinutes}p
                </p>
              </div>

              <span className="mt-2 text-[10px] font-bold text-amber-700 group-hover:underline flex items-center justify-between">
                <span>Xem công thức</span>
                <ArrowRight className="w-3 h-3 text-amber-500" />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
