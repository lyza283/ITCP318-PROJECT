import { useState, useEffect } from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from "recharts";
import adminApi from './adminApi'
import Loader from '../Layout/Loader';

const UserSalesChart = ({ startDate, endDate }) => {
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const barColors = ["#f2c94c", "#dfa92b", "#65452d", "#96734f"]
    useEffect(() => {
        let active = true
        adminApi.get('/admin/customer-sales', { params: { startDate, endDate } })
            .then(({ data }) => {
                if (active) setSales(data.customerSales)
            })
            .catch(error => {
                if (active) setError(error.response?.data?.message || error.message || 'Unable to load customer sales.')
            })
            .finally(() => {
                if (active) setLoading(false)
            })

        return () => {
            active = false
        }
    }, [startDate, endDate])

    return (
        <ResponsiveContainer width="100%" height={340}>
            {loading ? <Loader /> : error ? <div className="alert alert-danger">{error}</div> : !sales.length ? <div className="chart-empty-state">No completed customer sales in this date range.</div> : (<BarChart
                data={sales}
            >
                <CartesianGrid strokeDasharray="2 2" />
                <XAxis dataKey="userDetails.name" />
                <YAxis />
                <Tooltip />
                <Legend />

                <Bar dataKey="total" stroke="#402a1b"
                    strokeWidth={2} >
                    {
                        sales.map((item, index) => (
                            <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                        ))
                    }
                </Bar>
            </BarChart>)}
        </ResponsiveContainer>


    );
}
export default UserSalesChart