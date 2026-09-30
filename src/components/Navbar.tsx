import React from "react";
import { Utensils, CalendarDays, Refrigerator, Disc3, HeartPulse, Bookmark, Sparkles, Palette, Camera } from "lucide-react";
import { VisualDisplayMode } from "../types";

export type ActiveTabType = "explore" | "daily_plan" | "pantry" | "wheel" | "health" | "saved";

interface NavbarProps {
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  savedCount: number;
  openHealthModal: () => void;
  totalDishesCount: number;
  visualMode?: VisualDisplayMode;
  onToggleVisualMode?: (mode: VisualDisplayMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  openHealthModal,
  totalDishesCount,
  visualMode = "icon",
  onToggleVisualMode
}) => {
  const navItems: { id: ActiveTabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "explore", label: "Khám Phá Món", icon: <Utensils className="w-4 h-4" />, badge: `${totalDishesCount}+` },
    { id: "daily_plan", label: "Thực Đơn 1 Ngày", icon: <CalendarDays className="w-4 h-4" /> },
    { id: "pantry", label: "Tủ Lạnh Nhà Tôi", icon: <Refrigerator className="w-4 h-4" /> },
    { id: "wheel", label: "Vòng Quay May Mắn", icon: <Disc3 className="w-4 h-4" />, badge: "Vui nhộn" },
    { id: "health", label: "Dinh Dưỡng & TDEE", icon: <HeartPulse className="w-4 h-4" /> },
    { id: "saved", label: "Đã Lưu & Đi Chợ", icon: <Bookmark className="w-4 h-4" />, badge: savedCount > 0 ? `${savedCount}` : undefined },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-amber-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo Brand */}
          <div 
            onClick={() => setActiveTab("explore")}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-linear-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform">
              <span className="text-xl sm:text-2xl">🍲</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl text-slate-800 tracking-tight">Hôm Nay Ăn Gì?</span>
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  500+ Món
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Chuyên gia gợi ý thực đơn thế giới & cân bằng calo</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => {
                    if (item.id === "health") {
                      openHealthModal();
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-amber-500 text-white shadow-sm shadow-amber-500/30"
                      : "text-slate-600 hover:text-amber-600 hover:bg-amber-50"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? "bg-white/25 text-white"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Action Profile & Visual Mode buttons */}
          <div className="flex items-center gap-2">
            {onToggleVisualMode && (
              <button
                type="button"
                onClick={() => onToggleVisualMode(visualMode === "icon" ? "photo" : "icon")}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  visualMode === "icon"
                    ? "bg-amber-100/80 text-amber-900 border-amber-300"
                    : "bg-slate-100 text-slate-700 border-slate-200"
                }`}
                title={`Chuyển chế độ hiển thị (hiện tại: ${visualMode === "icon" ? "Biểu tượng Icon" : "Ảnh chụp thực tế"})`}
              >
                {visualMode === "icon" ? (
                  <>
                    <Palette className="w-3.5 h-3.5 text-amber-600" />
                    <span className="hidden sm:inline">Icon Minh Họa</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-3.5 h-3.5 text-slate-600" />
                    <span className="hidden sm:inline">Ảnh Chụp</span>
                  </>
                )}
              </button>
            )}

            <button
              id="btn-quick-health-profile"
              onClick={openHealthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors"
              title="Cài đặt mục tiêu sức khỏe & Calo cá nhân"
            >
              <HeartPulse className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Tính Calo Chuẩn</span>
            </button>
          </div>

        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden flex items-center justify-between overflow-x-auto py-2 border-t border-slate-100 gap-1 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-tab-${item.id}`}
                onClick={() => {
                  if (item.id === "health") {
                    openHealthModal();
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                  isActive
                    ? "text-amber-600 font-bold bg-amber-50"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span className="mb-0.5">{item.icon}</span>
                <span className="text-[11px] whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
