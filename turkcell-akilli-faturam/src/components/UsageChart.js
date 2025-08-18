import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function UsageChart({ usage, currentPlan }) {
  if (!usage || usage.length === 0) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-slate-800 mb-4">Kullanım Grafiği</h3>
        <div className="text-center py-8">
          <p className="text-slate-500">Kullanım verisi bulunamadı</p>
        </div>
      </div>
    );
  }

  // Prepare data for chart
  const chartData = usage.map(day => ({
    date: new Date(day.date).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }),
    'Veri (MB)': day.mb_used,
    'Dakika': day.minutes_used,
    'SMS': day.sms_used
  })).reverse(); // Show chronologically

  // Calculate totals and averages
  const totalData = usage.reduce((sum, day) => sum + day.mb_used, 0) / 1024; // Convert to GB
  const totalMinutes = usage.reduce((sum, day) => sum + day.minutes_used, 0);
  const totalSMS = usage.reduce((sum, day) => sum + day.sms_used, 0);

  const avgDaily = {
    data: totalData / usage.length,
    minutes: totalMinutes / usage.length,
    sms: totalSMS / usage.length
  };

  // Calculate remaining quota
  const quotaUsage = currentPlan ? {
    data: {
      used: totalData,
      quota: currentPlan.quota_gb,
      percentage: (totalData / currentPlan.quota_gb) * 100
    },
    minutes: {
      used: totalMinutes,
      quota: currentPlan.quota_min,
      percentage: (totalMinutes / currentPlan.quota_min) * 100
    },
    sms: {
      used: totalSMS,
      quota: currentPlan.quota_sms,
      percentage: (totalSMS / currentPlan.quota_sms) * 100
    }
  } : null;

  return (
    <div className="space-y-6">
      {/* Usage Summary Cards */}
      {quotaUsage && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Data Usage */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-slate-800">Veri Kullanımı</h4>
              <span className="text-2xl">📱</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Kullanılan:</span>
                <span className="font-semibold">{quotaUsage.data.used.toFixed(1)} GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Kota:</span>
                <span className="font-semibold">{quotaUsage.data.quota} GB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${
                    quotaUsage.data.percentage > 90 ? 'bg-red-500' :
                    quotaUsage.data.percentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(quotaUsage.data.percentage, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-slate-500">
                %{quotaUsage.data.percentage.toFixed(1)} kullanıldı
              </p>
            </div>
          </div>

          {/* Minutes Usage */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-slate-800">Konuşma</h4>
              <span className="text-2xl">📞</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Kullanılan:</span>
                <span className="font-semibold">{totalMinutes} dk</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Kota:</span>
                <span className="font-semibold">{quotaUsage.minutes.quota} dk</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${
                    quotaUsage.minutes.percentage > 90 ? 'bg-red-500' :
                    quotaUsage.minutes.percentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(quotaUsage.minutes.percentage, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-slate-500">
                %{quotaUsage.minutes.percentage.toFixed(1)} kullanıldı
              </p>
            </div>
          </div>

          {/* SMS Usage */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-slate-800">SMS</h4>
              <span className="text-2xl">💬</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Kullanılan:</span>
                <span className="font-semibold">{totalSMS} adet</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Kota:</span>
                <span className="font-semibold">{quotaUsage.sms.quota} adet</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${
                    quotaUsage.sms.percentage > 90 ? 'bg-red-500' :
                    quotaUsage.sms.percentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(quotaUsage.sms.percentage, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-slate-500">
                %{quotaUsage.sms.percentage.toFixed(1)} kullanıldı
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Usage Chart */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Günlük Kullanım Trendi</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="Veri (MB)" 
                stroke="#facc15" 
                strokeWidth={3}
                dot={{ fill: '#facc15', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="Dakika" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="SMS" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Averages */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-slate-800 mb-4">Günlük Ortalamalar</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{avgDaily.data.toFixed(1)} GB</div>
            <div className="text-sm text-slate-600">Günlük Ortalama Veri</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{avgDaily.minutes.toFixed(0)} dk</div>
            <div className="text-sm text-slate-600">Günlük Ortalama Konuşma</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{avgDaily.sms.toFixed(0)} adet</div>
            <div className="text-sm text-slate-600">Günlük Ortalama SMS</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UsageChart;
