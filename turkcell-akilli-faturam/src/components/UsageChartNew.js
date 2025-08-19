import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function UsageChart({ usageData, viewMode = 'daily' }) {
  // Process data based on view mode
  const processData = () => {
    if (!usageData || usageData.length === 0) return [];

    let processedData = [];

    if (viewMode === 'daily') {
      processedData = usageData.map((day, index) => ({
        date: new Date(day.date).toLocaleDateString('tr-TR', { 
          day: 'numeric', 
          month: 'short' 
        }),
        internet: (day.mb_used / 1024).toFixed(2), // Convert to GB
        konusma: day.minutes_used,
        sms: day.sms_used,
        day: index + 1
      }));
    } else if (viewMode === 'weekly') {
      // Group by weeks
      const weeklyData = {};
      usageData.forEach((day, index) => {
        const weekNum = Math.floor(index / 7) + 1;
        if (!weeklyData[weekNum]) {
          weeklyData[weekNum] = {
            week: `${weekNum}. Hafta`,
            internet: 0,
            konusma: 0,
            sms: 0,
            dayCount: 0
          };
        }
        weeklyData[weekNum].internet += day.mb_used / 1024;
        weeklyData[weekNum].konusma += day.minutes_used;
        weeklyData[weekNum].sms += day.sms_used;
        weeklyData[weekNum].dayCount++;
      });

      processedData = Object.values(weeklyData).map(week => ({
        date: week.week,
        internet: week.internet.toFixed(2),
        konusma: Math.round(week.konusma),
        sms: Math.round(week.sms)
      }));
    } else if (viewMode === 'monthly') {
      // Show cumulative data
      let cumulative = { internet: 0, konusma: 0, sms: 0 };
      processedData = usageData.map((day, index) => {
        cumulative.internet += day.mb_used / 1024;
        cumulative.konusma += day.minutes_used;
        cumulative.sms += day.sms_used;
        
        return {
          date: `${index + 1}. Gün`,
          internet: cumulative.internet.toFixed(2),
          konusma: Math.round(cumulative.konusma),
          sms: Math.round(cumulative.sms)
        };
      });
    }

    return processedData;
  };

  const chartData = processData();

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-semibold text-slate-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-slate-600">
                {entry.name === 'internet' ? 'İnternet' : 
                 entry.name === 'konusma' ? 'Konuşma' : 'SMS'}:
              </span>
              <span className="font-medium text-slate-800">
                {entry.value} {entry.name === 'internet' ? 'GB' : 
                              entry.name === 'konusma' ? 'dk' : 'adet'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!chartData.length) {
    return (
      <div className="h-80 flex items-center justify-center bg-slate-50 rounded-lg">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-slate-600">Henüz kullanım verisi bulunmuyor</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            stroke="#64748b"
            fontSize={12}
            tick={{ fill: '#64748b' }}
          />
          <YAxis 
            stroke="#64748b"
            fontSize={12}
            tick={{ fill: '#64748b' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ 
              paddingTop: '20px',
              fontSize: '14px'
            }}
            formatter={(value) => 
              value === 'internet' ? 'İnternet (GB)' : 
              value === 'konusma' ? 'Konuşma (dk)' : 'SMS (adet)'
            }
          />
          
          {/* Internet Usage Line */}
          <Line 
            type="monotone" 
            dataKey="internet" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#3b82f6' }}
            name="internet"
          />
          
          {/* Voice Usage Line - Only show if viewMode is daily or it's not too cluttered */}
          {(viewMode === 'daily' || chartData.length <= 10) && (
            <Line 
              type="monotone" 
              dataKey="konusma" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, fill: '#10b981' }}
              name="konusma"
            />
          )}
          
          {/* SMS Usage Line - Only show if viewMode is daily or it's not too cluttered */}
          {(viewMode === 'daily' || chartData.length <= 10) && (
            <Line 
              type="monotone" 
              dataKey="sms" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, fill: '#8b5cf6' }}
              name="sms"
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-blue-700">İnternet</span>
          </div>
          <div className="text-lg font-bold text-blue-600">
            {viewMode === 'monthly' && chartData.length > 0 
              ? `${chartData[chartData.length - 1].internet} GB`
              : `${chartData.reduce((sum, day) => sum + parseFloat(day.internet), 0).toFixed(1)} GB`
            }
          </div>
          <div className="text-xs text-blue-600">
            {viewMode === 'monthly' ? 'Toplam' : viewMode === 'weekly' ? 'Haftalık Ort.' : 'Günlük Ort.'}
          </div>
        </div>

        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-700">Konuşma</span>
          </div>
          <div className="text-lg font-bold text-green-600">
            {viewMode === 'monthly' && chartData.length > 0
              ? `${chartData[chartData.length - 1].konusma} dk`
              : `${Math.round(chartData.reduce((sum, day) => sum + parseInt(day.konusma), 0) / chartData.length)} dk`
            }
          </div>
          <div className="text-xs text-green-600">
            {viewMode === 'monthly' ? 'Toplam' : viewMode === 'weekly' ? 'Haftalık Ort.' : 'Günlük Ort.'}
          </div>
        </div>

        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-sm font-medium text-purple-700">SMS</span>
          </div>
          <div className="text-lg font-bold text-purple-600">
            {viewMode === 'monthly' && chartData.length > 0
              ? `${chartData[chartData.length - 1].sms} adet`
              : `${Math.round(chartData.reduce((sum, day) => sum + parseInt(day.sms), 0) / chartData.length)} adet`
            }
          </div>
          <div className="text-xs text-purple-600">
            {viewMode === 'monthly' ? 'Toplam' : viewMode === 'weekly' ? 'Haftalık Ort.' : 'Günlük Ort.'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UsageChart;
