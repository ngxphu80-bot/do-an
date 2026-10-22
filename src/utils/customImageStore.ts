// src/utils/customImageStore.ts

const STORAGE_KEY = "hon_nay_an_gi_custom_images";

// Curated realistic food photography by keyword
const REAL_FOOD_PHOTO_MAP: { keywords: string[]; url: string }[] = [
  {
    keywords: ["phở", "pho bo", "pho ga"],
    url: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=1000&q=80"
  },
  {
    keywords: ["bún chả", "bun cha"],
    url: "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1000&q=80"
  },
  {
    keywords: ["bánh mì", "banh mi", "sandwich"],
    url: "https://images.unsplash.com/photo-1626804475297-41608ea09aeb?auto=format&fit=crop&w=1000&q=80"
  },
  {
    keywords: ["cơm tấm", "cơm sườn", "cơm chiên", "cơm niêu", "cơm"],
    url: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1000&q=80"
  },
  {
    keywords: ["bún bò", "bún riêu", "bún thịt nướng", "bún"],
    url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1000&q=80"
  },
  {
    keywords: ["bò bít tết", "steak", "bò lúc lắc", "thịt bò"],
    url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80"
  },
  {
    keywords: ["mì ý", "spaghetti", "pasta", "carbonara", "bolognese", "lasagna"],
    url: "https://images.unsplash.com/photo-1621996346565-e3d5d6281720?auto=format&fit=crop&w=1000&q=80"
  },
  {
    keywords: ["sushi", "sashimi", "cá hồi", "salmon"],
    url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1000&q=80"
  },
  {
    keywords: ["pizza"],
    url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80"
  },
  {
    keywords: ["burger", "hăm-bơ-gơ"],
    url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=80"
  },
  {
    keywords: ["salad", "gỏi", "rau trộn"],
    url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=80"
  },
  {
    keywords: ["canh", "súp", "soup", "cháo"],
    url: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=80"
  },
  {
    keywords: ["tôm", "hải sản", "seafood", "mực", "cua", "ghẹ"],
    url: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=1000&q=80"
  },
  {
    keywords: ["gà nướng", "gà rán", "ức gà", "chicken"],
    url: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=1000&q=80"
  },
  {
    keywords: ["gỏi cuốn", "nem cuốn", "spring roll"],
    url: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1000&q=80"
  },
  {
    keywords: ["chè", "kem", "tráng miệng", "bánh", "dessert", "pudding"],
    url: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1000&q=80"
  }
];

export function getCustomDishImage(dishId: string): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw);
    return map[dishId] || null;
  } catch {
    return null;
  }
}

export function saveCustomDishImage(dishId: string, imageUrl: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[dishId] = imageUrl.trim();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.error("Error saving custom dish image", e);
  }
}

export function removeCustomDishImage(dishId: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const map = JSON.parse(raw);
    delete map[dishId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.error("Error removing custom dish image", e);
  }
}

export function getEffectiveDishImageUrl(dish: { id: string; name?: string; imageUrl: string }): string {
  // 1. User custom attached image
  const custom = getCustomDishImage(dish.id);
  if (custom && custom.trim().length > 0) {
    return custom;
  }

  // 2. Exact dish imageUrl (dedicated image)
  if (dish.imageUrl && dish.imageUrl.trim().length > 0) {
    return dish.imageUrl;
  }

  // 3. Return empty string if no dedicated verified image exists.
  // DishIllustration will render a clean neutral frame with the dish name,
  // NEVER showing an incorrect image of another dish.
  return "";
}
