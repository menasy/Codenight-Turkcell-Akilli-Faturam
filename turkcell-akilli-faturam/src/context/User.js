import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Custom hook - ismi "use" ile başlamalı
function useUserData() {
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(true);
	
	useEffect(() => {
		const fetchUsers = async () => {
			try {
				// Public klasöründeki JSON dosyasından veri çek
				const response = await axios.get('/data/users.json');
				setData(response.data);
			} catch (e) {
				console.error("Kullanıcı verisi alınamadı:", e);
				setData([]);
			} finally {
				setLoading(false);
			}
		};
		
		fetchUsers();
	}, []);
	
	return { users: data, loading };
}

const UserContext = createContext();

const UserProvider = ({ children }) => {
	const userData = useUserData(); // Custom hook kullanımı

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