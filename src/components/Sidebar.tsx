// src/components/Sidebar.tsx
import React, { useRef, useState, useEffect } from "react";
import { 
  Utensils, CalendarDays, Refrigerator, Disc3, HeartPulse, 
  Bookmark, Sparkles, ShoppingCart, BookOpen, Upload, Menu, X, 
  Clock, Camera, Palette, ChevronRight
} from "lucide-react";
import { VisualDisplayMode, UserHealthProfile } from "../types";
import { getCurrentTimeOfDayInfo, TimeOfDayInfo } from "../utils/timeOfDayHelper";

export type ActiveTabType = "explore" | "daily_plan" | "pantry" | "wheel" | "health" | "saved" | "shopping" | "diary";

interface SidebarProps {
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  savedCount: number;
  shoppingCount?: number;
  diaryCount?: number;
  openHealthModal: () => void;
  totalDishesCount: number;
  visualMode?: VisualDisplayMode;
  onToggleVisualMode?: (mode: VisualDisplayMode) => void;
  customLogo?: string;
  onUploadLogo?: (logoUrl: string) => void;
  userProfile?: UserHealthProfile;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  shoppingCount = 0,
  diaryCount = 0,
  openHealthModal,
  totalDishesCount,
  visualMode = "photo",
  onToggleVisualMode,
  customLogo,
  onUploadLogo,
  userProfile
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [timeInfo, setTimeInfo] = useState<TimeOfDayInfo>(() => getCurrentTimeOfDayInfo());
  const [currentTimeStr, setCurrentTimeStr] = useState<string>(() => {
    return new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  });

