import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useApp } from '../context/AppContext';
import UsageChart from './UsageChart';
import RecommendationCard from './RecommendationCard';
import Alerts from './Alerts';
import { ServiceFactory } from '../services/ServiceFactory';
import { CalculationService } from '../services/CalculationService';

function Dashboard() {
  const navigate = useNavigate();
  const { currentUser, clearUser } = useUser();
  const { alerts, isLoggedIn, logout } = useApp();
  const [usageData, setUsageData] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

    const dataService = ServiceFactory.getDataService();
  const calculationService = new CalculationService();

  useEffect(() => {
    if (!currentUser || !isLoggedIn) {
      navigate('/login');
      return;
    }
    loadDashboardData();
  }, [currentUser, isLoggedIn, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load usage data
      const usage = await dataService.getUserUsage(currentUser.user_id);
      setUsageData(usage);
      
      // Load current plan
      const plan = await dataService.getPlanById(currentUser.current_plan_id);
      setCurrentPlan(plan);
      
      // Calculate recommendations
      const plans = await dataService.getPlans();
      const recs = calculationService.getRecommendations(currentUser, usage, plans);
      setRecommendations(recs);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    clearUser();
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full animate-bounce mx-auto mb-4 flex items-center justify-center">
            <span className="text-slate-900 font-bold text-xl">T</span>
          </div>
          <p className="text-slate-600 text-lg">Dashboard yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-slate-900 font-bold text-lg">T</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Akıllı Faturam</h1>
                <p className="text-slate-600 text-sm">Hoş geldiniz, {currentUser?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Alerts Badge */}
              {alerts && alerts.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setActiveTab('alerts')}
                    className="bg-red-100 text-red-800 px-3 py-2 rounded-full text-sm font-medium hover:bg-red-200 transition-colors"
                  >
                    🔔 {alerts.length} uyarı
                  </button>
                </div>
              )}
              
              <div className="text-right hidden sm:block">
                <p className="text-slate-800 font-medium">{currentUser?.name}</p>
                <p className="text-yellow-600 text-sm font-semibold">{currentPlan?.name || 'Plan Yükleniyor...'}</p>
              </div>
              
              <button
                onClick={handleLogout}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <span>Çıkış</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Genel Bakış', icon: '📊' },
              { id: 'usage', label: 'Kullanım', icon: '📱' },
              { id: 'recommendations', label: 'Öneriler', icon: '💡' },
              { id: 'alerts', label: 'Uyarılar', icon: '🔔' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
                {tab.id === 'alerts' && alerts?.length > 0 && (
                  <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    {alerts.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-blue-600 text-xl">📱</span>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">Mevcut Plan</p>
                    <p className="text-slate-800 font-bold text-lg">{currentPlan?.name}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <span className="text-green-600 text-xl">💰</span>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">Aylık Ücret</p>
                    <p className="text-slate-800 font-bold text-lg">₺{currentPlan?.monthly_fee}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <span className="text-purple-600 text-xl">📊</span>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">Veri Kotası</p>
                    <p className="text-slate-800 font-bold text-lg">{currentPlan?.quotas?.data_mb / 1024} GB</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <span className="text-yellow-600 text-xl">⚡</span>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">Kullanım Durumu</p>
                    <p className="text-slate-800 font-bold text-lg">Normal</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Usage Chart */}
            <UsageChart usageData={usageData} currentPlan={currentPlan} />
            
            {/* Top Recommendation */}
            {recommendations.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">En İyi Öneri</h3>
                <RecommendationCard 
                  recommendation={recommendations[0]} 
                  currentPlan={currentPlan}
                  onPlanChange={() => loadDashboardData()}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'usage' && (
          <div className="space-y-8">
            <UsageChart usageData={usageData} currentPlan={currentPlan} />
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Plan Önerileri</h2>
            {recommendations.map((rec, index) => (
              <RecommendationCard 
                key={index}
                recommendation={rec} 
                currentPlan={currentPlan}
                onPlanChange={() => loadDashboardData()}
              />
            ))}
          </div>
        )}

        {activeTab === 'alerts' && (
          <Alerts alerts={alerts} />
        )}
      </div>
    </div>
  );
}

export default Dashboard;