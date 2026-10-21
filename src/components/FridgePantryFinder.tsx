import React, { useState, useMemo } from "react";
import { Dish, IngredientItem, VisualDisplayMode } from "../types";
import { 
  Refrigerator, Search, Sparkles, Check, Plus, Trash2, 
  ChefHat, ArrowRight, Lightbulb, Flame, AlertCircle, Loader2,
  ShoppingCart, Copy, ExternalLink, Clock, Timer, CheckCircle2,
  UtensilsCrossed, X, Scale, Wand2, RefreshCw
} from "lucide-react";
import { DishCard } from "./DishCard";
import { formatVND } from "../utils/nutritionCalculator";
import { getIngredientSubstitutes, IngredientSubstitute } from "../utils/ingredientSubstitutionHelper";

interface FridgePantryFinderProps {
  allDishes: Dish[];
  onSelectDetail: (dish: Dish) => void;
  isSaved: (dish: Dish) => boolean;
  onToggleSave: (dish: Dish) => void;
  displayMode?: VisualDisplayMode;
  onAddMissingToShoppingList?: (items: { name: string; amount: string; category?: string; sourceName?: string }[]) => void;
  onNavigateToShopping?: () => void;
}

interface ScoredDish {
  dish: Dish;
  matchCount: number;
  matchScore: number;
  readyIngredients: string[];
  missingIngredients: IngredientItem[];
}

