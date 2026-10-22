// src/components/PrintMealPlanModal.tsx
import React, { useState, useMemo } from "react";
import { DayMealPlan, UserHealthProfile, Dish } from "../types";
import { formatVND } from "../utils/nutritionCalculator";
import { 
  Printer, X, Download, FileText, Check, Copy, 
  Calendar, Flame, Apple, ShoppingBag, Utensils, Clock 
} from "lucide-react";

interface PrintMealPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: DayMealPlan;
  userProfile?: UserHealthProfile;
}

export const PrintMealPlanModal: React.FC<PrintMealPlanModalProps> = ({
  isOpen,
  onClose,
  plan,
  userProfile
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  // Group all ingredients across the 5 meals for easy grocery shopping
  const consolidatedIngredients = useMemo(() => {
    const list: { name: string; amount: string; category?: string; dishName: string }[] = [];
    const meals = [
      { name: "Bữa Sáng", dish: plan.breakfast },
      { name: "Bữa Trưa", dish: plan.lunch },
      { name: "Bữa Xế", dish: plan.afternoonSnack },
      { name: "Bữa Tối", dish: plan.dinner },
      { name: "Tráng Miệng", dish: plan.dessert }
    ];

    meals.forEach(m => {
      if (m.dish && m.dish.ingredients) {
        m.dish.ingredients.forEach(ing => {
          list.push({
            name: ing.name,
            amount: ing.amount || "Vừa đủ",
            category: ing.category || "other",
            dishName: m.dish.name
          });
        });
      }
    });

    // Deduplicate by ingredient name
    const map = new Map<string, { name: string; amounts: string[]; dishNames: Set<string> }>();
    list.forEach(item => {
      const key = item.name.trim().toLowerCase();
      if (!map.has(key)) {
        map.set(key, { name: item.name, amounts: [item.amount], dishNames: new Set([item.dishName]) });
      } else {
        const existing = map.get(key)!;
        existing.amounts.push(item.amount);
        existing.dishNames.add(item.dishName);
      }
    });

    return Array.from(map.values()).map(v => ({
      name: v.name,
      dishes: Array.from(v.dishNames).join(", ")
    }));
  }, [plan]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    let text = `📋 THỰC ĐƠN DINH DƯỠNG 1 NGÀY - HÔM NAY ĂN GÌ?\n`;
    text += `Ngày: ${plan.date || new Date().toLocaleDateString("vi-VN")}\n`;
    text += `Tổng calo: ${plan.totalCalories} kcal | Đạm: ${plan.totalProtein}g | Tinh bột: ${plan.totalCarbs}g | Béo: ${plan.totalFat}g\n`;
    text += `Chi phí ước tính: ${formatVND(plan.totalCostVND)}\n\n`;
    text += `1. 🍳 Bữa Sáng (06:30 - 08:00): ${plan.breakfast.name} (${plan.breakfast.calories} kcal)\n`;
    text += `2. ☀️ Bữa Trưa (11:30 - 13:00): ${plan.lunch.name} (${plan.lunch.calories} kcal)\n`;
    if (plan.afternoonSnack) {
      text += `3. 🍵 Bữa Xế (15:30 - 16:30): ${plan.afternoonSnack.name} (${plan.afternoonSnack.calories} kcal)\n`;
    }
    text += `4. 🌙 Bữa Tối (18:30 - 20:00): ${plan.dinner.name} (${plan.dinner.calories} kcal)\n`;
    if (plan.dessert) {
      text += `5. 🍧 Tráng Miệng: ${plan.dessert.name} (${plan.dessert.calories} kcal)\n`;
    }

    text += `\n🛒 DANH SÁCH NGUYÊN LIỆU CẦN ĐI CHỢ:\n`;
    consolidatedIngredients.slice(0, 15).forEach((ing, i) => {
      text += `- [ ] ${ing.name} (dùng cho: ${ing.dishes})\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const meals = [
    { key: "breakfast", label: "1. Bữa Sáng (06:30 - 08:00)", icon: "🍳", dish: plan.breakfast, percent: "25% kcal" },
    { key: "lunch", label: "2. Bữa Trưa (11:30 - 13:00)", icon: "☀️", dish: plan.lunch, percent: "35% kcal" },
    { key: "afternoon", label: "3. Bữa Xế Chiều (15:30 - 16:30)", icon: "🍵", dish: plan.afternoonSnack, percent: "10% kcal" },
    { key: "dinner", label: "4. Bữa Tối (18:30 - 20:00)", icon: "🌙", dish: plan.dinner, percent: "25% kcal" },
    { key: "dessert", label: "5. Tráng Miệng Thanh Mát", icon: "🍧", dish: plan.dessert, percent: "5% kcal" }
  ].filter(m => Boolean(m.dish));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      {/* Container */}
      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print bg-amber-50/90 border-b border-amber-200/80 px-5 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
              <Printer className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                In & Xuất Thực Đơn Ra PDF
              </h3>
              <p className="text-[11px] text-slate-500">
                Lưu PDF hoặc in giấy để mang theo đi chợ và dán bếp nấu ăn
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors"
              title="Sao chép tóm tắt vào bộ nhớ tạm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? "Đã chép" : "Chép Text"}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              title="Mở hộp thoại In / Lưu dưới dạng PDF"
            >
              <Printer className="w-4 h-4" />
              <span>In / Lưu PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6 printable-document bg-white text-slate-800">
          
          {/* Document Header */}
          <div className="border-b-2 border-amber-500 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🥗</span>
                <span className="font-black text-xs text-amber-700 uppercase tracking-widest">
                  HÔM NAY ĂN GÌ? • CHUYÊN GIA DINH DƯỠNG
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                KẾ HOẠCH THỰC ĐƠN 1 NGÀY & ĐI CHỢ
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                Ngày áp dụng: <strong>{plan.date || new Date().toLocaleDateString("vi-VN")}</strong> • Mã thực đơn: <span className="font-mono text-slate-500">{plan.id}</span>
              </p>
            </div>

            <div className="text-right sm:self-end">
              <div className="inline-block bg-amber-50 border border-amber-200 rounded-2xl p-3 text-left">
                <span className="text-[10px] font-bold text-amber-900 block uppercase">Tổng Năng Lượng</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-amber-950">{plan.totalCalories}</span>
                  <span className="text-xs text-amber-700 font-bold">kcal</span>
                </div>
                {userProfile?.targetDailyCalories && (
                  <span className="text-[10px] text-slate-500 block">
                    Mục tiêu: {userProfile.targetDailyCalories} kcal
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 py-3 border-y border-slate-200 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl text-center border border-slate-200">
              <span className="text-slate-500 text-[10px] font-bold block uppercase">Đạm (Protein)</span>
              <strong className="text-slate-900 text-sm font-black">{plan.totalProtein}g</strong>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl text-center border border-slate-200">
              <span className="text-slate-500 text-[10px] font-bold block uppercase">Tinh Bột (Carb)</span>
              <strong className="text-slate-900 text-sm font-black">{plan.totalCarbs}g</strong>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl text-center border border-slate-200">
              <span className="text-slate-500 text-[10px] font-bold block uppercase">Chất Béo (Fat)</span>
              <strong className="text-slate-900 text-sm font-black">{plan.totalFat}g</strong>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl text-center border border-slate-200">
              <span className="text-slate-500 text-[10px] font-bold block uppercase">Chất Xơ (Fiber)</span>
              <strong className="text-slate-900 text-sm font-black">{plan.totalFiber}g</strong>
            </div>
            <div className="bg-amber-50 p-2.5 rounded-xl text-center border border-amber-200 col-span-2 sm:col-span-1">
              <span className="text-amber-800 text-[10px] font-bold block uppercase">Chi Phí Cả Ngày</span>
              <strong className="text-amber-950 text-sm font-black">{formatVND(plan.totalCostVND)}</strong>
            </div>
          </div>

          {/* Section 1: 5 Meals Schedule */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Utensils className="w-4 h-4 text-amber-600" />
              <h2 className="font-black text-sm sm:text-base text-slate-900 uppercase tracking-wide">
                1. Chi Tiết 5 Cữ Ăn Trong Ngày
              </h2>
            </div>

            <div className="space-y-3">
              {meals.map((m, idx) => {
                const dish = m.dish as Dish;
                return (
                  <div 
                    key={m.key} 
                    className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-2 page-break-inside-avoid"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{m.icon}</span>
                        <div>
                          <span className="font-extrabold text-xs text-amber-900 uppercase">
                            {m.label}
                          </span>
                          <h3 className="font-black text-slate-900 text-base">
                            {dish.name}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
                          ⏱️ {dish.prepTimeMinutes + dish.cookTimeMinutes} phút
                        </span>
                        <span className="font-black text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md">
                          🔥 {dish.calories} kcal
                        </span>
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {formatVND(dish.estimatedCostVND)}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 italic">
                      &quot;{dish.description}&quot;
                    </p>

                    {/* Key Ingredients & Cook steps snippet */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                      <div>
                        <strong className="text-[11px] text-slate-700 block mb-0.5">
                          Nguyên liệu chính:
                        </strong>
                        <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-600">
                          {dish.keyIngredients.map((k, kIdx) => (
                            <span key={kIdx} className="bg-slate-100 px-2 py-0.5 rounded">
                              {k}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <strong className="text-[11px] text-slate-700 block mb-0.5">
                          Gợi ý chế biến nhanh:
                        </strong>
                        <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                          {dish.steps && dish.steps.length > 0
                            ? dish.steps.slice(0, 2).map((s, sIdx) => `${sIdx + 1}. ${s.instruction}`).join(" ")
                            : dish.chefTips || "Sơ chế sạch nguyên liệu, nêm nếm vừa vị, nấu chín đều."}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Consolidated Grocery Checklist */}
          <div className="space-y-3 pt-2 page-break-inside-avoid">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-600" />
                <h2 className="font-black text-sm sm:text-base text-slate-900 uppercase tracking-wide">
                  2. Danh Sách Nguyên Liệu Cần Mua Khi Đi Chợ
                </h2>
              </div>
              <span className="text-xs text-slate-500">
                (Đánh dấu tick [✓] khi mua tại chợ/siêu thị)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              {consolidatedIngredients.map((item, idx) => (
                <div 
                  key={idx} 
                  className="p-2 rounded-xl border border-slate-200 bg-slate-50/70 flex items-start gap-2"
                >
                  <span className="w-4 h-4 rounded border-2 border-slate-400 mt-0.5 shrink-0 block" />
                  <div className="min-w-0">
                    <strong className="text-slate-900 block truncate">{item.name}</strong>
                    <span className="text-[10px] text-slate-500 truncate block">
                      Dùng cho: {item.dishes}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Notes & Nutrition Rationales */}
          {plan.rationales && plan.rationales.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-2 page-break-inside-avoid">
              <strong className="font-bold text-amber-950 block text-xs uppercase flex items-center gap-1.5">
                <Apple className="w-3.5 h-3.5 text-amber-700" />
                <span>3. Tiêu Chuẩn Lựa Chọn Hợp Lý Của Thực Đơn Này:</span>
              </strong>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700">
                {plan.rationales.map((rat, rIdx) => (
                  <div key={rIdx} className="flex items-start gap-1.5">
                    <span className="font-bold text-amber-700 shrink-0">✓</span>
                    <span>{rat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Document Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
            <span>Ứng dụng &quot;Hôm Nay Ăn Gì?&quot; • Tự động tính calo & lên thực đơn</span>
            <span>https://ais-pre-4wisz7uplv66hh2w4py7ev-715822854924.asia-southeast1.run.app</span>
          </div>

        </div>

      </div>
    </div>
  );
};
