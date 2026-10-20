import { useState, useEffect } from 'react'
import adminApi from './adminApi'

import { PieChart, Pie, Legend, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ProductSalesChart({ startDate, endDate }) {
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const pieColors = [
        "#f2c94c",
        "#dfa92b",
        "#c58b35",
        "#a87521",
        "#96734f",
        "#806044",
        "#65452d",
        "#50331f",
        "#e9d7a5"
    ]
    // console.log(data)

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {`${percent}%`}
            </text>
        );
    };
    useEffect(() => {
        let active = true
        adminApi.get('/admin/product-sales', { params: { startDate, endDate } })
            .then(({ data }) => {
                if (active) setSales(data.totalPercentage)
            })
            .catch(error => {
                if (active) setError(error.response?.data?.message || error.message || 'Unable to load product sales.')
            })
            .finally(() => {
                if (active) setLoading(false)
            })

        return () => {
            active = false
        }
    }, [startDate, endDate])

    if (loading) return <div className="text-center">Loading product sales...</div>
    if (error) return <div className="alert alert-danger">{error}</div>
    if (!sales.length) return <div className="chart-empty-state">No completed product sales in this date range.</div>

    return (
        <ResponsiveContainer width="100%" height={340}>
            <PieChart>
                {/* <Pie data={data} dataKey="percent" nameKey="name" cx="50%" cy="50%" outerRadius={50} fill="#8884d8" /> */}
                <Pie
                    dataKey="percent"
                    nameKey="name"
                    isAnimationActive={true}
                    data={sales}
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    fill="#a87521"
                    label={renderCustomizedLabel}
                    labelLine={false}
                // label
                >  {
                        sales.map((entry, index) => <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />)
                    }
                </Pie>
                <Tooltip />
                <Legend layout="vertical" verticalAlign="top" align="right" />
            </PieChart>
        </ResponsiveContainer>


    );
}