import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import Profile from './Profile';
import Alerts from './Alerts';
import RecommendationCardNew from './RecommendationCardNew';
import UsageChartNew from './UsageChartNew';
import PlanChangeModalNew from './PlanChangeModalNew';

function DashboardComplete() {
  const { currentUser, logout, addAlert } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [plans, setPlans] = useState([]);
  const [usage, setUsage] = useState([]);
  const [addons, setAddons] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('daily'); // daily, weekly, monthly
  const [showPlanChangeModal, setShowPlanChangeModal] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadDashboardData();
    }
  }, [currentUser]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all data
      const [plansRes, usageRes, addonsRes] = await Promise.all([
        fetch('/data/plans.json'),
        fetch('/data/usage.json'),
        fetch('/data/addons.json')
      ]);

      const plansData = await plansRes.json();
      const usageData = await usageRes.json();
      const addonsData = await addonsRes.json();

      setPlans(plansData);
      setUsage(usageData.filter(u => u.user_id === currentUser.user_id));
      setAddons(addonsData);
      
      const userPlan = plansData.find(p => p.plan_id === currentUser.current_plan_id);
      setCurrentPlan(userPlan);

      // Generate smart alerts
      generateAlerts(usageData.filter(u => u.user_id === currentUser.user_id), userPlan);
      
    } catch (error) {
      console.error('Dashboard verileri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAlerts = (userUsage, plan) => {
    if (!userUsage.length || !plan) return;

    const newAlerts = [];
    const totalUsage = userUsage.reduce((acc, day) => {
      acc.mb_used += day.mb_used;
      acc.minutes_used += day.minutes_used;
      acc.sms_used += day.sms_used;
      return acc;
    }, { mb_used: 0, minutes_used: 0, sms_used: 0 });

    // Data limit alerts
    const dataUsagePercent = (totalUsage.mb_used / (plan.quota_gb * 1024)) * 100;
    if (dataUsagePercent >= 90) {
      newAlerts.push({
        id: Date.now() + 1,
        type: 'data_limit',
        level: 'critical',
        message: 'İnternet kotanızın %90\'ını tükettiniz! Ek paket alarak kotanızı artırabilirsiniz.',
        created_at: new Date().toISOString(),
        read: false
      });
    } else if (dataUsagePercent >= 75) {
      newAlerts.push({
        id: Date.now() + 2,
        type: 'data_usage',
        level: 'warning',
        message: 'İnternet kotanızın %75\'ini kullandınız. Kullanımınızı takip etmeyi unutmayın.',
        created_at: new Date().toISOString(),
        read: false
      });
    }

    // Anomaly detection - check last 7 days average vs today
    if (userUsage.length >= 7) {
      const last7Days = userUsage.slice(-7);
      const avgDailyUsage = last7Days.reduce((sum, day) => sum + day.mb_used, 0) / 7;
      const todayUsage = userUsage[userUsage.length - 1].mb_used;
      
      if (todayUsage > avgDailyUsage * 2) {
        newAlerts.push({
          id: Date.now() + 3,
          type: 'anomaly',
          level: 'warning',
          message: `Bugünkü kullanımınız (${(todayUsage/1024).toFixed(1)}GB) günlük ortalamanızın 2 katından fazla. Arka plan uygulamalarını kontrol edin.`,
          created_at: new Date().toISOString(),
          read: false
        });
      }
    }

    // Minutes limit alert
    const minutesUsagePercent = (totalUsage.minutes_used / plan.quota_min) * 100;
    if (minutesUsagePercent >= 90) {
      newAlerts.push({
        id: Date.now() + 4,
        type: 'minutes_limit',
        level: 'critical',
        message: 'Konuşma kotanızın %90\'ını kullandınız! Ek dakika paketi almayı düşünün.',
        created_at: new Date().toISOString(),
        read: false
      });
    }

    // SMS limit alert
    const smsUsagePercent = (totalUsage.sms_used / plan.quota_sms) * 100;
    if (smsUsagePercent >= 90) {
      newAlerts.push({
        id: Date.now() + 5,
        type: 'sms_limit',
        level: 'warning',
        message: 'SMS kotanızın %90\'ını kullandınız.',
        created_at: new Date().toISOString(),
        read: false
      });
    }

    setAlerts(newAlerts);
  };

  const calculatePredictions = () => {
    if (!usage.length || !currentPlan) return null;

    const daysInMonth = 30;
    const currentDay = usage.length;
    const remainingDays = daysInMonth - currentDay;

    const totalUsage = usage.reduce((acc, day) => {
      acc.mb_used += day.mb_used;
      acc.minutes_used += day.minutes_used;
      acc.sms_used += day.sms_used;
      return acc;
    }, { mb_used: 0, minutes_used: 0, sms_used: 0 });

    const avgDaily = {
      mb_used: totalUsage.mb_used / currentDay,
      minutes_used: totalUsage.minutes_used / currentDay,
      sms_used: totalUsage.sms_used / currentDay
    };

    const predicted = {
      mb_used: totalUsage.mb_used + (avgDaily.mb_used * remainingDays),
      minutes_used: totalUsage.minutes_used + (avgDaily.minutes_used * remainingDays),
      sms_used: totalUsage.sms_used + (avgDaily.sms_used * remainingDays)
    };

    return {
      current: totalUsage,
      predicted,
      remainingDays,
      avgDaily
    };
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePlanChange = async (newPlanId) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update current plan
      const newPlan = plans.find(p => p.plan_id === newPlanId);
      setCurrentPlan(newPlan);
      
      // Show success message
      addAlert({
        id: Date.now(),
        type: 'info',
        level: 'info',
        message: `Planınız başarıyla ${newPlan.plan_name} olarak değiştirildi!`,
        created_at: new Date().toISOString(),
        read: false
      });
      
      setShowPlanChangeModal(false);
    } catch (error) {
      console.error('Plan değiştirme hatası:', error);
    }
  };

  const predictions = calculatePredictions();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Dashboard yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Akıllı Tarifem</h1>
                <p className="text-sm text-slate-600">Hoş geldiniz, {currentUser?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Alert Badge */}
              {alerts.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setActiveTab('alerts')}
                    className="p-2 text-slate-600 hover:text-slate-800 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5-5V9a5 5 0 00-10 0v3L0 17h5m5 0v1a3 3 0 01-6 0v-1m6 0H9"/>
                    </svg>
                  </button>
                  {alerts.filter(a => !a.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {alerts.filter(a => !a.read).length}
                    </span>
                  )}
                </div>
              )}
              
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: '📊' },
              { id: 'profile', name: 'Profil', icon: '👤' },
              { id: 'alerts', name: 'Uyarılar', icon: '🔔' },
              { id: 'recommendations', name: 'Öneriler', icon: '💡' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.name}</span>
                {tab.id === 'alerts' && alerts.filter(a => !a.read).length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {alerts.filter(a => !a.read).length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Quick Stats */}
            {predictions && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Kalan Gün</p>
                      <p className="text-3xl font-bold text-slate-800">{predictions.remainingDays}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📅</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Günlük Ort. (GB)</p>
                      <p className="text-3xl font-bold text-slate-800">
                        {(predictions.avgDaily.mb_used / 1024).toFixed(1)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📊</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Tahmini Toplam (GB)</p>
                      <p className="text-3xl font-bold text-slate-800">
                        {(predictions.predicted.mb_used / 1024).toFixed(1)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🔮</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Paket Limiti (GB)</p>
                      <p className="text-3xl font-bold text-slate-800">
                        {currentPlan?.quota_gb || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📦</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Usage Chart */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Kullanım Grafiği</h2>
                <div className="flex space-x-2">
                  {['daily', 'weekly', 'monthly'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        viewMode === mode
                          ? 'bg-purple-500 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {mode === 'daily' ? 'Günlük' : mode === 'weekly' ? 'Haftalık' : 'Aylık'}
                    </button>
                  ))}
                </div>
              </div>
              <UsageChartNew usageData={usage} viewMode={viewMode} />
            </div>

            {/* Prediction Details */}
            {predictions && (
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Ay Sonu Tahminleri</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-2">İnternet Kullanımı</h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {(predictions.predicted.mb_used / 1024).toFixed(1)} GB
                    </p>
                    <p className="text-sm text-blue-600 mt-1">
                      Limit: {currentPlan?.quota_gb} GB
                    </p>
                    {predictions.predicted.mb_used / 1024 > currentPlan?.quota_gb && (
                      <p className="text-xs text-red-600 mt-1">⚠️ Limit aşılabilir!</p>
                    )}
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-2">Konuşma</h3>
                    <p className="text-2xl font-bold text-green-600">
                      {Math.round(predictions.predicted.minutes_used)} dk
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      Limit: {currentPlan?.quota_min} dk
                    </p>
                    {predictions.predicted.minutes_used > currentPlan?.quota_min && (
                      <p className="text-xs text-red-600 mt-1">⚠️ Limit aşılabilir!</p>
                    )}
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <h3 className="font-semibold text-purple-800 mb-2">SMS</h3>
                    <p className="text-2xl font-bold text-purple-600">
                      {Math.round(predictions.predicted.sms_used)} adet
                    </p>
                    <p className="text-sm text-purple-600 mt-1">
                      Limit: {currentPlan?.quota_sms} adet
                    </p>
                    {predictions.predicted.sms_used > currentPlan?.quota_sms && (
                      <p className="text-xs text-red-600 mt-1">⚠️ Limit aşılabilir!</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Hızlı İşlemler</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setShowPlanChangeModal(true)}
                  className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 text-left"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📋</span>
                    <div>
                      <h3 className="font-semibold">Planı Değiştir</h3>
                      <p className="text-sm opacity-90">Size uygun planı seçin</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('recommendations')}
                  className="p-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-200 text-left"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <h3 className="font-semibold">Önerileri Gör</h3>
                      <p className="text-sm opacity-90">Size özel plan önerileri</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && <Profile />}
        
        {activeTab === 'alerts' && <Alerts alerts={alerts} />}
        
        {activeTab === 'recommendations' && (
          <RecommendationCardNew 
            currentUser={currentUser}
            currentPlan={currentPlan}
            usage={usage}
            plans={plans}
            addons={addons}
          />
        )}
      </main>

      {/* Plan Change Modal */}
      {showPlanChangeModal && (
        <PlanChangeModalNew
          currentPlan={currentPlan}
          plans={plans}
          onClose={() => setShowPlanChangeModal(false)}
          onConfirm={handlePlanChange}
        />
      )}
    </div>
  );
}

export default DashboardComplete;