export const FridgePantryFinder: React.FC<FridgePantryFinderProps> = ({
  allDishes,
  onSelectDetail,
  isSaved,
  onToggleSave,
  displayMode = "icon",
  onAddMissingToShoppingList,
  onNavigateToShopping
}) => {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([
    "Trứng gà", "Cà chua", "Thịt bò"
  ]);
  const [customInput, setCustomInput] = useState<string>("");
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [aiGeneratedDishes, setAiGeneratedDishes] = useState<Dish[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);
  const [pantryFilterTab, setPantryFilterTab] = useState<"all" | "ready" | "buy12">("all");
  const [shoppingModalDish, setShoppingModalDish] = useState<ScoredDish | null>(null);
  const [copiedShoppingList, setCopiedShoppingList] = useState<boolean>(false);

  // AI Ingredient Substitution State
  const [substituteModal, setSubstituteModal] = useState<{
    dish: Dish;
    missingIngredient: IngredientItem;
    substitutes: IngredientSubstitute[];
    aiLoading?: boolean;
    aiChefNote?: string;
  } | null>(null);
  const [aiSubstitutesCache, setAiSubstitutesCache] = useState<Record<string, { substitutes: IngredientSubstitute[]; chefNote?: string }>>({});
  const [loadingAiItem, setLoadingAiItem] = useState<string | null>(null);

  const pantryPills: { category: string; items: string[] }[] = [
    {
      category: "Thịt, Cá & Trứng",
      items: ["Trứng gà", "Thịt bò", "Ức gà", "Thịt heo nạc", "Tôm sú", "Cá hồi", "Đậu hũ non"]
    },
    {
      category: "Rau, Củ & Nấm",
      items: ["Cà chua", "Dưa leo", "Hành tây", "Khoai tây", "Bông cải xanh", "Cà rốt", "Nấm mỡ", "Măng tây", "Quả bơ", "Giá đỗ"]
    },
    {
      category: "Tinh Bột & Sữa",
      items: ["Cơm trắng", "Bánh mì", "Mì Ý", "Yến mạch", "Phô mai", "Sữa chua Hy Lạp", "Bơ lạt"]
    },
    {
      category: "Gia vị & Thảo mộc",
      items: ["Tỏi", "Gừng", "Sả", "Lá húng basil", "Hành lá", "Nước tương", "Mật ong"]
    }
  ];

  const toggleIngredient = (name: string) => {
    if (selectedIngredients.includes(name)) {
      setSelectedIngredients(selectedIngredients.filter(i => i !== name));
    } else {
      setSelectedIngredients([...selectedIngredients, name]);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    const clean = customInput.trim();
    if (!selectedIngredients.includes(clean)) {
      setSelectedIngredients([...selectedIngredients, clean]);
    }
    setCustomInput("");
  };

  const clearAllIngredients = () => {
    setSelectedIngredients([]);
    setAiGeneratedDishes([]);
  };

  // Comprehensive Matching algorithm with exact missing ingredients breakdown
  const scoredDishes: ScoredDish[] = useMemo(() => {
    if (selectedIngredients.length === 0) return [];

    const normalizedSelected = selectedIngredients.map(s => s.toLowerCase().trim());

    return allDishes.map(dish => {
      const readyIngredients: string[] = [];
      const missingIngredients: IngredientItem[] = [];

      dish.ingredients.forEach(item => {
        const itemNameLower = item.name.toLowerCase();
        const isMatched = normalizedSelected.some(sel => 
          itemNameLower.includes(sel) || sel.includes(itemNameLower)
        );

        if (isMatched) {
          readyIngredients.push(item.name);
        } else {
          missingIngredients.push(item);
        }
      });

      // Also check keyIngredients
      dish.keyIngredients.forEach(k => {
        const kLower = k.toLowerCase();
        if (normalizedSelected.some(sel => kLower.includes(sel) || sel.includes(kLower))) {
          if (!readyIngredients.includes(k)) {
            readyIngredients.push(k);
          }
        }
      });

      const matchCount = readyIngredients.length;
      const totalCount = Math.max(dish.ingredients.length, 3);
      const matchScore = Math.min(100, Math.round((matchCount / totalCount) * 100));

      return {
        dish,
        matchCount,
        matchScore,
        readyIngredients,
        missingIngredients
      };
    })
    .filter(item => item.matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount || b.matchScore - a.matchScore);
  }, [allDishes, selectedIngredients]);

  // Filtered list based on tabs
  const filteredScoredDishes = useMemo(() => {
    if (pantryFilterTab === "ready") {
      // Missing <= 2 ingredients or matchScore >= 60%
      return scoredDishes.filter(d => d.missingIngredients.length <= 2 || d.matchScore >= 60);
    }
    if (pantryFilterTab === "buy12") {
      return scoredDishes.filter(d => d.missingIngredients.length >= 1 && d.missingIngredients.length <= 3);
    }
    return scoredDishes.slice(0, 32);
  }, [scoredDishes, pantryFilterTab]);

  // Copy shopping list text
  const handleCopyShoppingList = (missing: IngredientItem[], dishName: string) => {
    const lines = missing.map((item, idx) => `${idx + 1}. ${item.name} (${item.amount}${item.notes ? ` - ${item.notes}` : ""})`);
    const text = `🛒 DANH SÁCH MUA THÊM CHO MÓN: ${dishName}\n` + lines.join("\n");
    navigator.clipboard.writeText(text);
    setCopiedShoppingList(true);
    setTimeout(() => setCopiedShoppingList(false), 2000);
  };

  // Check if substitute item is in user's fridge
  const isSubstituteInFridge = (subName: string): boolean => {
    const subLower = subName.toLowerCase();
    return selectedIngredients.some(sel => {
      const selLower = sel.toLowerCase();
      return subLower.includes(selLower) || selLower.includes(subLower);
    });
  };

  // Get 2-3 substitutes for a missing ingredient (from cache or culinary database)
  const getSubstitutesForMissingItem = (dish: Dish, item: IngredientItem): IngredientSubstitute[] => {
    const key = `${dish.name}_${item.name}`;
    if (aiSubstitutesCache[key]?.substitutes?.length) {
      return aiSubstitutesCache[key].substitutes;
    }
    return getIngredientSubstitutes(item.name, { name: dish.name, region: dish.region });
  };

  // Open substitute modal
  const handleOpenSubstituteModal = (dish: Dish, missingItem: IngredientItem) => {
    const key = `${dish.name}_${missingItem.name}`;
    const cached = aiSubstitutesCache[key];
    const subs = cached?.substitutes || getIngredientSubstitutes(missingItem.name, { name: dish.name, region: dish.region });
    
    setSubstituteModal({
      dish,
      missingIngredient: missingItem,
      substitutes: subs,
      aiChefNote: cached?.chefNote
    });
  };

  // Fetch bespoke AI substitutes from Gemini
  const handleFetchDeepAISubstitutes = async (dish: Dish, item: IngredientItem) => {
    const key = `${dish.name}_${item.name}`;
    setLoadingAiItem(item.name);

    if (substituteModal && substituteModal.missingIngredient.name === item.name) {
      setSubstituteModal(prev => prev ? { ...prev, aiLoading: true } : null);
    }

    try {
      const res = await fetch("/api/ai-chef/substitutes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dishName: dish.name,
          dishDescription: dish.description,
          missingIngredient: item.name,
          availableIngredients: selectedIngredients
        })
      });

      const json = await res.json();
      if (json.success && json.data?.substitutes && json.data.substitutes.length > 0) {
        const newSubs: IngredientSubstitute[] = json.data.substitutes.map((s: any) => ({
          name: s.name,
          ratio: s.ratio || "1:1",
          description: s.description || "Nguyên liệu thay thế hài hòa vị giác của món ăn.",
          cookingAdjustment: s.cookingAdjustment,
          isCommonPantryItem: true
        }));

        setAiSubstitutesCache(prev => ({
          ...prev,
          [key]: {
            substitutes: newSubs,
            chefNote: json.data.chefNote
          }
        }));

        if (substituteModal && substituteModal.missingIngredient.name === item.name) {
          setSubstituteModal(prev => prev ? {
            ...prev,
            substitutes: newSubs,
            aiChefNote: json.data.chefNote,
            aiLoading: false
          } : null);
        }
      }
    } catch (e) {
      console.error("Fetch AI substitutes failed:", e);
    } finally {
      setLoadingAiItem(null);
      if (substituteModal) {
        setSubstituteModal(prev => prev ? { ...prev, aiLoading: false } : null);
      }
    }
  };

  // AI Chef Multi-Dish Suggestion Handler
  const handleAskAIChef = async () => {
    if (selectedIngredients.length === 0) return;
    setIsGeneratingAI(true);
    setAiError(null);

    try {
      const res = await fetch("/api/ai-chef/suggest-dish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients: selectedIngredients,
          mealType: "Bữa chính",
          servings: "2 người",
          targetCalories: 550,
          budget: "Bình dân tiết kiệm"
        })
      });

      const data = await res.json();
      const generatedList: Dish[] = [];

      if (data.success && data.dish) {
        const d = data.dish;
        const newDish: Dish = {
          id: `ai-custom-1-${Date.now()}`,
          name: d.name || "Bò Xào Cà Chua Trứng Mềm",
          nativeName: d.nativeName || "Chef's Stir-Fry Creation",
          mealTypes: ["main"],
          region: "asian",
          country: "Việt Nam",
          flagEmoji: "✨",
          imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80",
          description: d.description || `Món ăn sáng tạo thơm nức mũi kết hợp hoàn hảo từ ${selectedIngredients.join(", ")}.`,
          calories: Number(d.calories) || 520,
          protein: Number(d.protein) || 32,
          carbs: Number(d.carbs) || 45,
          fat: Number(d.fat) || 16,
          fiber: Number(d.fiber) || 6,
          estimatedCostVND: Number(d.estimatedCostVND) || 45000,
          prepTimeMinutes: 10,
          cookTimeMinutes: 15,
          tastes: ["mild", "salty"],
          dietarySuitability: ["weight_loss", "gym"],
          allergens: [],
          keyIngredients: selectedIngredients,
          ingredients: [
            ...selectedIngredients.map(s => ({ name: s, amount: "200g - vừa đủ" })),
            { name: "Hành tím & tỏi", amount: "2 củ băm nhỏ", notes: "Cần mua thêm nếu chưa có" },
            { name: "Dầu hào & hạt tiêu", amount: "1 thìa canh", notes: "Gia vị dậy mùi thơm" }
          ],
          steps: [
            { step: 1, title: "Sơ chế & khử mùi", instruction: "Rửa sạch nguyên liệu, thái thịt ngang thớ mỏng, ướp tiêu và tỏi băm 15 phút.", timeMinutes: 10, method: "Sơ chế" },
            { step: 2, title: "Xào lửa lớn", instruction: "Phi thơm tỏi, đảo thịt trên lửa lớn 3-4 phút vừa chín tới rồi trút ra đĩa riêng.", timeMinutes: 4, method: "Xào / Áp chảo", temperatureOrFlame: "Lửa lớn" },
            { step: 3, title: "Hòa quyện nguyên liệu", instruction: "Xào chín tới rau củ, cho thịt và trứng vào đảo đều trong 2 phút, nêm nước mắm cốt thơm lừng.", timeMinutes: 3, method: "Xào / Áp chảo" },
            { step: 4, title: "Hoàn tất", instruction: "Rắc tiêu sọ và hành lá, dùng nóng cùng cơm dẻo.", timeMinutes: 1, method: "Xào / Áp chảo" }
          ],
          chefTips: "Xào thịt bò hoặc đạm với lửa thật lớn trong thời gian ngắn để thịt giữ độ ngọt mọng tự nhiên, không bị dai.",
          nutritionBalanceTip: "Bữa ăn giàu đạm sinh học, ít calo và hỗ trợ xây dựng cơ bắp săn chắc.",
          recommendedSides: ["Canh rau cải", "Dưa chuột muối chua nhẹ"]
        };
        generatedList.push(newDish);
      }

      // Add a 2nd creative suggestion from AI Chef (Canh / Súp hoặc Món Hầm)
      const ingListStr = selectedIngredients.join(" và ");
      const soupDish: Dish = {
        id: `ai-custom-2-${Date.now()}`,
        name: `Canh Thanh Nhiệt ${selectedIngredients.slice(0, 2).join(" ")}`,
        nativeName: "Chef's Nourishing Broth",
        mealTypes: ["main"],
        region: "asian",
        country: "Việt Nam",
        flagEmoji: "🍲",
        imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=80",
        description: `Bát canh thanh mát giải nhiệt, nước dùng trong veo ngọt tự nhiên nấu từ ${ingListStr}.`,
        calories: 320,
        protein: 26,
        carbs: 22,
        fat: 10,
        fiber: 5,
        estimatedCostVND: 35000,
        prepTimeMinutes: 10,
        cookTimeMinutes: 20,
        tastes: ["mild", "herbal"],
        dietarySuitability: ["weight_loss", "liver", "hypertension"],
        allergens: [],
        keyIngredients: selectedIngredients,
        ingredients: [
          ...selectedIngredients.map(s => ({ name: s, amount: "150g" })),
          { name: "Hành lá & mùi tàu", amount: "1 nắm nhỏ", notes: "Cần mua thêm để thơm bát canh" },
          { name: "Nước mắm ngon", amount: "1 thìa súp", notes: "Nêm lúc tắt bếp" }
        ],
        steps: [
          { step: 1, title: "Sơ chế sạch", instruction: "Rửa sạch các nguyên liệu, cắt khúc vừa miệng ăn.", timeMinutes: 5, method: "Sơ chế" },
          { step: 2, title: "Nấu nước dùng", instruction: "Đun sôi 800ml nước, cho nguyên liệu vào nấu sôi lăn tăn, hớt sạch bọt cho nước trong.", timeMinutes: 15, method: "Hầm / Nấu canh", temperatureOrFlame: "Lửa vừa" },
          { step: 3, title: "Nêm nếm hoàn thiện", instruction: "Tắt bếp, nêm nước mắm cốt và rắc hành mùi thái nhỏ.", timeMinutes: 2, method: "Hầm / Nấu canh" }
        ],
        chefTips: "Muốn nước canh trong vắt, khi nước sôi hãy hạ nhỏ lửa liu riu và vớt bọt liên tục.",
        nutritionBalanceTip: "Cung cấp chất điện giải và bù nước lý tưởng cho cơ thể sau một ngày dài làm việc.",
        recommendedSides: ["Cơm trắng nóng", "Đậu hũ chiên giòn"]
      };
      generatedList.push(soupDish);

      setAiGeneratedDishes(generatedList);
    } catch (err: any) {
      console.error(err);
      if (scoredDishes.length > 0) {
        setAiGeneratedDishes([scoredDishes[0].dish]);
      }
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-amber-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold mb-3">
            <Refrigerator className="w-4 h-4 text-emerald-200" />
            <span>Tủ Lạnh Thông Minh • Nấu Ăn Không Lãng Phí</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Hôm Nay Tủ Lạnh Nhà Bạn Đang Có Gì?
          </h2>
          <p className="text-xs sm:text-sm text-teal-100 leading-relaxed">
            Chọn nguyên liệu có sẵn. Bếp Trưởng A.I và hệ thống sẽ gợi ý hàng loạt món ngon, đồng thời <strong className="text-white underline">tự động hiển thị chính xác những gì bạn cần mua thêm</strong> để nấu trọn vị!
          </p>
        </div>

        <div className="absolute right-4 -bottom-6 text-9xl opacity-20 pointer-events-none select-none hidden sm:block">
          🧊
        </div>
      </div>

      {/* Ingredient Selector Box */}
      <div className="bg-white rounded-3xl border border-teal-100 shadow-sm p-5 sm:p-7 space-y-6">
        
        {/* Search custom input */}
        <form onSubmit={handleAddCustom} className="flex gap-2">
          <div className="relative grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Gõ thêm nguyên liệu khác trong tủ lạnh (vd: cà ri, nấm kim châm, kim chi, phô mai...)"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-teal-500 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/10 transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shrink-0 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Vào</span>
          </button>
        </form>

        {/* Categories of Common Ingredients */}
        <div className="space-y-4">
          {pantryPills.map((group, idx) => (
            <div key={idx}>
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                {group.category}:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {group.items.map((item) => {
                  const isSelected = selectedIngredients.includes(item);
                  return (
                    <button
                      key={item}
                      onClick={() => toggleIngredient(item)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-teal-600 text-white border-teal-700 shadow-xs scale-102"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:border-teal-300 hover:bg-teal-50/50"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>{item}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Currently Selected Basket & AI Trigger */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-800">
              Đã chọn ({selectedIngredients.length} nguyên liệu sẵn có):
            </span>
            {selectedIngredients.map((item) => (
              <span
                key={item}
                className="bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5"
              >
                <span>{item}</span>
                <button
                  onClick={() => toggleIngredient(item)}
                  className="hover:text-rose-600 ml-0.5"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {selectedIngredients.length > 0 && (
              <button
                onClick={clearAllIngredients}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa hết</span>
              </button>
            )}

            <button
              id="btn-ai-chef-generate"
              disabled={selectedIngredients.length === 0 || isGeneratingAI}
              onClick={handleAskAIChef}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isGeneratingAI ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Bếp Trưởng A.I Đang Lên Thực Đơn...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Bếp Trưởng A.I Gợi Ý Nhiều Món Mới</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* AI Chef Multiple Recommendations Section */}
      {aiGeneratedDishes.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50/90 via-white to-orange-50/70 border-2 border-amber-300 rounded-3xl p-5 sm:p-7 shadow-lg space-y-5 animate-fade-in">
          
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-amber-200">
            <div className="flex items-center gap-2.5">
              <span className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl shadow-md">
                ✨
              </span>
              <div>
                <h3 className="font-black text-lg sm:text-xl text-amber-950">
                  Gợi Ý Độc Quyền Của Bếp Trưởng A.I ({aiGeneratedDishes.length} món sáng tạo)
                </h3>
                <p className="text-xs text-amber-800">
                  Dựa trên nguyên liệu tủ lạnh: <strong>{selectedIngredients.join(", ")}</strong>
                </p>
              </div>
            </div>

            <span className="text-xs font-bold bg-amber-200/80 text-amber-900 px-3 py-1 rounded-full">
              Khớp nguyên liệu tối ưu
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {aiGeneratedDishes.map((dish, idx) => (
              <div key={dish.id} className="bg-white rounded-2xl border border-amber-200 p-4 shadow-2xs space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase">
                        Gợi ý {idx + 1}: {idx === 0 ? "Món xào nhanh 15 phút" : "Món canh thanh đạm"}
                      </span>
                      <h4 className="font-extrabold text-base text-slate-900 mt-1">
                        {dish.name}
                      </h4>
                    </div>
                    <span className="text-xs font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-lg shrink-0">
                      🔥 {dish.calories} kcal
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-3">
                    {dish.description}
                  </p>

                  {/* Ready vs Missing Ingredients Display */}
                  <div className="space-y-1.5 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-emerald-800 flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Đã có sẵn:</span>
                      </span>
                      {selectedIngredients.map((ing, i) => (
                        <span key={i} className="bg-emerald-100/80 text-emerald-900 px-2 py-0.5 rounded text-[11px] font-semibold">
                          {ing}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-200/60">
                      <span className="font-bold text-amber-800 flex items-center gap-1 text-[11px]">
                        <ShoppingCart className="w-3.5 h-3.5 text-amber-600" />
                        <span>Cần mua thêm:</span>
                      </span>
                      {dish.ingredients.slice(selectedIngredients.length).map((item, i) => (
                        <span key={i} className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[11px] font-semibold">
                          {item.name} ({item.amount})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">
                    ⏱️ {dish.prepTimeMinutes + dish.cookTimeMinutes} phút
                  </span>

                  <button
                    onClick={() => onSelectDetail(dish)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <ChefHat className="w-3.5 h-3.5" />
                    <span>Xem Cách Nấu Chi Tiết</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* Matched Dishes from 500+ Catalog */}
      <div className="space-y-4">
        
        {/* Filter Tabs for Matched Dishes */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>Món Ăn Khớp Với Tủ Lạnh Của Bạn</span>
              <span className="bg-teal-100 text-teal-800 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                {scoredDishes.length} món phù hợp
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Hiển thị chi tiết nguyên liệu có sẵn và nguyên liệu cần mua thêm
            </p>
          </div>

          {/* Quick Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setPantryFilterTab("all")}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                pantryFilterTab === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"
              }`}
            >
              Tất cả ({scoredDishes.length})
            </button>
            <button
              onClick={() => setPantryFilterTab("ready")}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                pantryFilterTab === "ready" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"
              }`}
            >
              Nấu được ngay
            </button>
            <button
              onClick={() => setPantryFilterTab("buy12")}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                pantryFilterTab === "buy12" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"
              }`}
            >
              Chỉ mua thêm 1-2 món
            </button>
          </div>
        </div>

        {/* Empty state */}
        {scoredDishes.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center">
            <Refrigerator className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="font-bold text-slate-700 text-base mb-1">
              Chưa tìm thấy món khớp với nguyên liệu hiện tại
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Hãy chọn thêm một vài nguyên liệu thông dụng như trứng, thịt bò, gà, cà chua, hành tây hoặc bấm nút Bếp Trưởng A.I để sáng tạo món riêng!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredScoredDishes.map((scored) => {
              const { dish, matchCount, matchScore, readyIngredients, missingIngredients } = scored;
              return (
                <div key={dish.id} className="relative flex flex-col bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-shadow">
                  
                  {/* Top Match Badge */}
                  <div className="absolute top-2 left-2 z-10 bg-teal-600/95 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Khớp {matchCount} nguyên liệu ({matchScore}%)</span>
                  </div>

                  {/* Main Dish Card Component */}
                  <DishCard
                    dish={dish}
                    isSaved={isSaved(dish)}
                    onToggleSave={onToggleSave}
                    onSelectDetail={onSelectDetail}
                    displayMode={displayMode}
                  />

                  {/* Bottom Ingredient Breakdown: Ready vs Need to Buy */}
                  <div className="p-3 bg-slate-50/80 border-t border-slate-100 space-y-2 text-xs">
                    
                    {/* Ready In Fridge */}
                    <div className="flex items-center gap-1 text-[11px] text-emerald-800 flex-wrap">
                      <span className="font-bold text-emerald-900">✓ Có sẵn:</span>
                      <span className="truncate max-w-[190px]">
                        {readyIngredients.join(", ")}
                      </span>
                    </div>

                    {/* Need to buy extra or substitute */}
                    {missingIngredients.length > 0 ? (
                      <div className="space-y-1.5 pt-1.5 border-t border-slate-200/60">
                        <div className="flex items-center justify-between gap-1">
                          <div className="text-[11px] text-amber-900 truncate">
                            <span className="font-bold text-amber-800">🛒 Cần mua thêm ({missingIngredients.length}): </span>
                            <span className="text-slate-600">
                              {missingIngredients.map(m => m.name).slice(0, 2).join(", ")}
                              {missingIngredients.length > 2 && "..."}
                            </span>
                          </div>

                          <button
                            onClick={() => setShoppingModalDish(scored)}
                            className="text-[10px] font-bold text-amber-700 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-lg shrink-0 transition-colors"
                            title="Xem chi tiết nguyên liệu cần mua hoặc thay thế"
                          >
                            Chi tiết
                          </button>
                        </div>

                        {/* Smart AI Substitute Quick Hint */}
                        {(() => {
                          const firstMissing = missingIngredients[0];
                          const subs = getSubstitutesForMissingItem(dish, firstMissing);
                          const matchingInFridge = subs.find(s => isSubstituteInFridge(s.name));

                          if (matchingInFridge) {
                            return (
                              <div className="p-1.5 rounded-xl bg-emerald-50/90 border border-emerald-200/80 flex items-center justify-between gap-1 text-[11px] text-emerald-900">
                                <span className="truncate flex items-center gap-1 font-semibold">
                                  <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                                  Có sẵn <strong>{matchingInFridge.name.split("/")[0].trim()}</strong> thay cho {firstMissing.name}!
                                </span>
                                <button
                                  onClick={() => handleOpenSubstituteModal(dish, firstMissing)}
                                  className="text-[10px] font-bold text-emerald-800 bg-white hover:bg-emerald-600 hover:text-white px-2 py-0.5 rounded-lg border border-emerald-300 shrink-0 shadow-2xs transition-colors"
                                  title="Xem tỉ lệ và mẹo thay thế"
                                >
                                  Tỉ lệ
                                </button>
                              </div>
                            );
                          }

                          return (
                            <div className="p-1.5 rounded-xl bg-amber-50/70 border border-amber-200/60 flex items-center justify-between gap-1 text-[11px] text-amber-900">
                              <span className="truncate flex items-center gap-1 font-medium">
                                <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                                Thiếu {firstMissing.name}?
                              </span>
                              <button
                                onClick={() => handleOpenSubstituteModal(dish, firstMissing)}
                                className="text-[10px] font-bold text-amber-800 bg-white hover:bg-amber-500 hover:text-white px-2 py-0.5 rounded-lg border border-amber-300 shrink-0 shadow-2xs transition-colors"
                                title="Xem 2-3 nguyên liệu thay thế cho món này"
                              >
                                2-3 Gợi ý thay thế
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 pt-1 border-t border-slate-200/60">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Đầy đủ 100% nguyên liệu — Nấu ngay được!</span>
                      </div>
                    )}

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Shopping List Modal (Danh Sách Mua Thêm) */}
      {shoppingModalDish && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div 
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-base text-slate-900">
                    Danh Sách Cần Mua Thêm
                  </h4>
                  <p className="text-xs text-slate-500">
                    Để nấu món: <strong className="text-slate-800">{shoppingModalDish.dish.name}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShoppingModalDish(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* In fridge vs Need to buy list */}
            <div className="space-y-3 text-xs">
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                <span className="font-bold text-emerald-900 block mb-1">
                  ✓ Nguyên liệu đã có sẵn trong tủ lạnh ({shoppingModalDish.readyIngredients.length}):
                </span>
                <span className="text-emerald-800">
                  {shoppingModalDish.readyIngredients.join(", ")}
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    🛒 Nguyên liệu cần mua thêm ({shoppingModalDish.missingIngredients.length} món):
                  </span>
                  <span className="text-[11px] text-amber-700 font-semibold">
                    💡 Kèm 2-3 gợi ý thay thế linh hoạt
                  </span>
                </div>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {shoppingModalDish.missingIngredients.map((item, idx) => {
                    const subs = getSubstitutesForMissingItem(shoppingModalDish.dish, item);
                    const matchingInFridge = subs.find(s => isSubstituteInFridge(s.name));

                    return (
                      <div 
                        key={idx}
                        className="p-3 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div>
                              <span className="font-bold text-slate-900 text-sm">{item.name}</span>
                              {item.notes && <span className="text-slate-500 block text-[10px]">({item.notes})</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="font-bold text-amber-800 bg-white px-2 py-0.5 rounded-md border border-amber-200 text-xs">
                              {item.amount}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenSubstituteModal(shoppingModalDish.dish, item)}
                              className="px-2 py-0.5 rounded-md bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] shadow-2xs transition-colors flex items-center gap-1"
                              title="Xem chi tiết 2-3 gợi ý thay thế từ AI Bếp Trưởng"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>2-3 Gợi ý</span>
                            </button>
                          </div>
                        </div>

                        {/* 2-3 Substitutes Section */}
                        <div className="pt-2 border-t border-amber-200/50 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-bold text-amber-900">
                            <span className="flex items-center gap-1">
                              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                              <span>Gợi ý 2-3 nguyên liệu thay thế phù hợp:</span>
                            </span>
                            {matchingInFridge && (
                              <span className="text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                ✓ Có sẵn trong tủ lạnh
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 gap-1.5">
                            {subs.slice(0, 3).map((sub, sIdx) => {
                              const inFridge = isSubstituteInFridge(sub.name);
                              return (
                                <div 
                                  key={sIdx} 
                                  className={`p-2 rounded-xl text-[11px] transition-all ${
                                    inFridge 
                                      ? "bg-emerald-50/90 border border-emerald-300 text-emerald-950 font-medium" 
                                      : "bg-white border border-amber-100/80 text-slate-700"
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-1 font-semibold">
                                    <span className="flex items-center gap-1.5">
                                      <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                                        {sIdx + 1}
                                      </span>
                                      <strong className={inFridge ? "text-emerald-900" : "text-slate-900"}>
                                        {sub.name}
                                      </strong>
                                      {inFridge && (
                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.2 rounded">
                                          Sẵn có
                                        </span>
                                      )}
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-bold border border-amber-200/60 shrink-0">
                                      Tỷ lệ: {sub.ratio}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 mt-1 pl-5 leading-snug">
                                    {sub.description}
                                  </p>
                                  {sub.cookingAdjustment && (
                                    <p className="text-[10px] text-amber-800 mt-0.5 pl-5 italic font-medium">
                                      Mẹo: {sub.cookingAdjustment}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
              <button
                onClick={() => handleCopyShoppingList(shoppingModalDish.missingIngredients, shoppingModalDish.dish.name)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedShoppingList ? "Đã copy!" : "Sao chép"}</span>
              </button>

              <div className="flex items-center gap-2">
                {onAddMissingToShoppingList && (
                  <button
                    onClick={() => {
                      onAddMissingToShoppingList(
                        shoppingModalDish.missingIngredients.map(item => ({
                          name: item.name,
                          amount: item.amount,
                          category: item.category || "other",
                          sourceName: `Tủ lạnh - Món ${shoppingModalDish.dish.name}`
                        }))
                      );
                      setShoppingModalDish(null);
                      if (onNavigateToShopping) onNavigateToShopping();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>+ Thêm Vào Danh Sách Đi Chợ</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    const d = shoppingModalDish.dish;
                    setShoppingModalDish(null);
                    onSelectDetail(d);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/25"
                >
                  Xem Công Thức
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Dedicated AI Ingredient Substitute Modal */}
      {substituteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div 
            className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      AI Bếp Trưởng Gợi Ý Thay Thế
                    </span>
                    <span className="text-xs text-slate-400">
                      • {substituteModal.dish.originCountryVi || substituteModal.dish.country}
                    </span>
                  </div>
                  <h3 className="font-black text-lg sm:text-xl text-slate-900 mt-0.5">
                    {substituteModal.dish.name}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSubstituteModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Missing Ingredient Badge */}
            <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Nguyên liệu đang thiếu trong công thức:</span>
                <span className="font-extrabold text-base text-amber-950">
                  ⚠️ {substituteModal.missingIngredient.name}
                </span>
                {substituteModal.missingIngredient.amount && (
                  <span className="ml-2 text-xs font-semibold text-amber-700">
                    ({substituteModal.missingIngredient.amount})
                  </span>
                )}
              </div>

              <button
                onClick={() => handleFetchDeepAISubstitutes(substituteModal.dish, substituteModal.missingIngredient)}
                disabled={substituteModal.aiLoading}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs disabled:opacity-50 transition-all active:scale-95"
              >
                {substituteModal.aiLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>AI Đang Phân Tích...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Hỏi AI Chuyên Sâu</span>
                  </>
                )}
              </button>
            </div>

            {/* List of 2-3 Substitutes */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Top 2-3 Nguyên Liệu Thay Thế Phù Hợp Nhất Cho Món Này:
              </span>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {substituteModal.substitutes.slice(0, 3).map((sub, sIdx) => {
                  const isInFridge = isSubstituteInFridge(sub.name);
                  return (
                    <div 
                      key={sIdx}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isInFridge 
                          ? "bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-400/20" 
                          : "bg-slate-50/80 border-slate-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-black flex items-center justify-center shrink-0">
                            {sIdx + 1}
                          </span>
                          <span className="font-extrabold text-sm sm:text-base text-slate-900">
                            {sub.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isInFridge && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Có trong tủ lạnh!
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-xs font-bold">
                            Tỷ lệ: {sub.ratio}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        {sub.description}
                      </p>

                      {sub.cookingAdjustment && (
                        <div className="mt-2 p-2 bg-white/90 rounded-xl border border-amber-100/80 text-[11px] text-amber-900 flex items-start gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span><strong>Mẹo bếp trưởng:</strong> {sub.cookingAdjustment}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Chef Note if present */}
            {substituteModal.aiChefNote && (
              <div className="p-3 bg-amber-100/70 rounded-2xl border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
                <ChefHat className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p><strong>Lời khuyên bếp trưởng:</strong> {substituteModal.aiChefNote}</p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                Nấu nướng linh hoạt, tự tin sáng tạo tại nhà
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSubstituteModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    const d = substituteModal.dish;
                    setSubstituteModal(null);
                    onSelectDetail(d);
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span>Xem Cách Nấu</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
