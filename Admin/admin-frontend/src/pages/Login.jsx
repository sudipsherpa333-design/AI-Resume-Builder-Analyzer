import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const base = import.meta.env.VITE_API_BASE || ''
            // send username (or email) to admin login endpoint; server will normalize
            const res = await axios.post(`${base}/api/admin/login`, { username, password })
            const payload = res.data
            // token is usually under payload.data.token
            const token = payload?.data?.token || payload?.token
            const user = payload?.data?.user || payload?.user
            if (payload.success && token) {
                localStorage.setItem('admin_token', token)
                if (user) localStorage.setItem('admin_user', JSON.stringify(user))
                navigate('/', { replace: true })
            } else {
                alert(payload.message || 'Login failed')
            }
        } catch (err) {
            console.error(err)
            const msg = err.response?.data?.message || 'Network or server error'
            alert(msg)
        } finally { setLoading(false) }
    }

    return (
        <div className="container" style={{ maxWidth: 420, marginTop: 60 }}>
            <div className="card">
                <h3 style={{ marginTop: 0 }}>Admin Login</h3>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 8 }}>
                        <label>Username or Email</label>
                        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="airesume100" style={{ width: '100%', padding: 8, marginTop: 6 }} />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <label>Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="password" style={{ width: '100%', padding: 8, marginTop: 6 }} />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn primary" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
                        <button type="button" className="btn ghost" onClick={() => { setUsername('airesume100'); setPassword('resumepro9813') }}>Fill demo</button>
                    </div>
                </form>
                <div style={{ marginTop: 12, fontSize: 13, color: '#6b7280' }}>
                    Use username <strong>airesume100</strong> and password <strong>resumepro9813</strong>
                </div>
            </div>
        </div>
    )
}
