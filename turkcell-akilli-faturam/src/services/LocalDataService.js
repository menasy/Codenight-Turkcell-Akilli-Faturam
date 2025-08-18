// Data service for local JSON files - Open/Closed Principle
import axios from 'axios';

class LocalDataService {
  constructor() {
    this.baseURL = '/data';
    this.axiosInstance = axios.create({
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Users
  async getUsers() {
    try {
      const response = await this.axiosInstance.get(`${this.baseURL}/users.json`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Kullanıcı verileri alınamadı');
    }
  }

  async getUserById(id) {
    try {
      const users = await this.getUsers();
      const user = users.find(u => u.user_id === parseInt(id));
      return user;
    } catch (error) {
      console.error('Error fetching user by id:', error);
      throw new Error('Kullanıcı verisi alınamadı');
    }
  }

  // Plans
  async getPlans() {
    try {
      const response = await this.axiosInstance.get(`${this.baseURL}/plans.json`);
      return response.data;
    } catch (error) {
      console.error('Error fetching plans:', error);
      throw new Error('Plan verileri alınamadı');
    }
  }

  async getPlanById(id) {
    try {
      const plans = await this.getPlans();
      const plan = plans.find(p => p.plan_id === parseInt(id));
      return plan;
    } catch (error) {
      console.error('Error fetching plan by id:', error);
      throw new Error('Plan verisi alınamadı');
    }
  }

  // Usage
  async getUserUsage(userId, days = 90) {
    try {
      const response = await this.axiosInstance.get(`${this.baseURL}/usage.json`);
      const usageData = response.data;
      const userUsage = usageData.filter(u => u.user_id === parseInt(userId));
      // Sort by date descending and limit by days
      const sortedUsage = userUsage.sort((a, b) => new Date(b.date) - new Date(a.date));
      return sortedUsage.slice(0, days);
    } catch (error) {
      console.error('Error fetching usage:', error);
      throw new Error('Kullanım verileri alınamadı');
    }
  }

  // Addons
  async getAddons() {
    try {
      const response = await this.axiosInstance.get(`${this.baseURL}/addons.json`);
      return response.data;
    } catch (error) {
      console.error('Error fetching addons:', error);
      throw new Error('Ek paket verileri alınamadı');
    }
  }

  // Mock API responses for plan changes and top-ups
  async changePlan(userId, newPlanId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          user_id: userId,
          new_plan_id: newPlanId,
          status: "mocked-ok",
          message: "Plan başarıyla değiştirildi (simülasyon)"
        });
      }, 500);
    });
  }

  async topUp(userId, addonIds) {
    try {
      const addons = await this.getAddons();
      const selectedAddons = addons.filter(addon => 
        addonIds.includes(addon.addon_id)
      );
      const totalCost = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
      
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            user_id: userId,
            addons: selectedAddons,
            new_estimated_cost: totalCost,
            status: "mocked-ok",
            message: "Ek paket başarıyla eklendi (simülasyon)"
          });
        }, 500);
      });
    } catch (error) {
      console.error('Error in topUp:', error);
      throw new Error('Ek paket işlemi başarısız');
    }
  }

  // Recommendations API simulation
  async getRecommendations(userId, policy = { optimize_for: "lowest_total_cost", risk: "low_overage" }) {
    try {
      const plans = await this.getPlans();

      // This would normally be handled by the backend
      // For now, we'll return a simple mock response
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            user_id: userId,
            top3: plans.slice(0, 3).map((plan, index) => ({
              plan_id: plan.plan_id,
              total_cost: plan.monthly_price + (index * 50),
              breakdown: {
                base: plan.monthly_price,
                over_gb: index * 25,
                over_min: 0,
                over_sms: 0
              }
            })),
            rationale: "Mock öneri sistemi - Backend hazır olduğunda gerçek hesaplamalar yapılacak."
          });
        }, 300);
      });
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw new Error('Öneri verileri alınamadı');
    }
  }

  // Alerts API simulation
  async getAlerts(userId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            level: 'warning',
            type: 'data_usage',
            message: 'Veri kotanızın %75\'ini kullandınız.',
            created_at: new Date().toISOString(),
            read: false
          },
          {
            id: 2,
            level: 'info',
            type: 'plan_suggestion',
            message: 'Size daha uygun bir plan önerimiz var.',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            read: false
          }
        ]);
      }, 200);
    });
  }
}

export default LocalDataService;
