import json

# Load verified food images
from build_catalog import PHOTOS

# We will define categories of authentic real recipes
RECIPES = []

def add_recipe(name, native_name, meals, region, country, flag, cal, pro, carbs, fat, fiber, cost, prep, cook, tastes, suit, allergens, keys, photo_key, desc, method, tips, balance_tip):
    photo_url = PHOTOS.get(photo_key, PHOTOS["asian_soup_noodle"])
    RECIPES.append({
        "name": name,
        "nativeName": native_name,
        "mealTypes": meals,
        "region": region,
        "country": country,
        "flagEmoji": flag,
        "calories": cal,
        "protein": pro,
        "carbs": carbs,
        "fat": fat,
        "fiber": fiber,
        "estimatedCostVND": cost,
        "prepTimeMinutes": prep,
        "cookTimeMinutes": cook,
        "tastes": tastes,
        "dietarySuitability": suit,
        "allergens": allergens,
        "keyIngredients": keys,
        "imageUrl": photo_url,
        "description": desc,
        "method": method,
        "chefTips": tips,
        "nutritionBalanceTip": balance_tip
    })

print("Helper add_recipe ready.")
