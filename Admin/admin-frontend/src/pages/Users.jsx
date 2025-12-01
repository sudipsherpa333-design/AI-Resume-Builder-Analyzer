import React, { useEffect, useState } from 'react'
import api from '../api'

export default function Users() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')

    useEffect(() => { fetchUsers() }, [page, search])

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const res = await api.get('/api/admin/users', { params: { page, search } })
            setUsers(res.data.data.users || [])
        } catch (err) {
            console.error('Failed to load users', err)
        } finally { setLoading(false) }
    }

    const toggleSuspend = async (id, user) => {
        try {
            const action = user.isSuspended ? 'activate' : 'suspend'
            await api.put(`/api/admin/users/${id}/status`, { action })
            fetchUsers()
        } catch (err) { console.error(err) }
    }

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3>Users</h3>
                <div>
                    <input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            <div className="card">
                {loading ? <div>Loading...</div> : (
                    <table className="table">
                        <thead>
                            <tr><th>Name</th><th>Email</th><th>Role</th><th>Created</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u._id}>
                                    <td>{u.name}</td>
                                    <td>{u.email}</td>
                                    <td>{u.role}</td>
                                    <td>{new Date(u.createdAt).toLocaleString()}</td>
                                    <td>
                                        <button className="btn ghost" onClick={() => toggleSuspend(u._id, u)}>{u.isSuspended ? 'Activate' : 'Suspend'}</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
