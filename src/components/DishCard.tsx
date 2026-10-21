import React, { useState, useEffect } from "react";
import { Dish, PortionType, VisualDisplayMode } from "../types";
import { Clock, Flame, Heart, Sparkles, ChefHat, AlertTriangle, ShieldCheck } from "lucide-react";
import { formatVND, calculatePortionMultiplier } from "../utils/nutritionCalculator";
import { DishIllustration } from "./DishIllustration";

interface DishCardProps {
  dish: Dish;
  isSaved: boolean;
  onToggleSave: (dish: Dish) => void;
  onSelectDetail: (dish: Dish) => void;
  portionMultiplier?: number;
  selectedPortion?: PortionType;
  displayMode?: VisualDisplayMode;
}

export const DishCard: React.FC<DishCardProps> = ({
  dish,
  isSaved,
  onToggleSave,
  onSelectDetail,
  portionMultiplier = 1,
  selectedPortion = "single",
  displayMode = "icon"
}) => {
  const [localMode, setLocalMode] = useState<VisualDisplayMode>(displayMode);

  useEffect(() => {
    setLocalMode(displayMode);
  }, [displayMode]);

  const scaledCalories = Math.round(dish.calories * portionMultiplier);
  const scaledCost = Math.round(dish.estimatedCostVND * portionMultiplier);
  const scaledProtein = Math.round(dish.protein * portionMultiplier);

  const getPriceTierBadge = (cost: number) => {
    if (cost < 45000) return { label: "Bình dân", color: "bg-emerald-100 text-emerald-800" };
    if (cost <= 110000) return { label: "Trung cấp", color: "bg-amber-100 text-amber-800" };
    return { label: "Cao cấp", color: "bg-purple-100 text-purple-800" };
  };

  const priceBadge = getPriceTierBadge(dish.estimatedCostVND);

  const getMealTypeLabel = (types: string[]) => {
    const map: Record<string, string> = {
      breakfast: "Bữa sáng",
      main: "Bữa chính",
      afternoon: "Bữa xế",
      dessert: "Tráng miệng",
      snack: "Ăn vặt"
    };
    return types.map(t => map[t] || t).join(" • ");
  };

  const getHealthSuitabilityBadges = () => {
    const map: Record<string, { label: string; bg: string }> = {
      weight_loss: { label: "Giảm cân", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
      gym: { label: "Tăng cơ Gym", bg: "bg-blue-50 text-blue-700 border-blue-200" },
      kids: { label: "Trẻ em", bg: "bg-amber-50 text-amber-700 border-amber-200" },
      pregnancy: { label: "Sản phụ / Mẹ bầu", bg: "bg-rose-50 text-rose-700 border-rose-200" },
      hypertension: { label: "Huyết áp / Tim", bg: "bg-teal-50 text-teal-700 border-teal-200" },
      diabetes: { label: "Tiểu đường", bg: "bg-indigo-50 text-indigo-700 border-indigo-200" },
      liver: { label: "Mát gan", bg: "bg-cyan-50 text-cyan-700 border-cyan-200" },
      malnutrition: { label: "Bồi bổ", bg: "bg-orange-50 text-orange-700 border-orange-200" },
      respiratory: { label: "Bổ phế", bg: "bg-purple-50 text-purple-700 border-purple-200" }
    };
    return dish.dietarySuitability.slice(0, 3).map(k => map[k]).filter(Boolean);
  };

  const healthBadges = getHealthSuitabilityBadges();

  return (
    <div
      id={`dish-card-${dish.id}`}
      className="group bg-white rounded-3xl overflow-hidden border border-amber-100/80 shadow-xs hover:shadow-xl hover:border-amber-200 transition-all duration-300 flex flex-col justify-between"
    >
      {/* Top Media Section with Food Icon illustration */}
      <div className="relative aspect-4/3 overflow-hidden bg-amber-50/50">
        <DishIllustration
          dish={dish}
          size="md"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap pointer-events-auto">
            <span className="backdrop-blur-md bg-white/90 text-slate-800 text-xs font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
              <span>{dish.flagEmoji}</span>
              <span>{dish.country}</span>
            </span>

            <span className="backdrop-blur-md bg-slate-900/70 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
              {dish.region === "asian" ? "Món Á 🥢" : "Món Âu 🍷"}
            </span>
          </div>

          {/* Favorite Button */}
          <button
            id={`btn-fav-${dish.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(dish);
            }}
            className={`pointer-events-auto w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-transform active:scale-90 ${
              isSaved
                ? "bg-rose-500 text-white shadow-md shadow-rose-500/30 scale-105"
                : "bg-white/85 text-slate-700 hover:bg-white hover:text-rose-500"
            }`}
            title={isSaved ? "Bỏ lưu món" : "Lưu món yêu thích"}
          >
            <Heart className={`w-4 h-4 ${isSaved ? "fill-current text-white" : ""}`} />
          </button>
        </div>

        {/* Bottom Card Image Overlay Stats */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white text-xs pointer-events-none">
          <div className="flex items-center gap-1.5 backdrop-blur-md bg-black/40 px-2.5 py-1 rounded-full font-bold">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>{scaledCalories} kcal</span>
          </div>

          <div className="flex items-center gap-1 backdrop-blur-md bg-black/40 px-2.5 py-1 rounded-full font-medium">
            <Clock className="w-3.5 h-3.5 text-sky-300" />
            <span>{dish.prepTimeMinutes + dish.cookTimeMinutes} phút</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-5 flex flex-col grow justify-between">
        <div>
          {/* Meal type indicator */}
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
              {getMealTypeLabel(dish.mealTypes)}
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${priceBadge.color}`}>
              {priceBadge.label} • {formatVND(scaledCost)}
            </span>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onSelectDetail(dish)}
            className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1 cursor-pointer"
            title={dish.name}
          >
            {dish.name}
          </h3>

          {dish.nativeName && (
            <p className="text-xs text-slate-600 italic line-clamp-1 mb-2">
              {dish.nativeName}
            </p>
          )}

          {/* Short Description */}
          <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed mb-3">
            {dish.description}
          </p>

          {/* Health & Diet Suitability Tags */}
          {healthBadges.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap mb-3">
              {healthBadges.map((badge, idx) => (
                <span
                  key={idx}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.bg}`}
                >
                  {badge.label}
                </span>
              ))}
            </div>
          )}

          {/* Allergen Warning if any */}
          {dish.allergens.length > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50/80 px-2 py-1 rounded-lg border border-amber-200/50 mb-3">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="line-clamp-1">
                Lưu ý dị ứng: {dish.allergens.map(a => {
                  const m: Record<string, string> = {
                    seafood: "Hải sản",
                    peanuts: "Đậu phộng",
                    dairy: "Sữa/Lactose",
                    gluten: "Gluten",
                    eggs: "Trứng",
                    soy: "Đậu nành"
                  };
                  return m[a] || a;
                }).join(", ")}
              </span>
            </div>
          )}
        </div>

        {/* Footer info and CTA */}
        <div className="pt-3 border-t border-slate-100 mt-2">
          <div className="grid grid-cols-3 gap-1 text-center text-xs mb-3 bg-slate-50/80 p-2 rounded-xl">
            <div>
              <span className="block text-[10px] text-slate-700 font-bold">Protein</span>
              <span className="font-bold text-slate-800">{scaledProtein}g</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-700 font-bold">Carbs</span>
              <span className="font-bold text-slate-800">{Math.round(dish.carbs * portionMultiplier)}g</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-700 font-bold">Chất béo</span>
              <span className="font-bold text-slate-800">{Math.round(dish.fat * portionMultiplier)}g</span>
            </div>
          </div>

          <button
            id={`btn-view-recipe-${dish.id}`}
            onClick={() => onSelectDetail(dish)}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-500 text-amber-700 hover:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all group/btn"
          >
            <ChefHat className="w-4 h-4 text-amber-600 group-hover/btn:text-white" />
            <span>Xem Chi Tiết Công Thức & Nấu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
