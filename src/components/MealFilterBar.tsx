import React, { useState } from "react";
import { 
  Search, SlidersHorizontal, RotateCcw, ShieldAlert, Sparkles, 
  Flame, Clock, ChevronDown, ChevronUp, Check, Palette, Camera 
} from "lucide-react";
import { FilterState, MealType, RegionType, PortionType, TasteType, HealthProfileType, AllergenType, PriceTierType, VisualDisplayMode } from "../types";

interface MealFilterBarProps {
  filter: FilterState;
  onFilterChange: (newFilter: FilterState) => void;
  onResetFilter: () => void;
  totalFilteredCount: number;
  visualMode?: VisualDisplayMode;
  onToggleVisualMode?: (mode: VisualDisplayMode) => void;
}

export const MealFilterBar: React.FC<MealFilterBarProps> = ({
  filter,
  onFilterChange,
  onResetFilter,
  totalFilteredCount,
  visualMode = "icon",
  onToggleVisualMode
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const mealTypes: { id: MealType | "all"; label: string; icon: string }[] = [
    { id: "all", label: "Tất Cả Bữa", icon: "🍽️" },
    { id: "breakfast", label: "Bữa Sáng", icon: "🌅" },
    { id: "main", label: "Bữa Chính (Trưa/Tối)", icon: "☀️" },
    { id: "afternoon", label: "Bữa Xế", icon: "🍵" },
    { id: "dessert", label: "Tráng Miệng", icon: "🍧" },
    { id: "snack", label: "Ăn Vặt", icon: "🍿" },
  ];

  const regionTypes: { id: RegionType | "all"; label: string; icon: string }[] = [
    { id: "all", label: "Mọi Quốc Gia", icon: "🌍" },
    { id: "asian", label: "Món Á", icon: "🥢" },
    { id: "western", label: "Món Âu - Mỹ", icon: "🍷" },
  ];

  const portionTypes: { id: PortionType; label: string; icon: string }[] = [
    { id: "single", label: "1 Người", icon: "👤" },
    { id: "couple", label: "Cặp Đôi", icon: "👥" },
    { id: "family", label: "Gia Đình", icon: "👨‍👩‍👧‍👦" },
    { id: "party", label: "Tiệc / Nhóm", icon: "🎉" },
  ];

  const priceTiers: { id: PriceTierType | "all"; label: string }[] = [
    { id: "all", label: "Mọi mức giá" },
    { id: "budget", label: "Bình dân (<50k)" },
    { id: "medium", label: "Vừa phải (50k-120k)" },
    { id: "luxury", label: "Cao cấp (>120k)" },
  ];

  const tasteOptions: { id: TasteType; label: string; color: string }[] = [
    { id: "sour", label: "Chua thanh 🍋", color: "text-amber-700 bg-amber-50" },
    { id: "spicy", label: "Cay nồng 🌶️", color: "text-red-700 bg-red-50" },
    { id: "salty", label: "Mặn đậm đà 🧂", color: "text-slate-700 bg-slate-50" },
    { id: "sweet", label: "Ngọt ngào 🍯", color: "text-pink-700 bg-pink-50" },
    { id: "mild", label: "Thanh đạm 🌿", color: "text-emerald-700 bg-emerald-50" },
    { id: "creamy", label: "Béo ngậy 🧀", color: "text-yellow-700 bg-yellow-50" },
    { id: "crispy", label: "Giòn rụm 🥖", color: "text-orange-700 bg-orange-50" },
    { id: "herbal", label: "Thơm thảo mộc 🍃", color: "text-teal-700 bg-teal-50" },
  ];

  const healthProfiles: { id: HealthProfileType; label: string; desc: string }[] = [
    { id: "weight_loss", label: "Ăn kiêng / Giảm cân", desc: "Healthy, Eat Clean, ít calo" },
    { id: "malnutrition", label: "Suy dinh dưỡng / Tăng cân", desc: "Cần bồi bổ thể lực, dễ tiêu" },
    { id: "pregnancy", label: "Mẹ bầu / Sau sinh", desc: "Bổ khí huyết, lợi sữa, lành tính" },
    { id: "hypertension", label: "Huyết áp / Tim mạch", desc: "Giảm muối, ít mỡ xấu, giàu kali" },
    { id: "diabetes", label: "Tiểu đường", desc: "Chỉ số GI thấp, ít đường" },
    { id: "liver", label: "Mát gan / Giải độc", desc: "Ít dầu mỡ, thanh nhiệt" },
    { id: "respiratory", label: "Bổ phế / Hô hấp", desc: "Ấm họng, dịu thanh quản" },
    { id: "gym", label: "Tập Gym / Tăng cơ", desc: "Giàu Protein, năng lượng cao" },
    { id: "kids", label: "Thực đơn trẻ em", desc: "Dễ nhai, màu sắc đẹp, giàu canxi" },
  ];

  const allergensList: { id: AllergenType; label: string; icon: string }[] = [
    { id: "seafood", label: "Hải sản (Tôm, cua...)", icon: "🦐" },
    { id: "peanuts", label: "Đậu phộng / Hạt", icon: "🥜" },
    { id: "dairy", label: "Sữa / Lactose", icon: "🥛" },
    { id: "gluten", label: "Gluten / Bột mì", icon: "🌾" },
    { id: "eggs", label: "Trứng gia cầm", icon: "🥚" },
    { id: "soy", label: "Đậu nành", icon: "🌱" },
  ];

  const toggleTaste = (taste: TasteType) => {
    const current = [...filter.selectedTastes];
    const index = current.indexOf(taste);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(taste);
    }
    onFilterChange({ ...filter, selectedTastes: current });
  };

  const toggleHealthProfile = (hp: HealthProfileType) => {
    const current = [...filter.selectedHealthProfiles];
    const index = current.indexOf(hp);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(hp);
    }
    onFilterChange({ ...filter, selectedHealthProfiles: current });
  };

  const toggleAllergen = (allg: AllergenType) => {
    const current = [...filter.excludedAllergens];
    const index = current.indexOf(allg);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(allg);
    }
    onFilterChange({ ...filter, excludedAllergens: current });
  };

  return (
    <div className="bg-white rounded-3xl border border-amber-100/90 shadow-sm p-4 sm:p-6 mb-8 transition-all">
      {/* Search Input and Main Toggles */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        {/* Search Bar */}
        <div className="relative w-full md:grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            id="input-dish-search"
            type="text"
            value={filter.searchQuery}
            onChange={(e) => onFilterChange({ ...filter, searchQuery: e.target.value })}
            placeholder="Tìm theo tên món ăn, nguyên liệu (thịt bò, tôm, đậu hũ), quốc gia (Pháp, Ý, Nhật)..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-amber-500 rounded-2xl text-sm transition-all focus:outline-none focus:ring-4 focus:ring-amber-500/10"
          />
          {filter.searchQuery && (
            <button
              onClick={() => onFilterChange({ ...filter, searchQuery: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1"
            >
              Xóa
            </button>
          )}
        </div>

        {/* Portion Selector Button Pills */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl w-full md:w-auto shrink-0 overflow-x-auto">
          {portionTypes.map((p) => (
            <button
              key={p.id}
              onClick={() => onFilterChange({ ...filter, selectedPortion: p.id })}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                filter.selectedPortion === p.id
                  ? "bg-white text-slate-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* Expand / Collapse Advanced Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            id="btn-toggle-advanced-filter"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold border transition-all w-full md:w-auto ${
              isExpanded || filter.selectedTastes.length > 0 || filter.selectedHealthProfiles.length > 0 || filter.excludedAllergens.length > 0
                ? "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Bộ Lọc Nâng Cao</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {(filter.searchQuery || filter.selectedMeal !== "all" || filter.selectedRegion !== "all" || filter.selectedTastes.length > 0 || filter.selectedHealthProfiles.length > 0 || filter.excludedAllergens.length > 0) && (
            <button
              id="btn-reset-filters"
              onClick={onResetFilter}
              className="p-3 rounded-2xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
              title="Đặt lại bộ lọc"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Primary Meal Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-3 mt-3 border-t border-slate-100 scrollbar-none">
        {mealTypes.map((meal) => (
          <button
            key={meal.id}
            id={`filter-meal-${meal.id}`}
            onClick={() => onFilterChange({ ...filter, selectedMeal: meal.id })}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shrink-0 transition-all ${
              filter.selectedMeal === meal.id
                ? "bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent"
            }`}
          >
            <span>{meal.icon}</span>
            <span>{meal.label}</span>
          </button>
        ))}

        <div className="h-6 w-px bg-slate-200 mx-1 shrink-0" />

        {/* Region Fast Toggles */}
        {regionTypes.map((r) => (
          <button
            key={r.id}
            id={`filter-region-${r.id}`}
            onClick={() => onFilterChange({ ...filter, selectedRegion: r.id })}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shrink-0 transition-all ${
              filter.selectedRegion === r.id
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>{r.icon}</span>
            <span>{r.label}</span>
          </button>
        ))}

        {/* Visual Mode Selector: Icon vs Photo */}
        {onToggleVisualMode && (
          <div className="flex items-center gap-1 bg-amber-100/70 p-1 rounded-2xl border border-amber-200/80 shrink-0 ml-auto">
            <span className="text-[11px] font-bold text-amber-900 px-1.5 hidden lg:inline">Minh họa:</span>
            <button
              type="button"
              onClick={() => onToggleVisualMode("icon")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                visualMode === "icon"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "text-amber-900 hover:bg-amber-200/60"
              }`}
              title="Chế độ Biểu tượng Icon (Mặc định)"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Biểu Tượng Icon</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleVisualMode("photo")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                visualMode === "photo"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "text-amber-900 hover:bg-amber-200/60"
              }`}
              title="Chế độ Ảnh chụp thực tế"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Ảnh Chụp</span>
            </button>
          </div>
        )}
      </div>

      {/* Expanded Advanced Filters Drawer */}
      {isExpanded && (
        <div className="pt-5 border-t border-slate-100 space-y-5 animate-fade-in">
          
          {/* Taste multi-select */}
          <div>
            <span className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Khẩu Vị Mong Muốn (Có thể chọn nhiều mục):
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {tasteOptions.map((taste) => {
                const isSelected = filter.selectedTastes.includes(taste.id);
                return (
                  <button
                    key={taste.id}
                    onClick={() => toggleTaste(taste.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-amber-500 text-white border-amber-600 shadow-2xs"
                        : "bg-white text-slate-700 border-slate-200 hover:border-amber-300"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{taste.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Health Profile / Specific User Situations */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Chế Độ Sức Khỏe & Tình Trạng Đối Tượng:
              </span>
              <span className="text-[11px] text-slate-500">Chọn tình trạng để lọc món phù hợp</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {healthProfiles.map((hp) => {
                const isSelected = filter.selectedHealthProfiles.includes(hp.id);
                return (
                  <div
                    key={hp.id}
                    onClick={() => toggleHealthProfile(hp.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer select-none transition-all flex items-start gap-2 ${
                      isSelected
                        ? "bg-emerald-50 border-emerald-400 text-emerald-950 shadow-2xs"
                        : "bg-white border-slate-200 text-slate-700 hover:border-emerald-300"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-md flex items-center justify-center border mt-0.5 shrink-0 ${
                      isSelected ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 bg-white"
                    }`}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold block">{hp.label}</span>
                      <span className="text-[10px] text-slate-500 block leading-tight">{hp.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Allergen Elimination */}
          <div className="bg-rose-50/60 border border-rose-200/80 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span className="text-xs font-bold text-rose-950 uppercase tracking-wider">
                Loại Bỏ Hoàn Toàn Thành Phần Gây Dị Ứng (Allergen-Free):
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {allergensList.map((alg) => {
                const isExcluded = filter.excludedAllergens.includes(alg.id);
                return (
                  <button
                    key={alg.id}
                    onClick={() => toggleAllergen(alg.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                      isExcluded
                        ? "bg-rose-600 text-white border-rose-700 shadow-xs"
                        : "bg-white text-rose-900 border-rose-200 hover:bg-rose-100/50"
                    }`}
                  >
                    <span>{alg.icon}</span>
                    <span>Không có {alg.label}</span>
                    {isExcluded && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price and Calorie Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
                <span className="flex items-center gap-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span>Giới Hạn Calo Tối Đa (cho 1 người):</span>
                </span>
                <span className="text-amber-700 font-extrabold">{filter.maxCalories} kcal</span>
              </div>
              <input
                type="range"
                min="150"
                max="1000"
                step="25"
                value={filter.maxCalories}
                onChange={(e) => onFilterChange({ ...filter, maxCalories: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>150 kcal (Rau/Canh nhẹ)</span>
                <span>500 kcal</span>
                <span>1000 kcal (Thịnh soạn)</span>
              </div>
            </div>

            <div>
              <span className="block text-xs font-bold text-slate-800 mb-1.5">
                Phân Khúc Chi Phí Bữa Ăn:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {priceTiers.map((pt) => (
                  <button
                    key={pt.id}
                    onClick={() => onFilterChange({ ...filter, selectedPriceTier: pt.id })}
                    className={`px-2 py-1.5 rounded-lg text-xs font-bold border transition-all text-center ${
                      filter.selectedPriceTier === pt.id
                        ? "bg-amber-500 text-white border-amber-600"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {pt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Result Count and Active Filters bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-3 mt-3 border-t border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span>Tìm thấy: <strong className="text-amber-700 font-extrabold text-sm">{totalFilteredCount}</strong> món ăn đạt tiêu chuẩn</span>
          {filter.excludedAllergens.length > 0 && (
            <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
              Đã chặn {filter.excludedAllergens.length} loại dị ứng
            </span>
          )}
          {filter.selectedHealthProfiles.length > 0 && (
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              Đã lọc theo {filter.selectedHealthProfiles.length} chế độ sức khỏe
            </span>
          )}
        </div>

        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Khẩu phần đang tính: <strong>{portionTypes.find(p => p.id === filter.selectedPortion)?.label}</strong>
        </span>
      </div>

    </div>
  );
};
