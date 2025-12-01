import React from 'react'

export default function AdminLayout({ children }) {
    const handleLogout = () => {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        // force reload to clear state and redirect to /login
        window.location.href = '/login'
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null

    return (
        <div>
            <header style={{ background: 'linear-gradient(90deg,#eef2ff,#fff)' }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 700 }}>🚀 Admin</div>
                        <div style={{ color: '#6b7280' }}>AI Resume Builder</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ color: '#6b7280' }}>Admin Panel</div>
                        {token && (
                            <button className="btn ghost" onClick={handleLogout}>Logout</button>
                        )}
                    </div>
                </div>
            </header>

            <main style={{ padding: '20px 0' }}>
                {children}
            </main>

            <footer style={{ padding: 20, textAlign: 'center', color: '#9ca3af' }}>
                © {new Date().getFullYear()} AI Resume Builder — Admin
            </footer>
        </div>
    )
}
