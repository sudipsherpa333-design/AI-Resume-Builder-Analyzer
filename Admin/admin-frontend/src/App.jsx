import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Login from './pages/Login'
import AdminLayout from './components/AdminLayout'
import api from './api'

export default function App() {
    const loc = useLocation()
    const navigate = useNavigate()
    const [isChecking, setIsChecking] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        const verify = async () => {
            const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
            if (!token) {
                setIsAuthenticated(false)
                setIsChecking(false)
                return
            }

            try {
                const res = await api.get('/api/auth/profile')
                const user = res.data?.data?.user
                if (user && user.role === 'admin') {
                    setIsAuthenticated(true)
                } else {
                    // Not an admin - clear token
                    localStorage.removeItem('admin_token')
                    localStorage.removeItem('admin_user')
                    setIsAuthenticated(false)
                }
            } catch (err) {
                console.warn('Admin token verification failed', err)
                localStorage.removeItem('admin_token')
                localStorage.removeItem('admin_user')
                setIsAuthenticated(false)
            } finally {
                setIsChecking(false)
            }
        }

        verify()
    }, [navigate])

    if (isChecking) {
        return (
            <AdminLayout>
                <div className="container">Checking admin session...</div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div style={{ marginBottom: 12 }} className="header container">
                <h2>AI Resume Builder — Admin</h2>
                <nav className="nav">
                    <Link to="/" className={loc.pathname === '/' ? 'active' : ''}>Dashboard</Link>
                    <Link to="/users" className={loc.pathname === '/users' ? 'active' : ''}>Users</Link>
                </nav>
            </div>

            <div className="container">
                <Routes>
                    {!isAuthenticated ? (
                        // When not logged in, show only login route and redirect others
                        <>
                            <Route path="/login" element={<Login />} />
                            <Route path="*" element={<Login />} />
                        </>
                    ) : (
                        <>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/users" element={<Users />} />
                        </>
                    )}
                </Routes>
            </div>
        </AdminLayout>
    )
}
