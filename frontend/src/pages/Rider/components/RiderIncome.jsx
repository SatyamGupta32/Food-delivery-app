import axios from "axios";
import { useEffect, useState } from "react";
import { riderService } from "../../../config/services";
import Loading from "../../core/Loading";

const RiderIncome = () => {

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchIncome = async () => {
        try {
            const { data } = await axios.get(
                `${riderService}/api/rider/income`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            setStats({
                totalIncome: data.totalIncome ?? 0,
                totalDeliveries: data.totalDeliveries ?? 0,
                todayIncome: data.todayIncome ?? 0,
                monthlyIncome: data.monthlyIncome ?? 0,
            });
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIncome();
    }, []);

    if (loading) return <Loading />;

    if (!stats) {
        return (
            <p className="text-center text-gray-500 py-4">Could not load income data</p>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

                <div className="bg-green-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Total Income</p>
                    <h3 className="text-2xl font-bold">
                        ₹{Math.round(stats.totalIncome)}
                    </h3>
                </div>

                <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Deliveries</p>
                    <h3 className="text-2xl font-bold">
                        {stats.totalDeliveries}
                    </h3>
                </div>

                <div className="bg-yellow-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Today</p>
                    <h3 className="text-2xl font-bold">
                        ₹{Math.round(stats.todayIncome)}
                    </h3>
                </div>

                <div className="bg-purple-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500">This Month</p>
                    <h3 className="text-2xl font-bold">
                        ₹{Math.round(stats.monthlyIncome)}
                    </h3>
                </div>

            </div>
        </div>
    );
};

export default RiderIncome;
