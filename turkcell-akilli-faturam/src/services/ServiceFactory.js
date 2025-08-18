// Service factory - Dependency Inversion Principle
import ApiService from './ApiService';
import LocalDataService from './LocalDataService';

class ServiceFactory {
  static getDataService() {
    // Check if backend is available, otherwise use local data
    const useLocalData = process.env.REACT_APP_USE_LOCAL_DATA === 'true' || 
                         process.env.NODE_ENV === 'development';
    
    if (useLocalData) {
      console.log('Using Local Data Service');
      return new LocalDataService();
    } else {
      console.log('Using API Service');
      return new ApiService();
    }
  }
}

export { ServiceFactory };
export default ServiceFactory;
