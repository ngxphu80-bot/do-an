// src/components/WeatherDemandMealRecommender.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Dish } from "../types";
import { 
  CloudSun, CloudRain, Sun, Snowflake, Wind, Droplets, 
  MapPin, Sparkles, RefreshCw, ChevronRight, CheckCircle2, 
  Flame, Clock, DollarSign, ChefHat, AlertCircle, Compass, Zap
} from "lucide-react";
import { 
  VIETNAM_CITIES, CityWeatherLocation, WeatherData, 
  fetchLiveWeather, USER_DEMAND_OPTIONS, UserDemandOption, 
  getDishesForWeather, WeatherCategory 
} from "../utils/weatherHelper";
import { DishIllustration } from "./DishIllustration";
import { formatVND } from "../utils/nutritionCalculator";

interface WeatherDemandMealRecommenderProps {
  allDishes: Dish[];
  onSelectDish: (dish: Dish) => void;
  onSaveDish?: (dish: Dish) => void;
  savedDishIds?: string[];
  onAddToMealPlan?: (dish: Dish, mealSlot: "breakfast" | "lunch" | "afternoon" | "dinner" | "dessert") => void;
}

interface AIWeatherInsight {
  weatherInsight: string;
  recommendedDishes: {
    name: string;
    category: string;
    whyFit: string;
    nutritionBenefit: string;
  }[];
  drinkRecommendation?: string;
  chefTip?: string;
}

