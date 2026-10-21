import React, { useState } from "react";
import { UserHealthProfile, HealthProfileType, AllergenType } from "../types";
import { 
  X, HeartPulse, Scale, Activity, Flame, ShieldAlert, 
  CheckCircle2, Sparkles, User, Info, Check 
} from "lucide-react";
import { calculateBMR, calculateTDEE } from "../utils/nutritionCalculator";

interface HealthProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserHealthProfile;
  onSaveProfile: (profile: UserHealthProfile) => void;
}

export const HealthProfileModal: React.FC<HealthProfileModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSaveProfile
}) => {
  const [profile, setProfile] = useState<UserHealthProfile>(() => ({
    ...currentProfile,
    selectedHealthConditions: currentProfile.selectedHealthConditions?.length > 0 
      ? currentProfile.selectedHealthConditions 
      : currentProfile.condition ? [currentProfile.condition] : []
  }));

  if (!isOpen) return null;

  // Real-time calculations
  const bmr = Math.round(calculateBMR(profile));
  const tdee = Math.round(calculateTDEE(profile));
  const targetCal = tdee;

  const toggleHealthCondition = (id: HealthProfileType) => {
    const current = profile.selectedHealthConditions || [];
    const exists = current.includes(id);
    const updatedList = exists 
      ? current.filter(c => c !== id)
      : [...current, id];
    setProfile({
      ...profile,
      selectedHealthConditions: updatedList,
      condition: updatedList[0] || undefined
    });
  };

  const handleSave = () => {
    const conditions = profile.selectedHealthConditions || [];
    const updated: UserHealthProfile = {
      ...profile,
      bmr,
      tdee,
      targetDailyCalories: targetCal,
      selectedHealthConditions: conditions,
      condition: conditions[0] || undefined
    };
    onSaveProfile(updated);
    onClose();
  };

  const conditionsList: { id: HealthProfileType; label: string; desc: string; icon: string }[] = [
    { id: "weight_loss", label: "Ăn Kiêng / Giảm Mỡ", desc: "Thực đơn Healthy, Eat Clean, thâm hụt calo", icon: "🥗" },
    { id: "malnutrition", label: "Suy Dinh Dưỡng / Tăng Cân", desc: "Cần bồi bổ thể trạng, giàu năng lượng dễ tiêu", icon: "💪" },
    { id: "pregnancy", label: "Sản Phụ / Sau Sinh", desc: "Bổ sung sắt, canxi, axit folic, lợi sữa", icon: "🤰" },
    { id: "hypertension", label: "Huyết Áp / Tim Mạch", desc: "Giảm muối, ít mỡ bão hòa, giàu Kali", icon: "❤️" },
    { id: "diabetes", label: "Tiểu Đường", desc: "Kiểm soát đường huyết, chỉ số GI thấp", icon: "🩸" },
    { id: "liver", label: "Bệnh Lý Gan", desc: "Thanh nhiệt, ít dầu mỡ, giải độc gan", icon: "🌿" },
    { id: "respiratory", label: "Bệnh Lý Hô Hấp / Phổi", desc: "Lành tính, bổ phế, dịu họng", icon: "🫁" },
    { id: "gym", label: "Tập Gym / Thể Hình", desc: "Giàu Protein (1.8g-2.2g/kg), phục hồi cơ bắp", icon: "🏋️" },
    { id: "kids", label: "Trẻ Em Đang Lớn", desc: "Dinh dưỡng toàn diện, dễ tiêu hóa, hấp dẫn", icon: "👶" },
  ];

  const allergensList: { id: AllergenType; label: string; icon: string }[] = [
    { id: "seafood", label: "Hải sản (Tôm, cua, mực...)", icon: "🦐" },
    { id: "peanuts", label: "Đậu phộng / Các loại hạt", icon: "🥜" },
    { id: "dairy", label: "Sữa bò / Lactose", icon: "🥛" },
    { id: "gluten", label: "Gluten / Bột mì", icon: "🌾" },
    { id: "eggs", label: "Trứng", icon: "🥚" },
    { id: "soy", label: "Đậu nành", icon: "🌱" },
  ];

  const toggleAllergen = (id: AllergenType) => {
    const list = [...profile.allergies];
    const index = list.indexOf(id);
    if (index > -1) list.splice(index, 1);
    else list.push(id);
    setProfile({ ...profile, allergies: list });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div 
        className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">
                Hồ Sơ Sức Khỏe & Tính Calo Chuẩn
              </h2>
              <p className="text-xs text-emerald-100">
                Theo công thức khoa học Mifflin-St Jeor & khuyến nghị dinh dưỡng quốc tế
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6">
          
          {/* Real-time calculated Result Highlight Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>Mục Tiêu Năng Lượng Hàng Ngày Của Bạn:</span>
              </span>
              <span className="text-xs text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full font-bold">
                Tự động cân bằng
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-500 block">BMR (Trao đổi cơ bản)</span>
                <span className="text-lg sm:text-xl font-black text-slate-800">{bmr}</span>
                <span className="text-[10px] text-slate-400 block">kcal / ngày</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-500 block">TDEE (Tiêu hao thực tế)</span>
                <span className="text-lg sm:text-xl font-black text-slate-800">{tdee}</span>
                <span className="text-[10px] text-slate-400 block">kcal / ngày</span>
              </div>
              <div className="bg-emerald-600 text-white p-3 rounded-xl shadow-md">
                <span className="text-[11px] font-bold text-emerald-100 block">Calo Mục Tiêu Chuẩn</span>
                <span className="text-xl sm:text-2xl font-black">{targetCal}</span>
                <span className="text-[10px] text-emerald-200 block">kcal / ngày</span>
              </div>
            </div>

            {/* Meal Distribution recommendation */}
            <div className="mt-3 pt-3 border-t border-emerald-200/60 flex items-center justify-between text-xs text-emerald-800 flex-wrap gap-2">
              <span>Phân bổ khuyến nghị:</span>
              <div className="flex items-center gap-3 font-semibold text-[11px]">
                <span>Sáng: ~{Math.round(targetCal * 0.25)} kcal</span>
                <span>Trưa: ~{Math.round(targetCal * 0.35)} kcal</span>
                <span>Xế: ~{Math.round(targetCal * 0.1)} kcal</span>
                <span>Tối: ~{Math.round(targetCal * 0.25)} kcal</span>
              </div>
            </div>
          </div>

          {/* Section 1: Basic Body Stats */}
          <div>
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              <span>1. Thông Số Cơ Thể</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Giới tính</label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value as any })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
                >
                  <option value="female">Nữ 👩</option>
                  <option value="male">Nam 👨</option>
                </select>
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Tuổi (Năm)</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Weight */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Cân nặng (kg)</label>
                <input
                  type="number"
                  min="10"
                  max="250"
                  value={profile.weightKg}
                  onChange={(e) => setProfile({ ...profile, weightKg: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Height */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Chiều cao (cm)</label>
                <input
                  type="number"
                  min="50"
                  max="250"
                  value={profile.heightCm}
                  onChange={(e) => setProfile({ ...profile, heightCm: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Activity and Goal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Mức độ vận động thể chất:</span>
              </label>
              <select
                value={profile.activityLevel}
                onChange={(e) => setProfile({ ...profile, activityLevel: e.target.value as any })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
              >
                <option value="sedentary">Ít vận động (Ngồi văn phòng nhiều)</option>
                <option value="light">Vận động nhẹ (Tập nhẹ 1-3 ngày/tuần)</option>
                <option value="moderate">Vừa phải (Tập 3-5 ngày/tuần)</option>
                <option value="active">Năng động (Tập nặng 6-7 ngày/tuần)</option>
                <option value="very_active">Vận động viên / Lao động nặng</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>Mục tiêu thể hình:</span>
              </label>
              <select
                value={profile.goal}
                onChange={(e) => setProfile({ ...profile, goal: e.target.value as any })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
              >
                <option value="lose_weight">Giảm cân / Giảm mỡ (-450 kcal/ngày)</option>
                <option value="maintain">Duy trì vóc dáng (Chuẩn TDEE)</option>
                <option value="gain_weight">Tăng cân an toàn (+500 kcal/ngày)</option>
                <option value="gain_muscle">Tăng cơ Gym (Giàu protein +300 kcal)</option>
              </select>
            </div>
          </div>

          {/* Section 3: Health Profile / Special Condition (MULTI-SELECT) */}
          <div>
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                2. Tình Trạng Sức Khỏe Hoặc Đối Tượng Đặc Thù (Chọn nhiều mục cùng lúc):
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Đã chọn {profile.selectedHealthConditions?.length || 0} tình trạng
                </span>
                {(profile.selectedHealthConditions?.length || 0) > 0 && (
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, selectedHealthConditions: [], condition: undefined })}
                    className="text-[11px] text-slate-400 hover:text-rose-600 font-semibold transition-colors"
                  >
                    Bỏ chọn hết
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {conditionsList.map((item) => {
                const isSelected = (profile.selectedHealthConditions || []).includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleHealthCondition(item.id)}
                    className={`p-3 rounded-2xl border cursor-pointer select-none transition-all relative ${
                      isSelected
                        ? "bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs ring-1 ring-emerald-500/20"
                        : "bg-white border-slate-200 hover:border-emerald-200 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{item.icon}</span>
                        <span className="font-bold text-xs">{item.label}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                        isSelected 
                          ? "bg-emerald-600 border-emerald-600 text-white" 
                          : "border-slate-300 bg-slate-50"
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Allergens */}
          <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-4">
            <span className="block text-xs font-bold text-rose-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>3. Cảnh Báo Dị Ứng Cần Loại Bỏ Hoàn Toàn:</span>
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {allergensList.map((allg) => {
                const isChecked = profile.allergies.includes(allg.id);
                return (
                  <div
                    key={allg.id}
                    onClick={() => toggleAllergen(allg.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer select-none transition-all flex items-center gap-2 ${
                      isChecked
                        ? "bg-rose-600 text-white border-rose-700 shadow-2xs"
                        : "bg-white text-rose-900 border-rose-200 hover:bg-rose-100/50"
                    }`}
                  >
                    <span className="text-base">{allg.icon}</span>
                    <span className="text-xs font-bold">{allg.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Đóng
          </button>

          <button
            id="btn-save-health-profile"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/25 transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Lưu & Tự Động Lọc Thực Đơn</span>
          </button>
        </div>

      </div>
    </div>
  );
};
