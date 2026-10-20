import { useState, useEffect } from 'react'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import adminApi from './adminApi'

export default function MonthlySalesChart({ startDate, endDate }) {
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let active = true
        adminApi.get('/admin/sales-per-month', { params: { startDate, endDate } })
            .then(({ data }) => {
                if (active) setSales(data.salesPerMonth)
            })
            .catch(error => {
                if (active) setError(error.response?.data?.message || error.message || 'Unable to load monthly sales.')
            })
            .finally(() => {
                if (active) setLoading(false)
            })

        return () => {
            active = false
        }
    }, [startDate, endDate])

    if (loading) return <div className="text-center">Loading monthly sales...</div>
    if (error) return <div className="alert alert-danger">{error}</div>
    if (!sales.length) return <div className="chart-empty-state">No completed monthly sales in this date range.</div>

    return (
        <ResponsiveContainer width="100%" height={340}>
            <LineChart width={600} height={300} data={sales} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <Line type="monotone" dataKey="total" stroke="#a87521" strokeWidth={3} />
                <CartesianGrid stroke="#e5d7c1" strokeDasharray="5 5" />
                <XAxis dataKey="month" tickFormatter={value => new Date(`${value}-01T00:00:00`).toLocaleDateString('en', { month: 'short', year: '2-digit' })} />
                <YAxis />
                <Tooltip />
            </LineChart>
        </ResponsiveContainer>
    );
}