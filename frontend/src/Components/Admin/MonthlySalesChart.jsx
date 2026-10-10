import { useState, useEffect } from 'react'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import adminApi from './adminApi'

export default function MonthlySalesChart() {
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let active = true
        adminApi.get('/admin/sales-per-month')
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
    }, [])

    if (loading) return <div className="text-center">Loading monthly sales...</div>
    if (error) return <div className="alert alert-danger">{error}</div>

    return (
        <ResponsiveContainer width="90%" height={600}>
            <LineChart width={600} height={300} data={sales} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <Line type="monotone" dataKey="total" stroke="#8884d8" />
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
            </LineChart>
        </ResponsiveContainer>
    );
}