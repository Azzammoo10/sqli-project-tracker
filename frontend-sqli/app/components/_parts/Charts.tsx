export function TrendLine({ data }:{ data:Array<{label:string; value:number}> }) {
    if (!data?.length) return <div className="h-40 grid place-items-center text-gray-500 text-sm">Aucune donnée</div>;
    const h=160, w=560, pad=24;
    const xs = data.map((_, i)=>i);
    const ys = data.map(d=>d.value);
    const min=Math.min(...ys), max=Math.max(...ys);
    const X=(i:number)=> pad + (i*(w-pad*2))/Math.max(1, xs.length-1);
    const Y=(v:number)=> h-pad-((v-min)*(h-pad*2))/Math.max(1, (max-min)||1);
    const path = xs.map((i, idx)=>`${idx?'L':'M'} ${X(i)} ${Y(ys[i])}`).join(' ');

    return (
        <div className="w-full overflow-x-auto">
            <svg width={w} height={h} className="min-w-full">
                <defs>
                    <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#4B2A7B" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#4B2A7B" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <line x1={pad} y1={h-pad} x2={w-pad} y2={h-pad} stroke="#e5e7eb" />
                <path d={`${path} L ${w-pad} ${h-pad} L ${pad} ${h-pad} Z`} fill="url(#area)"/>
                <path d={path} fill="none" stroke="#4B2A7B" strokeWidth={2}/>
                {xs.map((i)=> <circle key={i} cx={X(i)} cy={Y(ys[i])} r={3} fill="#4B2A7B" />)}
                {xs.map((i)=> (
                    <text key={`lbl-${i}`} x={X(i)} y={h-6} fontSize="10" textAnchor="middle" className="fill-gray-500">{data[i].label}</text>
                ))}
            </svg>
        </div>
    );
}

export function StatusBars({ data }:{ data:Record<string, number> }) {
    const entries = Object.entries(data);
    const max = Math.max(1, ...entries.map(([,v])=>Number(v||0)));
    return (
        <div className="grid grid-cols-12 gap-2 items-end h-40">
            {entries.map(([label, value])=>{
                const height = `${(Number(value)/max)*100}%`;
                return (
                    <div key={label} className="col-span-3 sm:col-span-2 lg:col-span-1 flex flex-col items-center gap-1">
                        <div className="w-full bg-indigo-100 rounded relative" style={{height}}>
                            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-gray-700">{value}</span>
                        </div>
                        <span className="text-[10px] text-gray-600 text-center truncate w-full">{label}</span>
                    </div>
                );
            })}
        </div>
    );
}
