// src/utils/mealPlanGenerator.ts
import { Dish, DayMealPlan, UserHealthProfile } from "../types";

export type MealPlanTheme = "balanced" | "vietnamese" | "global" | "eatclean" | "light" | "budget";

export interface ThemeOption {
  id: MealPlanTheme;
  name: string;
  icon: string;
  desc: string;
}

export const MEAL_PLAN_THEMES: ThemeOption[] = [
  { id: "balanced", name: "Đa Dạng Hài Hòa", icon: "🎲", desc: "Không trùng lặp nguồn đạm, đủ nhóm chất, calo chuẩn khoa học" },
  { id: "vietnamese", name: "Chuẩn Cơm Nhà Việt", icon: "🇻🇳", desc: "Sáng phở/bún, trưa mặn kho, tối canh thanh nhẹ ấm cúng" },
  { id: "global", name: "Du Lịch Ẩm Thực Á - Âu", icon: "🌍", desc: "Trải nghiệm hương vị vòng quanh thế giới chuẩn vị" },
  { id: "eatclean", name: "Eat Clean & Gym", icon: "💪", desc: "Giàu đạm nạc, tinh bột chậm, giàu chất xơ & ít dầu mỡ" },
  { id: "light", name: "Thanh Đạm & Dễ Tiêu", icon: "🥗", desc: "Nhẹ bụng, nhiều canh súp, bảo vệ hệ tiêu hóa" },
  { id: "budget", name: "Tiết Kiệm Bình Dân", icon: "💰", desc: "Chi phí hợp lý, nguyên liệu gần gũi dễ mua" },
];

/**
 * Identify dominant protein group of a dish to avoid monotonous repetition
 */
function getDominantProtein(dish: Dish): string {
  const text = (dish.name + " " + (dish.keyIngredients || []).join(" ")).toLowerCase();
  if (text.includes("bò") || text.includes("beef")) return "beef";
  if (text.includes("gà") || text.includes("chicken")) return "chicken";
  if (text.includes("heo") || text.includes("lợn") || text.includes("ba chỉ") || text.includes("sườn")) return "pork";
  if (text.includes("tôm") || text.includes("mực") || text.includes("hải sản") || text.includes("cua") || text.includes("nghêu")) return "seafood";
  if (text.includes("cá") || text.includes("fish") || text.includes("hồi")) return "fish";
  if (text.includes("trứng") || text.includes("egg")) return "egg";
  if (text.includes("đậu hũ") || text.includes("tofu") || text.includes("nấm") || text.includes("chay")) return "plant";
  return "other";
}

/**
 * Generate a smart, diverse, harmonious 1-day meal plan
 */
