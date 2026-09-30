// src/components/DishIllustration.tsx
import React, { useState } from "react";
import { Dish, VisualDisplayMode } from "../types";
import { getDishIconData } from "../utils/dishIconHelper";
import { getEffectiveDishImageUrl } from "../utils/customImageStore";
import { 
  Soup, Utensils, Flame, Fish, Wheat, Pizza, 
  Salad, Egg, Sparkles, Coffee, Apple, Camera, Palette 
} from "lucide-react";

interface DishIllustrationProps {
  dish: Dish;
  displayMode?: VisualDisplayMode;
  size?: "sm" | "md" | "lg" | "hero";
  className?: string;
  showModeToggle?: boolean;
  onToggleMode?: () => void;
  roundedClassName?: string;
}

export const DishIllustration: React.FC<DishIllustrationProps> = ({
  dish,
  displayMode = "icon",
  size = "md",
  className = "",
  showModeToggle = false,
  onToggleMode,
  roundedClassName = "rounded-none"
}) => {
  const [imgError, setImgError] = useState<boolean>(false);
  const iconData = getDishIconData(dish);

  // Render matching Lucide Icon
  const renderLucideIcon = () => {
    const iconProps = { className: "w-3.5 h-3.5" };
    switch (iconData.lucideIconName) {
      case "Soup": return <Soup {...iconProps} />;
      case "Flame": return <Flame {...iconProps} />;
      case "Fish": return <Fish {...iconProps} />;
      case "Wheat": return <Wheat {...iconProps} />;
      case "Pizza": return <Pizza {...iconProps} />;
      case "Salad": return <Salad {...iconProps} />;
      case "Egg": return <Egg {...iconProps} />;
      case "Coffee": return <Coffee {...iconProps} />;
      case "Apple": return <Apple {...iconProps} />;
      case "Sparkles": return <Sparkles {...iconProps} />;
      case "Utensils":
      default:
        return <Utensils {...iconProps} />;
    }
  };

  // Size styling configuration
  const emojiSizeClass = {
    sm: "text-3xl sm:text-4xl",
    md: "text-5xl sm:text-6xl",
    lg: "text-6xl sm:text-7xl",
    hero: "text-7xl sm:text-8xl"
  }[size];

  // If in Photo mode and image hasn't errored out
  if (displayMode === "photo" && !imgError) {
    return (
      <div className={`relative w-full h-full overflow-hidden bg-slate-100 ${roundedClassName} ${className}`}>
        <img
          src={getEffectiveDishImageUrl(dish)}
          alt={dish.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Mini Food Icon badge on photo */}
        <div className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1.5 pointer-events-auto">
          <span 
            className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-sm shadow-sm border border-white/20"
            title={`Biểu tượng: ${iconData.categoryLabel}`}
          >
            {iconData.emoji}
          </span>
          {showModeToggle && onToggleMode && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleMode();
              }}
              className="px-2 py-1 rounded-full bg-amber-500/90 hover:bg-amber-500 text-white text-[10px] font-bold shadow-md flex items-center gap-1 transition-all"
              title="Chuyển sang xem Biểu tượng Icon"
            >
              <Palette className="w-3 h-3" />
              <span className="hidden sm:inline">Icon</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Primary "Icon Minh Họa" Mode
  return (
    <div 
      className={`relative w-full h-full overflow-hidden select-none flex flex-col items-center justify-center ${roundedClassName} ${className}`}
      style={{
        background: `linear-gradient(145deg, #18181b 0%, #09090b 100%)`
      }}
    >
      {/* Dynamic Colored Ambient Glow matching food archetype */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none transition-opacity duration-300 group-hover:opacity-60"
        style={{
          background: `radial-gradient(circle at 50% 45%, ${iconData.colorScheme.glowColor} 0%, transparent 70%)`
        }}
      />

      {/* Decorative concentric culinary rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="w-36 h-36 rounded-full border border-white/10" />
        <div className="w-52 h-52 rounded-full border border-dashed border-white/10 absolute" />
      </div>

      {/* Floating Steam / Aroma Accent if hot dish */}
      {iconData.steamAroma && size !== "sm" && (
        <div className="absolute top-4 flex items-center gap-1 text-white/30 text-xs pointer-events-none">
          <span className="animate-pulse">♨️</span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">Nóng hổi</span>
        </div>
      )}

      {/* Centerpiece Food Icon / Emoji */}
      <div className="relative z-10 flex flex-col items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
        <span 
          className={`${emojiSizeClass} filter drop-shadow-xl transition-all duration-300`}
          role="img" 
          aria-label={dish.name}
        >
          {iconData.emoji}
        </span>

        {/* Category Label Pill */}
        {size !== "sm" && (
          <div className="mt-2.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white shadow-xs">
            <span className="text-amber-400">
              {renderLucideIcon()}
            </span>
            <span className="text-[11px] font-bold text-slate-200 tracking-tight whitespace-nowrap">
              {iconData.categoryLabel}
            </span>
          </div>
        )}
      </div>

      {/* Subtle Subtype hint on hover or large sizes */}
      {size === "hero" && (
        <p className="relative z-10 text-xs text-slate-400 mt-2 font-medium">
          {iconData.subType}
        </p>
      )}

      {/* Quick Mode Toggle on top/bottom corner */}
      {showModeToggle && onToggleMode && (
        <div className="absolute bottom-2.5 right-2.5 z-20 pointer-events-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleMode();
            }}
            className="px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white text-[10px] font-bold backdrop-blur-md border border-white/20 shadow-md flex items-center gap-1 transition-all"
            title="Xem ảnh chụp thực tế"
          >
            <Camera className="w-3 h-3 text-amber-300" />
            <span className="hidden sm:inline">Ảnh chụp</span>
          </button>
        </div>
      )}
    </div>
  );
};
