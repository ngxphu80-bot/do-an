import React, { useState, useRef, useEffect, useMemo } from "react";
import { Dish, MealType, RegionType, VisualDisplayMode } from "../types";
import { 
  Disc3, Sparkles, ChefHat, RotateCcw, Volume2, VolumeX, 
  ArrowRight, Flame, Search, ExternalLink, Timer, UtensilsCrossed, 
  ChevronDown, ChevronUp, Clock, Shuffle, Check
} from "lucide-react";
import { formatVND } from "../utils/nutritionCalculator";
import { DishIllustration } from "./DishIllustration";

interface WheelOfFortuneProps {
  allDishes: Dish[];
  onSelectDetail: (dish: Dish) => void;
  isSaved: (dish: Dish) => boolean;
  onToggleSave: (dish: Dish) => void;
  displayMode?: VisualDisplayMode;
}

export const WheelOfFortune: React.FC<WheelOfFortuneProps> = ({
  allDishes,
  onSelectDetail,
  isSaved,
  onToggleSave,
  displayMode = "icon"
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [wheelItemCount, setWheelItemCount] = useState<number>(12);
  const [wheelSeed, setWheelSeed] = useState<number>(1);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [selectedWinner, setSelectedWinner] = useState<Dish | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showCookingDetails, setShowCookingDetails] = useState<boolean>(true);
  const [copiedDishName, setCopiedDishName] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationRef = useRef<number>(0);
  const spinVelocityRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Filter and randomly shuffle candidate dishes for the wheel segments
  const wheelDishes = useMemo(() => {
    let pool = allDishes;
    if (categoryFilter === "breakfast") {
      pool = allDishes.filter(d => d.mealTypes.includes("breakfast"));
    } else if (categoryFilter === "main") {
      pool = allDishes.filter(d => d.mealTypes.includes("main"));
    } else if (categoryFilter === "asian") {
      pool = allDishes.filter(d => d.region === "asian");
    } else if (categoryFilter === "western") {
      pool = allDishes.filter(d => d.region === "western");
    } else if (categoryFilter === "snack") {
      pool = allDishes.filter(d => d.mealTypes.includes("snack") || d.mealTypes.includes("dessert"));
    }

    if (pool.length === 0) pool = allDishes;

    // Pseudo-random deterministic shuffle with wheelSeed
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(wheelItemCount, shuffled.length));
  }, [allDishes, categoryFilter, wheelItemCount, wheelSeed]);

  // Reset/Shuffle the dishes on the wheel
  const handleResetWheelDishes = () => {
    if (isSpinning) return;
    setWheelSeed(prev => prev + 1);
    setSelectedWinner(null);
  };

  const colors = [
    "#f97316", "#06b6d4", "#10b981", "#8b5cf6",
    "#f43f5e", "#eab308", "#3b82f6", "#ec4899",
    "#14b8a6", "#f59e0b", "#6366f1", "#84cc16",
    "#d946ef", "#0ea5e9", "#ef4444", "#10b981"
  ];

  // Synthesized Web Audio tick effect
  const playTickSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {
      // Audio context may be restricted by autoplay policy
    }
  };

  const playVictorySound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.4);
      });
    } catch {
      // Ignore
    }
  };

  // Google Image Search handler
  const handleSearchGoogle = (dish: Dish) => {
    navigator.clipboard.writeText(dish.name);
    setCopiedDishName(true);
    setTimeout(() => setCopiedDishName(false), 2500);
    const searchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(dish.name)}`;
    window.open(searchUrl, "_blank", "noopener,noreferrer");
  };

  // Draw the wheel onto HTML Canvas
  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 12;

    ctx.clearRect(0, 0, width, height);

    const numSegments = wheelDishes.length;
    if (numSegments === 0) return;
    const anglePerSegment = (2 * Math.PI) / numSegments;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotationRef.current);

    // Draw slices
    for (let i = 0; i < numSegments; i++) {
      const startAngle = i * anglePerSegment;
      const endAngle = startAngle + anglePerSegment;
      const dish = wheelDishes[i];

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.rotate(startAngle + anglePerSegment / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#ffffff";
      const fontSize = numSegments >= 16 ? 10 : numSegments >= 12 ? 11 : 13;
      ctx.font = `bold ${fontSize}px 'Nunito', sans-serif`;
      ctx.shadowColor = "rgba(0,0,0,0.4)";
      ctx.shadowBlur = 4;
      
      const maxChar = numSegments >= 16 ? 11 : numSegments >= 12 ? 13 : 16;
      const displayName = dish.name.length > maxChar ? dish.name.slice(0, maxChar - 1) + ".." : dish.name;
      ctx.fillText(`${dish.flagEmoji} ${displayName}`, radius - 18, 4);
      ctx.restore();
    }

    // Inner center hub
    ctx.restore();

    // Center circular pin
    ctx.beginPath();
    ctx.arc(centerX, centerY, 24, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#f59e0b";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI);
    ctx.fillStyle = "#d97706";
    ctx.fill();

    // Outer rim
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#fef3c7";
    ctx.stroke();
  };

  useEffect(() => {
    drawWheel();
  }, [wheelDishes]);

  // Handle spin click
  const spinWheel = () => {
    if (isSpinning || wheelDishes.length === 0) return;
    setIsSpinning(true);
    setSelectedWinner(null);

    // Initial random velocity between 0.35 and 0.5 rad/frame
    spinVelocityRef.current = Math.random() * 0.15 + 0.38;
    const deceleration = 0.988; // Gentle friction

    let lastTickAngle = rotationRef.current;
    const anglePerSegment = (2 * Math.PI) / wheelDishes.length;

    const animate = () => {
      rotationRef.current = (rotationRef.current + spinVelocityRef.current) % (2 * Math.PI);
      spinVelocityRef.current *= deceleration;

      // Tick sound check
      if (Math.abs(rotationRef.current - lastTickAngle) >= anglePerSegment / 2) {
        playTickSound();
        lastTickAngle = rotationRef.current;
      }

      drawWheel();

      if (spinVelocityRef.current > 0.002) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Spin finished
        setIsSpinning(false);
        spinVelocityRef.current = 0;

        // Pointer is at the top (angle = 3*PI/2 or -PI/2)
        const pointerAngle = (3 * Math.PI) / 2;
        const normalizedRotation = (rotationRef.current % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        let winningAngle = (pointerAngle - normalizedRotation + 2 * Math.PI) % (2 * Math.PI);
        const winningIndex = Math.floor(winningAngle / anglePerSegment) % wheelDishes.length;

        const winner = wheelDishes[winningIndex];
        setSelectedWinner(winner);
        playVictorySound();
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold mb-2">
            <Disc3 className="w-4 h-4 text-amber-200 animate-spin" />
            <span>Dành Riêng Cho Người Đang Phân Vân</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Vòng Quay May Mắn: Hôm Nay Ăn Gì?
          </h2>
          <p className="text-xs sm:text-sm text-amber-100 leading-relaxed">
            Hàng trăm món ăn ngẫu nhiên xuất hiện trên vòng quay. Bấm nút quay để vũ trụ ẩm thực chọn ngay bữa ăn hoàn hảo cho bạn!
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Reset Dishes Button */}
          <button
            onClick={handleResetWheelDishes}
            disabled={isSpinning}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm active:scale-95 disabled:opacity-50"
            title="Đổi một bộ món ăn ngẫu nhiên mới lên vòng quay"
          >
            <Shuffle className="w-4 h-4 text-amber-200" />
            <span>Đổi Món Mới Trên Vòng</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs font-bold text-white transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? "Bật âm" : "Tắt âm"}</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Categories & Dish Count Chooser */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-amber-100 shadow-2xs">
        
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: "all", label: "Tất Cả Món", icon: "🎲" },
            { id: "breakfast", label: "Bữa Sáng", icon: "🌅" },
            { id: "main", label: "Bữa Chính", icon: "☀️" },
            { id: "asian", label: "Món Á", icon: "🥢" },
            { id: "western", label: "Món Âu", icon: "🍷" },
            { id: "snack", label: "Tráng Miệng", icon: "🍧" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setCategoryFilter(cat.id);
                setSelectedWinner(null);
              }}
              disabled={isSpinning}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all whitespace-nowrap ${
                categoryFilter === cat.id
                  ? "bg-amber-500 text-white shadow-xs scale-102"
                  : "bg-slate-50 text-slate-700 hover:bg-amber-50/70 border border-slate-200/70"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Number of dishes on wheel & Reset button */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-slate-500">Món trên vòng:</span>
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-bold">
            {[8, 12, 16].map((count) => (
              <button
                key={count}
                onClick={() => {
                  setWheelItemCount(count);
                  setSelectedWinner(null);
                }}
                disabled={isSpinning}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  wheelItemCount === count
                    ? "bg-white text-slate-900 shadow-xs font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {count} món
              </button>
            ))}
          </div>

          <button
            onClick={handleResetWheelDishes}
            disabled={isSpinning}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 transition-colors"
            title="Xáo trộn lại món trên vòng quay"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Main Wheel Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Wheel Box */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-amber-100 shadow-sm relative">
          
          {/* Top Indicator Arrow */}
          <div className="relative z-20 -mb-5">
            <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[28px] border-t-amber-600 drop-shadow-md" />
          </div>

          {/* Canvas */}
          <div className="relative p-2 bg-gradient-to-b from-amber-200 to-amber-400 rounded-full shadow-2xl">
            <canvas
              ref={canvasRef}
              width={380}
              height={380}
              className="rounded-full max-w-[320px] sm:max-w-[380px] h-auto"
            />
          </div>

          {/* Spin Trigger Button & Info */}
          <div className="mt-8 flex flex-col items-center gap-3 w-full max-w-sm">
            <button
              id="btn-spin-wheel"
              onClick={spinWheel}
              disabled={isSpinning}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-base sm:text-lg shadow-xl shadow-amber-500/30 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <Sparkles className="w-5 h-5 animate-bounce" />
              <span>{isSpinning ? "Đang Quay Chọn Món..." : "QUAY NGAY HÔM NAY ĂN GÌ!"}</span>
            </button>

            <button
              onClick={handleResetWheelDishes}
              disabled={isSpinning}
              className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 py-1"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Đổi ngẫu nhiên {wheelItemCount} món khác vào vòng quay</span>
            </button>
          </div>

        </div>

        {/* Result Announcement Box with Extended Preparation, Cooking & Chef Tips */}
        <div className="lg:col-span-6">
          {selectedWinner ? (
            <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50 border-2 border-amber-300 rounded-3xl p-5 sm:p-6 shadow-xl animate-fade-in space-y-4">
              
              {/* Header Title */}
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-amber-200/80">
                <div className="flex items-center gap-2.5">
                  <span className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl shadow-md">
                    🎉
                  </span>
                  <div>
                    <h3 className="font-black text-lg sm:text-xl text-slate-900">
                      Món Ăn Vũ Trụ Đã Chọn Cho Bạn!
                    </h3>
                    <p className="text-xs text-amber-800 font-semibold">
                      Khỏi cần đau đầu suy nghĩ nữa — Vào bếp ngay thôi!
                    </p>
                  </div>
                </div>

                <button
                  onClick={spinWheel}
                  disabled={isSpinning}
                  className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Quay lại</span>
                </button>
              </div>

              {/* Main Dish Profile Box */}
              <div className="bg-white rounded-2xl overflow-hidden border border-amber-200 shadow-xs">
                
                {/* Media banner */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                  <DishIllustration
                    dish={selectedWinner}
                    displayMode={displayMode}
                    size="md"
                    showModeToggle={true}
                  />
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 z-10 pointer-events-none">
                    <span>{selectedWinner.flagEmoji}</span>
                    <span>{selectedWinner.country}</span>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm z-10 pointer-events-none">
                    {formatVND(selectedWinner.estimatedCostVND)} (ước tính)
                  </div>
                </div>

                {/* Name, Calories and Quick Stats */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-black text-lg sm:text-xl text-slate-900">
                        {selectedWinner.name}
                      </h4>
                      {selectedWinner.nativeName && (
                        <p className="text-xs text-slate-400 italic">
                          {selectedWinner.nativeName}
                        </p>
                      )}
                    </div>

                    {/* Calories highlight badge */}
                    <div className="bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-2xl text-right shrink-0">
                      <span className="text-[10px] font-bold text-orange-600 block uppercase">Năng lượng</span>
                      <span className="text-base sm:text-lg font-black text-orange-700 flex items-center gap-1">
                        <Flame className="w-4 h-4 text-orange-500" />
                        {selectedWinner.calories} kcal
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedWinner.description}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-xs text-slate-500 flex-wrap">
                    <span className="font-semibold text-slate-700">⏱️ Tổng thời gian: {selectedWinner.prepTimeMinutes + selectedWinner.cookTimeMinutes} phút</span>
                    <span className="font-semibold text-blue-700">💪 Đạm: {selectedWinner.protein}g</span>
                    <span className="font-semibold text-amber-700">🌾 Carb: {selectedWinner.carbs}g</span>
                  </div>

                  {/* Google Image Search helper button */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 flex-wrap gap-2">
                    <button
                      onClick={() => handleSearchGoogle(selectedWinner)}
                      className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 hover:border-amber-300 text-xs font-bold transition-all flex items-center gap-1.5"
                      title="Tìm kiếm hình ảnh món ăn này trên Google Images"
                    >
                      <Search className="w-3.5 h-3.5 text-amber-600" />
                      <span>{copiedDishName ? "Đã copy tên & Đang mở Google..." : "Tìm ảnh trên Google"}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </button>

                    <button
                      onClick={() => onSelectDetail(selectedWinner)}
                      className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <ChefHat className="w-3.5 h-3.5" />
                      <span>Xem Định Lượng Khẩu Phần</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* EXTENDED SECTION: Chi Tiết Chuẩn Bị, Sơ Chế & Nấu */}
              <div className="bg-white rounded-2xl border border-amber-200/90 p-4 space-y-4 shadow-2xs">
                
                <div 
                  onClick={() => setShowCookingDetails(!showCookingDetails)}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4 text-amber-600" />
                    <h5 className="font-black text-sm text-slate-900 uppercase tracking-wide">
                      Mục Thêm: Chi Tiết Chuẩn Bị, Sơ Chế & Nấu
                    </h5>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600">
                    {showCookingDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {showCookingDetails && (
                  <div className="space-y-4 pt-1 animate-fade-in text-xs">
                    
                    {/* 1. Hướng dẫn sơ chế nguyên liệu & khử tanh */}
                    <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-3.5 space-y-1.5">
                      <div className="font-bold text-amber-950 flex items-center gap-1.5">
                        <span>🥕</span>
                        <span>Hướng dẫn sơ chế & làm sạch nguyên liệu:</span>
                      </div>
                      <ul className="text-slate-700 space-y-1 list-disc list-inside leading-relaxed">
                        <li><strong className="text-slate-900">Khử mùi tanh:</strong> Rửa sạch thịt/cá với nước muối loãng pha chút gừng đập dập hoặc rượu trắng 5-10 phút rồi thấm khô.</li>
                        <li><strong className="text-slate-900">Thái thịt:</strong> Thái ngang thớ mỏng đối với các món xào, thái quân cờ dày đối with món kho/hầm.</li>
                        <li><strong className="text-slate-900">Ướp gia vị:</strong> Ướp thịt/cá ít nhất 15-20 phút với chút tiêu sọ, hành tím băm và nước mắm ngon để ngấm đậm đà.</li>
                      </ul>
                    </div>

                    {/* 2. Bảng thời gian & nhiệt độ chuẩn xác */}
                    <div className="bg-orange-50/70 border border-orange-200/70 rounded-xl p-3.5 space-y-2">
                      <div className="font-bold text-orange-950 flex items-center gap-1.5">
                        <Timer className="w-3.5 h-3.5 text-orange-600" />
                        <span>Thời gian & Nhiệt độ nấu chuẩn xác:</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-slate-700">
                        <div className="bg-white p-2 rounded-lg border border-orange-200/80">
                          <span className="block font-bold text-orange-800">🍖 Luộc thịt:</span>
                          <span>15 - 20 phút (lửa vừa)</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-orange-200/80">
                          <span className="block font-bold text-orange-800">🥩 Nướng thịt/cá:</span>
                          <span>180°C - 200°C (15 - 22 phút)</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-orange-200/80">
                          <span className="block font-bold text-orange-800">🍳 Xào / Áp chảo:</span>
                          <span>3 - 5 phút (lửa lớn đảo nhanh)</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-orange-200/80">
                          <span className="block font-bold text-orange-800">🍲 Hầm / Nấu canh:</span>
                          <span>20 - 35 phút (lửa nhỏ liu riu)</span>
                        </div>
                      </div>
                    </div>

                    {/* 3. Chi tiết các bước nấu cụ thể */}
                    <div className="space-y-2">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>🍳</span>
                        <span>Các bước nấu cụ thể ({selectedWinner.steps.length} bước):</span>
                      </div>

                      <div className="space-y-2">
                        {selectedWinner.steps.map((st, i) => (
                          <div key={i} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                            <div className="flex items-center justify-between font-bold text-slate-800">
                              <span className="flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center">
                                  {st.step}
                                </span>
                                <span>{st.title}</span>
                              </span>
                              {st.timeMinutes && (
                                <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {st.timeMinutes} phút
                                </span>
                              )}
                            </div>
                            <p className="text-slate-600 pl-6 leading-relaxed">
                              {st.instruction}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 4. Mẹo đầu bếp nêm nếm đậm đà */}
                    {selectedWinner.chefTips && (
                      <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 space-y-1">
                        <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Mẹo đầu bếp giúp món ăn ngon và đậm đà hơn:</span>
                        </div>
                        <p className="text-emerald-900 leading-relaxed font-medium">
                          {selectedWinner.chefTips}
                        </p>
                      </div>
                    )}

                  </div>
                )}

              </div>

            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-dashed border-amber-200 p-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center text-3xl mx-auto shadow-inner">
                🎯
              </div>
              <h4 className="font-bold text-slate-800 text-base">
                Chưa biết chọn món gì?
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                Bấm nút &quot;QUAY NGAY HÔM NAY ĂN GÌ&quot; hoặc bấm &quot;Đổi Món Mới Trên Vòng&quot; để hệ thống bốc thăm ngẫu nhiên một món ăn ngon từ ẩm thực thế giới!
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
