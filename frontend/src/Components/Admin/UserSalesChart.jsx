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

const UserSalesChart = () => {
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const barColors = ["#FACC15", "#EAB308", "#1E293B"]
    useEffect(() => {
        let active = true
        adminApi.get('/admin/customer-sales')
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
    }, [])

    return (
        <ResponsiveContainer width="90%" height={600}>
            {loading ? <Loader /> : error ? <div className="alert alert-danger">{error}</div> : (<BarChart
                data={sales}
            >
                <CartesianGrid strokeDasharray="2 2" />
                <XAxis dataKey="userDetails.name" />
                <YAxis />
                <Tooltip />
                <Legend />

                <Bar dataKey="total" stroke="#000000"
                    strokeWidth={5} >
                    {
                        sales.map((item, index) => (
                            <Cell key={`cell-${index}`} fill={barColors[index % 20]} />
                        ))
                    }
                </Bar>
            </BarChart>)}
        </ResponsiveContainer>


    );
}
export default UserSalesChart