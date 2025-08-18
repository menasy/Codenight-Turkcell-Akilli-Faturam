import React from 'react';
import { useApp } from '../context/AppContext';

function Alerts({ alerts }) {
  const { markAlertAsRead, removeAlert } = useApp();

  const getAlertIcon = (type) => {
    switch (type) {
      case 'data_limit': return '📶';
      case 'data_usage': return '📱';
      case 'anomaly': return '⚠️';
      case 'minutes_limit': return '📞';
      case 'sms_limit': return '💬';
      default: return '🔔';
    }
  };

  const getAlertColor = (level) => {
    switch (level) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'warning': return 'border-yellow-500 bg-yellow-50';
      case 'info': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getAlertTextColor = (level) => {
    switch (level) {
      case 'critical': return 'text-red-800';
      case 'warning': return 'text-yellow-800';
      case 'info': return 'text-blue-800';
      default: return 'text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl text-center">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Tüm Sistemler Normal</h3>
        <p className="text-slate-600">
          Şu anda hiçbir uyarınız bulunmuyor. Kullanımınız normale gözüküyor.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Uyarılar</h2>
          <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">
            {alerts.length} aktif uyarı
          </span>
        </div>

        <div className="space-y-4">
          {alerts.map((alert, index) => (
            <div
              key={alert.id || index}
              className={`border-l-4 rounded-lg p-4 ${getAlertColor(alert.level)} transition-all duration-300 hover:shadow-md`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{getAlertIcon(alert.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`font-semibold ${getAlertTextColor(alert.level)}`}>
                        {alert.level === 'critical' ? 'Kritik' : 
                         alert.level === 'warning' ? 'Uyarı' : 
                         alert.level === 'info' ? 'Bilgi' : 'Genel'}
                      </span>
                      <span className="text-sm text-slate-500">
                        {formatDate(alert.created_at)}
                      </span>
                    </div>
                    <p className={`${getAlertTextColor(alert.level)} text-sm leading-relaxed`}>
                      {alert.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {!alert.read && (
                    <button
                      onClick={() => markAlertAsRead(alert.id)}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                      title="Okundu olarak işaretle"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => removeAlert(alert.id)}
                    className="text-slate-400 hover:text-red-600 transition-colors"
                    title="Uyarıyı kaldır"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Alert recommendations */}
              {alert.level === 'critical' && alert.type === 'data_limit' && (
                <div className="mt-3 p-3 bg-white/50 rounded-lg">
                  <p className="text-sm font-medium text-slate-700 mb-2">🎯 Önerilen Aksiyonlar:</p>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Ek veri paketi satın alın</li>
                    <li>• Wi-Fi kullanımını artırın</li>
                    <li>• Video kalitesini düşürün</li>
                  </ul>
                </div>
              )}

              {alert.type === 'anomaly' && (
                <div className="mt-3 p-3 bg-white/50 rounded-lg">
                  <p className="text-sm font-medium text-slate-700 mb-2">🔍 İnceleme Önerisi:</p>
                  <p className="text-sm text-slate-600">
                    Beklenmedik kullanım artışı tespit edildi. Arka planda çalışan uygulamaları kontrol edin.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary Statistics */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-red-50 rounded-lg">
              <div className="text-lg font-bold text-red-600">
                {alerts.filter(a => a.level === 'critical').length}
              </div>
              <div className="text-sm text-red-700">Kritik</div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="text-lg font-bold text-yellow-600">
                {alerts.filter(a => a.level === 'warning').length}
              </div>
              <div className="text-sm text-yellow-700">Uyarı</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {alerts.filter(a => a.level === 'info').length}
              </div>
              <div className="text-sm text-blue-700">Bilgi</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Alerts;