  // Update real-time clock every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeInfo(getCurrentTimeOfDayInfo());
      setCurrentTimeStr(new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }));
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const navItems: { 
    id: ActiveTabType; 
    label: string; 
    icon: React.ReactNode; 
    badge?: string; 
    subtext?: string;
  }[] = [
    { 
      id: "explore", 
      label: "Khám Phá", 
      icon: <Utensils className="w-5 h-5" />, 
      badge: `${totalDishesCount}+`,
      subtext: "Kho tàng 500+ món ngon thế giới" 
    },
    { 
      id: "daily_plan", 
      label: "Thực Đơn 1 Ngày", 
      icon: <CalendarDays className="w-5 h-5" />,
      subtext: "Lập thực đơn 5 cữ chuẩn calo"
    },
    { 
      id: "diary", 
      label: "Nhật Ký Ăn Uống", 
      icon: <BookOpen className="w-5 h-5" />, 
      badge: diaryCount > 0 ? `${diaryCount} ngày` : undefined,
      subtext: "Theo dõi lịch sử calo & ghi chú món" 
    },
    { 
      id: "pantry", 
      label: "Tủ Lạnh Thông Minh", 
      icon: <Refrigerator className="w-5 h-5" />,
      subtext: "Nấu theo đồ sẵn có & gợi ý thay thế"
    },
    { 
      id: "wheel", 
      label: "Vòng Quay Ăn Gì", 
      icon: <Disc3 className="w-5 h-5" />,
      subtext: "Giải cứu nỗi đắn đo bữa ăn"
    },
    { 
      id: "saved", 
      label: "Món Đã Lưu", 
      icon: <Bookmark className="w-5 h-5" />, 
      badge: savedCount > 0 ? `${savedCount}` : undefined,
      subtext: "Bộ sưu tập món ăn yêu thích"
    },
    { 
      id: "shopping", 
      label: "Danh Sách Đi Chợ", 
      icon: <ShoppingCart className="w-5 h-5" />, 
      badge: shoppingCount > 0 ? `${shoppingCount}` : undefined,
      subtext: "Checklist nguyên liệu cần mua"
    },
    { 
      id: "health", 
      label: "Tính Calo BMR / TDEE", 
      icon: <HeartPulse className="w-5 h-5" />,
      subtext: `${userProfile?.targetDailyCalories || 2000} kcal/ngày`
    },
  ];

  const handleSelectTab = (tab: ActiveTabType) => {
    if (tab === "health") {
      openHealthModal();
    } else {
      setActiveTab(tab);
    }
    setMobileOpen(false);
  };

  const renderNavContent = () => (
    <div className="flex flex-col h-full justify-between">
      {/* Top Branding Section */}
      <div className="space-y-4">
        {/* Brand Header: Logo nguyên bản không cắt chỉnh chi tiết */}
        <div 
          onClick={() => handleSelectTab("explore")}
          className="flex items-center gap-3 cursor-pointer group p-2 rounded-2xl hover:bg-amber-50/70 transition-all select-none"
        >
          <div className="relative group/logo shrink-0 flex items-center justify-center">
            <img
              src={customLogo || "/app-logo.jpg"}
              alt="Logo Hôm Nay Ăn Gì"
              className="h-11 w-auto max-h-12 max-w-[56px] object-contain select-none"
              referrerPolicy="no-referrer"
            />
            {onUploadLogo && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="absolute -bottom-1 -right-1 p-1 bg-white hover:bg-amber-50 text-slate-500 hover:text-amber-600 rounded-full shadow-md border border-slate-200 opacity-0 group-hover/logo:opacity-100 transition-opacity"
                title="Tải ảnh logo trực tiếp lên (PNG/JPG)"
              >
                <Upload className="w-3 h-3" />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && onUploadLogo) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    if (typeof reader.result === "string") {
                      onUploadLogo(reader.result);
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg text-slate-900 tracking-tight leading-none">
                Hôm Nay Ăn Gì?
              </span>
            </div>
            <p className="text-[11px] font-semibold text-amber-600 mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Chuyên Gia Dinh Dưỡng</span>
            </p>
          </div>
        </div>

        {/* Real-Time Meal Indicator Widget (Đúng thời điểm & thời gian ăn) */}
        <div 
          onClick={() => handleSelectTab("explore")}
          className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-200/80 cursor-pointer hover:border-amber-400 transition-all select-none group"
          title="Bấm để xem các món ăn thích hợp nhất vào thời điểm này"
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{currentTimeStr}</span>
            </span>
            <span className="text-[10px] font-extrabold bg-amber-500 text-white px-2 py-0.5 rounded-full shadow-2xs">
              {timeInfo.icon} {timeInfo.period === "breakfast" ? "Giờ Sáng" : timeInfo.period === "lunch" ? "Giờ Trưa" : timeInfo.period === "afternoon" ? "Giờ Xế" : timeInfo.period === "dinner" ? "Giờ Tối" : "Giờ Khuya"}
            </span>
          </div>
          <p className="text-[11px] font-extrabold text-amber-900 line-clamp-1 group-hover:text-amber-700">
            {timeInfo.title}
          </p>
          <span className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 block">
            {timeInfo.highlightCategory} ({timeInfo.timeRangeStr})
          </span>
        </div>

        {/* Vertical Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-left transition-all group ${
                  isActive
                    ? "bg-amber-500 text-white font-black shadow-md shadow-amber-500/25 ring-2 ring-amber-400/40"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-bold"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? "text-white" : "text-amber-600"
                  }`}>
                    {item.icon}
                  </span>
                  <div className="truncate">
                    <span className="text-sm block truncate leading-tight">
                      {item.label}
                    </span>
                    {item.subtext && (
                      <span className={`text-[10px] block truncate mt-0.5 font-normal ${
                        isActive ? "text-amber-100" : "text-slate-400"
                      }`}>
                        {item.subtext}
                      </span>
                    )}
                  </div>
                </div>

                {item.badge && (
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ml-1.5 ${
                    isActive
                      ? "bg-white text-amber-800"
                      : "bg-amber-100 text-amber-800"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Preferences & Quick Actions */}
      <div className="pt-4 border-t border-slate-200/80 space-y-2.5">
        {/* Visual Display Mode Toggle */}
        {onToggleVisualMode && (
          <div className="bg-slate-100 p-1 rounded-xl flex items-center justify-between text-xs">
            <span className="text-[11px] font-bold text-slate-600 pl-2">Hiển thị:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onToggleVisualMode("photo")}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all ${
                  visualMode === "photo" 
                    ? "bg-white text-slate-900 shadow-2xs font-extrabold" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Camera className="w-3 h-3 text-amber-600" />
                <span>Ảnh</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleVisualMode("icon")}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all ${
                  visualMode === "icon" 
                    ? "bg-white text-slate-900 shadow-2xs font-extrabold" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Palette className="w-3 h-3 text-amber-600" />
                <span>Vẽ</span>
              </button>
            </div>
          </div>
        )}

        {/* Health Profile Status Chip */}
        <div 
          onClick={openHealthModal}
          className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 cursor-pointer flex items-center justify-between transition-colors select-none"
        >
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="text-left">
              <span className="text-[10px] font-bold uppercase text-emerald-800 block">Mục Tiêu Calo</span>
              <span className="text-xs font-black text-emerald-950">
                {userProfile?.targetDailyCalories || 2000} kcal/ngày
              </span>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-emerald-700" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ========================================================= */}
      {/* DESKTOP VERTICAL SIDEBAR (Cố định ở lề bên trái màn hình) */}
      {/* ========================================================= */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 bottom-0 w-64 lg:w-72 bg-white border-r border-amber-100/90 z-40 p-4 lg:p-5 shadow-xs overflow-y-auto">
        {renderNavContent()}
      </aside>

      {/* ========================================================= */}
      {/* MOBILE COMPACT TOP BAR & SLIDE-OUT DRAWER                 */}
      {/* ========================================================= */}
      <header className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-1 text-slate-700 hover:bg-slate-100 rounded-xl"
            aria-label="Mở Menu"
          >
            <Menu className="w-5 h-5 text-amber-600" />
          </button>

          <div 
            onClick={() => handleSelectTab("explore")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <img
              src={customLogo || "/app-logo.jpg"}
              alt="Logo Hôm Nay Ăn Gì"
              className="h-8 w-auto max-h-8 max-w-[40px] object-contain"
              referrerPolicy="no-referrer"
            />
            <span className="font-black text-base text-slate-900 tracking-tight">Hôm Nay Ăn Gì?</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full flex items-center gap-1">
            <span>{timeInfo.icon}</span>
            <span>{currentTimeStr}</span>
          </span>
        </div>
      </header>

      {/* Mobile Slide-out Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex animate-fadeIn">
          <div 
            className="w-72 max-w-[85vw] bg-white h-full p-4 overflow-y-auto shadow-2xl animate-slideRight flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end pb-1">
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderNavContent()}
          </div>

          <div 
            className="grow h-full"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}

      {/* Mobile Bottom Quick Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-amber-100 flex items-center justify-around py-1.5 px-2 shadow-lg">
        {[
          { id: "explore" as const, label: "Khám Phá", icon: <Utensils className="w-4 h-4" /> },
          { id: "daily_plan" as const, label: "Thực Đơn", icon: <CalendarDays className="w-4 h-4" /> },
          { id: "diary" as const, label: "Nhật Ký", icon: <BookOpen className="w-4 h-4" />, badge: diaryCount },
          { id: "pantry" as const, label: "Tủ Lạnh", icon: <Refrigerator className="w-4 h-4" /> },
          { id: "shopping" as const, label: "Đi Chợ", icon: <ShoppingCart className="w-4 h-4" />, badge: shoppingCount },
        ].map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold relative transition-colors ${
                isActive ? "text-amber-600 bg-amber-50" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span className="relative">
                {item.icon}
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2 w-3.5 h-3.5 bg-amber-500 text-white rounded-full text-[8px] flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                )}
              </span>
              <span className="mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};
