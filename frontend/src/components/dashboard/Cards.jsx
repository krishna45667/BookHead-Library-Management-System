import React from 'react'

const accentMap = {
    amber: {
        border: "border-amber-500",
        text: "text-amber-400",
    },
    emerald: {
        border: "border-emerald-500",
        text: "text-emerald-400",
    },
    violet: {
        border: "border-violet-500",
        text: "text-violet-400",
    },
};

const Cards = ({ icon, count, title, accent = "amber" }) => {
    const colors = accentMap[accent] ?? accentMap.amber;

    return (
        <div
            className={`w-full border-t-4 ${colors.border} bg-zinc-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg shadow-black/20 hover:shadow-xl hover:-translate-y-0.5 transition duration-300`}
        >
            <div className={`text-3xl ${colors.text} mb-4`}>
                {icon}
            </div>

            <h2 className="text-3xl font-bold text-zinc-50 tabular-nums">
                {count}
            </h2>

            <p className="text-zinc-400 mt-1 text-sm tracking-wide uppercase">
                {title}
            </p>
        </div>
    )
}

export default Cards
