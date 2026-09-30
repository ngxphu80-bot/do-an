// src/utils/customImageStore.ts

const STORAGE_KEY = "hon_nay_an_gi_custom_images";

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

export function getEffectiveDishImageUrl(dish: { id: string; imageUrl: string }): string {
  const custom = getCustomDishImage(dish.id);
  return custom || dish.imageUrl;
}
