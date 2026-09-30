import React, { useState, useMemo, useEffect } from "react";
import { UserHealthProfile, Dish, HealthProfileType } from "../types";
import { 
  Lightbulb, Sparkles, RefreshCw, Copy, Check, Heart, 
  ChevronDown, ChevronUp, ArrowRight, ShieldCheck, Flame, 
  Dumbbell, Scale, HeartPulse, ExternalLink, Bookmark
} from "lucide-react";
import { DishIllustration } from "./DishIllustration";

export interface NutritionFactTip {
  id: string;
  goal: "lose_weight" | "gain_muscle" | "gain_weight" | "maintain";
  category: "science" | "food_hack" | "timing" | "metabolism" | "hydration" | "mindful";
  categoryLabel: string;
  categoryIcon: string;
  badge: string;
  title: string;
  fact: string;
  actionTip: string;
  suggestedTags: string[];
  recommendedHealthCondition: HealthProfileType;
}

const NUTRITION_TIPS_DATA: NutritionFactTip[] = [
  // --- LOSE WEIGHT (Giảm cân / Eat Clean) ---
  {
    id: "lw-1",
    goal: "lose_weight",
    category: "metabolism",
    categoryLabel: "Hiệu Ứng Nhiệt Thực Phẩm (TEF)",
    categoryIcon: "🔥",
    badge: "Đốt Calo Tự Nhiên",
    title: "Protein Tự Tiêu Hao 25% Calo Của Chính Nó Khi Tiêu Hóa",
    fact: "Cơ thể tiêu tốn từ 20% đến 30% lượng calo của protein chỉ để phân giải và hấp thụ nó (so với chỉ 0-3% của chất béo và 5-10% của tinh bột). Ví dụ: khi bạn ăn 100 kcal từ ức gà, cơ thể thực chất chỉ hấp thu ~75 kcal ròng.",
    actionTip: "Bổ sung một nguồn đạm nạc (ức gà, cá, tôm, đậu phụ, trứng) vào mọi bữa ăn để thúc đẩy trao đổi chất và giữ no lâu thêm 3-4 giờ.",
    suggestedTags: ["Ức gà", "Cá hồi", "Đậu hũ", "Salad"],
    recommendedHealthCondition: "weight_loss"
  },
  {
    id: "lw-2",
    goal: "lose_weight",
    category: "food_hack",
    categoryLabel: "Chỉ Số No Quốc Tế (Satiety Index)",
    categoryIcon: "🥔",
    badge: "Giảm Thèm Ăn",
    title: "Khoai Tây Luộc Là Thực Phẩm Đứng Đầu Về Khả Năng No Lâu",
    fact: "Theo nghiên cứu của Đại học Sydney về Chỉ số No (Satiety Index), khoai tây luộc/hấp no gấp 3.2 lần bánh mì trắng và gấp 1.5 lần yến mạch cùng mức calo, nhờ lượng tinh bột kháng (resistant starch) và cấu trúc giữ nước cao.",
    actionTip: "Thay thế cơm trắng tinh chế bằng khoai lang, khoai tây luộc để nguội nhẹ hoặc yến mạch nguyên hạt để no căng bụng mà vẫn thâm hụt calo nhẹ nhàng.",
    suggestedTags: ["Khoai lang", "Yến mạch", "Rau luộc"],
    recommendedHealthCondition: "weight_loss"
  },
  {
    id: "lw-3",
    goal: "lose_weight",
    category: "hydration",
    categoryLabel: "Khoa Học Thủy Hóa",
    categoryIcon: "💧",
    badge: "Tăng Trao Đổi Chất",
    title: "Uống 500ml Nước Trước Bữa Ăn Giảm 13% Lượng Ăn Tự Nhiên",
    fact: "Nghiên cứu lâm sàng chỉ ra rằng uống 500ml nước lọc ấm trước bữa ăn chính 30 phút giúp tăng tốc độ trao đổi chất lên 24-30% trong 60 phút tiếp theo, đồng thời gửi tín hiệu no sớm lên não giúp giảm trung bình 75-90 kcal mỗi bữa.",
    actionTip: "Tập thói quen uống một cốc nước ấm lớn trước khi ngồi vào bàn ăn trưa và tối. Tránh uống nước ngọt có ga hay nước ép đóng chai.",
    suggestedTags: ["Canh thanh đạm", "Nước lọc", "Trà xanh"],
    recommendedHealthCondition: "weight_loss"
  },
  {
    id: "lw-4",
    goal: "lose_weight",
    category: "timing",
    categoryLabel: "Sinh Học Nhịp Điệu",
    categoryIcon: "🌙",
    badge: "Đồng Hồ Sinh Học",
    title: "Ăn Tối Cách Giờ Đi Ngủ 3 Tiếng Giúp Cơ Thể Bật Cơ Chế Đốt Mỡ",
    fact: "Khi bạn hoàn thành bữa tối trước giờ ngủ ít nhất 3 tiếng, nồng độ Insulin giảm xuống mức nền, cho phép hormone GH (Growth Hormone) và Lipase tăng sinh vào ban đêm để phân giải mỡ dự trữ thay vì tích tụ năng lượng dư thừa.",
    actionTip: "Cố gắng ăn tối nhẹ nhàng trước 19h30, hạn chế tinh bột nhanh vào ban đêm và ưu tiên rau xanh luộc cùng protein hấp/nấu canh thanh nhiệt.",
    suggestedTags: ["Canh rau", "Cá hấp", "Canh rong biển"],
    recommendedHealthCondition: "weight_loss"
  },
  {
    id: "lw-5",
    goal: "lose_weight",
    category: "science",
    categoryLabel: "Mật Độ Năng Lượng",
    categoryIcon: "🥗",
    badge: "Kỹ Thuật Thể Tích",
    title: "Ăn Canh Hoặc Salad Trước Giảm 20% Tổng Calo Của Cả Bữa",
    fact: "Các nghiên cứu từ ĐH Penn State (Mỹ) chứng minh rằng bắt đầu bữa ăn bằng 1 bát canh rau thanh đạm hoặc đĩa rau củ tươi giúp làm căng thành dạ dày, kích hoạt thụ thể căng (stretch receptors) tạo cảm giác no tự nhiên.",
    actionTip: "Áp dụng thứ tự ăn thông minh: Canh/Rau xanh trước -> Thịt/Cá/Protein -> Tinh bột cuối cùng để làm chậm hấp thu đường vào máu.",
    suggestedTags: ["Canh cải", "Gỏi ngó sen", "Salad ức gà"],
    recommendedHealthCondition: "weight_loss"
  },

  // --- GAIN MUSCLE (Tăng cơ Gym / High Protein) ---
  {
    id: "gm-1",
    goal: "gain_muscle",
    category: "science",
    categoryLabel: "Tổng Hợp Cơ Bắp (MPS)",
    categoryIcon: "🧬",
    badge: "Ngưỡng Leucine",
    title: "Cơ Bắp Cần Ít Nhất 2.7g - 3g Leucine Để Kích Hoạt MPS Tối Đa",
    fact: "Leucine là axit amin chuỗi nhánh (BCAA) đóng vai trò như chiếc chìa khóa kích hoạt công tắc mTOR trong tế bào cơ. Một khẩu phần chứa khoảng 120-150g ức gà, thịt bò nạc hoặc 3 quả trứng sẽ cung cấp đủ lượng Leucine cần thiết.",
    actionTip: "Đảm bảo mỗi bữa ăn chính có tối thiểu 25g - 35g protein chất lượng cao để vượt qua ngưỡng Leucine, kích thích cơ bắp phát triển liên tục.",
    suggestedTags: ["Ức gà áp chảo", "Bò bít tết", "Trứng", "Cá hồi"],
    recommendedHealthCondition: "gym"
  },
  {
    id: "gm-2",
    goal: "gain_muscle",
    category: "timing",
    categoryLabel: "Khung Giờ Hấp Thụ",
    categoryIcon: "⏱️",
    badge: "Phân Bổ Đạm",
    title: "Chia Protein Thành 3-4 Cữ Tốt Hơn Dồn Hết Vào Một Bữa",
    fact: "Nghiên cứu của Tạp chí Dinh Dưỡng Thể Thao Quốc Tế (JISSN) chỉ ra rằng cơ bắp tổng hợp protein tối ưu nhất khi được cung cấp 0.4g - 0.55g đạm/kg thể trọng mỗi 3-4 tiếng, thay vì ăn dồn 80-100g vào bữa tối.",
    actionTip: "Phân chia lượng đạm đều đặn cho bữa sáng, trưa, xế và tối. Đừng quên một bữa phụ giàu đạm như sữa chua Hy Lạp hoặc trứng luộc vào buổi xế.",
    suggestedTags: ["Thịt bò áp chảo", "Tôm rim", "Cơm tấm bì chả"],
    recommendedHealthCondition: "gym"
  },
  {
    id: "gm-3",
    goal: "gain_muscle",
    category: "metabolism",
    categoryLabel: "Đồng Hóa Glycogen",
    categoryIcon: "⚡",
    badge: "Phục Hồi Sức Mạnh",
    title: "Carb Sau Tập Đưa Amino Acid Thẳng Vào Sợi Cơ Nhanh Hơn",
    fact: "Insulin tiết ra sau khi ăn tinh bột đóng vai trò như một chiếc xe vận chuyển, đẩy amino acid từ protein vào sợi cơ bị tổn thương để phục hồi, đồng thời bù đắp kho dự trữ năng lượng Glycogen cạn kiệt.",
    actionTip: "Sau buổi tập tạ 45 phút, hãy thưởng thức bữa ăn kết hợp cả đạm và tinh bột hấp thu vừa như cơm trắng, khoai tây kèm thịt bò nạc hoặc ức gà.",
    suggestedTags: ["Cơm bò xào", "Cơm gà xé", "Mì Ý bò bằm"],
    recommendedHealthCondition: "gym"
  },
  {
    id: "gm-4",
    goal: "gain_muscle",
    category: "science",
    categoryLabel: "Creatine Tự Nhiên",
    categoryIcon: "🥩",
    badge: "Sức Bật Cơ Bắp",
    title: "Thịt Bò & Cá Hồi Là Nguồn Cung Cấp Creatine Tự Nhiên Dồi Dào Nhất",
    fact: "1kg thịt bò tươi chứa khoảng 4.5g - 5g Creatine tự nhiên. Creatine giúp tái tạo ATP (nguồn năng lượng bùng nổ tức thì) cho phép bạn nâng tạ nặng hơn và tăng khối lượng cơ nạc nhanh hơn.",
    actionTip: "Đưa thịt bò nạc, cá ngừ hoặc cá hồi vào thực đơn 2-3 lần mỗi tuần để nạp Creatine và kẽm sinh học tự nhiên cho hệ cơ xương khớp.",
    suggestedTags: ["Bò lúc lắc", "Cá hồi nướng", "Thăn bò xào cần tây"],
    recommendedHealthCondition: "gym"
  },

  // --- GAIN WEIGHT (Tăng cân an toàn / Bồi bổ) ---
  {
    id: "gw-1",
    goal: "gain_weight",
    category: "food_hack",
    categoryLabel: "Mật Độ Năng Lượng Cao",
    categoryIcon: "🥑",
    badge: "Tăng Calo Dễ Dàng",
    title: "1 Thìa Dầu Oliu Hoặc Bơ Đậu Phộng Tăng Ngay 100-120 kcal Bổ Dưỡng",
    fact: "Chất béo thực vật lành mạnh cung cấp 9 kcal/gram (gấp đôi so với protein hay carb chỉ có 4 kcal/gram). Bạn có thể tăng 300-500 kcal mỗi ngày một cách nhẹ nhàng mà không cần ăn no căng tức bụng.",
    actionTip: "Thêm hạt điều, óc chó giã nhỏ vào cơm/cháo, hoặc rưới thêm 1 thìa dầu mè nguyên chất vào món súp, canh để tăng calo chất lượng cao.",
    suggestedTags: ["Cháo sườn bồi bổ", "Cơm tấm", "Súp gà ngô non", "Bơ"],
    recommendedHealthCondition: "malnutrition"
  },
  {
    id: "gw-2",
    goal: "gain_weight",
    category: "hydration",
    categoryLabel: "Thức Uống Dinh Dưỡng",
    categoryIcon: "🥛",
    badge: "Calo Dạng Lỏng",
    title: "Năng Lượng Dạng Lỏng Không Làm Dạ Dày Bị Cảm Giác Đầy Lâu",
    fact: "Dạ dày làm rỗng thức uống lỏng nhanh gấp 3 lần thức ăn đặc thô. Sinh tố chuối bơ sữa đặc hoặc sữa hạt dinh dưỡng giúp nạp thêm 450 kcal trong vài phút mà bạn vẫn thấy ngon miệng ở bữa kế tiếp.",
    actionTip: "Bổ sung một ly sinh tố bơ chuối béo ngậy hoặc sữa đậu phộng vào bữa xế chiều (15h30 - 16h) giữa hai bữa chính.",
    suggestedTags: ["Sinh tố bơ", "Chè đậu ngự", "Súp bí đỏ kem tươi"],
    recommendedHealthCondition: "malnutrition"
  },
  {
    id: "gw-3",
    goal: "gain_weight",
    category: "timing",
    categoryLabel: "Nhịp Ăn Liên Tục",
    categoryIcon: "🍽️",
    badge: "Hấp Thu Tối Đa",
    title: "Ăn 5 Bữa Nhỏ Mỗi Ngày Tránh Quá Tải Men Tiêu Hóa Ruột non",
    fact: "Hệ tiêu hóa của người gầy thường thiếu enzyme hoặc có nhu động ruột nhạy cảm. Ăn dồn quá nhiều thức ăn vào một bữa gây đầy hơi và bài tiết ra ngoài trước khi kịp hấp thu dưỡng chất.",
    actionTip: "Duy trì đồng hồ sinh học: 3 bữa chính đầy đủ thịt cá cơm canh + 2 bữa phụ nhẹ nhàng với sữa chua hoa quả hoặc bánh dinh dưỡng.",
    suggestedTags: ["Gà hầm hạt sen", "Cháo cá hồi", "Bò kho"],
    recommendedHealthCondition: "malnutrition"
  },

  // --- MAINTAIN (Duy trì / Sống khỏe cân bằng) ---
  {
    id: "mt-1",
    goal: "maintain",
    category: "mindful",
    categoryLabel: "Tâm Lý Ăn Uống",
    categoryIcon: "⚖️",
    badge: "Bền Vững Trọn Đời",
    title: "Quy Tắc 80/20 Giúp Duy Trì Cân Nặng Lý Tưởng Không Căng Thẳng",
    fact: "Nghiên cứu hành vi ăn uống cho thấy người kiêng khem 100% đồ ngọt hay món chiên có nguy cơ bỏ cuộc và ăn bù (binge eat) cao gấp 4 lần. Hãy dành 80% cho thực phẩm nguyên bản giàu vi chất và 20% cho món bạn yêu thích.",
    actionTip: "Đừng kiêng khem cực đoan! Ăn uống thoải mái vui vẻ cùng bạn bè và gia đình, duy trì các bữa ăn cân đối đầy đủ chất xơ và đạm sạch.",
    suggestedTags: ["Phở bò", "Bún chả", "Cơm niêu gia đình"],
    recommendedHealthCondition: "weight_loss"
  },
  {
    id: "mt-2",
    goal: "maintain",
    category: "science",
    categoryLabel: "Hệ Vi Sinh Đường Ruột (Microbiome)",
    categoryIcon: "🦠",
    badge: "Đề Kháng & Tâm Trạng",
    title: "90% Serotonin (Hormone Hạnh Phúc) Được Sản Xuất Trong Đường Ruột",
    fact: "Ruột được gọi là 'Bộ não thứ hai' của cơ thể. Một hệ vi sinh đa dạng khỏe mạnh từ thực phẩm lên men và chất xơ hòa tan giúp giảm lo âu, cải thiện chất lượng giấc ngủ và điều hòa huyết áp ổn định.",
    actionTip: "Thường xuyên ăn thực phẩm lên men tự nhiên như kim chi, dưa cải chua, sữa chua men sống, kombucha hoặc tương đậu miso.",
    suggestedTags: ["Canh kim chi", "Dưa chua kho cá", "Canh rong biển"],
    recommendedHealthCondition: "liver"
  },
  {
    id: "mt-3",
    goal: "maintain",
    category: "science",
    categoryLabel: "Sắc Màu Thực Vật (Phytonutrients)",
    categoryIcon: "🌈",
    badge: "Chống Lão Hóa Tế Bào",
    title: "Ăn Đủ 5 Sắc Màu Tự Nhiên Bảo Vệ Tim Mạch Và Thị Lực",
    fact: "Mỗi sắc màu trong thực vật chứa các chất chống oxy hóa chuyên biệt: Đỏ (Lycopene - bảo vệ tim), Cam/Vàng (Carotenoid - sáng mắt), Xanh (Chlorophyll - thanh lọc gan), Tím (Anthocyanin - chống lão hóa tế bào).",
    actionTip: "Tạo một đĩa ăn sắc màu hôm nay với cà rốt, ớt chuông, rau cải xanh, nấm rơm và cà chua bi để nạp trọn vẹn chất chống oxy hóa.",
    suggestedTags: ["Rau củ xào thập cẩm", "Canh khổ qua", "Gỏi cuốn tôm thịt"],
    recommendedHealthCondition: "hypertension"
  },
  {
    id: "mt-4",
    goal: "maintain",
    category: "timing",
    categoryLabel: "Tốc Độ Ăn Uống",
    categoryIcon: "🧘",
    badge: "Tín Hiệu No Tự Nhiên",
    title: "Não Bộ Cần Tròn 20 Phút Mới Nhận Được Tín Hiệu No Từ Dạ Dày",
    fact: "Hormone Leptin và Peptide YY (báo no) tiết ra từ ruột non mất từ 15-20 phút để truyền lên vùng dưới đồi của não bộ. Ăn vội dưới 10 phút là nguyên nhân hàng đầu gây ăn dư thừa 200-300 kcal ngoài ý muốn.",
    actionTip: "Đặt đũa xuống giữa các miếng ăn, nhai kỹ từ 15-20 lần mỗi ngụm thức ăn và tránh vừa ăn vừa lướt mạng xã hội.",
    suggestedTags: ["Phở gà", "Canh chua cá lóc", "Cơm tấm sườn"],
    recommendedHealthCondition: "weight_loss"
  }
];

