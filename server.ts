import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API health endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Lazy Gemini instance helper
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// AI Chef endpoint: Custom dish or custom menu suggestion
app.post("/api/ai-chef/suggest-dish", async (req, res) => {
  try {
    const { ingredients, mealType, region, dietaryPreferences, allergies, targetCalories, servings, budget } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(200).json({
        success: false,
        fallback: true,
        message: "Gemini API key chưa được cấu hình, hệ thống sẽ sử dụng thuật toán gợi ý thực đơn thông minh sẵn có."
      });
    }

    const prompt = `Bạn là một Chuyên gia Dinh dưỡng & Bếp trưởng quốc tế tài ba.
Hãy gợi ý 1 hoặc 2 món ăn sáng tạo, hấp dẫn, chuẩn vị và cân bằng dinh dưỡng dựa trên thông tin sau:
- Nguyên liệu có sẵn: ${ingredients && ingredients.length > 0 ? ingredients.join(", ") : "Tùy chọn tự do"}
- Bữa ăn: ${mealType || "Bất kỳ"}
- Phong cách ẩm thực: ${region || "Á hoặc Âu"}
- Tình trạng sức khỏe / Chế độ ăn: ${dietaryPreferences && dietaryPreferences.length > 0 ? dietaryPreferences.join(", ") : "Bình thường"}
- Thành phần DỊ ỨNG TUYỆT ĐỐI TRÁNH: ${allergies && allergies.length > 0 ? allergies.join(", ") : "Không có"}
- Lượng calo mục tiêu: khoảng ${targetCalories || "500-700"} kcal/người
- Khẩu phần: ${servings || "1-2 người"}
- Ngân sách: ${budget || "Bình dân / Hợp lý"}

Hãy trả về định dạng JSON thuần (không markdown code block nếu được, hoặc bọc trong json) theo cấu trúc sau:
{
  "name": "Tên món ăn hấp dẫn",
  "nativeName": "Tên gốc (nếu là món quốc tế)",
  "region": "Châu Á" hoặc "Châu Âu" hoặc "Mỹ/Khác",
  "country": "Quốc gia",
  "mealType": "Bữa chính" | "Bữa sáng" | "Bữa xế" | "Tráng miệng" | "Ăn vặt",
  "description": "Mô tả ngắn gọn về hương vị và điểm đặc biệt",
  "calories": 550,
  "protein": 32,
  "carbs": 48,
  "fat": 16,
  "fiber": 8,
  "estimatedCostVND": 45000,
  "prepTimeMinutes": 15,
  "cookTimeMinutes": 20,
  "servings": 2,
  "taste": ["Thanh đạm", "Chua ngọt"],
  "ingredients": [
    {"name": "Ức gà", "amount": "300g", "notes": "Cắt miếng vừa ăn"},
    {"name": "Bông cải xanh", "amount": "150g", "notes": "Cắt nhỏ"}
  ],
  "steps": [
    "Sơ chế: Rửa sạch các nguyên liệu, để ráo...",
    "Chế biến: Làm nóng chảo với 1 thìa dầu ô liu...",
    "Hoàn thành: Trình bày ra đĩa và thưởng thức..."
  ],
  "chefTips": "Mẹo nhỏ để món ăn thơm ngon và giữ trọn dưỡng chất",
  "nutritionBalanceAdvice": "Gợi ý thêm món canh rau hoặc nước ép để bữa ăn tròn vị và đủ chất"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "{}";
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      // Clean potential backticks if any
      const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedData = JSON.parse(cleaned);
    }

    return res.json({
      success: true,
      dish: parsedData
    });
  } catch (error: any) {
    console.error("AI Chef API error:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Lỗi khi xử lý yêu cầu với AI Chef"
    });
  }
});

// AI Chef endpoint: Smart ingredient substitutes for missing recipe ingredient
app.post("/api/ai-chef/substitutes", async (req, res) => {
  try {
    const { dishName, missingIngredient, availableIngredients, dishDescription } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(200).json({
        success: false,
        fallback: true,
        message: "Gemini API key chưa cấu hình, chuyển sang kho kiến thức ẩm thực tích hợp sẵn."
      });
    }

    const prompt = `Bạn là một Bếp trưởng & Chuyên gia Ẩm thực giàu kinh nghiệm.
Người dùng đang muốn nấu món: "${dishName || "Món ăn gia đình"}" (${dishDescription || ""}).
Họ đang BỊ THIẾU nguyên liệu: "${missingIngredient}".
Trong tủ lạnh của họ hiện có thể có: ${availableIngredients && availableIngredients.length > 0 ? availableIngredients.join(", ") : "Nguyên liệu gia đình phổ thông"}.

Hãy gợi ý ĐÚNG 2 hoặc 3 nguyên liệu thay thế THÔNG MINH, HỢP VỊ NHẤT cho món "${dishName}".
Ưu tiên những nguyên liệu phổ biến, dễ mua hoặc có thể có sẵn trong tủ lạnh, giữ được kết cấu và sự ngon miệng của món ăn.

Trả về duy nhất JSON thuần với cấu trúc:
{
  "substitutes": [
    {
      "name": "Tên nguyên liệu thay thế (kèm dạng sơ chế nếu cần)",
      "ratio": "Tỷ lệ thay thế (ví dụ: 1:1, hoặc 1 thìa = 1 quả)",
      "description": "Lý do thay thế phù hợp, hương vị và kết cấu mang lại cho món này",
      "cookingAdjustment": "Mẹo nêm nếm hoặc điều chỉnh thời gian nấu khi dùng nguyên liệu này"
    }
  ],
  "chefNote": "Lời khuyên ngắn gọn của bếp trưởng khi chế biến món này với nguyên liệu thay thế"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "{}";
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedData = JSON.parse(cleaned);
    }

    return res.json({
      success: true,
      data: parsedData
    });
  } catch (error: any) {
    console.error("AI Substitute API error:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Lỗi khi gợi ý nguyên liệu thay thế"
    });
  }
});

