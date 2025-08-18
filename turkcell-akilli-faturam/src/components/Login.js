import React from 'react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useApp } from '../context/AppContext';

function Login() {
	const navigate = useNavigate();
	const { users, plans, loading, setCurrentUser, getUserWithPlan } = useUser();
	const { login } = useApp();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);

	const handleUserSelect = (user) => {
		setSelectedUser(user);
		setIsDropdownOpen(false);
		console.log("Seçilen kullanıcı:", user);
	};

	const handleLogin = async () => {
		if (selectedUser) {
			try {
				console.log("Dashboard'a yönlendiriliyor...", selectedUser);
				
				// Set user in UserContext
				setCurrentUser(selectedUser);
				
				// Set user in AppContext and localStorage
				login(selectedUser);
				
				// Navigate to dashboard
				navigate('/dashboard');
			} catch (error) {
				console.error('Login error:', error);
			}
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
				<div className="text-center">
					<div className="w-12 h-12 bg-yellow-400 rounded-full animate-bounce mx-auto mb-4"></div>
					<p className="text-white text-lg">Kullanıcı verileri yükleniyor...</p>
				</div>
			</div>
		);
	}

  return (
	<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
		{/* Background Pattern */}
		<div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-transparent to-yellow-400/10"></div>
		
		<div className="relative max-w-lg w-full">
			{/* Turkcell Logo Area */}
			<div className="text-center mb-8">
				<div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl mb-4 shadow-2xl">
					<span className="text-slate-900 font-bold text-2xl">T</span>
				</div>
				<h1 className="text-4xl font-bold text-white mb-2">
					Akıllı <span className="text-yellow-400">Faturam</span>
				</h1>
				<p className="text-slate-300">Hesabınızı seçin ve devam edin</p>
			</div>

			{/* Main Card */}
			<div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
				{/* User Selection Dropdown */}
				<div className="relative mb-8">
					<label className="block text-sm font-semibold text-slate-700 mb-3">
						Kullanıcı Hesabı Seçin
					</label>
					<button 
						onClick={() => setIsDropdownOpen(!isDropdownOpen)}
						className="w-full text-white bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 focus:ring-4 focus:outline-none focus:ring-slate-300 font-medium rounded-xl text-sm px-6 py-4 text-center inline-flex items-center justify-between shadow-lg transition-all duration-200 hover:shadow-xl"
						type="button"
					>
						<div className="flex items-center space-x-3">
							<div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
								<span className="text-slate-900 font-bold text-sm">
									{selectedUser ? selectedUser.name.charAt(0).toUpperCase() : '?'}
								</span>
							</div>
							<span className="font-medium">
								{selectedUser ? selectedUser.name : "Kullanıcı Seçin"}
							</span>
						</div>
						<svg 
							className={`w-3 h-3 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
							aria-hidden="true" 
							xmlns="http://www.w3.org/2000/svg" 
							fill="none" 
							viewBox="0 0 10 6"
						>
							<path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
						</svg>
					</button>

					{/* Dropdown Menu */}
					{isDropdownOpen && users && users.length > 0 && (
						<div className="absolute top-full left-0 right-0 z-20 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
							<ul className="py-2">
								{users.map((user) => {
									const userPlan = plans.find(p => p.plan_id === user.current_plan_id);
									return (
									<li key={user.user_id}>
										<button
											onClick={() => handleUserSelect(user)}
											className="w-full text-left px-6 py-4 hover:bg-yellow-50 hover:border-l-4 hover:border-yellow-400 transition-all duration-200 group"
										>
											<div className="flex items-center space-x-4">
												<div className="w-10 h-10 bg-gradient-to-r from-slate-800 to-slate-900 rounded-full flex items-center justify-center shadow-md">
													<span className="text-yellow-400 font-bold text-sm">
														{user.name.charAt(0).toUpperCase()}
													</span>
												</div>
												<div className="flex-1">
													<div className="font-semibold text-slate-800 group-hover:text-slate-900">
														{user.name}
													</div>
													<div className="text-sm text-slate-500 group-hover:text-slate-600">
														{userPlan?.name || 'Plan Yükleniyor...'}
													</div>
												</div>
												<div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
													{user.age} yaş
												</div>
											</div>
										</button>
									</li>
									);
								})}
							</ul>
						</div>
					)}
				</div>

				{/* Login Button */}
				<button 
					onClick={handleLogin}
					disabled={!selectedUser}
					className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
						selectedUser 
							? 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 shadow-lg hover:shadow-xl' 
							: 'bg-slate-200 text-slate-400 cursor-not-allowed'
					}`}
				>
					{selectedUser ? 'Giriş Yap' : 'Lütfen Kullanıcı Seçin'}
				</button>

				{/* Quick Access */}
				{selectedUser && (
					<div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-yellow-50 rounded-xl border border-yellow-200">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-3">
								<div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
								<span className="text-sm font-medium text-slate-700">
									{selectedUser.name} olarak devam ediliyor
								</span>
							</div>
							<span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full font-medium">
								{plans.find(p => p.plan_id === selectedUser.current_plan_id)?.name || 'Plan Yükleniyor...'}
							</span>
						</div>
					</div>
				)}
			</div>

			{/* Footer */}
			<div className="text-center mt-8">
				<p className="text-slate-400 text-sm">
					© 2025 Turkcell - Akıllı Faturam
				</p>
			</div>
		</div>
	</div>
  )
}

export default Login