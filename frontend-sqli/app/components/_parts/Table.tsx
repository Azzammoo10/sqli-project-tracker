import React from 'react';

export function Th({ children }:{ children:React.ReactNode }) {
    return <th className="px-4 py-3 font-medium">{children}</th>;
}
export function Td({ children, className = '' }:{ children:React.ReactNode; className?:string }) {
    return <td className={`px-4 py-3 text-gray-700 ${className}`}>{children}</td>;
}
