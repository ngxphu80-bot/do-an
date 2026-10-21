import React, { useState, useMemo } from "react";
import { ShoppingListItem, ShoppingItemCategory, DayMealPlan, Dish } from "../types";
import { 
  ShoppingCart, Check, Plus, Trash2, Copy, Printer, 
  Download, Sparkles, CheckCircle2, Circle, AlertCircle, 
  CalendarDays, Refrigerator, Filter, ArrowRight, Share2, 
  RotateCcw, CheckSquare, Square, FileText, ChevronRight
} from "lucide-react";

interface ShoppingListProps {
  items: ShoppingListItem[];
  onToggleItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onClearCompleted: () => void;
  onClearAll: () => void;
  onAddItem: (name: string, amount: string, category: ShoppingItemCategory, sourceName?: string) => void;
  onImportFromDayPlan: () => void;
  onImportFromPantry: () => void;
  currentDayPlan?: DayMealPlan;
  pantryMissingCount?: number;
}

export const CATEGORY_INFO: Record<ShoppingItemCategory, { label: string; icon: string; color: string; badge: string }> = {
  meat: { label: "Thịt & Trứng", icon: "🥩", color: "text-rose-700 bg-rose-50 border-rose-200", badge: "bg-rose-100 text-rose-800" },
  seafood: { label: "Hải Sản", icon: "🦐", color: "text-sky-700 bg-sky-50 border-sky-200", badge: "bg-sky-100 text-sky-800" },
  veggie: { label: "Rau Củ & Nấm", icon: "🥦", color: "text-emerald-700 bg-emerald-50 border-emerald-200", badge: "bg-emerald-100 text-emerald-800" },
  grain: { label: "Tinh Bột & Bánh Mì", icon: "🍚", color: "text-amber-700 bg-amber-50 border-amber-200", badge: "bg-amber-100 text-amber-800" },
  dairy: { label: "Sữa, Bơ & Phô Mai", icon: "🥛", color: "text-blue-700 bg-blue-50 border-blue-200", badge: "bg-blue-100 text-blue-800" },
  spice: { label: "Gia Vị & Nước Sốt", icon: "🧂", color: "text-orange-700 bg-orange-50 border-orange-200", badge: "bg-orange-100 text-orange-800" },
  fruit: { label: "Trái Cây & Tráng Miệng", icon: "🍎", color: "text-purple-700 bg-purple-50 border-purple-200", badge: "bg-purple-100 text-purple-800" },
  other: { label: "Nhu Yếu Phẩm Khác", icon: "📦", color: "text-slate-700 bg-slate-50 border-slate-200", badge: "bg-slate-100 text-slate-800" }
};

