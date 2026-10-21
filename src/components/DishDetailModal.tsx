import React, { useState, useEffect } from "react";
import { Dish, PortionType, VisualDisplayMode } from "../types";
import { 
  X, Clock, Flame, Users, ChefHat, Sparkles, AlertTriangle, 
  Heart, CheckCircle2, BookmarkCheck, Scale, Apple, Share2, Palette, Camera,
  Search, Copy, Check, ExternalLink, ImagePlus, Timer, Info, UtensilsCrossed, ShoppingCart
} from "lucide-react";
import { formatVND, calculatePortionMultiplier } from "../utils/nutritionCalculator";
import { DishIllustration } from "./DishIllustration";
import { getCustomDishImage, saveCustomDishImage, removeCustomDishImage } from "../utils/customImageStore";

interface DishDetailModalProps {
  dish: Dish | null;
  isOpen: boolean;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (dish: Dish) => void;
  onAddToMealPlan?: (dish: Dish, mealSlot: "breakfast" | "lunch" | "afternoon" | "dinner" | "dessert") => void;
  displayMode?: VisualDisplayMode;
  onAddDishToShoppingList?: (dish: Dish, portion: PortionType) => void;
}

export const DishDetailModal: React.FC<DishDetailModalProps> = ({
  dish,
  isOpen,
  onClose,
  isSaved,
  onToggleSave,
  onAddToMealPlan,
  displayMode = "icon",
  onAddDishToShoppingList
}) => {
  const [portion, setPortion] = useState<PortionType>("single");
  const [activeStepTab, setActiveStepTab] = useState<number>(0);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [localMode, setLocalMode] = useState<VisualDisplayMode>(displayMode);
  const [customImageUrl, setCustomImageUrl] = useState<string>("");
  const [isAttachingImage, setIsAttachingImage] = useState<boolean>(false);
  const [copiedDishName, setCopiedDishName] = useState<boolean>(false);
  const [imageSaveSuccess, setImageSaveSuccess] = useState<string | null>(null);
  const [addedToShoppingFeedback, setAddedToShoppingFeedback] = useState<boolean>(false);

  useEffect(() => {
    setLocalMode(displayMode);
  }, [displayMode, dish?.id]);

  if (!isOpen || !dish) return null;

  const currentCustomImage = getCustomDishImage(dish.id);

  const handleCopyNameAndSearchGoogle = () => {
    if (!dish) return;
    navigator.clipboard.writeText(dish.name);
    setCopiedDishName(true);
    setTimeout(() => setCopiedDishName(false), 2500);
    const searchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(dish.name)}`;
    window.open(searchUrl, "_blank", "noopener,noreferrer");
  };

  const handleSaveCustomImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dish || !customImageUrl.trim()) return;
    saveCustomDishImage(dish.id, customImageUrl.trim());
    setLocalMode("photo");
    setImageSaveSuccess("Đã lưu ảnh mới thành công!");
    setTimeout(() => setImageSaveSuccess(null), 3000);
    setIsAttachingImage(false);
    setCustomImageUrl("");
  };

  const handleRemoveCustomImage = () => {
    if (!dish) return;
    removeCustomDishImage(dish.id);
    setImageSaveSuccess("Đã hoàn tác về ảnh mặc định");
    setTimeout(() => setImageSaveSuccess(null), 2500);
  };

  const multiplier = calculatePortionMultiplier(portion);
  const scaledCalories = Math.round(dish.calories * multiplier);
  const scaledProtein = Math.round(dish.protein * multiplier);
  const scaledCarbs = Math.round(dish.carbs * multiplier);
  const scaledFat = Math.round(dish.fat * multiplier);
  const scaledFiber = Math.round(dish.fiber * multiplier);
  const scaledCost = Math.round(dish.estimatedCostVND * multiplier);

  const toggleIngredient = (name: string) => {
    setCheckedIngredients(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const portionOptions: { id: PortionType; label: string; sub: string; icon: string }[] = [
    { id: "single", label: "1 Người", sub: "Khẩu phần đơn", icon: "👤" },
    { id: "couple", label: "Cặp Đôi", sub: "2 người lãng mạn", icon: "👥" },
    { id: "family", label: "Gia Đình", sub: "3 - 5 người", icon: "👨‍👩‍👧‍👦" },
    { id: "party", label: "Nhóm / Tiệc", sub: "6+ người thịnh soạn", icon: "🎉" },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div 
        className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Close Button & Actions */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            id="btn-fav-modal"
            onClick={() => onToggleSave(dish)}
            className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
              isSaved
                ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-105"
                : "bg-white/90 text-slate-700 hover:bg-white hover:text-rose-500"
            }`}
            title={isSaved ? "Bỏ lưu món" : "Lưu món yêu thích"}
          >
            <Heart className={`w-5 h-5 ${isSaved ? "fill-current text-white" : ""}`} />
          </button>
          
          <button
            id="btn-close-modal"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/90 text-slate-700 hover:bg-white hover:text-slate-900 flex items-center justify-center backdrop-blur-md shadow-md transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="overflow-y-auto grow p-0">
          
          {/* Hero Media Section with Food Icon illustration */}
          <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-amber-50/40">
            <DishIllustration
              dish={dish}
              size="hero"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />

            {/* Overlay Info */}
            <div className="absolute bottom-6 left-6 right-6 text-white pointer-events-none">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <span>{dish.flagEmoji}</span>
                  <span>{dish.country}</span>
                </span>
                <span className="bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  {dish.region === "asian" ? "Ẩm thực Châu Á" : "Ẩm thực Phương Tây"}
                </span>
                <span className="bg-emerald-500/90 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {formatVND(scaledCost)} (ước tính)
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1">
                {dish.name}
              </h1>
              {dish.nativeName && (
                <p className="text-sm text-slate-300 italic mb-2">
                  {dish.nativeName}
                </p>
              )}
              <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 max-w-2xl leading-relaxed">
                {dish.description}
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-8 space-y-6 sm:space-y-8">

            {/* Image Search & Custom Attachment Toolbar */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-amber-600" />
                  <span>Hình ảnh món ăn:</span>
                </span>
                {currentCustomImage && (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                    Ảnh tùy chỉnh của bạn
                  </span>
                )}
                {imageSaveSuccess && (
                  <span className="text-xs font-bold text-emerald-600 animate-pulse">
                    ✓ {imageSaveSuccess}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleCopyNameAndSearchGoogle}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 hover:border-amber-300 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 active:scale-95"
                  title="Tự động copy tên món và mở Google Images tìm ảnh đẹp"
                >
                  <Search className="w-3.5 h-3.5 text-amber-600" />
                  <span>{copiedDishName ? "Đã copy tên & Đang mở Google..." : "Tìm ảnh trên Google Images"}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsAttachingImage(!isAttachingImage)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-2xs ${
                    isAttachingImage 
                      ? "bg-amber-500 text-white border-amber-600" 
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                  title="Dán đường link ảnh từ Google vào đây để hiển thị"
                >
                  <ImagePlus className="w-3.5 h-3.5" />
                  <span>Gắn link ảnh mới</span>
                </button>

                {currentCustomImage && (
                  <button
                    type="button"
                    onClick={handleRemoveCustomImage}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                    title="Xóa ảnh tùy chỉnh, quay về ảnh mặc định"
                  >
                    Xóa ảnh tự gắn
                  </button>
                )}
              </div>
            </div>

            {/* Custom Image URL Input Form */}
            {isAttachingImage && (
              <form onSubmit={handleSaveCustomImage} className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-3 animate-fade-in">
                <div className="text-xs text-amber-900 leading-relaxed">
                  <strong>Hướng dẫn tìm & gắn ảnh:</strong> Bấm nút <em>&quot;Tìm ảnh trên Google Images&quot;</em> (hệ thống đã tự động copy tên món <strong>{dish.name}</strong>). Trên Google Images, bạn chuột phải vào bức ảnh ưng ý &rarr; Chọn <em>&quot;Sao chép địa chỉ hình ảnh (Copy image address)&quot;</em> &rarr; Dán link vào ô bên dưới:
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    placeholder="Dán link ảnh (https://...jpg, png, webp)"
                    className="grow px-3.5 py-2 rounded-xl bg-white border border-amber-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shrink-0 shadow-sm"
                  >
                    Lưu & Gắn Ảnh
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAttachingImage(false)}
                    className="px-3 py-2 rounded-xl bg-white text-slate-600 border border-slate-200 text-xs font-semibold"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            )}

            {/* Portion Adjuster */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-700" />
                  <span className="font-bold text-sm sm:text-base text-slate-900">
                    Chọn Khẩu Phần Nấu (Tự Động Cân Định Lượng)
                  </span>
                </div>
                <span className="text-xs text-amber-800 font-semibold bg-amber-100 px-2.5 py-1 rounded-full">
                  Hệ số x{multiplier}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {portionOptions.map((opt) => (
                  <button
                    key={opt.id}
                    id={`portion-opt-${opt.id}`}
                    onClick={() => setPortion(opt.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      portion === opt.id
                        ? "bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20"
                        : "bg-white text-slate-700 border-amber-100 hover:border-amber-300 hover:bg-amber-50/50"
                    }`}
                  >
                    <div className="text-lg mb-0.5">{opt.icon}</div>
                    <div className="font-bold text-sm">{opt.label}</div>
                    <div className={`text-[11px] ${portion === opt.id ? "text-amber-100" : "text-slate-500"}`}>
                      {opt.sub}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Nutrition & Macro Breakdown Panel */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span>Định Lượng Calo & Giá Trị Dinh Dưỡng ({portionOptions.find(p => p.id === portion)?.label})</span>
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  Thời gian nấu: {dish.prepTimeMinutes + dish.cookTimeMinutes} phút
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div className="bg-orange-50 border border-orange-200/70 p-3 rounded-2xl text-center">
                  <span className="text-xs font-semibold text-orange-700 block">Năng Lượng</span>
                  <span className="text-xl sm:text-2xl font-black text-orange-900">{scaledCalories}</span>
                  <span className="text-[11px] text-orange-600 block">kcal</span>
                </div>
                <div className="bg-blue-50 border border-blue-200/70 p-3 rounded-2xl text-center">
                  <span className="text-xs font-semibold text-blue-700 block">Đạm (Protein)</span>
                  <span className="text-xl sm:text-2xl font-black text-blue-900">{scaledProtein}g</span>
                  <span className="text-[11px] text-blue-600 block">~{Math.round(scaledProtein * 4)} kcal</span>
                </div>
                <div className="bg-amber-50 border border-amber-200/70 p-3 rounded-2xl text-center">
                  <span className="text-xs font-semibold text-amber-700 block">Tinh Bột (Carb)</span>
                  <span className="text-xl sm:text-2xl font-black text-amber-900">{scaledCarbs}g</span>
                  <span className="text-[11px] text-amber-600 block">~{Math.round(scaledCarbs * 4)} kcal</span>
                </div>
                <div className="bg-rose-50 border border-rose-200/70 p-3 rounded-2xl text-center">
                  <span className="text-xs font-semibold text-rose-700 block">Chất Béo (Fat)</span>
                  <span className="text-xl sm:text-2xl font-black text-rose-900">{scaledFat}g</span>
                  <span className="text-[11px] text-rose-600 block">~{Math.round(scaledFat * 9)} kcal</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-200/70 p-3 rounded-2xl text-center col-span-2 sm:col-span-1">
                  <span className="text-xs font-semibold text-emerald-700 block">Chất Xơ (Fiber)</span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-900">{scaledFiber}g</span>
                  <span className="text-[11px] text-emerald-600 block">Tiêu hóa tốt</span>
                </div>
              </div>
            </div>

            {/* Smart Nutrition Balance Tip & Recommended Pairings */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <Apple className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-xs sm:text-sm">
                <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <span>Lời Khuyên Cân Bằng Dinh Dưỡng Cho Bữa Ăn</span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">Chuyên gia</span>
                </div>
                <p className="text-emerald-900 leading-relaxed">
                  {dish.nutritionBalanceTip}
                </p>
                {dish.recommendedSides && dish.recommendedSides.length > 0 && (
                  <div className="pt-2 flex items-center gap-2 flex-wrap text-xs">
                    <span className="font-bold text-emerald-950">Gợi ý món ăn kèm lý tưởng:</span>
                    {dish.recommendedSides.map((side, i) => (
                      <span key={i} className="bg-white/90 text-emerald-800 font-semibold px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                        🥗 {side}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Allergen Warning Banner if any */}
            {dish.allergens.length > 0 && (
              <div className="bg-amber-50 border border-amber-300/80 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-amber-900">
                  <span className="font-bold block mb-0.5">Cảnh báo dị ứng thực phẩm:</span>
                  Món ăn này có chứa: <strong className="font-bold text-amber-950">{dish.allergens.map(a => {
                    const m: Record<string, string> = {
                      seafood: "Hải sản", peanuts: "Đậu phộng / Lạc", dairy: "Sữa / Lactose",
                      gluten: "Gluten / Bột mì", eggs: "Trứng", soy: "Đậu nành"
                    };
                    return m[a] || a;
                  }).join(", ")}</strong>. Người có cơ địa dị ứng nên cân nhắc hoặc thay thế nguyên liệu tương đương.
                </div>
              </div>
            )}

            {/* Detailed Ingredients Checklist */}
            <div>
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h3 className="font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-amber-600" />
                  <span>Nguyên Liệu Cần Chuẩn Bị (Khẩu phần: {multiplier} người)</span>
                </h3>
                <div className="flex items-center gap-2">
                  {onAddDishToShoppingList && (
                    <button
                      type="button"
                      onClick={() => {
                        onAddDishToShoppingList(dish, portion);
                        setAddedToShoppingFeedback(true);
                        setTimeout(() => setAddedToShoppingFeedback(false), 2200);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                      title="Thêm toàn bộ nguyên liệu món này vào Danh Sách Đi Chợ"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 text-amber-700" />
                      <span>{addedToShoppingFeedback ? "✓ Đã Gom Vào Đi Chợ!" : "+ Gom Vào Đi Chợ"}</span>
                    </button>
                  )}
                  <span className="text-xs text-slate-500 hidden sm:inline">Tick chọn những thứ đã có</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {dish.ingredients.map((item, idx) => {
                  const isChecked = !!checkedIngredients[item.name];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleIngredient(item.name)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all ${
                        isChecked
                          ? "bg-slate-50 border-slate-200 text-slate-400 line-through"
                          : "bg-white border-slate-200 hover:border-amber-300 text-slate-800 shadow-2xs"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                          isChecked ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 bg-white"
                        }`}>
                          {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-semibold">{item.name}</span>
                          {item.notes && (
                            <span className="text-[11px] text-slate-500 block">({item.notes})</span>
                          )}
                        </div>
                      </div>
                      <span className="font-bold text-xs sm:text-sm text-amber-700 shrink-0">
                        {item.amount}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step-by-Step Cooking Instructions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-amber-600" />
                  <span>Chi Tiết Quy Trình Chế Biến ({dish.steps.length} bước chuẩn chỉ)</span>
                </h3>
              </div>

              <div className="space-y-4">
                {dish.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-amber-200 transition-all shadow-2xs"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {step.step}
                        </span>
                        <h4 className="font-bold text-sm sm:text-base text-slate-900">
                          {step.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        {step.method && (
                          <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                            {step.method}
                          </span>
                        )}
                        {step.timeMinutes && (
                          <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            {step.timeMinutes} phút
                          </span>
                        )}
                        {step.temperatureOrFlame && (
                          <span className="text-[11px] font-semibold text-orange-700 bg-orange-100/80 px-2 py-0.5 rounded-full">
                            🔥 {step.temperatureOrFlame}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-9">
                      {step.instruction}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Comprehensive Prep & Cooking Times Reference Guide */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* 1. Hướng dẫn sơ chế & làm sạch nguyên liệu */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 sm:p-5 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                  <UtensilsCrossed className="w-4 h-4 text-amber-700" />
                  <span>Hướng Dẫn Sơ Chế & Làm Sạch Nguyên Liệu</span>
                </div>
                <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li><strong className="text-slate-900">Khử mùi tanh thịt/cá:</strong> Rửa qua nước muối loãng pha chút rượu trắng hoặc gừng đập dập 5-10 phút rồi thấm thật khô bằng khăn giấy.</li>
                  <li><strong className="text-slate-900">Kỹ thuật thái thịt:</strong> Luôn thái ngang thớ mỏng đối với thịt bò/thịt heo xào để khi nấu thịt mềm mọng, không bị dai.</li>
                  <li><strong className="text-slate-900">Thời gian ướp chuẩn:</strong> Ướp thịt cá với mắm, tiêu sọ, hành tỏi băm ít nhất 15-25 phút để gia vị ngấm sâu vào từng thớ thịt.</li>
                  <li><strong className="text-slate-900">Rau củ quả:</strong> Rửa sạch dưới vòi nước chảy, ngâm nước muối loãng 10 phút, vớt ráo nước trước khi luộc hoặc xào để giữ độ giòn ngọt.</li>
                </ul>
              </div>

              {/* 2. Bảng thời gian & nhiệt độ chuẩn xác */}
              <div className="bg-orange-50/70 border border-orange-200 rounded-2xl p-4 sm:p-5 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-orange-900 uppercase tracking-wider">
                  <Timer className="w-4 h-4 text-orange-600" />
                  <span>Thời Gian & Nhiệt Độ Chuẩn Xác Khi Nấu</span>
                </div>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-center justify-between border-b border-orange-200/60 pb-1.5">
                    <span className="font-semibold text-slate-800">🍖 Luộc thịt heo / gà:</span>
                    <span className="font-bold text-orange-700 bg-white px-2 py-0.5 rounded-md border border-orange-200">15 - 20 phút (lửa vừa)</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-orange-200/60 pb-1.5">
                    <span className="font-semibold text-slate-800">🥩 Nướng thịt / cá:</span>
                    <span className="font-bold text-orange-700 bg-white px-2 py-0.5 rounded-md border border-orange-200">180°C - 200°C (15 - 22 phút)</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-orange-200/60 pb-1.5">
                    <span className="font-semibold text-slate-800">🍳 Xào / Áp chảo thịt:</span>
                    <span className="font-bold text-orange-700 bg-white px-2 py-0.5 rounded-md border border-orange-200">3 - 5 phút (lửa lớn đảo nhanh)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">🍲 Hầm / Nấu canh nước trong:</span>
                    <span className="font-bold text-orange-700 bg-white px-2 py-0.5 rounded-md border border-orange-200">20 - 35 phút (lửa nhỏ liu riu)</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Chef's Secret Tips */}
            {dish.chefTips && (
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-300 rounded-2xl p-4 sm:p-5 flex items-start gap-3 shadow-2xs">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm space-y-1">
                  <span className="font-bold text-amber-950 block">Mẹo Nấu Ăn Ngon Của Bếp Trưởng:</span>
                  <p className="text-amber-900 leading-relaxed font-medium">{dish.chefTips}</p>
                  <p className="text-[11px] text-amber-800 pt-1">
                    💡 <em>Bí quyết thêm: Phi thơm hành tỏi với chút mỡ gà hoặc dầu ăn ở nhiệt độ vừa trước khi cho thịt vào xào; nêm nước mắm cốt nguyên chất vào 1 phút cuối trước khi tắt bếp để giữ trọn vẹn hương vị tinh túy nhất.</em>
                  </p>
                </div>
              </div>
            )}

            {/* Quick Add to Meal Plan Slots */}
            {onAddToMealPlan && (
              <div className="pt-4 border-t border-slate-100">
                <span className="block text-xs font-bold text-slate-700 mb-2">
                  Đưa món này vào Thực đơn 1 ngày:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => { onAddToMealPlan(dish, "breakfast"); onClose(); }}
                    className="px-3 py-1.5 rounded-xl bg-orange-100 text-orange-800 text-xs font-bold hover:bg-orange-200 transition-colors"
                  >
                    🌅 Bữa Sáng
                  </button>
                  <button
                    onClick={() => { onAddToMealPlan(dish, "lunch"); onClose(); }}
                    className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-800 text-xs font-bold hover:bg-amber-200 transition-colors"
                  >
                    ☀️ Bữa Trưa
                  </button>
                  <button
                    onClick={() => { onAddToMealPlan(dish, "afternoon"); onClose(); }}
                    className="px-3 py-1.5 rounded-xl bg-teal-100 text-teal-800 text-xs font-bold hover:bg-teal-200 transition-colors"
                  >
                    🍵 Bữa Xế
                  </button>
                  <button
                    onClick={() => { onAddToMealPlan(dish, "dinner"); onClose(); }}
                    className="px-3 py-1.5 rounded-xl bg-indigo-100 text-indigo-800 text-xs font-bold hover:bg-indigo-200 transition-colors"
                  >
                    🌙 Bữa Tối
                  </button>
                  <button
                    onClick={() => { onAddToMealPlan(dish, "dessert"); onClose(); }}
                    className="px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800 text-xs font-bold hover:bg-rose-200 transition-colors"
                  >
                    🍧 Tráng Miệng
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Footer sticky action bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <div className="hidden sm:block text-xs text-slate-500">
            Tổng cộng: <strong className="text-slate-800 font-bold">{scaledCalories} kcal</strong> • <strong className="text-amber-700 font-bold">{formatVND(scaledCost)}</strong>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => onToggleSave(dish)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 border transition-all ${
                isSaved
                  ? "bg-rose-50 border-rose-300 text-rose-600"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? "fill-current text-rose-500" : ""}`} />
              <span>{isSaved ? "Đã Lưu Yêu Thích" : "Lưu Món Này"}</span>
            </button>

            <button
              id="btn-modal-done"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-500/25 transition-all"
            >
              Đã Hiểu & Vào Bếp!
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
