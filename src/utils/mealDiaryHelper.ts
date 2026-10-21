// src/utils/mealDiaryHelper.ts
import { DayMealPlan, MealDiaryDay, MealDiarySlot, Dish, DiaryMood } from "../types";

/**
 * Format date string YYYY-MM-DD to Vietnamese display date
 */
export function formatDiaryDateDisplay(isoDateStr: string): string {
  try {
    const [y, m, d] = isoDateStr.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    const today = new Date();
    const todayStr = getTodayIsoDate();
    
    // Check if today
    if (isoDateStr === todayStr) {
      return `Hôm Nay (${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")})`;
    }
    
    // Check if yesterday
    const yest = new Date(today);
    yest.setDate(yest.getDate() - 1);
    const yestStr = formatDateToIso(yest);
    if (isoDateStr === yestStr) {
      return `Hôm Qua (${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")})`;
    }

    const dayOfWeek = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"][dateObj.getDay()];
    return `${dayOfWeek}, ${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
  } catch {
    return isoDateStr;
  }
}

export function formatDateToIso(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayIsoDate(): string {
  return formatDateToIso(new Date());
}

export function getYesterdayIsoDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatDateToIso(d);
}

/**
 * Calculate totals for a diary day
 */
export function recalculateDiaryDay(day: MealDiaryDay): MealDiaryDay {
  const slots: (MealDiarySlot | undefined)[] = [
    day.breakfast,
    day.lunch,
    day.afternoonSnack,
    day.dinner,
    day.dessert
  ];

  let totalPlanned = 0;
  let totalEaten = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;
  let fiber = 0;

  slots.forEach(slot => {
    if (!slot) return;
    totalPlanned += slot.dish.calories;
    if (slot.eaten) {
      totalEaten += slot.dish.calories;
      protein += slot.dish.protein;
      carbs += slot.dish.carbs;
      fat += slot.dish.fat;
      fiber += slot.dish.fiber;
    }
  });

  return {
    ...day,
    totalPlannedCalories: Math.round(totalPlanned),
    totalEatenCalories: Math.round(totalEaten),
    totalProtein: Math.round(protein),
    totalCarbs: Math.round(carbs),
    totalFat: Math.round(fat),
    totalFiber: Math.round(fiber),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Create a new diary day from a DayMealPlan
 */
export function createDiaryFromMealPlan(
  plan: DayMealPlan,
  targetDate: string,
  targetCalories: number = 2000,
  defaultEaten: boolean = false
): MealDiaryDay {
  const nowStr = new Date().toISOString();
  
  const rawDay: MealDiaryDay = {
    id: `diary-${targetDate}-${Date.now().toString(36)}`,
    date: targetDate,
    displayDate: formatDiaryDateDisplay(targetDate),
    title: plan.title || `Thực đơn ngày ${targetDate}`,
    sourcePlanId: plan.id,
    breakfast: {
      dish: plan.breakfast,
      eaten: defaultEaten,
      timeLogged: "07:30",
      actualPortion: "full"
    },
    lunch: {
      dish: plan.lunch,
      eaten: defaultEaten,
      timeLogged: "12:00",
      actualPortion: "full"
    },
    afternoonSnack: plan.afternoonSnack ? {
      dish: plan.afternoonSnack,
      eaten: defaultEaten,
      timeLogged: "15:30",
      actualPortion: "full"
    } : undefined,
    dinner: {
      dish: plan.dinner,
      eaten: defaultEaten,
      timeLogged: "19:00",
      actualPortion: "full"
    },
    dessert: plan.dessert ? {
      dish: plan.dessert,
      eaten: defaultEaten,
      timeLogged: "20:30",
      actualPortion: "full"
    } : undefined,
    waterGlasses: defaultEaten ? 6 : 0,
    mood: defaultEaten ? "great" : undefined,
    notes: plan.notes || "",
    targetCalories,
    totalPlannedCalories: plan.totalCalories,
    totalEatenCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    totalFiber: 0,
    createdAt: nowStr,
    updatedAt: nowStr
  };

  return recalculateDiaryDay(rawDay);
}

/**
 * Generate initial sample diary data so user can immediately experience the history
 */
export function generateInitialMealDiary(
  defaultPlan: DayMealPlan,
  targetCalories: number = 2000
): MealDiaryDay[] {
  const todayStr = getTodayIsoDate();
  const yestDate = new Date();
  yestDate.setDate(yestDate.getDate() - 1);
  const yestStr = formatDateToIso(yestDate);

  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const twoDaysAgoStr = formatDateToIso(twoDaysAgo);

  // Yesterday completed entry
  const yesterdayEntry: MealDiaryDay = {
    id: `diary-${yestStr}-sample`,
    date: yestStr,
    displayDate: formatDiaryDateDisplay(yestStr),
    title: "Thực đơn Cân Bằng Năng Lượng",
    sourcePlanId: defaultPlan.id,
    breakfast: {
      dish: defaultPlan.breakfast,
      eaten: true,
      timeLogged: "07:15",
      notes: "Ngon miệng, no lâu đến trưa"
    },
    lunch: {
      dish: defaultPlan.lunch,
      eaten: true,
      timeLogged: "12:15",
      notes: "Đủ chất, thanh nhẹ"
    },
    afternoonSnack: defaultPlan.afternoonSnack ? {
      dish: defaultPlan.afternoonSnack,
      eaten: true,
      timeLogged: "15:45",
      notes: "Tiếp thêm năng lượng buổi chiều"
    } : undefined,
    dinner: {
      dish: defaultPlan.dinner,
      eaten: true,
      timeLogged: "19:00",
      notes: "Vừa bụng, dễ tiêu hóa"
    },
    dessert: defaultPlan.dessert ? {
      dish: defaultPlan.dessert,
      eaten: true,
      timeLogged: "20:30"
    } : undefined,
    waterGlasses: 8,
    mood: "great",
    notes: "Một ngày ăn uống điều độ, ngủ ngon giấc và không bị thèm đồ ngọt đêm!",
    targetCalories,
    totalPlannedCalories: defaultPlan.totalCalories,
    totalEatenCalories: defaultPlan.totalCalories,
    totalProtein: defaultPlan.totalProtein,
    totalCarbs: defaultPlan.totalCarbs,
    totalFat: defaultPlan.totalFat,
    totalFiber: defaultPlan.totalFiber,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  };

  // Today entry (in progress)
  const todayEntry: MealDiaryDay = {
    id: `diary-${todayStr}-sample`,
    date: todayStr,
    displayDate: formatDiaryDateDisplay(todayStr),
    title: defaultPlan.title || "Thực đơn dinh dưỡng hôm nay",
    sourcePlanId: defaultPlan.id,
    breakfast: {
      dish: defaultPlan.breakfast,
      eaten: true,
      timeLogged: "07:30"
    },
    lunch: {
      dish: defaultPlan.lunch,
      eaten: false,
      timeLogged: "12:00"
    },
    afternoonSnack: defaultPlan.afternoonSnack ? {
      dish: defaultPlan.afternoonSnack,
      eaten: false,
      timeLogged: "15:30"
    } : undefined,
    dinner: {
      dish: defaultPlan.dinner,
      eaten: false,
      timeLogged: "19:00"
    },
    dessert: defaultPlan.dessert ? {
      dish: defaultPlan.dessert,
      eaten: false,
      timeLogged: "20:30"
    } : undefined,
    waterGlasses: 4,
    mood: "energetic",
    notes: "Đã hoàn thành bữa sáng chất lượng, uống đủ 1L nước buổi sáng.",
    targetCalories,
    totalPlannedCalories: defaultPlan.totalCalories,
    totalEatenCalories: defaultPlan.breakfast.calories,
    totalProtein: defaultPlan.breakfast.protein,
    totalCarbs: defaultPlan.breakfast.carbs,
    totalFat: defaultPlan.breakfast.fat,
    totalFiber: defaultPlan.breakfast.fiber,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return [todayEntry, yesterdayEntry];
}

/**
 * Format diary day to plain text for export or copying
 */
export function exportDiaryToText(day: MealDiaryDay): string {
  let text = `📖 NHẬT KÝ ĂN UỐNG: ${day.displayDate}\n`;
  text += `🎯 Kế hoạch: ${day.title}\n`;
  text += `⚡ Calo thực nạp: ${day.totalEatenCalories} / ${day.targetCalories} kcal (${Math.round((day.totalEatenCalories / day.targetCalories) * 100)}% mục tiêu)\n`;
  text += `📊 Dinh dưỡng đã nạp: Đạm ${day.totalProtein}g | Tinh bột ${day.totalCarbs}g | Chất béo ${day.totalFat}g | Chất xơ ${day.totalFiber}g\n`;
  text += `💧 Nước uống: ${day.waterGlasses}/8 ly (${day.waterGlasses * 250} ml)\n`;
  if (day.mood) {
    const moodLabels: Record<DiaryMood, string> = {
      great: "😋 Rất ngon miệng & hài lòng",
      light: "🥗 Cơ thể nhẹ nhàng, thanh lọc",
      energetic: "🏃 Tràn đầy năng lượng",
      full: "🥩 No nê, đủ chất",
      tired: "😴 Hơi mệt mỏi, cần nghỉ ngơi"
    };
    text += `✨ Cảm nhận: ${moodLabels[day.mood] || day.mood}\n`;
  }
  text += `\n--- CHI TIẾT CÁC BỮA ---\n`;

  if (day.breakfast) {
    text += `🍳 Sáng (${day.breakfast.timeLogged || "07:30"}): [${day.breakfast.eaten ? "ĐÃ ĂN" : "CHƯA ĂN"}] ${day.breakfast.dish.name} (${day.breakfast.dish.calories} kcal)\n`;
    if (day.breakfast.notes) text += `   Ghi chú: ${day.breakfast.notes}\n`;
  }

  if (day.lunch) {
    text += `🍛 Trưa (${day.lunch.timeLogged || "12:00"}): [${day.lunch.eaten ? "ĐÃ ĂN" : "CHƯA ĂN"}] ${day.lunch.dish.name} (${day.lunch.dish.calories} kcal)\n`;
    if (day.lunch.notes) text += `   Ghi chú: ${day.lunch.notes}\n`;
  }

  if (day.afternoonSnack) {
    text += `🥪 Xế (${day.afternoonSnack.timeLogged || "15:30"}): [${day.afternoonSnack.eaten ? "ĐÃ ĂN" : "CHƯA ĂN"}] ${day.afternoonSnack.dish.name} (${day.afternoonSnack.dish.calories} kcal)\n`;
    if (day.afternoonSnack.notes) text += `   Ghi chú: ${day.afternoonSnack.notes}\n`;
  }

  if (day.dinner) {
    text += `🍲 Tối (${day.dinner.timeLogged || "19:00"}): [${day.dinner.eaten ? "ĐÃ ĂN" : "CHƯA ĂN"}] ${day.dinner.dish.name} (${day.dinner.dish.calories} kcal)\n`;
    if (day.dinner.notes) text += `   Ghi chú: ${day.dinner.notes}\n`;
  }

  if (day.dessert) {
    text += `🍉 Tráng miệng (${day.dessert.timeLogged || "20:30"}): [${day.dessert.eaten ? "ĐÃ ĂN" : "CHƯA ĂN"}] ${day.dessert.dish.name} (${day.dessert.dish.calories} kcal)\n`;
    if (day.dessert.notes) text += `   Ghi chú: ${day.dessert.notes}\n`;
  }

  if (day.notes) {
    text += `\n📝 Ghi chú trong ngày: ${day.notes}\n`;
  }

  text += `\n✨ Lưu tự động bởi ứng dụng "Hôm Nay Ăn Gì?"`;
  return text;
}
