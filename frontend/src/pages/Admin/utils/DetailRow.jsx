import React from 'react'

const DetailRow = ({ label, value, breakAll }) => (
    <p className={`text-sm text-gray-700 ${breakAll ? 'break-all' : ''}`}>
        <span className="font-semibold text-gray-900">{label}: </span>
        {value || '—'}
    </p>
);

export default DetailRow
