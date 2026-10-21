// src/utils/weatherHelper.ts
import { Dish, TasteType, HealthProfileType } from "../types";

export interface CityWeatherLocation {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  icon: string;
}

export const VIETNAM_CITIES: CityWeatherLocation[] = [
  { id: "hanoi", name: "Hà Nội", region: "Miền Bắc", lat: 21.0285, lng: 105.8542, icon: "🏛️" },
  { id: "hcm", name: "TP. Hồ Chí Minh", region: "Miền Nam", lat: 10.8231, lng: 106.6297, icon: "🏙️" },
  { id: "danang", name: "Đà Nẵng", region: "Miền Trung", lat: 16.0544, lng: 108.2022, icon: "🌊" },
  { id: "dalat", name: "Đà Lạt", region: "Tây Nguyên (Se lạnh)", lat: 11.9404, lng: 108.4583, icon: "🌲" },
  { id: "haiphong", name: "Hải Phòng", region: "Duyên hải Bắc Bộ", lat: 20.8449, lng: 106.6881, icon: "⚓" },
  { id: "hue", name: "Huế", region: "Cố đô", lat: 16.4637, lng: 107.5909, icon: "🏯" },
  { id: "cantho", name: "Cần Thơ", region: "Miền Tây", lat: 10.0452, lng: 105.7469, icon: "🌾" },
  { id: "nhatrang", name: "Nha Trang", region: "Biển Nam Trung Bộ", lat: 12.2388, lng: 109.1967, icon: "🏖️" },
  { id: "sapa", name: "Sa Pa", region: "Núi cao (Rét buốt)", lat: 22.3364, lng: 103.8438, icon: "🏔️" },
];

export type WeatherCategory = "hot" | "rainy" | "cold" | "mild" | "humid";

export interface WeatherData {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  weatherCode: number;
  windSpeed: number;
  conditionCategory: WeatherCategory;
  conditionLabel: string;
  conditionIcon: string;
  advice: string;
  city: CityWeatherLocation;
  isDay: boolean;
  updatedAt: string;
}

/**
 * Decode WMO Weather Code to Vietnamese Condition & Category
 */
export function decodeWeatherCode(code: number, temp: number): {
  category: WeatherCategory;
  label: string;
  icon: string;
} {
  // Rain codes: 51-67, 80-82, 95-99
  const isRain = (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99);
  
  if (isRain) {
    return {
      category: "rainy",
      label: code >= 95 ? "Mưa dông, sấm sét" : code >= 61 ? "Mưa rào ấm ướt" : "Mưa phùn se lạnh",
      icon: code >= 95 ? "⛈️" : "🌧️"
    };
  }

  // Cold temperature check (<21°C)
  if (temp < 21) {
    return {
      category: "cold",
      label: temp < 15 ? "Trời rét đậm, gió lạnh" : "Trời se lạnh, hanh khô",
      icon: "❄️"
    };
  }

  // Hot temperature check (>30°C)
  if (temp >= 31) {
    return {
      category: "hot",
      label: temp >= 35 ? "Nắng gắt gay gắt, oi ả" : "Trời nắng nóng nhiệt độ cao",
      icon: "☀️"
    };
  }

  // Clear / Mild / Partly Cloudy
  if (code === 0) {
    return {
      category: "mild",
      label: "Trời quang đãng, mát mẻ",
      icon: "🌤️"
    };
  }

  return {
    category: "mild",
    label: "Thời tiết mát mẻ, dễ chịu",
    icon: "🌥️"
  };
}

/**
 * Fetch live real-time weather from Open-Meteo
 */
