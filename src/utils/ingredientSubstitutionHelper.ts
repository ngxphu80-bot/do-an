// src/utils/ingredientSubstitutionHelper.ts

export interface IngredientSubstitute {
  name: string;
  ratio: string;
  description: string;
  cookingAdjustment?: string;
  isCommonPantryItem?: boolean;
}

/**
 * Curated culinary substitution database tailored for Vietnamese & international dishes
 */
const CULINARY_SUBSTITUTE_RULES: {
  keywords: string[];
  substitutes: (dishContext?: { name?: string; region?: string }) => IngredientSubstitute[];
}[] = [
  // Thịt bò
  {
    keywords: ["thịt bò", "bò thăn", "bắp bò", "bò xay", "bò phi lê", "beef"],
    substitutes: (ctx) => [
      {
        name: "Thịt nạc vai heo / Ba chỉ heo",
        ratio: "1:1",
        description: "Độ mềm ngọt tương đồng, dễ ngấm gia vị và giữ được độ mọng nước.",
        cookingAdjustment: "Ướp thêm xíu dầu hào và tiêu đen, xào trên lửa lớn để giữ vị ngọt tự nhiên.",
        isCommonPantryItem: true
      },
      {
        name: "Ức gà / Đùi gà phi lê",
        ratio: "1:1",
        description: "Lựa chọn thanh nhẹ, giàu đạm và ít calo hơn thịt bò.",
        cookingAdjustment: "Thái lát vừa vặn, ướp cùng một thìa sữa chua hoặc xíu bột bắp để thịt gà mềm tan không bị khô.",
        isCommonPantryItem: true
      },
      {
        name: "Nấm đùi gà / Nấm portobello",
        ratio: "1:1 (hoặc kết hợp 50-50)",
        description: "Lựa chọn thuần chay hoàn hảo với kết cấu dai giòn sần sật và vị ngọt umami tự nhiên.",
        cookingAdjustment: "Áp chảo cháy cạnh với tỏi bơ trước khi cho vào nấu cùng món chính.",
        isCommonPantryItem: false
      }
    ]
  },
  // Thịt gà / Ức gà
  {
    keywords: ["thịt gà", "ức gà", "đùi gà", "gà ta", "chicken"],
    substitutes: () => [
      {
        name: "Thịt nạc heo / Thăn heo",
        ratio: "1:1",
        description: "Kết cấu sớ thịt mềm, hương vị trung tính dễ hòa quyện nước sốt.",
        cookingAdjustment: "Thái mỏng theo thớ ngang để thịt mềm, không xào quá lâu tránh dai.",
        isCommonPantryItem: true
      },
      {
        name: "Đậu hũ non / Đậu hũ chiên",
        ratio: "1:1",
        description: "Dễ thấm đẫm nước sốt, bổ sung lượng đạm thực vật lành tính.",
        cookingAdjustment: "Chiên sơ vàng các mặt trước khi kho hoặc xào để đậu hũ không bị vỡ.",
        isCommonPantryItem: true
      },
      {
        name: "Tôm sú / Tôm thẻ",
        ratio: "1:0.8 (giảm nhẹ lượng tôm)",
        description: "Đem lại vị ngọt giòn thanh lịch của hải sản tươi.",
        cookingAdjustment: "Nấu nhanh trong 2-3 phút cuối để tôm giữ nguyên độ giòn ngọt.",
        isCommonPantryItem: false
      }
    ]
  },
  // Thịt heo / Thịt ba chỉ
  {
    keywords: ["thịt heo", "thịt lợn", "thịt ba chỉ", "thăn heo", "pork"],
    substitutes: () => [
      {
        name: "Đùi gà rút xương / Ức gà",
        ratio: "1:1",
        description: "Thay thế tuyệt vời cho món xào, kho hoặc nướng, ít cholesterol hơn.",
        cookingAdjustment: "Với món kho, có thể thêm một chút dầu dừa hoặc dầu ăn để tạo độ óng ả.",
        isCommonPantryItem: true
      },
      {
        name: "Thịt bò nạc",
        ratio: "1:0.9",
        description: "Vị đậm đà và giàu khoáng chất sắt, kết hợp tốt với nước tương và tỏi.",
        cookingAdjustment: "Rút ngắn thời gian nấu trên bếp để thịt bò không bị dai.",
        isCommonPantryItem: true
      },
      {
        name: "Nấm hương tươi / Nấm bào ngư",
        ratio: "1:1",
        description: "Độ dai bùi tự nhiên, tạo hương thơm thảo mộc cuốn hút.",
        cookingAdjustment: "Xào thơm cùng hành tím phi vàng trước khi om kho.",
        isCommonPantryItem: false
      }
    ]
  },
  // Tôm / Hải sản
  {
    keywords: ["tôm", "tôm sú", "tôm thẻ", "shrimp", "prawn"],
    substitutes: () => [
      {
        name: "Mực tươi / Bạch tuộc",
        ratio: "1:1",
        description: "Độ giòn ngọt của hải sản tự nhiên, màu sắc tươi tắn hấp dẫn.",
        cookingAdjustment: "Khía vảy rồng trên thân mực và xào nhanh trên lửa cực lớn trong 2 phút.",
        isCommonPantryItem: false
      },
      {
        name: "Cá phi lê (cá hồi, cá chẽm, cá lóc)",
        ratio: "1:1",
        description: "Thịt cá mềm thơm, giàu Omega-3 có lợi cho tim mạch.",
        cookingAdjustment: "Cắt quân cờ dày và đảo nhẹ tay để cá không bị nát vụn.",
        isCommonPantryItem: false
      },
      {
        name: "Đậu hũ chiên vàng / Trứng cút",
        ratio: "1:1",
        description: "Thay thế dân dã, giá thành hợp lý và tạo độ bùi béo hấp dẫn.",
        cookingAdjustment: "Rất thích hợp cho các món canh chua, mì xào hoặc món kho mặn ngọt.",
        isCommonPantryItem: true
      }
    ]
  },
  // Trứng gà
  {
    keywords: ["trứng gà", "trứng vịt", "trứng", "egg"],
    substitutes: () => [
      {
        name: "Đậu hũ non tán nhuyễn",
        ratio: "1 quả trứng = 50g đậu hũ non",
        description: "Tạo kết cấu mềm mịn tương đương trong các món xào, súp hoặc canh cà chua.",
        cookingAdjustment: "Nêm thêm xíu bột nghệ để tạo màu vàng tươi tự nhiên như lòng đỏ trứng.",
        isCommonPantryItem: true
      },
      {
        name: "Trứng cút",
        ratio: "1 quả trứng gà = 4-5 quả trứng cút",
        description: "Hương vị béo ngậy nguyên bản, tạo điểm nhấn đẹp mắt cho đĩa ăn.",
        cookingAdjustment: "Luộc chín bóc vỏ hoặc đập trực tiếp vào chảo ốp la mini.",
        isCommonPantryItem: true
      },
      {
        name: "Bột bắp / Bột năng pha loãng",
        ratio: "1 quả trứng = 1 thìa canh bột + 3 thìa nước",
        description: "Dành riêng cho món súp, nước sốt cần độ sánh sệt sánh mịn.",
        cookingAdjustment: "Khuấy đều khi nước đang sôi lăn tăn để tạo độ óng trong suốt.",
        isCommonPantryItem: true
      }
    ]
  },
  // Cà chua
  {
    keywords: ["cà chua", "tomato"],
    substitutes: () => [
      {
        name: "Sốt cà chua hộp / Tương cà (Ketchup)",
        ratio: "1 quả cà chua = 2 thìa canh sốt cà",
        description: "Vị chua ngọt đậm đà, màu đỏ cam bóng bẩy bắt mắt.",
        cookingAdjustment: "Giảm lượng đường nêm nếm vì sốt hộp đã có độ ngọt sẵn.",
        isCommonPantryItem: true
      },
      {
        name: "Me chua / Nước cốt chanh / Dấm gạo",
        ratio: "1 quả cà chua = 1 thìa nước cốt chua + 1/2 thìa đường",
        description: "Tạo độ chua thanh tự nhiên cho các món canh, lẩu hoặc xào chua ngọt.",
        cookingAdjustment: "Nêm vào cuối quá trình nấu để giữ trọn mùi thơm thanh dịu.",
        isCommonPantryItem: true
      },
      {
        name: "Ớt chuông đỏ",
        ratio: "1 quả cà chua = 1/2 quả ớt chuông",
        description: "Màu đỏ rực rỡ, vị ngọt giòn và dồi dào vitamin C gấp 3 lần cam.",
        cookingAdjustment: "Thái hạt lựu và xào chín mềm để tinh dầu thơm tiết ra hòa quyện sốt.",
        isCommonPantryItem: true
      }
    ]
  },
  // Hành tây
  {
    keywords: ["hành tây", "onion"],
    substitutes: () => [
      {
        name: "Hành tím (Hành ta)",
        ratio: "1 củ hành tây = 4-5 củ hành tím",
        description: "Mùi thơm nồng đượm, vị ngọt thanh tự nhiên sau khi phi thơm.",
        cookingAdjustment: "Bào mỏng, phi thơm nhẹ nhàng không để cháy cạnh.",
        isCommonPantryItem: true
      },
      {
        name: "Đầu hành lá (Gốc hành trắng)",
        ratio: "1 củ hành tây = 5-6 gốc hành trắng",
        description: "Độ giòn ngọt tươi mới, phù hợp cả món xào, món súp và canh.",
        cookingAdjustment: "Chẻ dọc gốc hành và cho vào xào thơm ở bước đầu tiên.",
        isCommonPantryItem: true
      },
      {
        name: "Tỏi tây (Hành boa-rô / Leek)",
        ratio: "1 củ hành tây = 1/2 cây tỏi tây",
        description: "Hương thơm thanh tao chuẩn phong cách ẩm thực Âu và Á cao cấp.",
        cookingAdjustment: "Thái vát chéo mỏng và xào cùng bơ hoặc dầu thực vật.",
        isCommonPantryItem: false
      }
    ]
  },
  // Bông cải xanh / Súp lơ
  {
    keywords: ["bông cải xanh", "súp lơ", "broccoli", "cauliflower"],
    substitutes: () => [
      {
        name: "Bông cải trắng (Súp lơ trắng)",
        ratio: "1:1",
        description: "Họ hàng gần nhất, kết cấu giòn mềm tương đồng, màu sắc nhã nhặn.",
        cookingAdjustment: "Luộc sơ nước sôi có chút muối trong 1.5 phút trước khi xào.",
        isCommonPantryItem: true
      },
      {
        name: "Đậu cô ve / Đậu Hà Lan",
        ratio: "1:1",
        description: "Vị giòn ngọt sần sật, giàu chất xơ và bổ sung sắc xanh tươi tắn.",
        cookingAdjustment: "Tước sạch xơ 2 bên mép đậu và cắt khúc vừa ăn.",
        isCommonPantryItem: true
      },
      {
        name: "Bắp cải / Cải ngọt",
        ratio: "1:1",
        description: "Dễ mua ở mọi nơi, vị ngọt nước tự nhiên rất dễ chịu.",
        cookingAdjustment: "Xào lửa lớn nhanh tay để giữ độ giòn ngọt mọng nước.",
        isCommonPantryItem: true
      }
    ]
  },
  // Phô mai / Cheese
  {
    keywords: ["phô mai", "cheese", "parmesan", "mozzarella", "cheddar"],
    substitutes: () => [
      {
        name: "Phô mai con bò cười / Phô mai lát",
        ratio: "1:1",
        description: "Tạo độ ngậy béo bùi mềm mịn tức thì trong mì Ý, súp hoặc bánh mì.",
        cookingAdjustment: "Tán nhuyễn với chút sữa tươi ấm trước khi trộn vào sốt.",
        isCommonPantryItem: true
      },
      {
        name: "Bơ lạt + Lòng đỏ trứng gà",
        ratio: "30g phô mai = 1 thìa bơ + 1 lòng đỏ",
        description: "Bí quyết kinh điển của sốt Carbonara Ý: tạo độ béo mượt óng ả.",
        cookingAdjustment: "Tắt bếp trước khi đổ hỗn hợp trứng bơ vào để không bị vón cục.",
        isCommonPantryItem: true
      },
      {
        name: "Sữa chua Hy Lạp / Nước cốt dừa",
        ratio: "1:1",
        description: "Lựa chọn healthy thanh mát, tạo độ sánh kem bùi dịu dàng.",
        cookingAdjustment: "Cho vào ở bước cuối cùng và khuấy đều trên lửa nhỏ liu riu.",
        isCommonPantryItem: true
      }
    ]
  },
  // Nước dừa tươi (trong món kho, hầm)
  {
    keywords: ["nước dừa", "nước dừa tươi", "coconut water"],
    substitutes: () => [
      {
        name: "Nước lọc + Nước màu mía / Đường thốt nốt",
        ratio: "1 chén nước dừa = 1 chén nước + 1 thìa đường thốt nốt",
        description: "Tạo màu nâu cánh gián óng ả và vị ngọt đậm đà chuẩn vị truyền thống.",
        cookingAdjustment: "Thắng đường thốt nốt tan chảy tạo màu hổ phách trước khi cho nước vào om.",
        isCommonPantryItem: true
      },
      {
        name: "Nước ngọt có ga (Sá xị / Coca / Pepsi)",
        ratio: "1:1",
        description: "Mẹo bếp trưởng: Ga và đường giúp thịt kho mau mềm nhừ và lên màu cực đẹp.",
        cookingAdjustment: "Giảm bớt đường trong công thức vì nước ngọt đã có sẵn độ ngọt.",
        isCommonPantryItem: true
      },
      {
        name: "Nước hầm xương heo hoặc rau củ",
        ratio: "1:1",
        description: "Tạo vị ngọt sâu lắng, thanh đạm tự nhiên từ tủy xương.",
        cookingAdjustment: "Nêm thêm xíu nước mắm ngon loại đậm đà.",
        isCommonPantryItem: false
      }
    ]
  },
  // Nước mắm
  {
    keywords: ["nước mắm", "fish sauce"],
    substitutes: () => [
      {
        name: "Nước tương ngon + Muối tinh",
        ratio: "1 thìa nước mắm = 1 thìa nước tương + 1/4 thìa muối",
        description: "Vị mặn sâu umami từ đậu nành lên men, rất thơm khi kho hoặc xào.",
        cookingAdjustment: "Có thể vắt thêm vài giọt chanh để làm sáng hương vị.",
        isCommonPantryItem: true
      },
      {
        name: "Dầu hào (Oyster sauce)",
        ratio: "1 thìa nước mắm = 1 thìa dầu hào",
        description: "Vị mặn ngọt đượm đà và tạo độ bóng bẩy tuyệt hảo cho món xào, rim.",
        cookingAdjustment: "Dầu hào có độ đặc sánh nên hòa cùng xíu nước ấm trước khi ướp.",
        isCommonPantryItem: true
      },
      {
        name: "Muối biển + Bột ngọt/hạt nêm",
        ratio: "1 thìa nước mắm = 1/2 thìa muối + 1/2 thìa hạt nêm",
        description: "Giải pháp nhanh gọn nhất có sẵn trong mọi gian bếp gia đình.",
        cookingAdjustment: "Hòa tan trong nước ấm trước khi nêm vào canh hoặc kho.",
        isCommonPantryItem: true
      }
    ]
  },
  // Dầu hào
  {
    keywords: ["dầu hào", "oyster sauce"],
    substitutes: () => [
      {
        name: "Nước tương + Đường cát (hoặc mật ong)",
        ratio: "1 thìa dầu hào = 1 thìa nước tương + 1/2 thìa đường",
        description: "Tái tạo hoàn hảo tỷ lệ mặn ngọt đặc trưng của dầu hào.",
        cookingAdjustment: "Đun liu riu cho đường tan chảy tạo độ sánh mịn.",
        isCommonPantryItem: true
      },
      {
        name: "Hắc xì dầu (Nước tương đen ngọt)",
        ratio: "1:1",
        description: "Màu cánh gián bóng đẹp và hương thơm nồng nàn của đậu nành.",
        cookingAdjustment: "Rất hợp với các món xào mì, xào rau muống và ướp thịt nướng.",
        isCommonPantryItem: false
      },
      {
        name: "Sốt tương đen ngọt (Hoisin sauce)",
        ratio: "1:1",
        description: "Độ sánh đặc tương đương, vị ngọt thơm từ thảo quả và hoa hồi.",
        cookingAdjustment: "Thích hợp cho món ướp đồ nướng, vịt quay, sườn ram.",
        isCommonPantryItem: false
      }
    ]
  },
  // Gừng
  {
    keywords: ["gừng", "ginger"],
    substitutes: () => [
      {
        name: "Bột gừng khô",
        ratio: "1 củ gừng tươi (15g) = 1/2 thìa cà phê bột gừng",
        description: "Vị cay ấm cô đọng, dễ hòa tan vào nước sốt và nước chấm.",
        cookingAdjustment: "Cho vào ngay lúc ướp để hương thơm lan tỏa đều.",
        isCommonPantryItem: true
      },
      {
        name: "Sả tươi đập dập",
        ratio: "1 nhánh gừng = 1 nhánh sả",
        description: "Khử mùi tanh cực kỳ hiệu quả, tạo hương thơm đồng quê thanh khiết.",
        cookingAdjustment: "Đập dập phần gốc trắng và phi thơm cùng hành tỏi.",
        isCommonPantryItem: true
      },
      {
        name: "Rượu trắng / Rượu Mai Quế Lộ",
        ratio: "1 củ gừng = 1 thìa canh rượu",
        description: "Bí quyết của đầu bếp nhà hàng để khử sạch mùi tanh của thịt cá.",
        cookingAdjustment: "Dùng để rửa sơ hoặc ướp thực phẩm trong 5 phút trước khi nấu.",
        isCommonPantryItem: true
      }
    ]
  },
  // Sữa tươi / Sữa chua
  {
    keywords: ["sữa tươi", "sữa đặc", "milk"],
    substitutes: () => [
      {
        name: "Nước cốt dừa",
        ratio: "1:1",
        description: "Độ béo ngậy ngọt bùi đậm chất nhiệt đới, thơm nức mũi.",
        cookingAdjustment: "Rất ngon khi kết hợp cùng cà ri, xôi, chè hoặc súp bí đỏ.",
        isCommonPantryItem: true
      },
      {
        name: "Sữa chua Hy Lạp pha loãng",
        ratio: "1:1",
        description: "Tạo độ sánh mượt và vị chua thanh nhẹ kích thích vị giác.",
        cookingAdjustment: "Khuấy tan cùng chút nước ấm trước khi trộn vào món ăn.",
        isCommonPantryItem: true
      },
      {
        name: "Sữa hạt (sữa đậu nành, hạnh nhân, yến mạch)",
        ratio: "1:1",
        description: "Lựa chọn thuần chay lành mạnh, ít béo ngậy hơn nhưng rất thanh tao.",
        cookingAdjustment: "Chọn loại không đường để dễ dàng điều chỉnh gia vị món mặn.",
        isCommonPantryItem: true
      }
    ]
  },
  // Cơm trắng / Tinh bột
  {
    keywords: ["cơm trắng", "cơm", "gạo", "rice"],
    substitutes: () => [
      {
        name: "Cơm gạo lứt / Hạt Quinoa",
        ratio: "1:1",
        description: "Chỉ số đường huyết (GI) thấp, giàu chất xơ và no lâu gấp đôi.",
        cookingAdjustment: "Nấu với nhiều nước hơn một chút để hạt cơm nở mềm dẻo.",
        isCommonPantryItem: true
      },
      {
        name: "Khoai lang / Khoai tây hấp",
        ratio: "1 chén cơm = 1 củ khoai vừa (150g)",
        description: "Nguồn tinh bột phức hợp tự nhiên, vị ngọt bùi ngon lành.",
        cookingAdjustment: "Cắt quân cờ hấp chín hoặc nướng sơ bằng nồi chiên không dầu.",
        isCommonPantryItem: true
      },
      {
        name: "Bún tươi / Bánh phở / Mì sợi",
        ratio: "1 chén cơm = 100g bún/mì",
        description: "Dễ nuốt, thanh nhẹ và đổi gió bữa ăn gia đình phong phú.",
        cookingAdjustment: "Trần qua nước sôi 30 giây trước khi chan nước dùng hoặc trộn sốt.",
        isCommonPantryItem: true
      }
    ]
  },
  // Nấm
  {
    keywords: ["nấm", "nấm mỡ", "nấm hương", "nấm đùi gà", "mushroom"],
    substitutes: () => [
      {
        name: "Đậu hũ non chiên giòn",
        ratio: "1:1",
        description: "Vị bùi béo, mềm trong giòn ngoài, thay thế chất đạm thực vật hoàn hảo.",
        cookingAdjustment: "Cắt miếng vừa ăn, chiên vàng ươm trước khi cho vào nấu cùng.",
        isCommonPantryItem: true
      },
      {
        name: "Cà tím / Quả bí ngòi",
        ratio: "1:1",
        description: "Kết cấu mềm mọng xốp sau khi chín, hút trọn nước sốt thơm ngon.",
        cookingAdjustment: "Thái vát chéo, xào lửa vừa với tỏi và dầu hào.",
        isCommonPantryItem: true
      },
      {
        name: "Thịt băm hoặc ức gà xé",
        ratio: "1:0.8",
        description: "Tăng cường năng lượng và chất đạm động vật nếu bạn không ăn chay.",
        cookingAdjustment: "Phi thơm cùng hành tím trước khi cho rau củ vào.",
        isCommonPantryItem: true
      }
    ]
  }
];

