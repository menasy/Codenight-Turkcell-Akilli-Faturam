import React, { createContext, useContext, useState, useEffect } from 'react';
import ServiceFactory from '../services/ServiceFactory';

const UserContext = createContext();

// Custom hook for user data
function useUserData() {
	const [users, setUsers] = useState([]);
	const [plans, setPlans] = useState([]);
	const [currentUser, setCurrentUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	
	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				const dataService = ServiceFactory.getDataService();
				
				const [usersData, plansData] = await Promise.all([
					dataService.getUsers(),
					dataService.getPlans()
				]);
				
				setUsers(usersData);
				setPlans(plansData);
				
				// Load current user from localStorage if exists
				const savedUser = localStorage.getItem('currentUser');
				if (savedUser) {
					setCurrentUser(JSON.parse(savedUser));
				}
			} catch (err) {
				console.error("Kullanıcı verisi alınamadı:", err);
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};
		
		fetchData();
	}, []);
	
	// Helper function to get user with plan details
	const getUserWithPlan = (userId) => {
		const user = users.find(u => u.user_id === userId);
		if (!user) return null;
		
		const plan = plans.find(p => p.plan_id === user.current_plan_id);
		return { ...user, current_plan: plan };
	};
	
	// Clear user data
	const clearUser = () => {
		setCurrentUser(null);
		localStorage.removeItem('currentUser');
	};
	
	return { 
		users, 
		plans, 
		currentUser,
		setCurrentUser,
		clearUser,
		loading, 
		error,
		getUserWithPlan
	};
}

const UserProvider = ({ children }) => {
	const userData = useUserData();

	return (
		<UserContext.Provider value={userData}>
			{children}
		</UserContext.Provider>
	);
};

const useUser = () => {
	const context = useContext(UserContext);
	if (!context) {
		throw new Error('useUser must be used within a UserProvider');
	}
	return context;
};

export { useUser, UserProvider };
