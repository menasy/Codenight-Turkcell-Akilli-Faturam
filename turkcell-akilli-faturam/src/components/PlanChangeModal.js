import React, { useState, useEffect } from 'react';
import { ServiceFactory } from '../services/ServiceFactory';
import { CalculationService } from '../services/CalculationService';

function PlanChangeModal({ isOpen, onClose, currentPlan, recommendedPlan, user, onPlanChanged }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [confirmationData, setConfirmationData] = useState({});
  const [allPlans, setAllPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(recommendedPlan);

  const dataService = ServiceFactory.getDataService();
  const calculationService = new CalculationService();

  useEffect(() => {
    if (isOpen) {
      loadPlans();
      setSelectedPlan(recommendedPlan);
      setCurrentStep(1);
    }
  }, [isOpen, recommendedPlan]);

  const loadPlans = async () => {
    try {
      const plans = await dataService.getPlans();
      setAllPlans(plans);
    } catch (error) {
      console.error('Error loading plans:', error);
    }
  };

  const calculatePlanComparison = () => {
    if (!selectedPlan || !currentPlan) return {};

    const currentMonthlyCost = currentPlan.monthly_fee;
    const newMonthlyCost = selectedPlan.monthly_fee;
    const monthlySavings = currentMonthlyCost - newMonthlyCost;
    const annualSavings = monthlySavings * 12;

    return {
      currentMonthlyCost,
      newMonthlyCost,
      monthlySavings,
      annualSavings,
      percentageSavings: currentMonthlyCost > 0 ? (monthlySavings / currentMonthlyCost) * 100 : 0
    };
  };

  const handlePlanChange = async () => {
    if (!selectedPlan) return;

    setIsProcessing(true);
    try {
      // Simulate plan change API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update user's plan
      const updatedUser = { ...user, current_plan_id: selectedPlan.plan_id };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      if (onPlanChanged) {
        onPlanChanged(selectedPlan);
      }
      
      setCurrentStep(3); // Success step
      setTimeout(() => {
        onClose();
        setCurrentStep(1);
      }, 3000);
      
    } catch (error) {
      console.error('Error changing plan:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const comparison = calculatePlanComparison();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">Plan Değişikliği</h2>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center space-x-4 mt-4">
            <div className={`flex items-center ${currentStep >= 1 ? 'text-yellow-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-yellow-100' : 'bg-slate-100'}`}>
                {currentStep > 1 ? '✓' : '1'}
              </div>
              <span className="ml-2 text-sm font-medium">Plan Seçimi</span>
            </div>
            <div className="w-8 border-t border-slate-200"></div>
            <div className={`flex items-center ${currentStep >= 2 ? 'text-yellow-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-yellow-100' : 'bg-slate-100'}`}>
                {currentStep > 2 ? '✓' : '2'}
              </div>
              <span className="ml-2 text-sm font-medium">Onay</span>
            </div>
            <div className="w-8 border-t border-slate-200"></div>
            <div className={`flex items-center ${currentStep >= 3 ? 'text-green-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-green-100' : 'bg-slate-100'}`}>
                {currentStep >= 3 ? '✓' : '3'}
              </div>
              <span className="ml-2 text-sm font-medium">Tamamlandı</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Plan Seçimi</h3>
                <div className="space-y-4">
                  {allPlans.map(plan => (
                    <div
                      key={plan.plan_id}
                      className={`border rounded-xl p-4 cursor-pointer transition-all ${
                        selectedPlan?.plan_id === plan.plan_id
                          ? 'border-yellow-500 bg-yellow-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => setSelectedPlan(plan)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-slate-800">{plan.name}</h4>
                          <p className="text-sm text-slate-600 mt-1">{plan.description}</p>
                          <div className="flex space-x-4 mt-2 text-sm">
                            <span>📱 {plan.quotas.data_mb / 1024} GB</span>
                            <span>📞 {plan.quotas.minutes} dakika</span>
                            <span>💬 {plan.quotas.sms} SMS</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-slate-800">₺{plan.monthly_fee}</div>
                          <div className="text-sm text-slate-600">/ ay</div>
                        </div>
                      </div>
                      {plan.plan_id === currentPlan?.plan_id && (
                        <div className="mt-2 text-sm text-blue-600 font-medium">Mevcut Plan</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {selectedPlan && selectedPlan.plan_id !== currentPlan?.plan_id && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <h4 className="font-semibold text-slate-800 mb-3">Değişiklik Özeti</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Mevcut Plan:</span>
                      <span>{currentPlan.name} - ₺{currentPlan.monthly_fee}/ay</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Yeni Plan:</span>
                      <span>{selectedPlan.name} - ₺{selectedPlan.monthly_fee}/ay</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Aylık Fark:</span>
                      <span className={comparison.monthlySavings > 0 ? 'text-green-600' : 'text-red-600'}>
                        {comparison.monthlySavings > 0 ? '-' : '+'}₺{Math.abs(comparison.monthlySavings)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!selectedPlan || selectedPlan.plan_id === currentPlan?.plan_id}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Devam Et
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Plan Değişikliği Onayı</h3>
                
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <span className="text-yellow-600 text-xl">📋</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800 mb-2">Plan Değişiklik Detayları</h4>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="font-medium text-slate-700">Mevcut Plan</div>
                          <div className="bg-white/60 rounded-lg p-3">
                            <div className="font-semibold">{currentPlan?.name}</div>
                            <div className="text-slate-600">₺{currentPlan?.monthly_fee}/ay</div>
                            <div className="text-xs text-slate-500 mt-1">
                              {currentPlan?.quotas.data_mb / 1024} GB • {currentPlan?.quotas.minutes} dk • {currentPlan?.quotas.sms} SMS
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="font-medium text-slate-700">Yeni Plan</div>
                          <div className="bg-white/60 rounded-lg p-3">
                            <div className="font-semibold">{selectedPlan?.name}</div>
                            <div className="text-slate-600">₺{selectedPlan?.monthly_fee}/ay</div>
                            <div className="text-xs text-slate-500 mt-1">
                              {selectedPlan?.quotas.data_mb / 1024} GB • {selectedPlan?.quotas.minutes} dk • {selectedPlan?.quotas.sms} SMS
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-white/60 rounded-lg">
                        <div className="font-medium text-slate-700 mb-2">Maliyet Analizi</div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Aylık tasarruf:</span>
                            <span className={comparison.monthlySavings > 0 ? 'text-green-600 font-semibold' : 'text-red-600'}>
                              {comparison.monthlySavings > 0 ? '' : '+'}₺{Math.abs(comparison.monthlySavings)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Yıllık tasarruf:</span>
                            <span className={comparison.annualSavings > 0 ? 'text-green-600 font-semibold' : 'text-red-600'}>
                              {comparison.annualSavings > 0 ? '' : '+'}₺{Math.abs(comparison.annualSavings)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 mt-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-600 text-lg">ℹ️</span>
                    <div className="text-sm text-blue-800">
                      <div className="font-medium mb-1">Önemli Notlar:</div>
                      <ul className="space-y-1 text-blue-700">
                        <li>• Plan değişikliği bir sonraki fatura döneminde geçerli olacaktır</li>
                        <li>• Mevcut kotalarınız yeni plan kotalarıyla güncellenecektir</li>
                        <li>• Bu işlem geri alınamaz, tekrar plan değişikliği yapabilirsiniz</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setCurrentStep(1)}
                  disabled={isProcessing}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors disabled:opacity-50"
                >
                  Geri
                </button>
                <button
                  onClick={handlePlanChange}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {isProcessing && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  )}
                  <span>{isProcessing ? 'İşleniyor...' : 'Plan Değişikliğini Onayla'}</span>
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-green-600 text-3xl">✅</span>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Plan Değişikliği Başarılı!</h3>
                <p className="text-slate-600">
                  Planınız başarıyla <strong>{selectedPlan?.name}</strong> olarak güncellendi.
                </p>
              </div>

              <div className="bg-green-50 rounded-xl p-4">
                <div className="text-sm text-green-800">
                  Yeni planınız bir sonraki fatura döneminde aktif olacaktır.
                  Dashboard'da güncel bilgilerinizi görebilirsiniz.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlanChangeModal;