// AI Chef endpoint: Full day meal plan consultation
app.post("/api/ai-chef/day-plan", async (req, res) => {
  try {
    const { targetCalories, dietaryGoal, healthConditions, allergies, cuisinePreference } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(200).json({
        success: false,
        fallback: true,
        message: "Gemini API key chưa được cấu hình, dùng thuật toán gợi ý sẵn có."
      });
    }

    const prompt = `Bạn là Chuyên gia Dinh dưỡng. Hãy thiết kế thực đơn 1 ngày hoàn chỉnh gồm: Bữa sáng, Bữa trưa, Bữa xế, Bữa tối và Món tráng miệng.
- Mục tiêu calo cả ngày: ${targetCalories || 2000} kcal
- Chế độ/Mục tiêu: ${dietaryGoal || "Cân bằng dinh dưỡng"}
- Tình trạng bệnh lý/Sức khỏe: ${healthConditions && healthConditions.length > 0 ? healthConditions.join(", ") : "Bình thường"}
- DỊ ỨNG CẦN TRÁNH: ${allergies && allergies.length > 0 ? allergies.join(", ") : "Không có"}
- Sở thích ẩm thực: ${cuisinePreference || "Đa dạng Á & Âu"}

Trả về JSON thuần với cấu trúc:
{
  "daySummary": "Lời khuyên dinh dưỡng cho cả ngày",
  "totalCalories": 1950,
  "totalProtein": 110,
  "totalCarbs": 220,
  "totalFat": 55,
  "totalFiber": 30,
  "meals": [
    {
      "mealType": "Bữa sáng",
      "name": "Tên món",
      "calories": 420,
      "description": "Mô tả ngắn gọn",
      "keyIngredients": ["Yến mạch", "Chuối", "Hạt chia", "Sữa hạnh nhân"]
    },
    {
      "mealType": "Bữa trưa",
      "name": "Tên món",
      "calories": 650,
      "description": "Mô tả ngắn gọn",
      "keyIngredients": ["Cơm gạo lứt", "Cá hồi áp chảo", "Canh rong biển"]
    },
    {
      "mealType": "Bữa xế",
      "name": "Tên món",
      "calories": 180,
      "description": "Mô tả ngắn gọn",
      "keyIngredients": ["Sữa chua Hy Lạp", "Quả việt quất"]
    },
    {
      "mealType": "Bữa tối",
      "name": "Tên món",
      "calories": 550,
      "description": "Mô tả ngắn gọn",
      "keyIngredients": ["Ức gà nướng thảo mộc", "Salad xà lách sốt mè"]
    },
    {
      "mealType": "Tráng miệng",
      "name": "Tên món",
      "calories": 150,
      "description": "Mô tả ngắn gọn",
      "keyIngredients": ["Trái cây tươi theo mùa"]
    }
  ],
  "expertAdvice": "Mẹo uống nước và vận động kèm theo"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "{}";
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedData = JSON.parse(cleaned);
    }

    return res.json({
      success: true,
      plan: parsedData
    });
  } catch (error: any) {
    console.error("AI Day Plan error:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Lỗi khi tạo thực đơn cả ngày"
    });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
