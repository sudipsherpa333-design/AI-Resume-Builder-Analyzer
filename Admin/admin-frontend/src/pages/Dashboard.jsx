import React, { useEffect, useState } from 'react'
import api from '../api'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

export default function Dashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/api/admin/stats')
                setStats(res.data.data)
            } catch (err) {
                console.error('Failed to fetch stats', err)
            } finally { setLoading(false) }
        }
        fetchStats()
    }, [])

    if (loading) return <div className="container">Loading...</div>

    const userGrowthLabels = (stats.userGrowth || []).map(u => `${u._id.month}/${u._id.year}`)
    const userGrowthData = (stats.userGrowth || []).map(u => u.count)

    const templateLabels = (stats.topTemplates || []).map(t => t.name)
    const templateUsage = (stats.topTemplates || []).map(t => t.usageCount)

    return (
        <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
                <div className="card"> <h4>Total users</h4> <div style={{ fontSize: 20, fontWeight: 700 }}>{stats.totalUsers}</div></div>
                <div className="card"> <h4>Total resumes</h4> <div style={{ fontSize: 20, fontWeight: 700 }}>{stats.totalResumes}</div></div>
                <div className="card"> <h4>Active templates</h4> <div style={{ fontSize: 20, fontWeight: 700 }}>{stats.activeTemplates}</div></div>
                <div className="card"> <h4>Monthly revenue</h4> <div style={{ fontSize: 20, fontWeight: 700 }}>{stats.monthlyRevenue.total} {stats.monthlyRevenue.currency}</div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>{stats.monthlyRevenue.note}</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                <div className="card">
                    <h4>User growth (last 12 months)</h4>
                    <Line data={{ labels: userGrowthLabels, datasets: [{ label: 'New users', data: userGrowthData, borderColor: '#4F46E5', backgroundColor: 'rgba(79,70,229,0.1)' }] }} />
                </div>

                <div className="card">
                    <h4>Top templates</h4>
                    <Bar data={{ labels: templateLabels, datasets: [{ label: 'Usage', data: templateUsage, backgroundColor: '#60A5FA' }] }} />
                </div>
            </div>

        </div>
    )
}
