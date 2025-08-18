// API service for backend integration - Interface Segregation Principle
import BaseApiService from './BaseApiService';

class ApiService extends BaseApiService {
  // Users
  async getUsers() {
    return this.get('/users');
  }

  async getUserById(id) {
    return this.get(`/users/${id}`);
  }

  // Usage
  async getUserUsage(id, days = 90) {
    return this.get(`/usage/${id}`, { days });
  }

  // Plans
  async getPlans() {
    return this.get('/plans');
  }

  // Recommendations
  async getRecommendations(userId, policy = { optimize_for: "lowest_total_cost", risk: "low_overage" }) {
    return this.post('/recommendation', {
      user_id: userId,
      policy
    });
  }

  // Plan changes
  async changePlan(userId, newPlanId) {
    return this.post('/change-plan', {
      user_id: userId,
      new_plan_id: newPlanId
    });
  }

  // Top-up
  async topUp(userId, addonIds) {
    return this.post('/topup', {
      user_id: userId,
      addon_ids: addonIds
    });
  }

  // Alerts
  async getAlerts(id) {
    return this.get(`/alerts/${id}`);
  }

  // WebSocket connection for real-time alerts
  connectToAlerts(userId, onMessage) {
    const ws = new WebSocket(`ws://localhost:3001/ws/alerts?user_id=${userId}`);
    
    ws.onopen = () => {
      console.log('WebSocket connected for alerts');
    };

    ws.onmessage = (event) => {
      const alert = JSON.parse(event.data);
      onMessage(alert);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return ws;
  }
}

export default ApiService;