const GOAL_CONFIG: Record<
  UserHealthProfile["goal"], 
  { label: string; icon: string; theme: string; badgeColor: string; bgGradient: string; borderColor: string; filterCondition: HealthProfileType }
> = {
  lose_weight: {
    label: "Giảm Cân / Giảm Mỡ",
    icon: "🥗",
    theme: "emerald",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    bgGradient: "from-emerald-500/10 via-teal-500/5 to-amber-500/10",
    borderColor: "border-emerald-300/80 hover:border-emerald-400",
    filterCondition: "weight_loss"
  },
  gain_muscle: {
    label: "Tăng Cơ Bắp / Gym",
    icon: "🏋️",
    theme: "indigo",
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-300",
    bgGradient: "from-indigo-500/10 via-sky-500/5 to-purple-500/10",
    borderColor: "border-indigo-300/80 hover:border-indigo-400",
    filterCondition: "gym"
  },
  gain_weight: {
    label: "Tăng Cân An Toàn",
    icon: "🥑",
    theme: "amber",
    badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
    bgGradient: "from-amber-500/10 via-orange-500/5 to-yellow-500/10",
    borderColor: "border-amber-300/80 hover:border-amber-400",
    filterCondition: "malnutrition"
  },
  maintain: {
    label: "Duy Trì Vóc Dáng & Cân Bằng",
    icon: "✨",
    theme: "teal",
    badgeColor: "bg-teal-100 text-teal-800 border-teal-300",
    bgGradient: "from-teal-500/10 via-emerald-500/5 to-cyan-500/10",
    borderColor: "border-teal-300/80 hover:border-teal-400",
    filterCondition: "weight_loss"
  }
};

