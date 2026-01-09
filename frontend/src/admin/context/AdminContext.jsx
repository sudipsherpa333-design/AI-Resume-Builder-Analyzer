// frontend/src/admin/context/AdminContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const AdminContext = createContext();

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};

export const AdminProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [isAdminLoading, setIsAdminLoading] = useState(true);

    // Load admin from localStorage
    useEffect(() => {
        const loadAdmin = () => {
            try {
                const savedAdmin = localStorage.getItem('admin');
                const savedToken = localStorage.getItem('adminToken');

                if (savedAdmin && savedToken) {
                    const parsedAdmin = JSON.parse(savedAdmin);
                    setAdmin(parsedAdmin);
                }
            } catch (error) {
                console.error('Error loading admin session:', error);
                localStorage.removeItem('admin');
                localStorage.removeItem('adminToken');
            } finally {
                setIsAdminLoading(false);
            }
        };

        // Small delay to prevent flash
        const timer = setTimeout(loadAdmin, 100);
        return () => clearTimeout(timer);
    }, []);

    // Admin login function
    const adminLogin = async (email, password) => {
        try {
            // For development - demo credentials
            const validCredentials = [
                { email: 'admin@resume.com', password: 'Admin123!', name: 'Super Admin' },
                { email: 'admin@example.com', password: 'admin123', name: 'Admin User' }
            ];

            const validCred = validCredentials.find(
                cred => cred.email === email && cred.password === password
            );

            if (validCred) {
                const adminData = {
                    id: `admin_${Date.now()}`,
                    email: validCred.email,
                    name: validCred.name,
                    role: 'super_admin',
                    permissions: {
                        users: { view: true, edit: true, delete: true },
                        resumes: { view: true, edit: true, delete: true },
                        analytics: { view: true },
                        settings: { view: true, edit: true },
                        templates: { view: true, edit: true },
                        system: { view: true }
                    },
                    lastLogin: new Date().toISOString(),
                    createdAt: new Date().toISOString()
                };

                const token = `admin_token_${Date.now()}_${Math.random().toString(36).substr(2)}`;

                localStorage.setItem('admin', JSON.stringify(adminData));
                localStorage.setItem('adminToken', token);

                setAdmin(adminData);

                toast.success('Admin login successful!');
                return { success: true, admin: adminData };
            } else {
                toast.error('Invalid admin credentials');
                return { success: false, error: 'Invalid email or password' };
            }
        } catch (error) {
            console.error('Admin login error:', error);
            toast.error('Login failed. Please try again.');
            return { success: false, error: error.message };
        }
    };

    // Admin logout function
    const adminLogout = () => {
        localStorage.removeItem('admin');
        localStorage.removeItem('adminToken');
        setAdmin(null);
        toast.success('Admin logged out successfully');
    };

    // Update admin profile
    const updateAdmin = (updates) => {
        if (admin) {
            const updatedAdmin = { ...admin, ...updates };
            localStorage.setItem('admin', JSON.stringify(updatedAdmin));
            setAdmin(updatedAdmin);
            toast.success('Profile updated successfully');
            return { success: true, admin: updatedAdmin };
        }
        return { success: false, error: 'No admin logged in' };
    };

    const value = {
        admin,
        isAdminLoading,
        isAdminAuthenticated: !!admin,
        adminLogin,
        adminLogout,
        updateAdmin
    };

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
};