// src/utils/timeOfDayHelper.ts
import { Dish, MealType } from "../types";

export type MealTimePeriod = "breakfast" | "lunch" | "afternoon" | "dinner" | "late_night";

export interface TimeOfDayInfo {
  period: MealTimePeriod;
  title: string;
  subtitle: string;
  icon: string;
  advice: string;
  highlightCategory: string;
  targetMealTypes: MealType[];
  timeRangeStr: string;
  greeting: string;
}

/**
 * Returns current meal period info based on local time
 */
export function getCurrentTimeOfDayInfo(date: Date = new Date()): TimeOfDayInfo {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const currentDecHour = hours + minutes / 60;

  // 05:00 - 10:30: Breakfast
  if (currentDecHour >= 5 && currentDecHour < 10.5) {
    return {
      period: "breakfast",
      title: "Bữa Sáng Nạp Năng Lượng",
      subtitle: "Khởi đầu ngày mới tỉnh táo với tinh bột lành mạnh & protein dễ tiêu",
      icon: "🌅",
      greeting: "Chào buổi sáng!",
      advice: "Nên ăn bữa sáng giàu năng lượng sạch, kèm một cốc nước ấm hoặc cà phê nhẹ để đánh thức hệ tiêu hóa.",
      highlightCategory: "Món ăn sáng & Nước dùng",
      targetMealTypes: ["breakfast"],
      timeRangeStr: "05:00 - 10:30"
    };
  }

  // 10:30 - 14:00: Lunch
  if (currentDecHour >= 10.5 && currentDecHour < 14) {
    return {
      period: "lunch",
      title: "Bữa Trưa Năng Lượng Đỉnh Cao",
      subtitle: "Bữa chính quan trọng nhất trong ngày, nạp đủ đạm, tinh bột & chất xơ",
      icon: "☀️",
      greeting: "Đã đến giờ cơm trưa!",
      advice: "Bữa trưa nên chiếm khoảng 35-40% calo trong ngày. Kết hợp hài hòa món mặn giàu đạm và canh/rau xanh.",
      highlightCategory: "Bữa chính đậm đà",
      targetMealTypes: ["main"],
      timeRangeStr: "10:30 - 14:00"
    };
  }

  // 14:00 - 17:30: Afternoon Snack
  if (currentDecHour >= 14 && currentDecHour < 17.5) {
    return {
      period: "afternoon",
      title: "Bữa Xế Chiều Tỉnh Táo",
      subtitle: "Đổi vị xua tan mệt mỏi với món nhẹ thanh mát, trái cây hoặc trà",
      icon: "🍵",
      greeting: "Chào buổi chiều!",
      advice: "Khoảng thời gian đường huyết giảm nhẹ, một món ăn xế nhẹ (150-200 kcal) giúp bạn duy trì năng suất làm việc đến tối mà không lo tích mỡ.",
      highlightCategory: "Món xế & Tráng miệng",
      targetMealTypes: ["afternoon", "dessert"],
      timeRangeStr: "14:00 - 17:30"
    };
  }

  // 17:30 - 21:30: Dinner
  if (currentDecHour >= 17.5 && currentDecHour < 21.5) {
    return {
      period: "dinner",
      title: "Bữa Tối Ấm Cúng & Nhẹ Bụng",
      subtitle: "Thanh đạm, dễ tiêu hóa giúp ngủ sâu giấc và thư giãn sau ngày dài",
      icon: "🌙",
      greeting: "Đã đến giờ cơm tối!",
      advice: "Bữa tối nên giảm bớt tinh bột nhanh, ưu tiên cá, ức gà, canh rau nóng hổi để dạ dày được nghỉ ngơi thoải mái vào ban đêm.",
      highlightCategory: "Cơm tối gia đình",
      targetMealTypes: ["main"],
      timeRangeStr: "17:30 - 21:30"
    };
  }

  // 21:30 - 05:00: Late Night
  return {
    period: "late_night",
    title: "Bữa Khuya Thanh Nhẹ",
    subtitle: "Nếu đói đêm, ưu tiên súp ấm, sữa hạt sen hoặc trái cây ít đường",
    icon: "✨",
    greeting: "Thực đơn khuya thanh nhẹ",
    advice: "Hạn chế đồ chiên rán nhiều dầu mỡ. Một bát súp ấm hoặc ly sữa ấm hạt sen sẽ giúp làm dịu cơn đói và hỗ trợ giấc ngủ.",
    highlightCategory: "Món ấm bụng dễ ngủ",
    targetMealTypes: ["dessert", "afternoon"],
    timeRangeStr: "21:30 - 05:00"
  };
}

/**
 * Filter dishes matching the specific meal period
 */
export function getDishesForTimePeriod(allDishes: Dish[], period: MealTimePeriod): Dish[] {
  switch (period) {
    case "breakfast":
      return allDishes.filter(d => d.mealTypes.includes("breakfast"));
    case "lunch":
      return allDishes.filter(d => d.mealTypes.includes("main") && d.calories >= 400);
    case "afternoon":
      return allDishes.filter(d => d.mealTypes.includes("afternoon") || (d.mealTypes.includes("dessert") && d.calories <= 300));
    case "dinner":
      return allDishes.filter(d => d.mealTypes.includes("main"));
    case "late_night":
      return allDishes.filter(d => d.calories <= 280 && (d.mealTypes.includes("dessert") || d.mealTypes.includes("afternoon")));
    default:
      return allDishes.slice(0, 20);
  }
}
