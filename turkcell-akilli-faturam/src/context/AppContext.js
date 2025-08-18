import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

// Application state management
function useAppState() {
	const [currentUser, setCurrentUser] = useState(null);
	const [alerts, setAlerts] = useState([]);
	const [notifications, setNotifications] = useState([]);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	
	// Check if user is logged in on mount
	useEffect(() => {
		const savedUser = localStorage.getItem('currentUser');
		if (savedUser) {
			setCurrentUser(JSON.parse(savedUser));
			setIsLoggedIn(true);
		}
	}, []);
	
	const login = (user) => {
		setCurrentUser(user);
		setIsLoggedIn(true);
		localStorage.setItem('currentUser', JSON.stringify(user));
	};
	
	const logout = () => {
		setCurrentUser(null);
		setIsLoggedIn(false);
		setAlerts([]);
		setNotifications([]);
		localStorage.removeItem('currentUser');
	};
	
	const addAlert = (alert) => {
		setAlerts(prev => [alert, ...prev]);
	};
	
	const removeAlert = (alertId) => {
		setAlerts(prev => prev.filter(alert => alert.id !== alertId));
	};
	
	const markAlertAsRead = (alertId) => {
		setAlerts(prev => prev.map(alert => 
			alert.id === alertId ? { ...alert, read: true } : alert
		));
	};
	
	return {
		currentUser,
		isLoggedIn,
		alerts,
		notifications,
		login,
		logout,
		addAlert,
		removeAlert,
		markAlertAsRead
	};
}

const AppProvider = ({ children }) => {
	const appState = useAppState();
	
	return (
		<AppContext.Provider value={appState}>
			{children}
		</AppContext.Provider>
	);
};

const useApp = () => {
	const context = useContext(AppContext);
	if (!context) {
		throw new Error('useApp must be used within an AppProvider');
	}
	return context;
};

export { useApp, AppProvider };
