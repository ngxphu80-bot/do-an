export type MealType = "breakfast" | "main" | "afternoon" | "dessert" | "snack";

export type VisualDisplayMode = "icon" | "photo";

export type RegionType = "asian" | "western";

export type PortionType = "single" | "couple" | "family" | "party";

export type TasteType = 
  | "sour" 
  | "spicy" 
  | "salty" 
  | "sweet" 
  | "mild" 
  | "creamy" 
  | "crispy" 
  | "herbal";

export type PriceTierType = "budget" | "medium" | "luxury";

export type HealthProfileType = 
  | "weight_loss"      // Ăn kiêng giảm cân, Eat Clean
  | "malnutrition"     // Suy dinh dưỡng, cần bồi bổ tăng cân
  | "pregnancy"        // Sản phụ, mẹ bầu, sau sinh
  | "hypertension"     // Huyết áp, tim mạch (giảm muối, mỡ xấu)
  | "liver"            // Bệnh gan, giải độc mát gan
  | "diabetes"         // Tiểu đường (GI thấp)
  | "respiratory"      // Bệnh phổi, hô hấp, thanh nhiệt
  | "gym"              // Tập gym tăng cơ (High protein)
  | "kids";            // Trẻ em (mềm, đủ chất, hấp dẫn)

export type AllergenType = 
  | "seafood"          // Hải sản (tôm, cua, mực...)
  | "peanuts"          // Đậu phộng / Lạc
  | "dairy"            // Sữa / Phô mai / Lactose
  | "gluten"           // Lúa mì / Bột mì
  | "eggs"             // Trứng
  | "soy";             // Đậu nành

export interface IngredientItem {
  name: string;
  amount: string;
  notes?: string;
  category?: "meat" | "seafood" | "veggie" | "grain" | "dairy" | "spice" | "fruit";
}

export interface CookingStep {
  step: number;
  title: string;
  instruction: string;
  timeMinutes?: number;
  temperatureOrFlame?: string;
  method?: "Sơ chế" | "Ướp gia vị" | "Luộc / Trụng" | "Xào / Áp chảo" | "Kho / Rim" | "Hầm / Nấu canh" | "Nướng" | "Chiên giòn" | "Trộn / Cuốn" | "Hấp";
}

export interface Dish {
  id: string;
  name: string;
  nativeName?: string;
  mealTypes: MealType[];
  region: RegionType;
  country: string;
  flagEmoji: string;
  imageUrl: string;
  description: string;
  calories: number; // kcal / 1 khẩu phần
  protein: number;  // grams
  carbs: number;    // grams
  fat: number;      // grams
  fiber: number;    // grams
  estimatedCostVND: number; // chi phí ước tính / người
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  tastes: TasteType[];
  dietarySuitability: HealthProfileType[];
  allergens: AllergenType[];
  keyIngredients: string[];
  ingredients: IngredientItem[];
  steps: CookingStep[];
  chefTips: string;
  nutritionBalanceTip: string;
  recommendedSides?: string[];
  isPopular?: boolean;
}

export interface UserHealthProfile {
  age: number;
  gender: "male" | "female";
  weightKg: number;
  heightCm: number;
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  goal: "lose_weight" | "maintain" | "gain_muscle" | "gain_weight";
  condition?: HealthProfileType;
  selectedHealthConditions: HealthProfileType[];
  allergies: AllergenType[];
  bmr?: number;
  tdee?: number;
  targetDailyCalories?: number;
}

export interface DayMealPlan {
  id: string;
  title: string;
  date: string;
  breakfast: Dish;
  lunch: Dish;
  afternoonSnack?: Dish;
  dinner: Dish;
  dessert?: Dish;
  totalCalories: number;
  totalCostVND: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  notes?: string;
}

export interface FilterState {
  searchQuery: string;
  selectedMeal: MealType | "all";
  selectedRegion: RegionType | "all";
  selectedPortion: PortionType;
  selectedPriceTier: PriceTierType | "all";
  selectedTastes: TasteType[];
  selectedHealthProfiles: HealthProfileType[];
  excludedAllergens: AllergenType[];
  maxCalories: number;
  maxPrepTime: number;
}
