import React from "react";
import { Link, useLocation } from "react-router";
import { cn, getFirstWord } from "~/lib/utils";

type ProjectCardProps = {
    id: number | string;
    name: string;
    client: string;
    imageUrl: string;
    tags?: string[];
    status?: string;
};

const statusColors: Record<string, string> = {
    en_attente: "!bg-[#FEF3C7] !text-amber-700",
    en_cours: "!bg-[#DCFCE7] !text-green-700",
    termine: "!bg-[#DBEAFE] !text-blue-700",
    bloque: "!bg-[#FEE2E2] !text-red-700",
};

const ProjectCard = ({ id, name, client, imageUrl, tags = [], status }: ProjectCardProps) => {
    const path = useLocation();
    const normalize = (s = "") =>
        s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

    return (
        <Link
            to={path.pathname === "/" || path.pathname.startsWith("/project") ? `/project/${id}` : `/project/${id}`}
            className="trip-card"
        >
            <img src={imageUrl} alt={name} />

            <article>
                <h2>{name}</h2>
                <figure>
                    <img src="/assets/icons/user-check.svg" alt="" className="size-4" aria-hidden />
                    <figcaption>Client: {client}</figcaption>
                </figure>
            </article>

            {/* Chips sans Syncfusion */}
            {tags.length > 0 && (
                <div className="mt-5 pl-[18px] pr-3.5 pb-5">
                    <ul role="list" className="flex flex-wrap gap-2">
                        {tags.map((tag, i) => (
                            <li key={`${id}-${i}`}>
                <span
                    className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                        i === 1 ? "bg-pink-50 text-pink-600" : "bg-green-50 text-green-700",
                        "ring-1 ring-inset",
                        i === 1 ? "ring-pink-200" : "ring-green-200"
                    )}
                >
                  {getFirstWord(tag)}
                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {status && (
                <article
                    className={cn(
                        "tripCard-pill",
                        statusColors[normalize(status)] || "!bg-gray-100 !text-gray-700"
                    )}
                >
                    {status.toUpperCase().replace("_", " ")}
                </article>
            )}
        </Link>
    );
};

export default ProjectCard;
