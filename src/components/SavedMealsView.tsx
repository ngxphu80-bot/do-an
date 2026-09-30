import React, { useState } from "react";
import { Dish, DayMealPlan, VisualDisplayMode } from "../types";
import { 
  Bookmark, ShoppingCart, History, Trash2, CheckSquare, 
  Square, Copy, Check, ChefHat, Calendar, ArrowRight, ExternalLink 
} from "lucide-react";
import { DishCard } from "./DishCard";
import { formatVND } from "../utils/nutritionCalculator";

interface SavedMealsViewProps {
  savedDishes: Dish[];
  onToggleSave: (dish: Dish) => void;
  onSelectDetail: (dish: Dish) => void;
  savedDayPlans: DayMealPlan[];
  onDeleteDayPlan: (id: string) => void;
  onApplyDayPlan: (plan: DayMealPlan) => void;
  displayMode?: VisualDisplayMode;
}

export const SavedMealsView: React.FC<SavedMealsViewProps> = ({
  savedDishes,
  onToggleSave,
  onSelectDetail,
  savedDayPlans,
  onDeleteDayPlan,
  onApplyDayPlan,
  displayMode = "icon"
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"favorites" | "grocery" | "history">("favorites");
  const [checkedGrocery, setCheckedGrocery] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<boolean>(false);

  // Generate combined grocery list from saved dishes
  const groceryItems = React.useMemo(() => {
    const map: Record<string, { amount: string; dishes: string[] }> = {};

    savedDishes.forEach(dish => {
      dish.ingredients.forEach(ing => {
        const key = ing.name.trim().toLowerCase();
        if (!map[key]) {
          map[key] = {
            amount: ing.amount,
            dishes: [dish.name]
          };
        } else {
          if (!map[key].dishes.includes(dish.name)) {
            map[key].dishes.push(dish.name);
          }
        }
      });
    });

    return Object.entries(map).map(([name, data]) => ({
      name,
      amount: data.amount,
      dishes: data.dishes
    }));
  }, [savedDishes]);

  const toggleGroceryItem = (name: string) => {
    setCheckedGrocery(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const copyGroceryList = () => {
    if (groceryItems.length === 0) return;
    const text = groceryItems
      .map(item => `- ${item.name} (${item.amount}) [Cho món: ${item.dishes.join(", ")}]`)
      .join("\n");

    navigator.clipboard.writeText(`🛒 DANH SÁCH ĐI CHỢ:\n${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-rose-500 fill-rose-100" />
            <span>Món Đã Lưu & Quản Lý Thực Đơn</span>
          </h2>
          <p className="text-xs text-slate-500">
            Lưu giữ công thức yêu thích, danh sách đi chợ và lịch sử thực đơn để đổi món linh hoạt
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveSubTab("favorites")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === "favorites"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>💖 Món Yêu Thích</span>
            <span className="bg-rose-100 text-rose-700 text-[10px] px-1.5 py-0.5 rounded-full">
              {savedDishes.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab("grocery")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === "grocery"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
            <span>Danh Sách Đi Chợ</span>
            {groceryItems.length > 0 && (
              <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded-full">
                {groceryItems.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab("history")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === "history"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <History className="w-3.5 h-3.5 text-amber-600" />
            <span>Thực Đơn Đã Lưu</span>
            <span className="bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0.5 rounded-full">
              {savedDayPlans.length}
            </span>
          </button>
        </div>
      </div>

      {/* Subtab 1: Favorites */}
      {activeSubTab === "favorites" && (
        <div>
          {savedDishes.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center">
              <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700 text-base mb-1">
                Chưa có món ăn nào được lưu
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Khi duyệt danh mục 500 món hoặc xem chi tiết, hãy nhấn vào biểu tượng trái tim để lưu lại vào bộ sưu tập cá nhân!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {savedDishes.map((dish) => (
                <DishCard
                  key={dish.id}
                  dish={dish}
                  isSaved={true}
                  onToggleSave={onToggleSave}
                  onSelectDetail={onSelectDetail}
                  displayMode={displayMode}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subtab 2: Grocery List */}
      {activeSubTab === "grocery" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
                <span>Tổng Hợp Danh Sách Nguyên Liệu Cần Mua</span>
              </h3>
              <p className="text-xs text-slate-500">
                Tự động gom nguyên liệu từ {savedDishes.length} món bạn đã lưu yêu thích
              </p>
            </div>

            {groceryItems.length > 0 && (
              <button
                onClick={copyGroceryList}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Đã Sao Chép Danh Sách!" : "Sao Chép Danh Sách Đi Chợ"}</span>
              </button>
            )}
          </div>

          {groceryItems.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Lưu các món ăn bạn muốn nấu để hệ thống tự động xuất bảng nguyên liệu đi chợ!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {groceryItems.map((item, idx) => {
                const isChecked = !!checkedGrocery[item.name];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleGroceryItem(item.name)}
                    className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-center justify-between ${
                      isChecked
                        ? "bg-slate-50 border-slate-200 text-slate-400 line-through"
                        : "bg-white border-slate-200 hover:border-emerald-300 text-slate-800 shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <div>
                        <span className="font-semibold text-xs sm:text-sm capitalize">{item.name}</span>
                        <span className="text-[10px] text-slate-400 block line-clamp-1">
                          (Dùng cho: {item.dishes.join(", ")})
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-emerald-700 shrink-0">
                      {item.amount}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Subtab 3: Saved Day Plans (History to prevent meal fatigue) */}
      {activeSubTab === "history" && (
        <div className="space-y-4">
          {savedDayPlans.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center">
              <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700 text-base mb-1">
                Chưa có thực đơn ngày nào được lưu
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Khi tạo thực đơn 1 ngày ở tab &quot;Thực Đơn 1 Ngày&quot;, hãy bấm &quot;Lưu Thực Đơn Ngày&quot; để lưu lại nhật ký dinh dưỡng và đổi món linh hoạt!
              </p>
            </div>
          ) : (
            savedDayPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                      📅
                    </span>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-slate-900">
                        {plan.title} ({plan.date})
                      </h4>
                      <span className="text-xs text-slate-500">
                        Tổng: {plan.totalCalories} kcal • {formatVND(plan.totalCostVND)} • Đạm {plan.totalProtein}g
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onApplyDayPlan(plan)}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 flex items-center gap-1 transition-colors"
                    >
                      <span>Kích Hoạt Làm Thực Đơn Hôm Nay</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteDayPlan(plan.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Xóa thực đơn này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Mini slots summary */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  <div className="bg-orange-50/70 p-2.5 rounded-xl border border-orange-100">
                    <span className="text-[10px] font-bold text-orange-700 block">🌅 Sáng</span>
                    <span className="font-bold text-slate-800 line-clamp-1">{plan.breakfast.name}</span>
                    <span className="text-[10px] text-slate-500">{plan.breakfast.calories} kcal</span>
                  </div>

                  <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-100">
                    <span className="text-[10px] font-bold text-amber-700 block">☀️ Trưa</span>
                    <span className="font-bold text-slate-800 line-clamp-1">{plan.lunch.name}</span>
                    <span className="text-[10px] text-slate-500">{plan.lunch.calories} kcal</span>
                  </div>

                  {plan.afternoonSnack && (
                    <div className="bg-teal-50/70 p-2.5 rounded-xl border border-teal-100">
                      <span className="text-[10px] font-bold text-teal-700 block">🍵 Xế</span>
                      <span className="font-bold text-slate-800 line-clamp-1">{plan.afternoonSnack.name}</span>
                      <span className="text-[10px] text-slate-500">{plan.afternoonSnack.calories} kcal</span>
                    </div>
                  )}

                  <div className="bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-100">
                    <span className="text-[10px] font-bold text-indigo-700 block">🌙 Tối</span>
                    <span className="font-bold text-slate-800 line-clamp-1">{plan.dinner.name}</span>
                    <span className="text-[10px] text-slate-500">{plan.dinner.calories} kcal</span>
                  </div>

                  {plan.dessert && (
                    <div className="bg-rose-50/70 p-2.5 rounded-xl border border-rose-100">
                      <span className="text-[10px] font-bold text-rose-700 block">🍧 Tráng miệng</span>
                      <span className="font-bold text-slate-800 line-clamp-1">{plan.dessert.name}</span>
                      <span className="text-[10px] text-slate-500">{plan.dessert.calories} kcal</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};
