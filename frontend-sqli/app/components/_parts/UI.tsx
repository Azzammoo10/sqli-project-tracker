import React from 'react';

export function Card({ title, actionLabel, onAction, children }:{
    title:string; actionLabel?:string; onAction?:()=>void; children:React.ReactNode;
}) {
    return (
        <section className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                {actionLabel && onAction && (
                    <button onClick={onAction} className="text-sm text-[#4B2A7B] hover:underline">
                        {actionLabel}
                    </button>
                )}
            </div>
            {children}
        </section>
    );
}

export function KpiCard({ title, value, icon }:{
    title:string; value:string|number; icon:React.ReactNode;
}) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-4 border hover:shadow transition">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">{title}</span>
                {icon}
            </div>
            <div className="text-3xl font-semibold text-gray-900">{value}</div>
        </div>
    );
}

export function Progress({ value }:{ value:string }) {
    return (
        <div className="w-44" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-label={`Progression ${value}`}>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="h-2 rounded-full bg-[#4B2A7B]" style={{ width:value }} />
            </div>
            <div className="text-xs text-right text-gray-600 mt-1">{value}</div>
        </div>
    );
}

export function StatusChip({ label, compact=false }:{ label:string; compact?:boolean }) {
    const map: Record<string,string> = {
        'EN_COURS':'bg-indigo-50 text-indigo-700',
        'ACTIF':'bg-indigo-50 text-indigo-700',
        'TERMINE':'bg-emerald-50 text-emerald-700',
        'EN_RETARD':'bg-rose-50 text-rose-700',
        '—':'bg-gray-50 text-gray-500',
    };
    const key = map[label] ? label : '—';
    return (
        <span className={`inline-flex items-center ${compact ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'} rounded-full font-medium ${map[key]}`}>
      {label}
    </span>
    );
}

export function TypeChip({ label }:{ label:string }) {
    const map: Record<string,string> = {
        'Delivery':'bg-indigo-50 text-indigo-700',
        'TMA':'bg-blue-50 text-blue-700',
        'Interne':'bg-gray-100 text-gray-900',
        '—':'bg-gray-50 text-gray-500',
    };
    const key = map[label] ? label : '—';
    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${map[key]}`}>{key}</span>;
}

export function EmptyState({ title, description, actionLabel, onAction }:{
    title:string; description:string; actionLabel?:string; onAction?:()=>void;
}) {
    return (
        <div className="rounded-xl border border-dashed py-10 grid place-items-center text-center">
            <h4 className="font-medium text-gray-900">{title}</h4>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
            {actionLabel && onAction && (
                <button onClick={onAction} className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#4B2A7B] text-white hover:bg-[#5B3A8B] text-sm">
                    {actionLabel}
                </button>
            )}
        </div>
    );
}

export function EmptySimple({ text }:{ text:string }) {
    return <div className="h-32 grid place-items-center text-gray-500 text-sm border rounded-lg bg-gray-50/50">{text}</div>;
}
