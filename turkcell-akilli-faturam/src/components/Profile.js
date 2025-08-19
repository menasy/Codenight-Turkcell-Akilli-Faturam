import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

function Profile() {
  const { currentUser } = useApp();
  const [userPlan, setUserPlan] = useState(null);
  const [usageData, setUsageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Load plans data
      const plansResponse = await fetch('/data/plans.json');
      const plans = await plansResponse.json();
      const plan = plans.find(p => p.plan_id === currentUser.current_plan_id);
      setUserPlan(plan);

      // Load usage data
      const usageResponse = await fetch('/data/usage.json');
      const allUsage = await usageResponse.json();
      const userUsage = allUsage.filter(u => u.user_id === currentUser.user_id);
      
      // Calculate totals for current month
      const totalUsage = userUsage.reduce((acc, day) => {
        acc.mb_used += day.mb_used;
        acc.minutes_used += day.minutes_used;
        acc.sms_used += day.sms_used;
        return acc;
      }, { mb_used: 0, minutes_used: 0, sms_used: 0 });

      setUsageData(totalUsage);
    } catch (error) {
      console.error('Kullanıcı verileri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (used, total) => {
    return Math.min((used / total) * 100, 100);
  };

  const formatData = (mb) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb} MB`;
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getProgressBgColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-100';
    if (percentage >= 75) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  if (!currentUser) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl text-center">
        <div className="text-6xl mb-4">👤</div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Kullanıcı Bulunamadı</h3>
        <p className="text-slate-600">Lütfen giriş yapın.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-3/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 rounded"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            <div className="h-4 bg-slate-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Kullanıcı Bilgileri Kartı */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">
                {currentUser.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{currentUser.name}</h2>
              <p className="text-slate-600">
                {currentUser.type.charAt(0).toUpperCase() + currentUser.type.slice(1)} Hat
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              currentUser.type === 'faturalı' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {currentUser.type === 'faturalı' ? '📄' : '💳'} {currentUser.type}
            </div>
          </div>
        </div>

        {/* Paket Bilgileri */}
        {userPlan && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">Mevcut Paketiniz</h3>
                <p className="text-xl font-bold text-purple-600">{userPlan.plan_name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600">Aylık Ücret</p>
                <p className="text-2xl font-bold text-slate-800">{userPlan.monthly_price}₺</p>
              </div>
            </div>
          </div>
        )}

        {/* Kota Göstergeleri */}
        {userPlan && usageData && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Paket Kullanımı</h3>
            
            {/* Internet Kotası */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">📶</span>
                  <span className="font-medium text-slate-700">İnternet</span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-slate-600">
                    {formatData(usageData.mb_used)} / {formatData(userPlan.quota_gb * 1024)}
                  </span>
                </div>
              </div>
              <div className={`w-full rounded-full h-3 ${getProgressBgColor(calculateProgress(usageData.mb_used, userPlan.quota_gb * 1024))}`}>
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(calculateProgress(usageData.mb_used, userPlan.quota_gb * 1024))}`}
                  style={{ width: `${calculateProgress(usageData.mb_used, userPlan.quota_gb * 1024)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Kullanılan: {formatData(usageData.mb_used)}</span>
                <span>Kalan: {formatData((userPlan.quota_gb * 1024) - usageData.mb_used)}</span>
              </div>
            </div>

            {/* Dakika Kotası */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">📞</span>
                  <span className="font-medium text-slate-700">Konuşma</span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-slate-600">
                    {usageData.minutes_used} / {userPlan.quota_min} dk
                  </span>
                </div>
              </div>
              <div className={`w-full rounded-full h-3 ${getProgressBgColor(calculateProgress(usageData.minutes_used, userPlan.quota_min))}`}>
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(calculateProgress(usageData.minutes_used, userPlan.quota_min))}`}
                  style={{ width: `${calculateProgress(usageData.minutes_used, userPlan.quota_min)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Kullanılan: {usageData.minutes_used} dk</span>
                <span>Kalan: {userPlan.quota_min - usageData.minutes_used} dk</span>
              </div>
            </div>

            {/* SMS Kotası */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">💬</span>
                  <span className="font-medium text-slate-700">SMS</span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-slate-600">
                    {usageData.sms_used} / {userPlan.quota_sms} adet
                  </span>
                </div>
              </div>
              <div className={`w-full rounded-full h-3 ${getProgressBgColor(calculateProgress(usageData.sms_used, userPlan.quota_sms))}`}>
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(calculateProgress(usageData.sms_used, userPlan.quota_sms))}`}
                  style={{ width: `${calculateProgress(usageData.sms_used, userPlan.quota_sms)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Kullanılan: {usageData.sms_used} adet</span>
                <span>Kalan: {userPlan.quota_sms - usageData.sms_used} adet</span>
              </div>
            </div>
          </div>
        )}

        {/* Kullanım Özeti */}
        {userPlan && usageData && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(calculateProgress(usageData.mb_used, userPlan.quota_gb * 1024))}%
                </div>
                <div className="text-sm text-blue-700">İnternet</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(calculateProgress(usageData.minutes_used, userPlan.quota_min))}%
                </div>
                <div className="text-sm text-green-700">Konuşma</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(calculateProgress(usageData.sms_used, userPlan.quota_sms))}%
                </div>
                <div className="text-sm text-purple-700">SMS</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