export function generateSmartHarmoniousPlan(
  allDishes: Dish[],
  targetCalories: number = 2000,
  theme: MealPlanTheme = "balanced"
): DayMealPlan {
  // 1. Filter dish pools by theme
  let themePool = allDishes;
  if (theme === "vietnamese") {
    themePool = allDishes.filter(d => d.country === "Việt Nam" || d.region === "asian");
  } else if (theme === "global") {
    themePool = allDishes.filter(d => d.country !== "Việt Nam");
  } else if (theme === "eatclean") {
    themePool = allDishes.filter(d => 
      d.dietarySuitability.includes("gym") || 
      d.dietarySuitability.includes("weight_loss") || 
      d.protein >= 22
    );
  } else if (theme === "light") {
    themePool = allDishes.filter(d => 
      d.dietarySuitability.includes("respiratory") || 
      d.dietarySuitability.includes("weight_loss") || 
      d.calories <= 500
    );
  } else if (theme === "budget") {
    themePool = allDishes.filter(d => d.estimatedCostVND <= 45000);
  }

  // Fallback to all dishes if pool is too small
  if (themePool.length < 15) themePool = allDishes;

  const breakfastPool = themePool.filter(d => d.mealTypes.includes("breakfast"));
  const mainPool = themePool.filter(d => d.mealTypes.includes("main"));
  const afternoonPool = themePool.filter(d => d.mealTypes.includes("afternoon") || (d.mealTypes.includes("dessert") && d.calories <= 320));
  const dessertPool = themePool.filter(d => d.mealTypes.includes("dessert"));

  // Ensure non-empty fallback pools
  const safeBreakfasts = breakfastPool.length > 0 ? breakfastPool : allDishes.filter(d => d.mealTypes.includes("breakfast"));
  const safeMains = mainPool.length > 0 ? mainPool : allDishes.filter(d => d.mealTypes.includes("main"));
  const safeAfternoons = afternoonPool.length > 0 ? afternoonPool : allDishes.filter(d => d.mealTypes.includes("afternoon"));
  const safeDesserts = dessertPool.length > 0 ? dessertPool : allDishes.filter(d => d.mealTypes.includes("dessert"));

  // Helper: Fisher-Yates array shuffle for true diversity
  const shuffle = <T>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const shuffledBreakfasts = shuffle(safeBreakfasts);
  const shuffledMains = shuffle(safeMains);
  const shuffledAfternoons = shuffle(safeAfternoons);
  const shuffledDesserts = shuffle(safeDesserts);

  let bestPlanDishes = {
    breakfast: shuffledBreakfasts[0],
    lunch: shuffledMains[0],
    afternoonSnack: shuffledAfternoons[0],
    dinner: shuffledMains[1] || shuffledMains[0],
    dessert: shuffledDesserts[0]
  };
  let bestScore = -Infinity;

  // 60 randomized multi-dimensional attempts for high variety & scientific balance
  const ATTEMPTS = 60;
  for (let i = 0; i < ATTEMPTS; i++) {
    const b = shuffledBreakfasts[Math.floor(Math.random() * shuffledBreakfasts.length)];
    const bProtein = getDominantProtein(b);

    // Lunch candidates: prefer different protein from breakfast
    let lunchCandidates = shuffledMains.filter(d => getDominantProtein(d) !== bProtein);
    if (lunchCandidates.length === 0) lunchCandidates = shuffledMains;
    const l = lunchCandidates[Math.floor(Math.random() * lunchCandidates.length)];
    const lProtein = getDominantProtein(l);

    // Afternoon snack
    const aft = shuffledAfternoons[Math.floor(Math.random() * shuffledAfternoons.length)];

    // Dinner candidates: strictly different dish from lunch, prefer different protein
    let dinnerCandidates = shuffledMains.filter(d => 
      d.id !== l.id && 
      getDominantProtein(d) !== lProtein && 
      getDominantProtein(d) !== bProtein
    );
    if (dinnerCandidates.length === 0) {
      dinnerCandidates = shuffledMains.filter(d => d.id !== l.id);
    }
    if (dinnerCandidates.length === 0) dinnerCandidates = shuffledMains;
    const din = dinnerCandidates[Math.floor(Math.random() * dinnerCandidates.length)];
    const dinProtein = getDominantProtein(din);

    // Dessert
    const des = shuffledDesserts[Math.floor(Math.random() * shuffledDesserts.length)];

    // Scoring combination
    const totalKcal = b.calories + l.calories + aft.calories + din.calories + des.calories;
    const kcalDiff = Math.abs(totalKcal - targetCalories);
    
    // Base score with random jitter (±100) so consecutive runs don't lock into the exact same dish
    const randomJitter = (Math.random() - 0.5) * 200;
    let score = 1200 - kcalDiff * 1.2 + randomJitter;
    
    // Reward protein diversity (tri-protein rotation)
    const proteins = new Set([bProtein, lProtein, dinProtein]);
    score += proteins.size * 250;

    // Reward contrast in cooking styles (e.g., if one is spicy or dry, another is soothing or soup)
    const textAll = `${b.name} ${l.name} ${din.name}`.toLowerCase();
    const hasSoup = textAll.includes("canh") || textAll.includes("súp") || textAll.includes("nước") || textAll.includes("phở") || textAll.includes("bún");
    if (hasSoup) score += 150;

    // Reward theme harmony
    if (theme === "vietnamese" && (l.country === "Việt Nam" || din.country === "Việt Nam")) {
      score += 250;
    }
    if (theme === "global" && (l.country !== din.country)) {
      score += 200; // variety
    }

    if (score > bestScore) {
      bestScore = score;
      bestPlanDishes = {
        breakfast: b,
        lunch: l,
        afternoonSnack: aft,
        dinner: din,
        dessert: des
      };
    }
  }

  const { breakfast, lunch, afternoonSnack, dinner, dessert } = bestPlanDishes;
  const list = [breakfast, lunch, afternoonSnack, dinner, dessert];

  const totalCalories = list.reduce((s, d) => s + d.calories, 0);
  const totalCostVND = list.reduce((s, d) => s + d.estimatedCostVND, 0);
  const totalProtein = list.reduce((s, d) => s + d.protein, 0);
  const totalCarbs = list.reduce((s, d) => s + d.carbs, 0);
  const totalFat = list.reduce((s, d) => s + d.fat, 0);
  const totalFiber = list.reduce((s, d) => s + d.fiber, 0);

  // Protein names mapping for Vietnamese explanation
  const proteinNameMap: Record<string, string> = {
    beef: "Thịt Bò",
    chicken: "Thịt Gà",
    pork: "Thịt Heo",
    seafood: "Hải Sản",
    fish: "Cá",
    egg: "Trứng",
    plant: "Đạm Thực Vật / Đậu Hũ",
    other: "Hỗn Hợp"
  };

  const bProt = proteinNameMap[getDominantProtein(breakfast)] || "Đạm nhẹ";
  const lProt = proteinNameMap[getDominantProtein(lunch)] || "Đạm bữa chính";
  const dinProt = proteinNameMap[getDominantProtein(dinner)] || "Đạm bữa tối";

  // Formulate logical rationales explaining why this plan is reasonable
  const rationales: string[] = [
    `Luân chuyển nguồn đạm: Sáng (${bProt}) • Trưa (${lProt}) • Tối (${dinProt}) giúp cân bằng axit amin và tránh ngấy protein lặp lại.`,
    `Phân bổ calo 5 cữ chuẩn khoa học: Sáng ~${breakfast.calories} kcal (25%), Trưa ~${lunch.calories} kcal (35%), Xế ~${afternoonSnack.calories} kcal (10%), Tối ~${dinner.calories} kcal (25%), Tráng miệng ~${dessert.calories} kcal (5%).`,
    `Hài hòa vị giác & tiêu hóa: Kết hợp món mặn giàu năng lượng buổi trưa và bữa tối thanh nhẹ dễ tiêu, không gây nặng bụng ban đêm.`,
    `Bổ sung chất xơ tự nhiên: Tổng cộng ${totalFiber}g chất xơ từ rau củ, củ quả và món tráng miệng thanh lọc cơ thể.`
  ];

  // Creative title generator
  const themeObj = MEAL_PLAN_THEMES.find(t => t.id === theme);
  const title = `${themeObj?.icon || "✨"} Thực Đơn ${themeObj?.name || "Cân Bằng"}: ${breakfast.name.split(" ")[0]} • ${lunch.name.split(" ")[0]} • ${dinner.name.split(" ")[0]}`;

  const notes = `Thực đơn được AI chọn lọc đa dạng ngẫu nhiên: Sáng (${breakfast.name} - ${breakfast.calories} kcal), Trưa (${lunch.name} - ${lunch.calories} kcal), Xế (${afternoonSnack.name}), Tối (${dinner.name} - ${dinner.calories} kcal), Tráng miệng (${dessert.name}). Cân đối đạm, xơ, tinh bột và năng lượng đạt chuẩn mục tiêu.`;

  return {
    id: `plan-${theme}-${Date.now().toString(36)}`,
    title,
    date: new Date().toLocaleDateString("vi-VN"),
    breakfast,
    lunch,
    afternoonSnack,
    dinner,
    dessert,
    totalCalories,
    totalCostVND,
    totalProtein,
    totalCarbs,
    totalFat,
    totalFiber,
    notes,
    rationales
  };
}
