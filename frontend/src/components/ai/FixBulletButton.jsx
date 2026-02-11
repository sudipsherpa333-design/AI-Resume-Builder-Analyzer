import React, { useState } from "react";

const FixBulletButton = ({ bullet, resume, onResumeUpdate }) => {
    const [loading, setLoading] = useState(false);

    const fixBullet = async () => {
        setLoading(true);
        const res = await fetch("/api/ai/rewrite-bullet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bullet, keywords: resume.skills }),
        });
        const data = await res.json();
        // Update resume bullets
        const newExperience = resume.experience.map(exp => ({
            ...exp,
            bullets: exp.bullets.map(bul => (bul === bullet ? data.text : bul))
        }));
        onResumeUpdate({ ...resume, experience: newExperience });
        setLoading(false);
    };

    return (
        <button
            onClick={fixBullet}
            disabled={loading}
            className="ml-2 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
        >
            {loading ? "Fixing..." : "Fix"}
        </button>
    );
};

export default FixBulletButton;
