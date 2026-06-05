import React from 'react'


const SectionBlock = ({ title, emptyText, items, renderCard }) => (
    <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        {items.length === 0 ? (
            <p className="text-center text-gray-500 py-8 bg-white rounded-xl border border-dashed border-gray-200">
                {emptyText}
            </p>
        ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {items.map((item) => renderCard(item))}
            </div>
        )}
    </div>
);

export default SectionBlock
