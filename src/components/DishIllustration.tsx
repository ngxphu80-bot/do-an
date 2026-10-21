// src/components/DishIllustration.tsx
import React from "react";
import { Dish } from "../types";
import { getDishIconData } from "../utils/dishIconHelper";
import { 
  Soup, Utensils, Flame, Fish, Wheat, Pizza, 
  Salad, Egg, Sparkles, Coffee, Apple 
} from "lucide-react";

interface DishIllustrationProps {
  dish: Dish;
  size?: "sm" | "md" | "lg" | "hero";
  className?: string;
  roundedClassName?: string;
  displayMode?: string; // Keep for backward compatibility
  showModeToggle?: boolean;
  onToggleMode?: () => void;
}

export const DishIllustration: React.FC<DishIllustrationProps> = ({
  dish,
  size = "md",
  className = "",
  roundedClassName = "rounded-none"
}) => {
  const iconData = getDishIconData(dish);

  // Render matching Lucide Icon for category badge
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

  const discSizeClass = {
    sm: "w-16 h-16",
    md: "w-28 h-28",
    lg: "w-36 h-36",
    hero: "w-44 h-44"
  }[size];

  // Distinct gourmet culinary theme gradients (Light & Vibrant instead of dark gloom)
  const getGourmetTheme = () => {
    switch (iconData.lucideIconName) {
      case "Soup":
        return {
          bg: "bg-gradient-to-br from-amber-100 via-orange-50 to-amber-200/70 border-amber-200",
          disc: "bg-white/90 shadow-md border border-amber-200/90",
          accentColor: "text-amber-800",
          tagBg: "bg-amber-500/90 text-white",
          glow: "rgba(245, 158, 11, 0.25)"
        };
      case "Flame":
        return {
          bg: "bg-gradient-to-br from-orange-100 via-rose-50 to-red-100/70 border-orange-200",
          disc: "bg-white/90 shadow-md border border-orange-200/90",
          accentColor: "text-orange-900",
          tagBg: "bg-orange-600 text-white",
          glow: "rgba(234, 88, 12, 0.25)"
        };
      case "Fish":
        return {
          bg: "bg-gradient-to-br from-cyan-100 via-sky-50 to-teal-100/70 border-cyan-200",
          disc: "bg-white/90 shadow-md border border-cyan-200/90",
          accentColor: "text-cyan-900",
          tagBg: "bg-cyan-600 text-white",
          glow: "rgba(6, 182, 212, 0.25)"
        };
      case "Salad":
        return {
          bg: "bg-gradient-to-br from-emerald-100 via-teal-50 to-lime-100/70 border-emerald-200",
          disc: "bg-white/90 shadow-md border border-emerald-200/90",
          accentColor: "text-emerald-900",
          tagBg: "bg-emerald-600 text-white",
          glow: "rgba(16, 185, 129, 0.25)"
        };
      case "Wheat":
      case "Pizza":
        return {
          bg: "bg-gradient-to-br from-yellow-100 via-amber-50 to-orange-100/70 border-yellow-200",
          disc: "bg-white/90 shadow-md border border-yellow-200/90",
          accentColor: "text-amber-950",
          tagBg: "bg-amber-600 text-white",
          glow: "rgba(217, 119, 6, 0.25)"
        };
      case "Apple":
      case "Coffee":
        return {
          bg: "bg-gradient-to-br from-rose-100 via-pink-50 to-amber-100/70 border-rose-200",
          disc: "bg-white/90 shadow-md border border-rose-200/90",
          accentColor: "text-rose-900",
          tagBg: "bg-rose-500 text-white",
          glow: "rgba(244, 63, 94, 0.25)"
        };
      default:
        return {
          bg: "bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100/70 border-amber-200",
          disc: "bg-white/90 shadow-md border border-amber-200/90",
          accentColor: "text-slate-800",
          tagBg: "bg-amber-600 text-white",
          glow: "rgba(245, 158, 11, 0.2)"
        };
    }
  };

  const theme = getGourmetTheme();

  return (
    <div 
      className={`relative w-full h-full overflow-hidden select-none flex flex-col items-center justify-center border transition-all duration-300 ${theme.bg} ${roundedClassName} ${className}`}
    >
      {/* Soft Ambient Light Glow */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none transition-opacity duration-300 group-hover:opacity-75"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${theme.glow} 0%, transparent 70%)`
        }}
      />

      {/* Decorative Culinary Plate / Platter Base */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className={`${discSizeClass} rounded-full ${theme.disc} flex items-center justify-center transition-transform duration-300 group-hover:scale-105`}>
          <div className="w-5/6 h-5/6 rounded-full border border-dashed border-slate-300/60" />
        </div>
      </div>

      {/* Floating Steaming Aroma / Hot Soup Indicator */}
      {iconData.steamAroma && size !== "sm" && (
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded-full border border-amber-200/80 shadow-2xs text-[10px] font-bold text-amber-800 pointer-events-none animate-pulse">
          <span>♨️</span>
          <span>Nóng hổi</span>
        </div>
      )}

      {/* Centerpiece 3D Food Emoji Icon (Highly recognizable & appetizing) */}
      <div className="relative z-10 flex flex-col items-center justify-center transform group-hover:scale-115 transition-transform duration-300 ease-out">
        <span 
          className={`${emojiSizeClass} filter drop-shadow-lg transition-transform duration-300`}
          role="img" 
          aria-label={dish.name}
        >
          {iconData.emoji}
        </span>

        {/* Category Label Pill */}
        {size !== "sm" && (
          <div className={`mt-2 flex items-center gap-1 px-2.5 py-0.5 rounded-full ${theme.tagBg} shadow-xs text-[11px] font-extrabold tracking-tight`}>
            <span>{renderLucideIcon()}</span>
            <span className="whitespace-nowrap">{iconData.categoryLabel}</span>
          </div>
        )}
      </div>

      {/* Bottom Subtype Indicator for Larger Sizes */}
      {size === "hero" && (
        <div className="relative z-10 text-xs font-bold text-slate-600 mt-2 flex items-center gap-1.5 bg-white/80 backdrop-blur-xs px-3 py-1 rounded-full border border-slate-200">
          <span>{dish.flagEmoji}</span>
          <span>{iconData.subType}</span>
        </div>
      )}
    </div>
  );
};
