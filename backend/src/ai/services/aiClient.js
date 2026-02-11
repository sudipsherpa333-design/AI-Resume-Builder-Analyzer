export const aiClient = async (prompt) => {
    const r = await fetch(process.env.AI_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.AI_KEY}`
        },
        body: JSON.stringify({
            prompt,
            model: process.env.AI_MODEL
        })
    });

    if (!r.ok) throw new Error("AI API error");

    const d = await r.json();
    return d.output || d.text || JSON.stringify(d);
};
