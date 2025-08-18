import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import ServiceFactory from '../services/ServiceFactory';
import CalculationService from '../services/CalculationService';
import UsageChart from './UsageChart';
import RecommendationCard from './RecommendationCard';
import Alerts from './Alerts';

function Dashboard() {
  const { currentUser, logout, alerts, addAlert } = useApp();
  const navigate = useNavigate();
  const [usage, setUsage] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const dataService = ServiceFactory.createDataService();
        
        // Fetch usage data
        const usageData = await dataService.getUserUsage(currentUser.user_id, 30);
        setUsage(usageData);

        // Generate recommendations
        if (usageData.length > 0) {
          const { plans } = await dataService.getPlans();
          const recs = CalculationService.generateRecommendations(
            plans, 
            usageData, 
            currentUser.current_plan_id
          );
          setRecommendations(recs.recommendations);
        }

        // Generate alerts
        const currentPlan = currentUser.current_plan;
        if (currentPlan && usageData.length > 0) {
          const today = new Date();
          const daysRemaining = 30 - today.getDate();
          const generatedAlerts = CalculationService.generateAlerts(
            usageData, 
            currentPlan, 
            daysRemaining
          );
          
          generatedAlerts.forEach(alert => {
            addAlert({ ...alert, id: Date.now() + Math.random() });
          });
        }

      } catch (error) {
        console.error('Dashboard data fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser, navigate, addAlert]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!currentUser) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-yellow-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Dashboard yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center">
                <span className="text-slate-900 font-bold">T</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Akıllı Faturam</h1>
                <p className="text-slate-300 text-sm">Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Alerts Badge */}
              <div className="relative">
                <button className="text-white hover:text-yellow-400 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.021 15.493A9.953 9.953 0 003 12c0-5.523 4.477-10 10-10s10 4.477 10 10a9.953 9.953 0 01-1.021 3.493"/>
                  </svg>
                </button>
                {alerts.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {alerts.length}
                  </span>
                )}
              </div>

              <div className="text-right">
                <p className="text-white font-medium">{currentUser.name}</p>
                <p className="text-yellow-400 text-sm">
                  {currentUser.current_plan?.plan_name || 'Plan yükleniyor...'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Genel Bakış', icon: '📊' },
              { id: 'usage', label: 'Kullanım Detayları', icon: '📈' },
              { id: 'recommendations', label: 'Öneriler', icon: '💡' },
              { id: 'alerts', label: 'Uyarılar', icon: '🚨' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-yellow-400 text-slate-900'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.id === 'alerts' && alerts.length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {alerts.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Welcome Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-slate-800 mb-2">
                Hoş Geldiniz, {currentUser.name}!
              </h2>
              <p className="text-slate-600">
                Akıllı Faturam dashboard'una hoş geldiniz. 
                Burada faturanızı takip edebilir ve yönetebilirsiniz.
              </p>
            </div>

            {/* Plan Info Card */}
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Mevcut Planınız</h3>
              <p className="text-slate-800 font-semibold text-lg">
                {currentUser.current_plan?.plan_name || 'Plan yükleniyor...'}
              </p>
              <p className="text-slate-700 text-sm mt-2">
                Aylık: ₺{currentUser.current_plan?.monthly_price || 0}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Hızlı İşlemler</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => setActiveTab('usage')}
                  className="w-full text-left p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  📊 Kullanım Detayları
                </button>
                <button 
                  onClick={() => setActiveTab('recommendations')}
                  className="w-full text-left p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  💡 Plan Önerileri
                </button>
                <button className="w-full text-left p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  ⚙️ Plan Değiştir
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'usage' && (
          <div className="space-y-6">
            <UsageChart usage={usage} currentPlan={currentUser.current_plan} />
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Plan Önerileri</h2>
              <p className="text-slate-600 mb-6">
                Son 30 günlük kullanımınıza göre en uygun planlar:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((rec, index) => (
                  <RecommendationCard 
                    key={rec.plan.plan_id} 
                    recommendation={rec}
                    rank={index + 1}
                    isCurrentPlan={rec.is_current}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <Alerts alerts={alerts} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
