import { UserHealthProfile, Dish } from "../types";

export function calculateBMR(profile: UserHealthProfile): number {
  const { weightKg, heightCm, age, gender } = profile;
  // Mifflin-St Jeor formula
  if (gender === "male") {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
}

export function calculateTDEE(profile: UserHealthProfile): number {
  const bmr = calculateBMR(profile);
  const multipliers = {
    sedentary: 1.2,        // Ít vận động (làm việc bàn giấy)
    light: 1.375,         // Vận động nhẹ (tập 1-3 buổi/tuần)
    moderate: 1.55,       // Vận động vừa (tập 3-5 buổi/tuần)
    active: 1.725,        // Vận động nhiều (tập 6-7 buổi/tuần)
    very_active: 1.9,     // Rất tích cực (vận động viên, lao động nặng)
  };

  const multiplier = multipliers[profile.activityLevel] || 1.2;
  const maintenanceCalories = Math.round(bmr * multiplier);

  switch (profile.goal) {
    case "lose_weight":
      return Math.max(1200, maintenanceCalories - 450);
    case "gain_muscle":
      return maintenanceCalories + 300;
    case "gain_weight":
      return maintenanceCalories + 500;
    case "maintain":
    default:
      return maintenanceCalories;
  }
}

export interface MacroSplit {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
}

export function getRecommendedDailyMacros(targetCalories: number, goal: UserHealthProfile["goal"]): MacroSplit {
  let proteinRatio = 0.25;
  let carbRatio = 0.50;
  let fatRatio = 0.25;

  if (goal === "gain_muscle") {
    proteinRatio = 0.30;
    carbRatio = 0.45;
    fatRatio = 0.25;
  } else if (goal === "lose_weight") {
    proteinRatio = 0.35;
    carbRatio = 0.40;
    fatRatio = 0.25;
  }

  return {
    calories: targetCalories,
    proteinGrams: Math.round((targetCalories * proteinRatio) / 4),
    carbsGrams: Math.round((targetCalories * carbRatio) / 4),
    fatGrams: Math.round((targetCalories * fatRatio) / 9),
    fiberGrams: Math.round((targetCalories / 1000) * 14), // ~14g fiber per 1000 kcal
  };
}

export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

export function calculatePortionMultiplier(portion: "single" | "couple" | "family" | "party"): number {
  switch (portion) {
    case "single":
      return 1;
    case "couple":
      return 2;
    case "family":
      return 4;
    case "party":
      return 8;
    default:
      return 1;
  }
}

export function evaluateMealBalance(dishes: Dish[]): {
  isBalanced: boolean;
  score: number; // 0 to 100
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  advice: string[];
} {
  const totalCalories = dishes.reduce((sum, d) => sum + d.calories, 0);
  const totalProtein = dishes.reduce((sum, d) => sum + d.protein, 0);
  const totalCarbs = dishes.reduce((sum, d) => sum + d.carbs, 0);
  const totalFat = dishes.reduce((sum, d) => sum + d.fat, 0);
  const totalFiber = dishes.reduce((sum, d) => sum + d.fiber, 0);

  const advice: string[] = [];
  let score = 80;

  if (totalFiber < 6 && dishes.length > 0) {
    advice.push("🥦 Bữa ăn đang thiếu chất xơ! Nên bổ sung thêm một đĩa rau luộc, salad hoặc canh rau.");
    score -= 20;
  } else {
    advice.push("✨ Hàm lượng chất xơ dồi dào, rất tốt cho tiêu hóa và đường huyết!");
    score += 10;
  }

  if (totalProtein < 15 && dishes.length > 0) {
    advice.push("🥩 Lượng đạm hơi thấp, có thể thêm một quả trứng luộc, đậu hũ hoặc ức gà.");
    score -= 15;
  } else if (totalProtein >= 25) {
    advice.push("💪 Lượng Protein chuẩn chỉ, hỗ trợ cơ bắp và tạo cảm giác no lâu.");
    score += 10;
  }

  if (totalFat > 35) {
    advice.push("⚠️ Bữa ăn hơi nhiều dầu mỡ/chất béo, nên dùng phương pháp hấp/luộc hoặc uống kèm trà xanh.");
    score -= 15;
  }

  score = Math.min(100, Math.max(20, score));

  return {
    isBalanced: score >= 70,
    score,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    totalFiber,
    advice,
  };
}
