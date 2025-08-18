export function SkeletonCard() {
    return (
        <div className="bg-white rounded-xl shadow-sm p-4 border animate-pulse">
            <div className="flex items-center justify-between mb-2">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-4 w-4 bg-gray-200 rounded" />
            </div>
            <div className="h-7 w-20 bg-gray-200 rounded" />
        </div>
    );
}

export function ProjectGridSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl border bg-white p-4 animate-pulse">
                    <div className="h-5 w-32 bg-gray-200 rounded mb-3" />
                    <div className="h-6 w-40 bg-gray-200 rounded mb-2" />
                    <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
                    <div className="flex gap-2">
                        <div className="h-5 w-16 bg-gray-200 rounded-full" />
                        <div className="h-5 w-20 bg-gray-200 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function ListSkeleton({ rows = 6 }:{ rows?:number }) {
    return (
        <ul className="space-y-3 animate-pulse">
            {Array.from({ length: rows }).map((_, i) => (
                <li key={i} className="flex items-center justify-between">
                    <div>
                        <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
                        <div className="h-3 w-24 bg-gray-200 rounded" />
                    </div>
                    <div className="h-3 w-44 bg-gray-200 rounded" />
                </li>
            ))}
        </ul>
    );
}

export function TableSkeleton() {
    return (
        <div className="border rounded-lg overflow-hidden animate-pulse">
            <div className="h-9 bg-gray-100" />
            <div className="space-y-2 p-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-7 bg-gray-100 rounded" />
                ))}
            </div>
        </div>
    );
}
