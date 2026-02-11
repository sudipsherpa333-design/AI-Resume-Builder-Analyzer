import React from "react";
import FixBulletButton from "./FixBulletButton";

const WeakBullets = ({ bullets = [], resume, onResumeUpdate }) => {
    if (!bullets || bullets.length === 0) return null;

    return (
        <div className="p-3 border rounded bg-gray-50">
            <h3 className="font-semibold">Weak Bullets</h3>
            <ul className="list-disc list-inside mt-1">
                {bullets.map((b, i) => (
                    <li key={i} className="flex justify-between items-center">
                        <span>{b}</span>
                        <FixBulletButton bullet={b} resume={resume} onResumeUpdate={onResumeUpdate} />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default WeakBullets;