export async function fetchLiveWeather(city: CityWeatherLocation): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Weather API error");
    const data = await response.json();
    const cur = data.current;
    
    const temp = Math.round(cur.temperature_2m);
    const apparent = Math.round(cur.apparent_temperature);
    const humidity = cur.relative_humidity_2m;
    const wCode = cur.weather_code;
    const isDay = cur.is_day === 1;

    const { category, label, icon } = decodeWeatherCode(wCode, temp);

    let advice = "";
    if (category === "rainy") {
      advice = "Thời tiết mưa ẩm ướt, cơ thể cần các món nước ấm nóng, súp cay nhẹ, lẩu hoặc món kho đậm đà để kích thích vị giác và giữ ấm dạ dày.";
    } else if (category === "hot") {
      advice = "Trời nắng nóng gay gắt, cơ thể dễ mất nước và khoáng. Hãy ưu tiên các món canh chua thanh mát, gỏi cuốn, đồ uống giải nhiệt và chè dưỡng nhan.";
    } else if (category === "cold") {
      advice = "Không khí se lạnh, nhiệt độ thấp tiêu hao nhiều calo. Các món nướng, lẩu sôi sùng sục, phở sốt vang hay bò kho nóng hổi là lựa chọn số 1.";
    } else {
      advice = "Thời tiết mát mẻ lý tưởng, thích hợp cho bữa cơm gia đình đầm ấm hoặc thưởng thức các món bún, bánh đặc sản vùng miền.";
    }

    return {
      temperature: temp,
      apparentTemperature: apparent,
      humidity,
      weatherCode: wCode,
      windSpeed: Math.round(cur.wind_speed_10m),
      conditionCategory: category,
      conditionLabel: label,
      conditionIcon: icon,
      advice,
      city,
      isDay,
      updatedAt: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    };
  } catch {
    // Graceful offline fallback
    const fallbackCategory: WeatherCategory = city.id === "dalat" || city.id === "sapa" ? "cold" : "hot";
    const temp = city.id === "dalat" ? 18 : city.id === "sapa" ? 14 : 31;
    return {
      temperature: temp,
      apparentTemperature: temp + 1,
      humidity: 75,
      weatherCode: 0,
      windSpeed: 10,
      conditionCategory: fallbackCategory,
      conditionLabel: fallbackCategory === "cold" ? "Se lạnh sương mù" : "Nắng ráo nhiệt đới",
      conditionIcon: fallbackCategory === "cold" ? "❄️" : "☀️",
      advice: fallbackCategory === "cold" 
        ? "Trời se lạnh, ưu tiên các món ấm nóng, lẩu, canh hầm hoặc đồ nướng." 
        : "Trời nắng ấm, ưu tiên món canh thanh mát và đồ uống giải nhiệt.",
      city,
      isDay: true,
      updatedAt: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    };
  }
}

/**
 * User Demand Categories definition
 */
export interface UserDemandOption {
  id: string;
  name: string;
  icon: string;
  desc: string;
  tagline: string;
  filterFn: (d: Dish) => boolean;
}

