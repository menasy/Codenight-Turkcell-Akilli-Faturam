import React, { useState } from 'react';

function PlanChangeModalNew({ currentPlan, plans, onClose, onConfirm }) {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!selectedPlan) return;
    
    setLoading(true);
    try {
      await onConfirm(selectedPlan.plan_id);
    } catch (error) {
      console.error('Plan değiştirme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSavings = (plan) => {
    if (!currentPlan) return 0;
    return currentPlan.monthly_price - plan.monthly_price;
  };

  const getPlanTypeColor = (type) => {
    return type === 'faturalı' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Plan Değiştir</h2>
              <p className="text-slate-600 mt-1">Size en uygun planı seçin</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Current Plan */}
        {currentPlan && (
          <div className="p-6 border-b border-slate-200 bg-slate-50">
            <h3 className="font-semibold text-slate-800 mb-3">Mevcut Planınız</h3>
            <div className="bg-white rounded-xl p-4 border-2 border-slate-300">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-lg text-slate-800">{currentPlan.plan_name}</h4>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-slate-600">
                    <span>📶 {currentPlan.quota_gb} GB</span>
                    <span>📞 {currentPlan.quota_min} dk</span>
                    <span>💬 {currentPlan.quota_sms} SMS</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-800">{currentPlan.monthly_price}₺</div>
                  <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPlanTypeColor(currentPlan.type)}`}>
                    {currentPlan.type}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Available Plans */}
        <div className="p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Diğer Planlar</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.filter(plan => plan.plan_id !== currentPlan?.plan_id).map((plan) => {
              const savings = calculateSavings(plan);
              const isSelected = selectedPlan?.plan_id === plan.plan_id;
              
              return (
                <div
                  key={plan.plan_id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`bg-white rounded-xl p-4 border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    isSelected 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-lg text-slate-800">{plan.plan_name}</h4>
                    <div className="text-right">
                      <div className="text-xl font-bold text-slate-800">{plan.monthly_price}₺</div>
                      {savings !== 0 && (
                        <div className={`text-sm font-medium ${savings > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {savings > 0 ? `-${savings}₺` : `+${Math.abs(savings)}₺`}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4 text-sm text-slate-600">
                      <span>📶 {plan.quota_gb} GB</span>
                      <span>📞 {plan.quota_min} dk</span>
                      <span>💬 {plan.quota_sms} SMS</span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanTypeColor(plan.type)}`}>
                      {plan.type}
                    </div>
                  </div>

                  {/* Comparison with current plan */}
                  {currentPlan && (
                    <div className="text-xs text-slate-500 border-t pt-2">
                      <div className="grid grid-cols-3 gap-2">
                        <div className={`text-center ${plan.quota_gb > currentPlan.quota_gb ? 'text-green-600' : plan.quota_gb < currentPlan.quota_gb ? 'text-red-600' : 'text-slate-500'}`}>
                          {plan.quota_gb > currentPlan.quota_gb ? '+' : plan.quota_gb < currentPlan.quota_gb ? '' : '='}{plan.quota_gb - currentPlan.quota_gb} GB
                        </div>
                        <div className={`text-center ${plan.quota_min > currentPlan.quota_min ? 'text-green-600' : plan.quota_min < currentPlan.quota_min ? 'text-red-600' : 'text-slate-500'}`}>
                          {plan.quota_min > currentPlan.quota_min ? '+' : plan.quota_min < currentPlan.quota_min ? '' : '='}{plan.quota_min - currentPlan.quota_min} dk
                        </div>
                        <div className={`text-center ${plan.quota_sms > currentPlan.quota_sms ? 'text-green-600' : plan.quota_sms < currentPlan.quota_sms ? 'text-red-600' : 'text-slate-500'}`}>
                          {plan.quota_sms > currentPlan.quota_sms ? '+' : plan.quota_sms < currentPlan.quota_sms ? '' : '='}{plan.quota_sms - currentPlan.quota_sms} SMS
                        </div>
                      </div>
                    </div>
                  )}

                  {isSelected && (
                    <div className="mt-3 p-2 bg-purple-100 rounded-lg border border-purple-200">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        <span className="text-sm font-medium text-purple-700">Seçildi</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              {selectedPlan ? (
                <div>
                  <span className="font-medium">Seçilen Plan:</span> {selectedPlan.plan_name}
                  <br />
                  <span className="font-medium">Aylık Ücret:</span> {selectedPlan.monthly_price}₺
                  {currentPlan && calculateSavings(selectedPlan) !== 0 && (
                    <span className={`ml-2 ${calculateSavings(selectedPlan) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ({calculateSavings(selectedPlan) > 0 ? '-' : '+'}{Math.abs(calculateSavings(selectedPlan))}₺)
                    </span>
                  )}
                </div>
              ) : (
                'Lütfen bir plan seçin'
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedPlan || loading}
                className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Değiştiriliyor...</span>
                  </div>
                ) : (
                  'Planı Değiştir'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="px-6 pb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Önemli Bilgilendirme:</p>
                <ul className="text-xs space-y-1">
                  <li>• Plan değişikliği bir sonraki fatura döneminde geçerli olur.</li>
                  <li>• Mevcut dönem kotalarınız korunur.</li>
                  <li>• İptal işlemi için müşteri hizmetlerini arayabilirsiniz.</li>
                  <li>• Bu bir demo uygulamadır, gerçek plan değişikliği yapılmaz.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlanChangeModalNew;