export const ShoppingList: React.FC<ShoppingListProps> = ({
  items,
  onToggleItem,
  onDeleteItem,
  onClearCompleted,
  onClearAll,
  onAddItem,
  onImportFromDayPlan,
  onImportFromPantry,
  currentDayPlan,
  pantryMissingCount = 0
}) => {
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "completed">("all");
  const [newItemName, setNewItemName] = useState<string>("");
  const [newItemAmount, setNewItemAmount] = useState<string>("");
  const [newItemCategory, setNewItemCategory] = useState<ShoppingItemCategory>("veggie");
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Statistics
  const totalCount = items.length;
  const completedCount = items.filter(i => i.checked).length;
  const pendingCount = totalCount - completedCount;
  const percentCompleted = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (filterCategory !== "all" && item.category !== filterCategory) return false;
      if (filterStatus === "pending" && item.checked) return false;
      if (filterStatus === "completed" && !item.checked) return false;
      return true;
    });
  }, [items, filterCategory, filterStatus]);

  // Grouped by Category
  const groupedItems = useMemo(() => {
    const groups: Partial<Record<ShoppingItemCategory, ShoppingListItem[]>> = {};
    filteredItems.forEach(item => {
      const cat = item.category || "other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat]!.push(item);
    });
    return groups;
  }, [filteredItems]);

  // Handle Add Item
  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    onAddItem(
      newItemName.trim(), 
      newItemAmount.trim() || "Vừa đủ", 
      newItemCategory, 
      "Tự thêm"
    );
    setNewItemName("");
    setNewItemAmount("");
  };

  // Generate plain text checklist for clipboard or export
  const generateChecklistText = () => {
    const dateStr = new Date().toLocaleDateString("vi-VN");
    let text = `🛒 DANH SÁCH ĐI CHỢ - HÔM NAY ĂN GÌ\n`;
    text += `📅 Ngày tạo: ${dateStr}\n`;
    text += `📊 Tiến độ: ${completedCount}/${totalCount} món (${percentCompleted}%)\n`;
    text += `-------------------------------------------\n\n`;

    const categories = Object.keys(CATEGORY_INFO) as ShoppingItemCategory[];
    categories.forEach(cat => {
      const catItems = items.filter(i => i.category === cat);
      if (catItems.length > 0) {
        const info = CATEGORY_INFO[cat];
        text += `${info.icon} ${info.label.toUpperCase()}:\n`;
        catItems.forEach(item => {
          const checkMark = item.checked ? "[x]" : "[ ]";
          const src = item.sourceName ? ` (Từ: ${item.sourceName})` : "";
          text += `  ${checkMark} ${item.name} - ${item.amount}${src}\n`;
        });
        text += `\n`;
      }
    });

    text += `-------------------------------------------\n`;
    text += `✨ Được tạo tự động bởi ứng dụng "Hôm Nay Ăn Gì"`;
    return text;
  };

  // Copy plain text to clipboard
  const handleCopyChecklist = async () => {
    try {
      const text = generateChecklistText();
      await navigator.clipboard.writeText(text);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2500);
    } catch {
      // Fallback
    }
  };

  // Download TXT file
  const handleDownloadTxt = () => {
    const text = generateChecklistText();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `danh-sach-di-cho-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Trigger Print View
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-xl text-center md:text-left z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold mb-3">
            <ShoppingCart className="w-4 h-4 text-amber-200" />
            <span>Trợ Lý Đi Chợ Thông Minh • Chống Quên Mua Sắm</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Danh Sách Đi Chợ & Checklist
          </h2>
          <p className="text-xs sm:text-sm text-amber-100 leading-relaxed">
            Tự động tổng hợp chính xác những nguyên liệu còn thiếu từ <strong>Thực đơn 1 ngày</strong> và <strong>Tủ lạnh nhà tôi</strong>. Tick chọn khi đi siêu thị hoặc xuất ra file ghi chú!
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap z-10 shrink-0">
          <button
            onClick={handleCopyChecklist}
            className="px-4 py-2.5 rounded-2xl bg-white text-slate-800 hover:bg-amber-50 text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2 active:scale-95"
            title="Sao chép toàn bộ danh sách dạng văn bản checklist để gửi qua tin nhắn"
          >
            {copyFeedback ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Đã Sao Chép!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-amber-600" />
                <span>Sao Chép Checklist</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-slate-950 hover:bg-black text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2 active:scale-95"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>In / Xuất File</span>
          </button>
        </div>

        <div className="absolute right-4 -bottom-6 text-9xl opacity-15 pointer-events-none select-none hidden sm:block">
          🛒
        </div>
      </div>

      {/* Quick Auto-Compilation Bar */}
      <div className="bg-gradient-to-r from-amber-50 via-white to-orange-50 rounded-3xl border border-amber-200/90 p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                Tự Động Gom Nguyên Liệu Vào Danh Sách
              </h4>
              <p className="text-xs text-slate-500">
                Lấy tự động từ Thực đơn 1 ngày hoặc những món còn thiếu trong Tủ Lạnh Nhà Tôi
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap pt-1">
          {/* Import from today's plan */}
          <button
            onClick={onImportFromDayPlan}
            className="px-4 py-2 rounded-xl bg-white hover:bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300 shadow-2xs transition-all flex items-center gap-2 active:scale-95"
          >
            <CalendarDays className="w-4 h-4 text-amber-600" />
            <span>+ Lấy toàn bộ nguyên liệu từ Thực Đơn Hôm Nay</span>
          </button>

          {/* Import from Pantry Missing */}
          <button
            onClick={onImportFromPantry}
            className="px-4 py-2 rounded-xl bg-white hover:bg-teal-100 text-teal-900 font-bold text-xs border border-teal-300 shadow-2xs transition-all flex items-center gap-2 active:scale-95"
          >
            <Refrigerator className="w-4 h-4 text-teal-600" />
            <span>+ Lấy nguyên liệu còn thiếu từ Tủ Lạnh Nhà Tôi</span>
          </button>
        </div>
      </div>

      {/* Progress & Quick Stats Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Tiến Độ Mua Sắm:
              </span>
              <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                {completedCount}/{totalCount} món ({percentCompleted}%)
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {pendingCount > 0 ? `Còn ${pendingCount} món cần mua` : "Đã hoàn thành 100% danh sách đi chợ! 🎉"}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {completedCount > 0 && (
              <button
                onClick={onClearCompleted}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold transition-colors flex items-center gap-1.5"
                title="Xóa những món đã mua khỏi danh sách"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa món đã mua</span>
              </button>
            )}

            {totalCount > 0 && (
              <button
                onClick={onClearAll}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors flex items-center gap-1.5"
                title="Xóa toàn bộ danh sách"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Xóa hết</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${percentCompleted}%` }}
          />
        </div>

        {/* Add Custom Item Input Bar */}
        <form onSubmit={handleAddCustom} className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
          <div className="grow flex gap-2">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Thêm món cần mua (vd: Dầu hào, sả, hành lá, phô mai...)"
              className="grow px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
            />
            <input
              type="text"
              value={newItemAmount}
              onChange={(e) => setNewItemAmount(e.target.value)}
              placeholder="Định lượng (vd: 500g, 1 chai)"
              className="w-32 sm:w-36 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 shrink-0"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value as ShoppingItemCategory)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-amber-500"
            >
              {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                <option key={key} value={key}>
                  {info.icon} {info.label}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={!newItemName.trim()}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Món</span>
            </button>
          </div>
        </form>

      </div>

      {/* Filter Chips by Category & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status filters */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-bold text-slate-600">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterStatus === "all" ? "bg-white text-slate-900 shadow-2xs font-black" : "hover:text-slate-900"
            }`}
          >
            Tất cả ({totalCount})
          </button>
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterStatus === "pending" ? "bg-white text-slate-900 shadow-2xs font-black" : "hover:text-slate-900"
            }`}
          >
            Chưa mua ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus("completed")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterStatus === "completed" ? "bg-white text-slate-900 shadow-2xs font-black" : "hover:text-slate-900"
            }`}
          >
            Đã mua ({completedCount})
          </button>
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          <button
            onClick={() => setFilterCategory("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterCategory === "all" ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            Tất cả danh mục
          </button>
          {Object.entries(CATEGORY_INFO).map(([key, info]) => {
            const count = items.filter(i => i.category === key).length;
            if (count === 0 && filterCategory !== key) return null;
            return (
              <button
                key={key}
                onClick={() => setFilterCategory(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
                  filterCategory === key 
                    ? "bg-slate-900 text-white shadow-2xs" 
                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                }`}
              >
                <span>{info.icon}</span>
                <span>{info.label.split(" ")[0]} ({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Checklist Items Organized by Category */}
      {items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center text-3xl mx-auto shadow-inner">
            🛒
          </div>
          <div>
            <h4 className="font-extrabold text-base text-slate-800">
              Danh Sách Đi Chợ Hiện Đang Trống
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Bạn có thể bấm các nút gom nguyên liệu ở trên từ <strong>Thực Đơn 1 Ngày</strong> hoặc <strong>Tủ Lạnh Nhà Tôi</strong>, hoặc tự gõ thêm các món bạn cần mua vào ô bên trên!
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onImportFromDayPlan}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors shadow-2xs"
            >
              Gom Nguyên Liệu Thực Đơn Hôm Nay
            </button>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-xs text-slate-500">
          Không có món nào phù hợp với bộ lọc hiện tại.
        </div>
      ) : (
        <div className="space-y-6">
          {(Object.keys(groupedItems) as ShoppingItemCategory[]).map((cat) => {
            const catItems = groupedItems[cat] || [];
            if (catItems.length === 0) return null;
            const info = CATEGORY_INFO[cat];

            return (
              <div key={cat} className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs">
                
                {/* Category Group Header */}
                <div className="p-3.5 sm:p-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{info.icon}</span>
                    <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                      {info.label}
                    </h3>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${info.badge}`}>
                    {catItems.length} món
                  </span>
                </div>

                {/* Items in this category */}
                <div className="divide-y divide-slate-100">
                  {catItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onToggleItem(item.id)}
                      className={`p-3 sm:p-4 flex items-center justify-between gap-3 cursor-pointer select-none transition-colors ${
                        item.checked
                          ? "bg-slate-50/60 text-slate-400"
                          : "hover:bg-amber-50/30 text-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Interactive Checkbox */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleItem(item.id);
                          }}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                            item.checked
                              ? "bg-emerald-500 border-emerald-500 text-white shadow-2xs"
                              : "border-slate-300 bg-white hover:border-amber-400"
                          }`}
                        >
                          {item.checked && <Check className="w-4 h-4 stroke-[3]" />}
                        </button>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs sm:text-sm font-bold ${item.checked ? "line-through text-slate-400" : "text-slate-900"}`}>
                              {item.name}
                            </span>
                            {item.sourceName && (
                              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md hidden sm:inline">
                                {item.sourceName}
                              </span>
                            )}
                          </div>
                          {item.notes && (
                            <span className="text-[11px] text-slate-400 block">
                              {item.notes}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${
                          item.checked 
                            ? "bg-slate-100 text-slate-400 border-slate-200" 
                            : "bg-amber-50 text-amber-900 border-amber-200"
                        }`}>
                          {item.amount}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteItem(item.id);
                          }}
                          className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                          title="Xóa món này"
                        >
                          ×
                        </button>
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Export / Printable Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div 
            className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 border border-slate-200 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-base text-slate-900">
                    Xuất & In Danh Sách Đi Chợ
                  </h4>
                  <p className="text-xs text-slate-500">
                    Bản checklist rõ ràng tiện dụng khi đi mua sắm
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowExportModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            {/* Checklist Preview Box */}
            <div className="overflow-y-auto grow p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed select-all">
              {generateChecklistText()}
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadTxt}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải File .TXT</span>
                </button>

                <button
                  onClick={handleCopyChecklist}
                  className="px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copyFeedback ? "Đã chép!" : "Sao chép"}</span>
                </button>
              </div>

              <button
                onClick={handlePrint}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/25"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In Bản Checklist</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
