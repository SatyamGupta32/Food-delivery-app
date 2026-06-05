import React from 'react'

const StatCard = ({ label, value, accent }) => (
    <div className={`bg-white p-5 rounded-xl shadow border-l-4 ${accent}`}>
        <p className="text-sm text-gray-500">{label}</p>
        <h2 className="text-3xl font-bold mt-2 text-gray-900">{value}</h2>
    </div>
);

export default StatCard
