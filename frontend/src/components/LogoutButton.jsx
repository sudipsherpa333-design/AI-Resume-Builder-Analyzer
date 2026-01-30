// src/components/LogoutButton.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

const LogoutButton = ({ className = '' }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <button
            onClick={handleLogout}
            className={`flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors ${className}`}
        >
            <LogOut size={18} />
            Logout
        </button>
    );
};

export default LogoutButton;