export const WeatherDemandMealRecommender: React.FC<WeatherDemandMealRecommenderProps> = ({
  allDishes,
  onSelectDish,
  onSaveDish,
  savedDishIds = [],
  onAddToMealPlan
}) => {
  // Selected city
  const [selectedCity, setSelectedCity] = useState<CityWeatherLocation>(VIETNAM_CITIES[0]); // Hà Nội default
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState<boolean>(true);
  
  // Selected demand (Default matches weather category)
  const [selectedDemandId, setSelectedDemandId] = useState<string>("rainy_warm");
  
  // AI Insight state
  const [aiInsight, setAiInsight] = useState<AIWeatherInsight | null>(null);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Load weather when selectedCity changes
  useEffect(() => {
    let isMounted = true;
    setLoadingWeather(true);
    fetchLiveWeather(selectedCity).then((data) => {
      if (!isMounted) return;
      setWeatherData(data);
      setLoadingWeather(false);

      // Auto-set initial demand based on current weather
      if (data.conditionCategory === "hot") {
        setSelectedDemandId("hot_cooling");
      } else if (data.conditionCategory === "rainy" || data.conditionCategory === "cold") {
        setSelectedDemandId("rainy_warm");
      } else {
        setSelectedDemandId("family_comfort");
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedCity]);

  // Handle GPS location detection
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ định vị GPS.");
      return;
    }

    setLoadingWeather(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const customLoc: CityWeatherLocation = {
          id: "custom_gps",
          name: "Vị Trí Của Bạn",
          region: "Định vị GPS thời gian thực",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          icon: "📍"
        };
        setSelectedCity(customLoc);
      },
      () => {
        setLoadingWeather(false);
        alert("Không thể lấy vị trí GPS, đang dùng danh sách thành phố sẵn có.");
      },
      { timeout: 7000 }
    );
  };

  // Trigger Gemini AI Weather Recommendation
  const handleConsultAiWeather = async () => {
    if (!weatherData) return;
    setLoadingAi(true);
    setAiError(null);

    try {
      const activeDemand = USER_DEMAND_OPTIONS.find(d => d.id === selectedDemandId);
      const res = await fetch("/api/ai-chef/weather-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cityName: weatherData.city.name,
          temperature: weatherData.temperature,
          conditionLabel: weatherData.conditionLabel,
          conditionCategory: weatherData.conditionCategory,
          currentMealPeriod: "Bữa chính",
          userDemand: activeDemand ? activeDemand.name : "Món ăn phù hợp thời tiết"
        })
      });

      const json = await res.json();
      if (json.success && json.data) {
        setAiInsight(json.data);
      } else {
        // Fallback simulated insight if server offline
        setAiInsight({
          weatherInsight: `Thời tiết ${weatherData.city.name} hiện tại ${weatherData.temperature}°C (${weatherData.conditionLabel}). Cơ thể cần các món giàu năng lượng cân đối, thanh lọc đường ruột và duy trì thân nhiệt tối ưu.`,
          recommendedDishes: [
            {
              name: weatherData.conditionCategory === "hot" ? "Canh Chua Cá Bông Lau" : "Phở Bò Tái Nạm Nóng Hổi",
              category: weatherData.conditionCategory === "hot" ? "Món Canh Thanh Mát" : "Món Nước Ấm Tỳ Vị",
              whyFit: weatherData.conditionCategory === "hot" ? "Vị chua thanh mát giải nhiệt tức thì, kích thích vị giác ngày oi ả" : "Nước dùng quế hồi nóng hổi giữ ấm phế quản và lưu thông khí huyết",
              nutritionBenefit: "Cung cấp đạm nạc, vitamin C tự nhiên và khoáng chất"
            },
            {
              name: weatherData.conditionCategory === "hot" ? "Gỏi Cuốn Tôm Thịt Sốt Tương" : "Thịt Kho Tàu Nước Dừa Nóng",
              category: "Món Chính Bữa Ăn",
              whyFit: "Hương vị đậm đà vừa miệng, cân bằng nhóm chất",
              nutritionBenefit: "Dễ tiêu hóa, bổ sung năng lượng bền bỉ"
            }
          ],
          drinkRecommendation: weatherData.conditionCategory === "hot" ? "Trà Đào Cam Sả hoặc Nước Mát Râu Ngô" : "Trà Gừng Mật Ong Ấm Nóng",
          chefTip: "Nên thưởng thức món ăn ngay khi vừa chế biến xong để cảm nhận trọn vẹn vị tươi ngon."
        });
      }
    } catch {
      setAiError("Không thể kết nối đến AI Chef lúc này, hiển thị gợi ý thông minh từ cơ sở dữ liệu ẩm thực.");
    } finally {
      setLoadingAi(false);
    }
  };

  // Filter dishes based on active demand
  const currentDemand = useMemo(() => {
    return USER_DEMAND_OPTIONS.find(d => d.id === selectedDemandId) || USER_DEMAND_OPTIONS[0];
  }, [selectedDemandId]);

  const recommendedDishes = useMemo(() => {
    let pool = allDishes.filter(currentDemand.filterFn);
    if (pool.length < 6) {
      // Fallback merge with weather pool
      if (weatherData) {
        const wPool = getDishesForWeather(allDishes, weatherData.conditionCategory);
        pool = Array.from(new Set([...pool, ...wPool]));
      }
    }
    // Return top 12 dishes
    return pool.slice(0, 12);
  }, [allDishes, currentDemand, weatherData]);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* ========================================================================= */}
      {/* 1. REAL-TIME WEATHER RADAR & CITY PICKER                                  */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-amber-100/60 rounded-3xl p-5 sm:p-7 border border-amber-300/90 shadow-sm space-y-5">
        
        {/* Top Header & City Selection */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-amber-200/80">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="px-3 py-1 bg-amber-500 text-white font-black text-xs rounded-full flex items-center gap-1.5 shadow-2xs">
                <CloudSun className="w-3.5 h-3.5" />
                <span>AI Gợi Ý Món Ăn Theo Thời Tiết Thực Tế & Nhu Cầu</span>
              </span>
              <span className="text-[11px] font-bold text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
                Dữ liệu trực tiếp Open-Meteo
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Thời Tiết Hôm Nay Thế Nào • Ăn Gì Hợp Lý Nhất?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Tự động phân tích nhiệt độ, độ ẩm và thời tiết để gợi ý món ăn chuẩn vị (ấm nóng ngày mưa, thanh mát ngày nắng).
            </p>
          </div>

          {/* City Selector and GPS button */}
          <div className="flex items-center gap-2 flex-wrap self-stretch lg:self-auto">
            <select
              value={selectedCity.id}
              onChange={(e) => {
                const found = VIETNAM_CITIES.find(c => c.id === e.target.value);
                if (found) setSelectedCity(found);
              }}
              className="px-3 py-2 rounded-2xl bg-white border border-amber-300 text-xs sm:text-sm font-bold text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer"
            >
              {VIETNAM_CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name} ({c.region})
                </option>
              ))}
            </select>

            <button
              onClick={handleDetectGPS}
              className="px-3 py-2 rounded-2xl bg-white hover:bg-amber-50 text-amber-900 text-xs font-bold border border-amber-300 shadow-2xs transition-colors flex items-center gap-1.5 shrink-0"
              title="Định vị GPS nơi bạn đang đứng"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>Vị Trí Của Tôi</span>
            </button>
          </div>
        </div>

        {/* Live Weather Status Card */}
        {loadingWeather ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2 text-amber-800">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
            <span className="text-xs font-bold">Đang tải dữ liệu thời tiết thực tế từ trạm khí tượng...</span>
          </div>
        ) : weatherData && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Left: Big Temperature & Condition Badge */}
            <div className="md:col-span-5 bg-white/90 p-4 sm:p-5 rounded-2xl border border-amber-200/90 shadow-2xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <span className="text-5xl select-none filter drop-shadow-sm">
                  {weatherData.conditionIcon}
                </span>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                      {weatherData.temperature}°C
                    </span>
                    <span className="text-xs text-slate-500 font-bold">
                      (Cảm nhận {weatherData.apparentTemperature}°C)
                    </span>
                  </div>
                  <span className="text-sm font-extrabold text-amber-900 block mt-0.5">
                    {weatherData.conditionLabel}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    📍 {weatherData.city.name} • Cập nhật: {weatherData.updatedAt}
                  </span>
                </div>
              </div>

              {/* Weather meta chips */}
              <div className="flex flex-col gap-1 text-[11px] text-slate-600 font-medium text-right shrink-0">
                <span className="flex items-center gap-1 justify-end">
                  <Droplets className="w-3 h-3 text-cyan-600" />
                  <span>Ẩm: {weatherData.humidity}%</span>
                </span>
                <span className="flex items-center gap-1 justify-end">
                  <Wind className="w-3 h-3 text-teal-600" />
                  <span>Gió: {weatherData.windSpeed} km/h</span>
                </span>
              </div>
            </div>

            {/* Right: Weather Culinary Advice & AI Button */}
            <div className="md:col-span-7 bg-white/90 p-4 sm:p-5 rounded-2xl border border-amber-200/90 shadow-2xs flex flex-col justify-between gap-3">
              <div>
                <span className="text-xs font-black uppercase text-amber-900 flex items-center gap-1.5">
                  <ChefHat className="w-4 h-4 text-amber-600" />
                  <span>Lời Khuyên Dinh Dưỡng Cho Thời Tiết Này:</span>
                </span>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mt-1 font-medium">
                  {weatherData.advice}
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 flex-wrap">
                <span className="text-[11px] text-slate-500">
                  {weatherData.conditionCategory === "rainy" ? "🌧️ Ưu tiên: Món nước ấm nóng, lẩu, nướng" :
                   weatherData.conditionCategory === "hot" ? "☀️ Ưu tiên: Canh chua thanh mát, chè, đồ mát" :
                   weatherData.conditionCategory === "cold" ? "❄️ Ưu tiên: Lẩu nấm, phở sốt vang, canh hầm" :
                   "🌤️ Ưu tiên: Mâm cơm gia đình đa dạng, bún phở"}
                </span>

                <button
                  onClick={handleConsultAiWeather}
                  disabled={loadingAi}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
                >
                  {loadingAi ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>AI Đang Phân Tích...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                      <span>AI Phân Tích Thực Đơn Thời Tiết</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 2. AI DEEP CULINARY INSIGHT (IF TRIGGERED)                                */}
      {/* ========================================================================= */}
      {aiInsight && (
        <div className="bg-gradient-to-br from-orange-500/10 via-amber-500/10 to-white rounded-3xl p-5 sm:p-6 border border-orange-300 shadow-md space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-orange-500 text-white rounded-xl shadow-2xs">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="font-black text-sm sm:text-base text-slate-900">
                Gợi Ý Chuyên Sâu Từ AI Chef Dựa Trên Thời Tiết Thực Tế
              </h3>
            </div>
            <span className="text-[11px] font-bold text-orange-800 bg-orange-100 px-2.5 py-0.5 rounded-full border border-orange-200">
              {weatherData?.temperature}°C • {weatherData?.city.name}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white/90 p-3 rounded-2xl border border-orange-100 shadow-2xs">
            {aiInsight.weatherInsight}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {aiInsight.recommendedDishes.map((rec, idx) => (
              <div key={idx} className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-2xs space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 inline-block">
                  {rec.category}
                </span>
                <h4 className="font-extrabold text-sm text-slate-900">{rec.name}</h4>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{rec.whyFit}</p>
                <div className="pt-1 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{rec.nutritionBenefit}</span>
                </div>
              </div>
            ))}
          </div>

          {aiInsight.drinkRecommendation && (
            <div className="p-3 bg-amber-100/70 rounded-2xl border border-amber-300/80 flex items-center justify-between gap-2 text-xs font-bold text-amber-950 flex-wrap">
              <span>🥤 Đồ uống đề xuất cho thời tiết này:</span>
              <span className="text-amber-900 font-extrabold bg-white px-3 py-1 rounded-xl shadow-2xs">
                {aiInsight.drinkRecommendation}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. LOGIC GỢI Ý MÓN ĂN THEO NHU CẦU CỤ THỂ (DEMAND HUB)                   */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        
        {/* Demand Selector Pills */}
        <div className="space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Gợi Ý Món Ăn Đúng Nhu Cầu & Tình Huống Của Bạn:</span>
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Tìm thấy <strong className="text-amber-700 font-bold">{recommendedDishes.length} món</strong> phù hợp nhất
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {USER_DEMAND_OPTIONS.map((dm) => {
              const isSelected = selectedDemandId === dm.id;
              return (
                <button
                  key={dm.id}
                  onClick={() => setSelectedDemandId(dm.id)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer ${
                    isSelected
                      ? "bg-amber-500 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-300 scale-102"
                      : "bg-white hover:bg-amber-50 text-slate-700 border border-slate-200/90"
                  }`}
                  title={dm.desc}
                >
                  <span className="text-sm">{dm.icon}</span>
                  <span>{dm.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Demand Banner Tagline */}
        <div className="bg-white p-3 rounded-2xl border border-amber-200/80 flex items-center justify-between gap-3 flex-wrap text-xs">
          <div className="flex items-center gap-2">
            <span className="text-lg">{currentDemand.icon}</span>
            <div>
              <span className="font-extrabold text-slate-900 block">{currentDemand.name}</span>
              <span className="text-slate-500">{currentDemand.desc}</span>
            </div>
          </div>
          <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            {currentDemand.tagline}
          </span>
        </div>

        {/* ========================================================================= */}
        {/* 4. DISH CARDS GRID WITH PURE HIGH-VISIBILITY CULINARY ILLUSTRATIONS      */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {recommendedDishes.map((dish) => {
            const isSaved = savedDishIds.includes(dish.id);

            return (
              <div
                key={dish.id}
                onClick={() => onSelectDish(dish)}
                className="group bg-white rounded-3xl overflow-hidden border border-amber-200/80 shadow-2xs hover:shadow-xl hover:border-amber-400 transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                {/* Media Illustration */}
                <div className="relative aspect-4/3 overflow-hidden bg-amber-50/40">
                  <DishIllustration
                    dish={dish}
                    size="md"
                  />

                  {/* Top Origin Flag & Calories */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                    <span className="backdrop-blur-md bg-white/95 text-slate-800 text-[11px] font-bold px-2 py-0.5 rounded-full shadow-2xs flex items-center gap-1 border border-slate-200/80">
                      <span>{dish.flagEmoji}</span>
                      <span>{dish.country}</span>
                    </span>

                    <span className="backdrop-blur-md bg-black/60 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      🔥 {dish.calories} kcal
                    </span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        {formatVND(dish.estimatedCostVND)}
                      </span>
                      <span className="text-slate-500 font-medium">
                        ⏱️ {dish.prepTimeMinutes + dish.cookTimeMinutes} phút
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                      {dish.name}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                      {dish.description}
                    </p>
                  </div>

                  {/* Nutrition & Why Fit */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>Đạm: <strong className="text-blue-700 font-bold">{dish.protein}g</strong></span>
                      <span>Bột: <strong className="text-amber-700 font-bold">{dish.carbs}g</strong></span>
                      <span>Xơ: <strong className="text-emerald-700 font-bold">{dish.fiber}g</strong></span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDish(dish);
                        }}
                        className="w-full py-2 bg-amber-50 hover:bg-amber-500 hover:text-white text-amber-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                      >
                        <span>Xem Cách Nấu</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      {onSaveDish && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSaveDish(dish);
                          }}
                          className={`p-2 rounded-xl border transition-colors ${
                            isSaved 
                              ? "bg-rose-50 border-rose-200 text-rose-600 font-bold" 
                              : "bg-slate-50 border-slate-200 text-slate-500 hover:text-rose-500"
                          }`}
                          title={isSaved ? "Đã lưu" : "Lưu món"}
                        >
                          ♥
                        </button>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
