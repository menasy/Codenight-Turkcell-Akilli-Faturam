import React, { useState } from 'react';
import ServiceFactory from '../services/ServiceFactory';

function RecommendationCard({ recommendation, rank, isCurrentPlan }) {
  const [isChanging, setIsChanging] = useState(false);
  const { plan, cost_breakdown, monthly_savings } = recommendation;

  const handlePlanChange = async () => {
    if (isCurrentPlan) return;
    
    setIsChanging(true);
    try {
      const dataService = ServiceFactory.createDataService();
      const result = await dataService.changePlan(1, plan.plan_id); // Mock user ID
      
      alert(`Plan değişikliği başarılı: ${result.message}`);
    } catch (error) {
      console.error('Plan change error:', error);
      alert('Plan değişikliği sırasında bir hata oluştu.');
    } finally {
      setIsChanging(false);
    }
  };

  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 1: return 'bg-yellow-400 text-slate-900';
      case 2: return 'bg-slate-400 text-white';
      case 3: return 'bg-orange-400 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const getSavingsColor = (savings) => {
    if (savings > 0) return 'text-green-600';
    if (savings < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl p-6 border-2 transition-all duration-300 hover:shadow-2xl ${
      isCurrentPlan ? 'border-yellow-400 bg-yellow-50' : 'border-transparent hover:border-slate-200'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getRankBadgeColor(rank)}`}>
            {rank}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">{plan.plan_name}</h3>
            <p className="text-sm text-slate-500">{plan.type}</p>
          </div>
        </div>
        {isCurrentPlan && (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
            Mevcut Plan
          </span>
        )}
      </div>

      {/* Plan Details */}
      <div className="space-y-3 mb-6">
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="text-center p-2 bg-slate-50 rounded-lg">
            <div className="font-semibold text-slate-800">{plan.quota_gb} GB</div>
            <div className="text-slate-500">İnternet</div>
          </div>
          <div className="text-center p-2 bg-slate-50 rounded-lg">
            <div className="font-semibold text-slate-800">{plan.quota_min} dk</div>
            <div className="text-slate-500">Konuşma</div>
          </div>
          <div className="text-center p-2 bg-slate-50 rounded-lg">
            <div className="font-semibold text-slate-800">{plan.quota_sms}</div>
            <div className="text-slate-500">SMS</div>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-slate-50 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-slate-800 mb-3">Tahmini Aylık Maliyet</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Temel ücret:</span>
            <span className="font-semibold">₺{cost_breakdown.base}</span>
          </div>
          {cost_breakdown.data_overage > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-600">Veri aşımı:</span>
              <span className="font-semibold text-red-600">₺{cost_breakdown.data_overage.toFixed(2)}</span>
            </div>
          )}
          {cost_breakdown.minutes_overage > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-600">Dakika aşımı:</span>
              <span className="font-semibold text-red-600">₺{cost_breakdown.minutes_overage.toFixed(2)}</span>
            </div>
          )}
          {cost_breakdown.sms_overage > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-600">SMS aşımı:</span>
              <span className="font-semibold text-red-600">₺{cost_breakdown.sms_overage.toFixed(2)}</span>
            </div>
          )}
          <hr className="my-2" />
          <div className="flex justify-between font-bold">
            <span>Toplam:</span>
            <span className="text-lg">₺{cost_breakdown.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Savings */}
      {monthly_savings !== 0 && (
        <div className={`text-center p-3 rounded-lg mb-4 ${
          monthly_savings > 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className={`font-semibold ${getSavingsColor(monthly_savings)}`}>
            {monthly_savings > 0 ? '💰 Aylık Tasarruf' : '💸 Ek Maliyet'}
          </div>
          <div className={`text-lg font-bold ${getSavingsColor(monthly_savings)}`}>
            ₺{Math.abs(monthly_savings).toFixed(2)}
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handlePlanChange}
        disabled={isCurrentPlan || isChanging}
        className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
          isCurrentPlan
            ? 'bg-yellow-100 text-yellow-800 cursor-not-allowed'
            : isChanging
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 shadow-lg hover:shadow-xl transform hover:scale-105'
        }`}
      >
        {isCurrentPlan 
          ? 'Mevcut Planınız'
          : isChanging 
          ? 'Plan Değiştiriliyor...'
          : 'Bu Plana Geç'
        }
      </button>

      {/* Overage Info */}
      {(cost_breakdown.data_overage > 0 || cost_breakdown.minutes_overage > 0 || cost_breakdown.sms_overage > 0) && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-orange-500">⚠️</span>
            <span className="text-sm text-orange-700 font-medium">Aşım Ücretleri Dahil</span>
          </div>
          <p className="text-xs text-orange-600 mt-1">
            Mevcut kullanımınıza göre bazı kotaları aşacaksınız.
          </p>
        </div>
      )}
    </div>
  );
}

export default RecommendationCard;
