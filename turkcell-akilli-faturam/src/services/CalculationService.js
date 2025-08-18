// Calculation service for cost analysis - Single Responsibility Principle
class CalculationService {
  // Calculate monthly cost for a plan based on usage
  static calculateMonthlyCost(plan, usage) {
    if (!plan || !usage) return 0;

    const baseCost = plan.monthly_price;
    
    // Calculate average daily usage
    const avgDailyData = usage.reduce((sum, day) => sum + day.mb_used, 0) / usage.length / 1024; // Convert MB to GB
    const avgDailyMinutes = usage.reduce((sum, day) => sum + day.minutes_used, 0) / usage.length;
    const avgDailySms = usage.reduce((sum, day) => sum + day.sms_used, 0) / usage.length;

    // Project monthly usage (30 days)
    const monthlyData = avgDailyData * 30;
    const monthlyMinutes = avgDailyMinutes * 30;
    const monthlySms = avgDailySms * 30;

    // Calculate overages
    const dataOverage = Math.max(monthlyData - plan.quota_gb, 0) * plan.overage_gb;
    const minutesOverage = Math.max(monthlyMinutes - plan.quota_min, 0) * plan.overage_min;
    const smsOverage = Math.max(monthlySms - plan.quota_sms, 0) * plan.overage_sms;

    const totalCost = baseCost + dataOverage + minutesOverage + smsOverage;

    return {
      base: baseCost,
      data_overage: dataOverage,
      minutes_overage: minutesOverage,
      sms_overage: smsOverage,
      total: totalCost,
      projected_usage: {
        data_gb: monthlyData,
        minutes: monthlyMinutes,
        sms: monthlySms
      }
    };
  }

  // Generate plan recommendations
  static generateRecommendations(plans, userUsage, currentPlanId) {
    const recommendations = plans.map(plan => {
      const cost = this.calculateMonthlyCost(plan, userUsage);
      return {
        plan,
        cost_breakdown: cost,
        is_current: plan.plan_id === currentPlanId
      };
    });

    // Sort by total cost
    const sorted = recommendations.sort((a, b) => a.cost_breakdown.total - b.cost_breakdown.total);
    
    // Get top 3 recommendations
    const top3 = sorted.slice(0, 3);
    
    // Calculate savings compared to current plan
    const currentPlanCost = sorted.find(r => r.is_current)?.cost_breakdown.total || 0;
    
    top3.forEach(rec => {
      rec.monthly_savings = currentPlanCost - rec.cost_breakdown.total;
    });

    return {
      recommendations: top3,
      rationale: this.generateRationale(top3, userUsage)
    };
  }

  // Generate recommendation rationale
  static generateRationale(recommendations, usage) {
    if (!recommendations.length) return "Öneri bulunamadı.";

    const avgDailyData = usage.reduce((sum, day) => sum + day.mb_used, 0) / usage.length / 1024;
    const monthlyData = avgDailyData * 30;

    const bestPlan = recommendations[0].plan;
    const worstPlan = recommendations[recommendations.length - 1].plan;

    return `Son ${usage.length} günlük ortalama ${monthlyData.toFixed(1)}GB kullanım. ` +
           `${bestPlan.plan_name} planda ${recommendations[0].cost_breakdown.total.toFixed(0)}₺ ` +
           `ile en ekonomik seçenek. ${worstPlan.plan_name} planına göre aylık ` +
           `${(recommendations[recommendations.length - 1].cost_breakdown.total - recommendations[0].cost_breakdown.total).toFixed(0)}₺ tasarruf.`;
  }

  // Calculate usage forecasting
  static forecastUsage(usage, daysRemaining) {
    if (!usage.length) return { data: 0, minutes: 0, sms: 0 };

    const avgDaily = {
      data: usage.reduce((sum, day) => sum + day.mb_used, 0) / usage.length,
      minutes: usage.reduce((sum, day) => sum + day.minutes_used, 0) / usage.length,
      sms: usage.reduce((sum, day) => sum + day.sms_used, 0) / usage.length
    };

    return {
      data_mb: avgDaily.data * daysRemaining,
      data_gb: (avgDaily.data * daysRemaining) / 1024,
      minutes: avgDaily.minutes * daysRemaining,
      sms: avgDaily.sms * daysRemaining
    };
  }

  // Generate alerts based on usage patterns
  static generateAlerts(usage, plan, daysRemaining) {
    const alerts = [];
    
    if (!usage.length || !plan) return alerts;

    const forecast = this.forecastUsage(usage, daysRemaining);
    const currentMonth = usage.reduce((sum, day) => sum + day.mb_used, 0) / 1024; // GB

    // Data usage alerts
    const dataRemaining = plan.quota_gb - currentMonth;
    const dataUsagePercent = (currentMonth / plan.quota_gb) * 100;

    if (dataUsagePercent > 90 && daysRemaining > 3) {
      alerts.push({
        level: 'critical',
        type: 'data_limit',
        message: `Kalan veri kotanız %${(100 - dataUsagePercent).toFixed(1)}. ${daysRemaining} gün kaldı.`,
        created_at: new Date().toISOString()
      });
    } else if (dataUsagePercent > 75) {
      alerts.push({
        level: 'warning',
        type: 'data_usage',
        message: `Veri kotanızın %${dataUsagePercent.toFixed(1)}'ini kullandınız.`,
        created_at: new Date().toISOString()
      });
    }

    // Anomaly detection - usage spike
    const recent3Days = usage.slice(-3);
    const previous14Days = usage.slice(-17, -3);
    
    if (recent3Days.length === 3 && previous14Days.length >= 7) {
      const recentAvg = recent3Days.reduce((sum, day) => sum + day.mb_used, 0) / 3;
      const previousAvg = previous14Days.reduce((sum, day) => sum + day.mb_used, 0) / previous14Days.length;
      
      if (recentAvg > previousAvg * 2) {
        alerts.push({
          level: 'info',
          type: 'anomaly',
          message: `Son 3 gündeki kullanımınız normale göre %${((recentAvg / previousAvg - 1) * 100).toFixed(0)} daha yüksek.`,
          created_at: new Date().toISOString()
        });
      }
    }

    return alerts;
  }
}

export { CalculationService };
export default CalculationService;
