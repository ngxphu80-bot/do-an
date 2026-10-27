// src/utils/dishIconHelper.ts
import { Dish } from "../types";

export interface DishIconData {
  emoji: string;
  categoryLabel: string;
  subType: string;
  lucideIconName: "Soup" | "Utensils" | "Flame" | "Fish" | "Wheat" | "Pizza" | "Salad" | "Egg" | "Sparkles" | "Coffee" | "Apple";
  colorScheme: {
    bgGradient: string;
    darkBgGradient: string;
    glowColor: string;
    badgeBg: string;
    badgeText: string;
    borderAccent: string;
    chipBg: string;
  };
  steamAroma?: boolean;
}

export function getDishIconData(dish: Dish): DishIconData {
  const name = (dish.name + " " + (dish.nativeName || "") + " " + dish.description).toLowerCase();
  const mealTypes = dish.mealTypes || [];

  // 1. Phở, Bún, Miến, Mì, Hủ tiếu, Ramen, Udon, Soba
  if (
    name.includes("phở") ||
    name.includes("bún") ||
    name.includes("hủ tiếu") ||
    name.includes("hủ tiêu") ||
    name.includes("miến") ||
    name.includes("ramen") ||
    name.includes("udon") ||
    name.includes("soba") ||
    name.includes("mì quảng") ||
    name.includes("bánh canh") ||
    (name.includes("mì ") && !name.includes("bánh mì")) ||
    name.includes("noodle")
  ) {
    return {
      emoji: "🍜",
      categoryLabel: "Phở & Bún Mì Nước",
      subType: "Món nước thơm ngọt nước dùng",
      lucideIconName: "Soup",
      steamAroma: true,
      colorScheme: {
        bgGradient: "from-amber-500/15 via-orange-500/10 to-amber-900/30",
        darkBgGradient: "from-amber-950 via-slate-900 to-amber-900/60",
        glowColor: "rgba(245, 158, 11, 0.25)",
        badgeBg: "bg-amber-100",
        badgeText: "text-amber-800",
        borderAccent: "border-amber-300",
        chipBg: "bg-amber-500/20 text-amber-300"
      }
    };
  }

  // 2. Spaghetti, Pasta, Lasagna, Carbonara, Bolognese
  if (
    name.includes("spaghetti") ||
    name.includes("pasta") ||
    name.includes("lasagna") ||
    name.includes("carbonara") ||
    name.includes("bolognese") ||
    name.includes("mì ý") ||
    name.includes("penne") ||
    name.includes("fettuccine")
  ) {
    return {
      emoji: "🍝",
      categoryLabel: "Mì Ý & Pasta",
      subType: "Sốt Ý Al Dente chuẩn vị",
      lucideIconName: "Utensils",
      steamAroma: true,
      colorScheme: {
        bgGradient: "from-red-500/15 via-amber-500/10 to-stone-900/30",
        darkBgGradient: "from-stone-950 via-red-950/40 to-slate-900",
        glowColor: "rgba(239, 68, 68, 0.25)",
        badgeBg: "bg-red-100",
        badgeText: "text-red-800",
        borderAccent: "border-red-300",
        chipBg: "bg-red-500/20 text-red-300"
      }
    };
  }

  // 3. Pizza, Đút lò
  if (name.includes("pizza") || name.includes("đút lò phô mai")) {
    return {
      emoji: "🍕",
      categoryLabel: "Pizza & Đút Lò",
      subType: "Đế nướng giòn rụm phô mai dẻo",
      lucideIconName: "Pizza",
      steamAroma: false,
      colorScheme: {
        bgGradient: "from-amber-500/20 via-red-500/10 to-stone-900/30",
        darkBgGradient: "from-stone-950 via-amber-950/50 to-slate-900",
        glowColor: "rgba(245, 158, 11, 0.3)",
        badgeBg: "bg-amber-100",
        badgeText: "text-amber-800",
        borderAccent: "border-amber-300",
        chipBg: "bg-amber-500/20 text-amber-300"
      }
    };
  }

  // 4. Lẩu, Canh, Súp, Pot, Stew, Jjigae
  if (
    name.includes("lẩu") ||
    name.includes("canh") ||
    name.includes("súp") ||
    name.includes("soup") ||
    name.includes("jjigae") ||
    name.includes("hầm") ||
    name.includes("tom yum") ||
    name.includes("cà ri") ||
    name.includes("curry") ||
    name.includes("bò kho") ||
    name.includes("ragu")
  ) {
    return {
      emoji: "🍲",
      categoryLabel: "Canh, Lẩu & Cà Ri",
      subType: "Nồi hầm nóng hổi bổ dưỡng",
      lucideIconName: "Soup",
      steamAroma: true,
      colorScheme: {
        bgGradient: "from-orange-500/15 via-red-500/10 to-amber-900/30",
        darkBgGradient: "from-stone-950 via-orange-950/50 to-slate-900",
        glowColor: "rgba(249, 115, 22, 0.25)",
        badgeBg: "bg-orange-100",
        badgeText: "text-orange-800",
        borderAccent: "border-orange-300",
        chipBg: "bg-orange-500/20 text-orange-300"
      }
    };
  }

  // 5. Bò & Bít Tết (Steak, Bò né, Bò nướng, Tenderloin)
  if (
    name.includes("bò bít tết") ||
    name.includes("steak") ||
    name.includes("bò né") ||
    name.includes("tenderloin") ||
    name.includes("ribeye") ||
    name.includes("bò tơ") ||
    name.includes("thăn bò") ||
    name.includes("bắp bò") ||
    (name.includes("bò") && !name.includes("phở bò") && !name.includes("bún bò"))
  ) {
    return {
      emoji: "🥩",
      categoryLabel: "Bò & Bít Tết",
      subType: "Áp chảo mềm mọng nước",
      lucideIconName: "Flame",
      steamAroma: true,
      colorScheme: {
        bgGradient: "from-rose-500/20 via-red-500/10 to-stone-900/30",
        darkBgGradient: "from-stone-950 via-rose-950/50 to-slate-900",
        glowColor: "rgba(244, 63, 94, 0.25)",
        badgeBg: "bg-rose-100",
        badgeText: "text-rose-800",
        borderAccent: "border-rose-300",
        chipBg: "bg-rose-500/20 text-rose-300"
      }
    };
  }

  // 6. Thịt Heo, Sườn, Ba Chỉ Kho, Thịt Nướng, BBQ
  if (
    name.includes("sườn") ||
    name.includes("thịt heo") ||
    name.includes("thịt lợn") ||
    name.includes("ba chỉ") ||
    name.includes("kho tộ") ||
    name.includes("kho tàu") ||
    name.includes("xá xíu") ||
    name.includes("pork") ||
    name.includes("bbq") ||
    name.includes("chashu")
  ) {
    return {
      emoji: "🍖",
      categoryLabel: "Thịt Heo & Sườn Nướng",
      subType: "Đậm đà ngấm vị cơm nhà",
      lucideIconName: "Flame",
      steamAroma: true,
      colorScheme: {
        bgGradient: "from-amber-600/15 via-rose-600/10 to-stone-900/30",
        darkBgGradient: "from-stone-950 via-stone-900 to-amber-950/40",
        glowColor: "rgba(217, 119, 6, 0.25)",
        badgeBg: "bg-amber-100",
        badgeText: "text-amber-800",
        borderAccent: "border-amber-300",
        chipBg: "bg-amber-500/20 text-amber-300"
      }
    };
  }

  // 7. Thịt Gà, Vịt, Cơm Gà, Cánh Gà
  if (
    name.includes("gà") ||
    name.includes("vịt") ||
    name.includes("chicken") ||
    name.includes("duck") ||
    name.includes("cơm gà")
  ) {
    return {
      emoji: "🍗",
      categoryLabel: "Gà & Vịt Quay",
      subType: "Vàng ruộm giòn da thơm ngọt",
      lucideIconName: "Flame",
      steamAroma: true,
      colorScheme: {
        bgGradient: "from-yellow-500/20 via-orange-500/10 to-amber-950/30",
        darkBgGradient: "from-stone-950 via-amber-950/50 to-slate-900",
        glowColor: "rgba(234, 179, 8, 0.25)",
        badgeBg: "bg-yellow-100",
        badgeText: "text-yellow-800",
        borderAccent: "border-yellow-300",
        chipBg: "bg-yellow-500/20 text-yellow-300"
      }
    };
  }

  // 8. Tôm, Cua, Ghẹ
  if (
    name.includes("tôm") ||
    name.includes("cua") ||
    name.includes("ghẹ") ||
    name.includes("prawn") ||
    name.includes("shrimp") ||
    name.includes("crab")
  ) {
    return {
      emoji: "🦐",
      categoryLabel: "Tôm & Cua Biển",
      subType: "Tươi ngọt đượm hương vị biển",
      lucideIconName: "Fish",
      steamAroma: true,
      colorScheme: {
        bgGradient: "from-teal-500/20 via-cyan-500/10 to-slate-900/30",
        darkBgGradient: "from-slate-950 via-teal-950/50 to-stone-900",
        glowColor: "rgba(20, 184, 166, 0.25)",
        badgeBg: "bg-teal-100",
        badgeText: "text-teal-800",
        borderAccent: "border-teal-300",
        chipBg: "bg-teal-500/20 text-teal-300"
      }
    };
  }

  // 9. Cá, Mực, Hải Sản, Sushi, Sashimi, Chả Cá
  if (
    name.includes("cá ") ||
    name.includes("cá hồi") ||
    name.includes("cá ngừ") ||
    name.includes("cá lóc") ||
    name.includes("cá chẽm") ||
    name.includes("cá thu") ||
    name.includes("mực") ||
    name.includes("nghêu") ||
    name.includes("hải sản") ||
    name.includes("sushi") ||
    name.includes("sashimi") ||
    name.includes("chả cá") ||
    name.includes("salmon") ||
    name.includes("tuna")
  ) {
    const isSushi = name.includes("sushi") || name.includes("sashimi");
    return {
      emoji: isSushi ? "🍣" : "🐟",
      categoryLabel: isSushi ? "Sushi & Sashimi" : "Cá & Hải Sản Tươi",
      subType: "Giàu Omega-3 thanh khiết",
      lucideIconName: "Fish",
      steamAroma: !isSushi,
      colorScheme: {
        bgGradient: "from-cyan-500/20 via-teal-500/10 to-blue-950/30",
        darkBgGradient: "from-slate-950 via-cyan-950/50 to-stone-900",
        glowColor: "rgba(6, 182, 212, 0.25)",
        badgeBg: "bg-cyan-100",
        badgeText: "text-cyan-800",
        borderAccent: "border-cyan-300",
        chipBg: "bg-cyan-500/20 text-cyan-300"
      }
    };
  }

  // 10. Bánh Mì, Baguette, Sandwich, Burger, Toast, Tacos, Burrito
  if (
    name.includes("bánh mì") ||
    name.includes("burger") ||
    name.includes("sandwich") ||
    name.includes("toast") ||
    name.includes("tacos") ||
    name.includes("burrito") ||
    name.includes("quesadilla") ||
    name.includes("croissant")
  ) {
    const isTaco = name.includes("tacos") || name.includes("burrito");
    const isBurger = name.includes("burger");
    const emoji = isTaco ? "🌮" : isBurger ? "🍔" : "🥖";
    return {
      emoji,
      categoryLabel: "Bánh Mì & Kẹp Cuốn",
      subType: "Vỏ giòn nhân đẫm thơm bơ",
      lucideIconName: "Wheat",
      steamAroma: false,
      colorScheme: {
        bgGradient: "from-amber-500/20 via-yellow-500/10 to-amber-950/30",
        darkBgGradient: "from-stone-950 via-amber-950/50 to-slate-900",
        glowColor: "rgba(245, 158, 11, 0.25)",
        badgeBg: "bg-amber-100",
        badgeText: "text-amber-800",
        borderAccent: "border-amber-300",
        chipBg: "bg-amber-500/20 text-amber-300"
      }
    };
  }

  // 11. Cơm, Xôi, Cháo, Bibimbap, Fried Rice, Donburi, Paella, Risotto
  if (
    name.includes("cơm") ||
    name.includes("xôi") ||
    name.includes("cháo") ||
    name.includes("bibimbap") ||
    name.includes("donburi") ||
    name.includes("gyudon") ||
    name.includes("katsudon") ||
    name.includes("paella") ||
    name.includes("risotto") ||
    name.includes("fried rice")
  ) {
    return {
      emoji: "🍚",
      categoryLabel: "Cơm Dẻo, Xôi & Cháo",
      subType: "Chắc dạ hạt dẻo ấm bụng",
      lucideIconName: "Utensils",
      steamAroma: true,
      colorScheme: {
        bgGradient: "from-amber-500/15 via-orange-500/10 to-stone-900/30",
        darkBgGradient: "from-stone-950 via-stone-900 to-amber-950/40",
        glowColor: "rgba(245, 158, 11, 0.2)",
        badgeBg: "bg-amber-100",
        badgeText: "text-amber-800",
        borderAccent: "border-amber-300",
        chipBg: "bg-amber-500/20 text-amber-300"
      }
    };
  }

  // 12. Salad, Gỏi, Rau Củ, Nộm, Poke Bowl, Eat Clean
  if (
    name.includes("salad") ||
    name.includes("gỏi") ||
    name.includes("nộm") ||
    name.includes("rau") ||
    name.includes("poke") ||
    name.includes("xà lách") ||
    name.includes("cuốn")
  ) {
    return {
      emoji: "🥗",
      categoryLabel: "Salad & Gỏi Cuốn",
      subType: "Thanh mát giàu chất xơ",
      lucideIconName: "Salad",
      steamAroma: false,
      colorScheme: {
        bgGradient: "from-emerald-500/20 via-teal-500/10 to-slate-900/30",
        darkBgGradient: "from-slate-950 via-emerald-950/50 to-stone-900",
        glowColor: "rgba(16, 185, 129, 0.25)",
        badgeBg: "bg-emerald-100",
        badgeText: "text-emerald-800",
        borderAccent: "border-emerald-300",
        chipBg: "bg-emerald-500/20 text-emerald-300"
      }
    };
  }

  // 13. Dim sum, Bánh Bao, Há Cảo, Sủi Cảo, Hoành Thánh, Bánh Cuốn, Bánh Xèo, Bánh Khọt
  if (
    name.includes("dim sum") ||
    name.includes("há cảo") ||
    name.includes("sủi cảo") ||
    name.includes("hoành thánh") ||
    name.includes("bánh xèo") ||
    name.includes("bánh khọt") ||
    name.includes("bánh cuốn") ||
    name.includes("chả giò") ||
    name.includes("nem rán") ||
    name.includes("tteokbokki")
  ) {
    const isPancake = name.includes("bánh xèo") || name.includes("bánh khọt");
    return {
      emoji: isPancake ? "🥞" : "🥟",
      categoryLabel: "Bánh Truyền Thống & Dimsum",
      subType: "Vỏ mỏng nhân thơm giòn rụm",
      lucideIconName: "Utensils",
      steamAroma: true,
      colorScheme: {
        bgGradient: "from-amber-500/20 via-orange-500/10 to-stone-900/30",
        darkBgGradient: "from-stone-950 via-amber-950/50 to-slate-900",
        glowColor: "rgba(245, 158, 11, 0.25)",
        badgeBg: "bg-amber-100",
        badgeText: "text-amber-800",
        borderAccent: "border-amber-300",
        chipBg: "bg-amber-500/20 text-amber-300"
      }
    };
  }

  // 14. Trứng, Điểm tâm sáng
  if (name.includes("trứng") || name.includes("egg") || name.includes("pancake") || name.includes("waffle")) {
    return {
      emoji: "🍳",
      categoryLabel: "Trứng & Điểm Tâm Sáng",
      subType: "Béo ngậy thơm ngát năng lượng",
      lucideIconName: "Egg",
      steamAroma: true,
      colorScheme: {
        bgGradient: "from-yellow-400/20 via-amber-500/10 to-stone-900/30",
        darkBgGradient: "from-stone-950 via-yellow-950/50 to-slate-900",
        glowColor: "rgba(250, 204, 21, 0.25)",
        badgeBg: "bg-yellow-100",
        badgeText: "text-yellow-800",
        borderAccent: "border-yellow-300",
        chipBg: "bg-yellow-500/20 text-yellow-300"
      }
    };
  }

  // 15. Chè, Tráng Miệng, Bánh Ngọt, Sinh Tố, Yến Mạch, Sữa Chua
  if (
    mealTypes.includes("dessert") ||
    name.includes("chè") ||
    name.includes("bánh ngọt") ||
    name.includes("tiramisu") ||
    name.includes("kem") ||
    name.includes("yến mạch") ||
    name.includes("sữa chua") ||
    name.includes("parfait") ||
    name.includes("flan") ||
    name.includes("smoothie")
  ) {
    return {
      emoji: "🍧",
      categoryLabel: "Tráng Miệng & Chè Ngọt",
      subType: "Ngọt thanh giải nhiệt thư giãn",
      lucideIconName: "Sparkles",
      steamAroma: false,
      colorScheme: {
        bgGradient: "from-pink-500/20 via-purple-500/10 to-slate-900/30",
        darkBgGradient: "from-slate-950 via-purple-950/50 to-pink-950/40",
        glowColor: "rgba(236, 72, 153, 0.25)",
        badgeBg: "bg-pink-100",
        badgeText: "text-pink-800",
        borderAccent: "border-pink-300",
        chipBg: "bg-pink-500/20 text-pink-300"
      }
    };
  }

  // 16. Cà phê, Trà, Thức uống bọt biển (Coffee & Dalgona Beverages)
  if (
    name.includes("cà phê") ||
    name.includes("coffee") ||
    name.includes("dalgona") ||
    name.includes("bọt biển") ||
    name.includes("latte") ||
    name.includes("cappuccino") ||
    name.includes("matcha") ||
    name.includes("trà")
  ) {
    return {
      emoji: "☕",
      categoryLabel: "Cà Phê & Thức Uống",
      subType: "Hương thơm đậm đà, bọt mịn bồng bềnh",
      lucideIconName: "Coffee",
      steamAroma: false,
      colorScheme: {
        bgGradient: "from-amber-700/25 via-amber-800/15 to-stone-900/40",
        darkBgGradient: "from-amber-950 via-stone-900 to-amber-900/60",
        glowColor: "rgba(217, 119, 6, 0.3)",
        badgeBg: "bg-amber-100",
        badgeText: "text-amber-900",
        borderAccent: "border-amber-400",
        chipBg: "bg-amber-700/30 text-amber-200"
      }
    };
  }

  // Default Culinary fallback
  return {
    emoji: "🍽️",
    categoryLabel: "Món Ngon Đặc Sản",
    subType: "Hương vị tinh hoa chọn lọc",
    lucideIconName: "Utensils",
    steamAroma: true,
    colorScheme: {
      bgGradient: "from-amber-500/15 via-orange-500/10 to-stone-900/30",
      darkBgGradient: "from-stone-950 via-stone-900 to-amber-950/30",
      glowColor: "rgba(245, 158, 11, 0.2)",
      badgeBg: "bg-amber-100",
      badgeText: "text-amber-800",
      borderAccent: "border-amber-300",
      chipBg: "bg-amber-500/20 text-amber-300"
    }
  };
}