interface DailyNutritionTipProps {
  userProfile: UserHealthProfile;
  onOpenHealthModal: () => void;
  onSelectDish: (dish: Dish) => void;
  onApplyConditionFilter?: (condition: HealthProfileType) => void;
  allDishes: Dish[];
}

export const DailyNutritionTip: React.FC<DailyNutritionTipProps> = ({
  userProfile,
  onOpenHealthModal,
  onSelectDish,
  onApplyConditionFilter,
  allDishes
}) => {
  // Goal can be temporarily previewed or matched with profile
  const [selectedGoal, setSelectedGoal] = useState<UserHealthProfile["goal"]>(userProfile.goal || "maintain");
  const [currentTipIndex, setCurrentTipIndex] = useState<number>(0);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);

  // Sync with profile if profile updates
  useEffect(() => {
    if (userProfile.goal) {
      setSelectedGoal(userProfile.goal);
    }
  }, [userProfile.goal]);

  // Tips filtered by selected goal
  const goalTips = useMemo(() => {
    const list = NUTRITION_TIPS_DATA.filter(t => t.goal === selectedGoal);
    return list.length > 0 ? list : NUTRITION_TIPS_DATA;
  }, [selectedGoal]);

  // Current active tip
  const activeTip = goalTips[currentTipIndex % goalTips.length];

  // Randomize tip
  const handleShuffleTip = () => {
    setIsShuffling(true);
    setTimeout(() => {
      setCurrentTipIndex((prev) => (prev + 1) % goalTips.length);
      setIsShuffling(false);
    }, 200);
  };

  // Copy tip to clipboard
  const handleCopyTip = async () => {
    try {
      const text = `💡 Mẹo Dinh Dưỡng Hôm Nay (${GOAL_CONFIG[selectedGoal].label}):\n"${activeTip.title}"\n🔬 Sự thật khoa học: ${activeTip.fact}\n✅ Lời khuyên: ${activeTip.actionTip}`;
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Recommended dishes based on active tip keywords or health profile
  const matchingDishes = useMemo(() => {
    if (!allDishes || allDishes.length === 0) return [];

    // Filter by suggested condition or tags
    const condition = activeTip.recommendedHealthCondition;
    const directMatches = allDishes.filter(d => 
      d.dietarySuitability.includes(condition) ||
      activeTip.suggestedTags.some(tag => 
        d.name.toLowerCase().includes(tag.toLowerCase()) || 
        d.keyIngredients.some(k => k.toLowerCase().includes(tag.toLowerCase()))
      )
    );

    // Pick top 3 diverse matches
    return directMatches.slice(0, 3);
  }, [allDishes, activeTip]);

  const currentGoalConfig = GOAL_CONFIG[selectedGoal] || GOAL_CONFIG.maintain;

  return (
    <div 
      className={`rounded-3xl border ${currentGoalConfig.borderColor} bg-gradient-to-br ${currentGoalConfig.bgGradient} bg-white/95 shadow-md backdrop-blur-md overflow-hidden transition-all duration-300 relative`}
    >
      {/* Top Banner Accent Line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-amber-400 to-orange-500" />

      {/* Header Bar */}
      <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100/80">
        
        {/* Left: Component Title & Goal Indicator */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-200/50 shrink-0">
            <Lightbulb className={`w-5 h-5 ${isShuffling ? "animate-spin" : ""}`} />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <span>Mẹo Dinh Dưỡng Hôm Nay</span>
                <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-bold border border-amber-200">
                  Daily Nutrition Tip
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-600">
              <span className="font-semibold text-slate-500">Mục tiêu cá nhân:</span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${currentGoalConfig.badgeColor}`}>
                <span>{currentGoalConfig.icon}</span>
                <span>{currentGoalConfig.label}</span>
              </span>
              <button
                onClick={onOpenHealthModal}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold underline underline-offset-2 ml-1"
                title="Thay đổi cân nặng, chiều cao hoặc mục tiêu trong hồ sơ"
              >
                Chỉnh hồ sơ
              </button>
            </div>
          </div>
        </div>

        {/* Right: Quick Goal Switcher & Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          {/* Quick goal pills */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-bold text-slate-600">
            {(["lose_weight", "gain_muscle", "maintain", "gain_weight"] as const).map((g) => {
              const active = selectedGoal === g;
              const cfg = GOAL_CONFIG[g];
              return (
                <button
                  key={g}
                  onClick={() => {
                    setSelectedGoal(g);
                    setCurrentTipIndex(0);
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 text-[11px] ${
                    active 
                      ? "bg-white text-slate-900 shadow-xs font-black" 
                      : "hover:text-slate-900 text-slate-500"
                  }`}
                  title={`Xem mẹo cho mục tiêu: ${cfg.label}`}
                >
                  <span>{cfg.icon}</span>
                  <span className="hidden sm:inline">{cfg.label.split("/")[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Random tip button */}
          <button
            onClick={handleShuffleTip}
            disabled={isShuffling}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs hover:shadow-xs transition-all active:scale-95 flex items-center gap-1.5 text-xs font-bold"
            title="Đổi mẹo ngẫu nhiên khác"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-600 ${isShuffling ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Mẹo khác</span>
          </button>

          {/* Collapse/Expand Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-500 border border-slate-200 transition-colors"
            title={isCollapsed ? "Mở rộng mẹo dinh dưỡng" : "Thu gọn"}
            aria-label="Thu gọn hoặc mở rộng"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Tip Content Body (Collapsible) */}
      {!isCollapsed && (
        <div className="p-4 sm:p-6 space-y-5 animate-fade-in">
          
          {/* Main Tip Headline & Category */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-amber-900 bg-amber-100/90 px-3 py-1 rounded-full border border-amber-200/80 shadow-2xs">
                <span>{activeTip.categoryIcon}</span>
                <span>{activeTip.categoryLabel}</span>
              </span>

              <span className="text-[11px] font-bold text-slate-600 bg-slate-100/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>{activeTip.badge}</span>
              </span>

              <span className="text-[11px] text-slate-600 ml-auto font-medium">
                Mẹo {((currentTipIndex % goalTips.length) + 1)} / {goalTips.length}
              </span>
            </div>

            <h3 className="text-base sm:text-lg md:text-xl font-black text-slate-900 leading-snug tracking-tight">
              {activeTip.title}
            </h3>
          </div>

          {/* Dual Info Blocks: Science Fact + Daily Action Tip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Block 1: The Science Fact */}
            <div className="bg-white/80 rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
                  <span>🔬</span>
                  <span>Sự Thật Khoa Học Đã Chứng Minh</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                  {activeTip.fact}
                </p>
              </div>

              <div className="pt-2 text-[11px] text-slate-600 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Dữ liệu dựa trên nghiên cứu sinh lý học & dinh dưỡng lâm sàng</span>
              </div>
            </div>

            {/* Block 2: Daily Actionable Tip */}
            <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200/90 shadow-2xs space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
                  <span>🎯</span>
                  <span>Lời Khuyên Thực Hiện Hôm Nay</span>
                </div>
                <p className="text-xs sm:text-sm text-emerald-950 font-medium leading-relaxed">
                  {activeTip.actionTip}
                </p>
              </div>

              {/* Keywords / Tags */}
              <div className="pt-2 flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-emerald-700 uppercase">Gợi ý nguyên liệu:</span>
                {activeTip.suggestedTags.map((tag, idx) => (
                  <span 
                    key={idx}
                    className="text-[11px] font-semibold text-emerald-800 bg-white/90 px-2 py-0.5 rounded-md border border-emerald-200/80 shadow-2xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom Row: Matched Dishes in Catalog & Action Controls */}
          <div className="pt-2 border-t border-slate-200/70 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Matching Dishes Preview */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-xs font-bold text-slate-700 shrink-0 flex items-center gap-1.5">
                <span>🍽️</span>
                <span>Món gợi ý hợp mục tiêu:</span>
              </span>

              <div className="flex items-center gap-2 flex-wrap">
                {matchingDishes.map((dish) => (
                  <button
                    key={dish.id}
                    onClick={() => onSelectDish(dish)}
                    className="group bg-white hover:bg-amber-50/80 text-left border border-slate-200 hover:border-amber-400 p-1.5 pr-3 rounded-xl transition-all shadow-2xs hover:shadow-xs flex items-center gap-2 active:scale-95"
                    title={`Xem chi tiết món: ${dish.name}`}
                  >
                    <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 shadow-2xs">
                      <DishIllustration dish={dish} displayMode="icon" size="sm" />
                    </div>
                    <div className="truncate max-w-[130px]">
                      <div className="text-xs font-bold text-slate-800 group-hover:text-amber-700 truncate">
                        {dish.name}
                      </div>
                      <div className="text-[10px] text-slate-600 font-semibold">
                        {dish.calories} kcal • {dish.protein}g đạm
                      </div>
                    </div>
                  </button>
                ))}

                {onApplyConditionFilter && (
                  <button
                    onClick={() => onApplyConditionFilter(activeTip.recommendedHealthCondition)}
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-800 hover:bg-amber-100/70 px-2.5 py-1.5 rounded-xl border border-amber-300 transition-colors flex items-center gap-1"
                    title="Lọc tất cả món ăn trong danh mục theo chế độ này"
                  >
                    <span>Lọc toàn bộ món</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Utility buttons: Copy Tip & Bookmark */}
            <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  isBookmarked 
                    ? "bg-rose-50 text-rose-600 border-rose-300 shadow-2xs" 
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
                title={isBookmarked ? "Đã lưu vào mẹo yêu thích" : "Lưu mẹo hay này"}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-rose-500 text-rose-500" : ""}`} />
                <span>{isBookmarked ? "Đã lưu" : "Lưu mẹo"}</span>
              </button>

              <button
                onClick={handleCopyTip}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
                title="Sao chép mẹo chia sẻ bạn bè"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Đã chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>
      )}

      {/* Minimized View teaser bar when collapsed */}
      {isCollapsed && (
        <div 
          onClick={() => setIsCollapsed(false)}
          className="p-3 px-5 text-xs text-slate-600 bg-white/70 hover:bg-white flex items-center justify-between cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2 truncate">
            <span className="font-bold text-slate-800 truncate">
              {activeTip.categoryIcon} {activeTip.title}
            </span>
            <span className="text-slate-600 hidden sm:inline truncate">— {activeTip.actionTip}</span>
          </div>
          <span className="text-emerald-600 font-bold text-xs shrink-0 ml-2">
            Mở xem chi tiết ↓
          </span>
        </div>
      )}
    </div>
  );
};
