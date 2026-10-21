import { ShoppingListItem, ShoppingItemCategory, DayMealPlan, Dish, IngredientItem } from "../types";

export function inferIngredientCategory(ingredientName: string): ShoppingItemCategory {
  const name = ingredientName.toLowerCase().trim();

  // Seafood
  if (
    /tôm|cua|cá\b|cá hồi|cá thu|cá lóc|cá trắm|mực|bạch tuộc|ngao|sò|ốc|hến|lươn|ghẹ|rong biển|chả cá|tép|bề bề|hàu|sò điệp/i.test(name)
  ) {
    return "seafood";
  }

  // Meat & Eggs
  if (
    /thịt|bò|heo|lợn|gà|vịt|sườn|giò|chả lụa|chả bò|trứng|cừu|ba chỉ|bắp bò|xúc xích|lạp xưởng|giò sống|pate|nạc vai/i.test(name)
  ) {
    return "meat";
  }

  // Dairy & Milks
  if (
    /sữa|bơ\b|phô mai|cheese|yogurt|sữa chua|whipping|cream|váng sữa|nước cốt dừa/i.test(name)
  ) {
    return "dairy";
  }

  // Grains & Starches
  if (
    /gạo|cơm|bún|phở|mì\b|nui|miến|bánh mì|yến mạch|bột mì|bột bắp|ngũ cốc|hạt sen|bánh tráng|pasta|spaghetti|bột năng|bột gạo/i.test(name)
  ) {
    return "grain";
  }

  // Fruits
  if (
    /táo|cam|chuối|dưa hấu|xoài|chanh\b|dứa|thơm|dâu|nho|lê\b|thanh long|đu đủ|kiwi|bưởi|quýt|chanh leo|đào|vải|nhãn/i.test(name)
  ) {
    return "fruit";
  }

  // Vegetables & Herbs & Tofu
  if (
    /rau|củ|cải|xà lách|cà chua|dưa chuột|dưa leo|hành|tỏi tây|nấm|mộc nhĩ|giá đỗ|khoai tây|khoai lang|cà rốt|bắp cải|bông cải|đậu phụ|đậu hũ|măng|ớt chuông|bí đỏ|bí xanh|ngô|bắp\b|đậu que|đậu cô ve|húng|quế|ngò|thì là|gừng|sả|đậu bắp|su hào|bầu|mướp|cần tây/i.test(name)
  ) {
    return "veggie";
  }

  // Spices & Sauces
  if (
    /nước mắm|xì dầu|tương|muối|đường|tiêu|ớt\b|dầu ăn|dầu hào|giấm|hạt nêm|bột ngọt|sa tế|mật ong|sốt|mayonnaise|ngũ vị hương|cà ri|bột nghệ|dầu mè/i.test(name)
  ) {
    return "spice";
  }

  return "other";
}

export function extractDayPlanIngredients(plan: DayMealPlan): ShoppingListItem[] {
  const dishes: { slot: string; dish?: Dish }[] = [
    { slot: "Bữa sáng", dish: plan.breakfast },
    { slot: "Bữa trưa", dish: plan.lunch },
    { slot: "Xế chiều", dish: plan.afternoonSnack },
    { slot: "Bữa tối", dish: plan.dinner },
    { slot: "Tráng miệng", dish: plan.dessert }
  ];

  const result: ShoppingListItem[] = [];
  const seenMap: Record<string, ShoppingListItem> = {};

  dishes.forEach(({ slot, dish }) => {
    if (!dish) return;

    dish.ingredients.forEach(item => {
      const key = item.name.toLowerCase().trim();
      if (seenMap[key]) {
        // Append note or source
        const existing = seenMap[key];
        if (existing.sourceName && !existing.sourceName.includes(dish.name)) {
          existing.sourceName += `, ${dish.name}`;
        }
      } else {
        const cat = item.category || inferIngredientCategory(item.name);
        const newItem: ShoppingListItem = {
          id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: item.name,
          amount: item.amount || "Vừa đủ",
          category: cat,
          sourceType: "day_plan",
          sourceName: `${slot}: ${dish.name}`,
          checked: false,
          notes: item.notes,
          addedAt: new Date().toISOString()
        };
        seenMap[key] = newItem;
        result.push(newItem);
      }
    });
  });

  return result;
}

export function extractDishIngredients(dish: Dish, multiplier: number = 1): ShoppingListItem[] {
  return dish.ingredients.map(item => {
    const cat = item.category || inferIngredientCategory(item.name);
    return {
      id: `dish-item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: item.name,
      amount: item.amount ? (multiplier > 1 ? `${item.amount} (x${multiplier})` : item.amount) : "Vừa đủ",
      category: cat,
      sourceType: "dish",
      sourceName: `Món: ${dish.name}`,
      checked: false,
      notes: item.notes,
      addedAt: new Date().toISOString()
    };
  });
}

export function mergeShoppingItems(
  existingItems: ShoppingListItem[], 
  incomingItems: ShoppingListItem[]
): ShoppingListItem[] {
  const map: Record<string, ShoppingListItem> = {};
  const result: ShoppingListItem[] = [];

  existingItems.forEach(item => {
    map[item.name.toLowerCase().trim()] = item;
    result.push(item);
  });

  incomingItems.forEach(incoming => {
    const key = incoming.name.toLowerCase().trim();
    if (map[key]) {
      // already exists, don't duplicate, but update source name if different
      const current = map[key];
      if (incoming.sourceName && current.sourceName && !current.sourceName.includes(incoming.sourceName)) {
        current.sourceName = `${current.sourceName}, ${incoming.sourceName}`;
      }
    } else {
      map[key] = incoming;
      result.push(incoming);
    }
  });

  return result;
}