export const USER_DEMAND_OPTIONS: UserDemandOption[] = [
  {
    id: "quick_15m",
    name: "Ăn Nhanh Cấp Tốc (<15p)",
    icon: "⚡",
    desc: "Nấu siêu nhanh hoặc sơ chế đơn giản, thích hợp ngày bận rộn",
    tagline: "Tiết kiệm tối đa thời gian đứng bếp",
    filterFn: (d) => (d.prepTimeMinutes + d.cookTimeMinutes) <= 20
  },
  {
    id: "rainy_warm",
    name: "Ấm Bụng Ngày Mưa & Lạnh",
    icon: "🌧️",
    desc: "Món nước nóng hổi, lẩu, súp ấm, kho tiêu ấm tỳ vị",
    tagline: "Giữ ấm cơ thể xua tan cảm giác buốt giá",
    filterFn: (d) => {
      const text = (d.name + " " + d.description).toLowerCase();
      return text.includes("nóng") || text.includes("lẩu") || text.includes("súp") || 
             text.includes("kho") || text.includes("hầm") || text.includes("tiêu") || 
             text.includes("gừng") || text.includes("cháo") || text.includes("phở");
    }
  },
  {
    id: "hot_cooling",
    name: "Giải Nhiệt Ngày Nắng Nóng",
    icon: "☀️",
    desc: "Canh chua thanh mát, đồ giải nhiệt, gỏi cuốn, hoa quả thanh nhẹ",
    tagline: "Bù nước bù khoáng, hạ hỏa thanh nhiệt",
    filterFn: (d) => {
      const text = (d.name + " " + d.description).toLowerCase();
      return text.includes("chua") || text.includes("canh") || text.includes("gỏi") || 
             text.includes("cuốn") || text.includes("chè") || text.includes("sữa chua") || 
             text.includes("thanh") || text.includes("salad") || d.calories <= 420;
    }
  },
  {
    id: "anti_bloat",
    name: "Giải Ngấy & Đổi Vị",
    icon: "🥗",
    desc: "Nhiều rau củ, vị chua cay dịu, giải cứu sau chuỗi ngày dầu mỡ",
    tagline: "Tươi mát đường ruột, kích thích lại vị giác",
    filterFn: (d) => {
      const text = (d.name + " " + d.description).toLowerCase();
      return d.fiber >= 3 && (text.includes("rau") || text.includes("chua") || text.includes("nộm") || text.includes("gỏi") || text.includes("luộc"));
    }
  },
  {
    id: "eatclean_diet",
    name: "Eat Clean / Giảm Mỡ",
    icon: "🥑",
    desc: "Calo kiểm soát (<450 kcal), giàu vitamin, ít dầu mỡ gia vị công nghiệp",
    tagline: "Giữ dáng thon gọn mà vẫn no lâu",
    filterFn: (d) => d.calories <= 450 && d.dietarySuitability.includes("weight_loss")
  },
  {
    id: "high_protein_gym",
    name: "Giàu Đạm Tăng Cơ Gym",
    icon: "💪",
    desc: "Đạm nạc dồi dào (>25g protein), phục hồi cơ bắp tối ưu",
    tagline: "Nguồn đạm chuẩn chất lượng cao",
    filterFn: (d) => d.protein >= 25
  },
  {
    id: "sick_recovery",
    name: "Bồi Bổ & Giải Cảm",
    icon: "🍲",
    desc: "Dễ nuốt, thơm hành lá, tía tô, gừng sả tiêu, làm ấm người nhanh",
    tagline: "Hồi phục thể lực nhanh chóng",
    filterFn: (d) => {
      const text = (d.name + " " + d.description).toLowerCase();
      return text.includes("cháo") || text.includes("súp") || text.includes("gà") || text.includes("hầm") || text.includes("gừng");
    }
  },
  {
    id: "family_comfort",
    name: "Cơm Nhà Sum Vầy",
    icon: "👨‍👩‍👧‍👦",
    desc: "Món mặn chuẩn cơm nhà, đậm đà bắt cơm, người lớn trẻ nhỏ đều mê",
    tagline: "Hương vị quê nhà ấm cúng",
    filterFn: (d) => d.mealTypes.includes("main") && d.country === "Việt Nam"
  },
  {
    id: "budget_saving",
    name: "Bình Dân & Tiết Kiệm",
    icon: "💰",
    desc: "Chi phí phải chăng (<40.000đ/phần), nguyên liệu chợ gần gũi",
    tagline: "Bữa ăn kinh tế ngon bổ rẻ",
    filterFn: (d) => d.estimatedCostVND <= 40000
  },
  {
    id: "late_night_light",
    name: "Ăn Đêm Thanh Nhẹ",
    icon: "🌙",
    desc: "Dưới 300 kcal, không gây đầy bụng, không lo tích mỡ, ngủ ngon",
    tagline: "Thoải mái dạ dày trước giờ ngủ",
    filterFn: (d) => d.calories <= 320 && (d.mealTypes.includes("afternoon") || d.mealTypes.includes("dessert"))
  }
];

/**
 * Filter dishes according to weather condition
 */
export function getDishesForWeather(allDishes: Dish[], category: WeatherCategory): Dish[] {
  if (category === "rainy") {
    return allDishes.filter(d => {
      const text = (d.name + " " + d.description).toLowerCase();
      return text.includes("nóng") || text.includes("lẩu") || text.includes("súp") || 
             text.includes("kho") || text.includes("hầm") || text.includes("tiêu") || 
             text.includes("gừng") || text.includes("cháo") || text.includes("phở") ||
             text.includes("bún bò") || text.includes("nướng") || text.includes("bò kho");
    });
  }

  if (category === "hot") {
    return allDishes.filter(d => {
      const text = (d.name + " " + d.description).toLowerCase();
      return text.includes("chua") || text.includes("canh") || text.includes("gỏi") || 
             text.includes("cuốn") || text.includes("chè") || text.includes("sữa chua") || 
             text.includes("kem") || text.includes("trái cây") || text.includes("thanh") ||
             d.calories <= 450;
    });
  }

  if (category === "cold") {
    return allDishes.filter(d => {
      const text = (d.name + " " + d.description).toLowerCase();
      return text.includes("lẩu") || text.includes("nướng") || text.includes("kho tàu") || 
             text.includes("sốt vang") || text.includes("bò kho") || text.includes("hầm") || 
             text.includes("cháo") || text.includes("cay") || text.includes("thịt nướng");
    });
  }

  // Mild weather: popular, balanced comfort dishes
  return allDishes.filter(d => d.isPopular || d.mealTypes.includes("main"));
}