/**
 * Find 2-3 tailored substitute ingredients for a missing ingredient
 */
export function getIngredientSubstitutes(
  ingredientName: string,
  dishContext?: { name?: string; region?: string; mealType?: string }
): IngredientSubstitute[] {
  const normName = ingredientName.toLowerCase().trim();

  // Find matching rule
  for (const rule of CULINARY_SUBSTITUTE_RULES) {
    if (rule.keywords.some(kw => normName.includes(kw) || kw.includes(normName))) {
      return rule.substitutes(dishContext);
    }
  }

  // Fallback smart culinary rule based on general food classification
  if (normName.includes("thịt") || normName.includes("cá") || normName.includes("hải sản")) {
    return [
      {
        name: "Ức gà hoặc thịt heo thăn",
        ratio: "1:1",
        description: "Loại thịt trắng mềm mọng, dễ chế biến và thấm vị sốt của món.",
        cookingAdjustment: "Thái mỏng theo thớ và xào lửa lớn.",
        isCommonPantryItem: true
      },
      {
        name: "Đậu hũ non hoặc đậu hũ chiên",
        ratio: "1:1",
        description: "Nguồn đạm thanh nhẹ, mềm ngậy và chống ngấy hiệu quả.",
        cookingAdjustment: "Chiên vàng sơ các mặt để giữ hình dáng đẹp mắt.",
        isCommonPantryItem: true
      },
      {
        name: "Trứng gà / Trứng cút",
        ratio: "1 phần thịt = 2 quả trứng",
        description: "Nguyên liệu dễ tìm nhất, giàu đạm và thơm béo tự nhiên.",
        cookingAdjustment: "Ốp la hoặc luộc lòng đào tùy theo tính chất món ăn.",
        isCommonPantryItem: true
      }
    ];
  }

  if (normName.includes("rau") || normName.includes("củ") || normName.includes("quả")) {
    return [
      {
        name: "Cải ngọt / Cải bắp / Cải thìa",
        ratio: "1:1",
        description: "Rau họ cải giòn ngọt nhiều nước, phù hợp cho cả xào, luộc và nấu canh.",
        cookingAdjustment: "Xào nhanh tay lửa lớn để giữ màu xanh mướt.",
        isCommonPantryItem: true
      },
      {
        name: "Cà rốt hoặc Dưa leo thái mỏng",
        ratio: "1:1",
        description: "Độ giòn ngọt tươi tắn, tạo màu sắc hấp dẫn cho đĩa thức ăn.",
        cookingAdjustment: "Thái sợi hoặc thái lát vát chéo mỏng.",
        isCommonPantryItem: true
      },
      {
        name: "Nấm tươi các loại (nấm đùi gà, nấm rơm)",
        ratio: "1:1",
        description: "Bổ sung vị ngọt umami tự nhiên và chất xơ quý giá.",
        cookingAdjustment: "Rửa nhanh và để ráo trước khi cho vào xào nấu.",
        isCommonPantryItem: true
      }
    ];
  }

  // Generic universal substitute
  return [
    {
      name: "Nguyên liệu cùng nhóm tương đồng trong tủ lạnh",
      ratio: "1:1",
      description: "Có thể thay bằng các nguyên liệu cùng nhóm đạm, rau củ hoặc gia vị sẵn có mà bạn thích.",
      cookingAdjustment: "Nếm thử nước sốt sau khi nấu để điều chỉnh độ mặn ngọt vừa miệng.",
      isCommonPantryItem: true
    },
    {
      name: "Đậu hũ non / Nấm tươi",
      ratio: "1:1",
      description: "Hương vị trung tính, dễ dàng hấp thu trọn vẹn gia vị của món ăn.",
      cookingAdjustment: "Cho vào ở bước giữa để nguyên liệu ngấm sâu gia vị.",
      isCommonPantryItem: true
    }
  ];
}
