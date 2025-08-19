import React, { useState, useEffect } from 'react';

function RecommendationCardNew({ currentUser, currentPlan, usage, plans, addons }) {
  const [recommendations, setRecommendations] = useState([]);
  const [addonRecommendations, setAddonRecommendations] = useState([]);
  const [selectedAction, setSelectedAction] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser && currentPlan && usage.length > 0 && plans.length > 0) {
      calculateRecommendations();
    }
  }, [currentUser, currentPlan, usage, plans, addons]);

  const calculateRecommendations = () => {
    // Calculate total usage
    const totalUsage = usage.reduce((acc, day) => {
      acc.mb_used += day.mb_used;
      acc.minutes_used += day.minutes_used;
      acc.sms_used += day.sms_used;
      return acc;
    }, { mb_used: 0, minutes_used: 0, sms_used: 0 });

    // Calculate usage percentages
    const dataUsagePercent = (totalUsage.mb_used / (currentPlan.quota_gb * 1024)) * 100;
    const minutesUsagePercent = (totalUsage.minutes_used / currentPlan.quota_min) * 100;
    const smsUsagePercent = (totalUsage.sms_used / currentPlan.quota_sms) * 100;

    // Predict monthly usage
    const daysInMonth = 30;
    const currentDay = usage.length;
    const avgDaily = {
      mb_used: totalUsage.mb_used / currentDay,
      minutes_used: totalUsage.minutes_used / currentDay,
      sms_used: totalUsage.sms_used / currentDay
    };

    const predictedMonthly = {
      mb_used: avgDaily.mb_used * daysInMonth,
      minutes_used: avgDaily.minutes_used * daysInMonth,
      sms_used: avgDaily.sms_used * daysInMonth
    };

    // Find suitable plans
    const suitablePlans = plans.filter(plan => {
      // Don't recommend current plan
      if (plan.plan_id === currentPlan.plan_id) return false;
      
      // Check if plan can handle predicted usage
      const canHandleData = (predictedMonthly.mb_used / 1024) <= plan.quota_gb;
      const canHandleMinutes = predictedMonthly.minutes_used <= plan.quota_min;
      const canHandleSms = predictedMonthly.sms_used <= plan.quota_sms;
      
      return canHandleData && canHandleMinutes && canHandleSms;
    }).map(plan => {
      // Calculate score based on efficiency and cost
      const dataOverhead = plan.quota_gb - (predictedMonthly.mb_used / 1024);
      const minutesOverhead = plan.quota_min - predictedMonthly.minutes_used;
      const smsOverhead = plan.quota_sms - predictedMonthly.sms_used;
      
      const priceDiff = plan.monthly_price - currentPlan.monthly_price;
      const wasteScore = (dataOverhead / plan.quota_gb) + 
                       (minutesOverhead / plan.quota_min) + 
                       (smsOverhead / plan.quota_sms);
      
      // Lower waste and lower price increase = better score
      const score = (1 - wasteScore) * 100 - (priceDiff * 0.1);
      
      return {
        ...plan,
        score,
        priceDiff,
        dataOverhead,
        minutesOverhead,
        smsOverhead,
        reason: getPlanRecommendationReason(plan, currentPlan, predictedMonthly, priceDiff)
      };
    }).sort((a, b) => b.score - a.score).slice(0, 3);

    setRecommendations(suitablePlans);

    // Calculate addon recommendations
    const addonRecs = [];
    
    // If data usage is high, recommend data addon
    if (dataUsagePercent > 80 || predictedMonthly.mb_used / 1024 > currentPlan.quota_gb * 0.9) {
      const dataAddon = addons.find(addon => addon.type === 'data');
      if (dataAddon) {
        addonRecs.push({
          ...dataAddon,
          reason: 'İnternet kotanız dolmak üzere. Ek veri paketi almanızı öneriyoruz.'
        });
      }
    }

    // If minutes usage is high, recommend voice addon
    if (minutesUsagePercent > 80 || predictedMonthly.minutes_used > currentPlan.quota_min * 0.9) {
      const voiceAddon = addons.find(addon => addon.type === 'voice');
      if (voiceAddon) {
        addonRecs.push({
          ...voiceAddon,
          reason: 'Konuşma kotanız dolmak üzere. Ek dakika paketi almanızı öneriyoruz.'
        });
      }
    }

    // If SMS usage is high, recommend SMS addon
    if (smsUsagePercent > 80 || predictedMonthly.sms_used > currentPlan.quota_sms * 0.9) {
      const smsAddon = addons.find(addon => addon.type === 'sms');
      if (smsAddon) {
        addonRecs.push({
          ...smsAddon,
          reason: 'SMS kotanız dolmak üzere. Ek SMS paketi almanızı öneriyoruz.'
        });
      }
    }

    setAddonRecommendations(addonRecs);
  };

  const getPlanRecommendationReason = (plan, currentPlan, predicted, priceDiff) => {
    const reasons = [];
    
    if (priceDiff < 0) {
      reasons.push(`Aylık ${Math.abs(priceDiff)}₺ tasarruf`);
    }
    
    if (plan.quota_gb > currentPlan.quota_gb) {
      reasons.push(`${plan.quota_gb - currentPlan.quota_gb}GB daha fazla internet`);
    }
    
    if (plan.quota_min > currentPlan.quota_min) {
      reasons.push(`${plan.quota_min - currentPlan.quota_min} dakika daha fazla konuşma`);
    }
    
    if (predicted.mb_used / 1024 > currentPlan.quota_gb * 0.9) {
      reasons.push('Mevcut internet kotanız yetersiz');
    }
    
    return reasons.length > 0 ? reasons.join(', ') : 'Kullanımınıza uygun alternatif';
  };

  const handlePlanAction = async (plan) => {
    setLoading(true);
    setSelectedAction(plan);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`${plan.plan_name} planına geçiş işlemi başarıyla tamamlandı!`);
    } catch (error) {
      console.error('Plan değiştirme hatası:', error);
      alert('Plan değiştirme işlemi sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
      setSelectedAction(null);
    }
  };

  const handleAddonAction = async (addon) => {
    setLoading(true);
    setSelectedAction(addon);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert(`${addon.name} paketi başarıyla satın alındı!`);
    } catch (error) {
      console.error('Ek paket alma hatası:', error);
      alert('Ek paket alma işlemi sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
      setSelectedAction(null);
    }
  };

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'faturalı': return '📄';
      case 'faturasız': return '💳';
      case 'data': return '📶';
      case 'voice': return '📞';
      case 'sms': return '💬';
      default: return '💡';
    }
  };

  return (
    <div className="space-y-8">
      {/* Plan Recommendations */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Size Özel Plan Önerileri</h2>
            <p className="text-slate-600 mt-1">Kullanım alışkanlıklarınıza göre en uygun planlar</p>
          </div>
          <div className="text-3xl">🎯</div>
        </div>

        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((plan, index) => (
              <div
                key={plan.plan_id}
                className="bg-gradient-to-br from-white to-slate-50 rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-all duration-300"
              >
                {/* Recommendation Badge */}
                {index === 0 && (
                  <div className="inline-flex items-center bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium mb-3">
                    <span className="mr-1">⭐</span>
                    En Uygun
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{plan.plan_name}</h3>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                      plan.type === 'faturalı' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {getRecommendationIcon(plan.type)} {plan.type}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-800">{plan.monthly_price}₺</div>
                    {plan.priceDiff !== 0 && (
                      <div className={`text-sm font-medium ${plan.priceDiff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {plan.priceDiff > 0 ? '+' : ''}{plan.priceDiff}₺
                      </div>
                    )}
                  </div>
                </div>

                {/* Plan Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">📶 İnternet</span>
                    <span className="font-medium">{plan.quota_gb} GB</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">📞 Konuşma</span>
                    <span className="font-medium">{plan.quota_min} dk</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">💬 SMS</span>
                    <span className="font-medium">{plan.quota_sms} adet</span>
                  </div>
                </div>

                {/* Recommendation Reason */}
                <div className="bg-blue-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-blue-800 font-medium mb-1">Neden öneriyoruz?</p>
                  <p className="text-xs text-blue-700">{plan.reason}</p>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handlePlanAction(plan)}
                  disabled={loading && selectedAction?.plan_id === plan.plan_id}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading && selectedAction?.plan_id === plan.plan_id ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>İşleniyor...</span>
                    </div>
                  ) : (
                    'Bu Plana Geç'
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Mevcut Planınız Optimal</h3>
            <p className="text-slate-600">
              Şu anda kullanımınıza en uygun plandaşınız. Başka bir plan önerimiz bulunmuyor.
            </p>
          </div>
        )}
      </div>

      {/* Addon Recommendations */}
      {addonRecommendations.length > 0 && (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Ek Paket Önerileri</h2>
              <p className="text-slate-600 mt-1">Kotalarınızı artırmak için ek paketler</p>
            </div>
            <div className="text-3xl">📦</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {addonRecommendations.map((addon) => (
              <div
                key={addon.addon_id}
                className="bg-gradient-to-br from-white to-orange-50 rounded-xl p-6 border border-orange-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{addon.name}</h3>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                      addon.type === 'data' ? 'bg-blue-100 text-blue-800' :
                      addon.type === 'voice' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {getRecommendationIcon(addon.type)} {addon.type === 'data' ? 'İnternet' : addon.type === 'voice' ? 'Konuşma' : 'SMS'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-800">{addon.price}₺</div>
                    <div className="text-xs text-slate-500">tek seferlik</div>
                  </div>
                </div>

                {/* Addon Details */}
                <div className="space-y-2 mb-4">
                  {addon.extra_gb > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">📶 Ek İnternet</span>
                      <span className="font-medium">{addon.extra_gb} GB</span>
                    </div>
                  )}
                  {addon.extra_min > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">📞 Ek Konuşma</span>
                      <span className="font-medium">{addon.extra_min} dk</span>
                    </div>
                  )}
                  {addon.extra_sms > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">💬 Ek SMS</span>
                      <span className="font-medium">{addon.extra_sms} adet</span>
                    </div>
                  )}
                </div>

                {/* Recommendation Reason */}
                <div className="bg-orange-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-orange-800 font-medium mb-1">Neden gerekli?</p>
                  <p className="text-xs text-orange-700">{addon.reason}</p>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleAddonAction(addon)}
                  disabled={loading && selectedAction?.addon_id === addon.addon_id}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading && selectedAction?.addon_id === addon.addon_id ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Satın alınıyor...</span>
                    </div>
                  ) : (
                    'Satın Al'
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Information Box */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 mb-2">Akıllı Öneri Sistemi</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Önerilerimiz, son 30 günlük kullanım verileriniz analiz edilerek hazırlanmıştır. 
              Gelecekteki kullanım tahminlerinize göre en uygun ve ekonomik seçenekleri sunuyoruz. 
              Plan değişiklikleri bir sonraki fatura döneminde geçerli olur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecommendationCardNew;
