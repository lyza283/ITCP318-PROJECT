import { useState, useEffect } from 'react'
import adminApi from './adminApi'

import { PieChart, Pie, Legend, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ProductSalesChart() {
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const pieColors = [
        "#FF6633",
        "#FFB399",
        "#FF33FF",
        "#FFFF99",
        "#00B3E6",
        "#E6B333",
        "#3366E6",
        "#999966",
        "#809980",
        "#E6FF80",
        "#1AFF33",
        "#999933",
        "#FF3380",
        "#CCCC00",
        "#66E64D",
        "#4D80CC",
        "#FF4D4D",
        "#99E6E6",
        "#6666FF"
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
        adminApi.get('/admin/product-sales')
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
    }, [])

    if (loading) return <div className="text-center">Loading product sales...</div>
    if (error) return <div className="alert alert-danger">{error}</div>

    return (
        <ResponsiveContainer width="90%" height={1000}>
            <PieChart width={1000} height={1000}>
                {/* <Pie data={data} dataKey="percent" nameKey="name" cx="50%" cy="50%" outerRadius={50} fill="#8884d8" /> */}
                <Pie
                    dataKey="percent"
                    nameKey="name"
                    isAnimationActive={true}
                    data={sales}
                    cx="50%"
                    cy="50%"
                    outerRadius={300}
                    fill="#8884d8"
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