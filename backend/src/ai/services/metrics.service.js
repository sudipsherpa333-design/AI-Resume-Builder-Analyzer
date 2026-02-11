export const detectMetrics = (experience = []) => {
    let count = 0;
    const regex = /\d+%|\d+x|\d+\+/;

    experience.forEach(job =>
        job.bullets?.forEach(b => {
            if (regex.test(b)) count++;
        })
    );

    return { count };
};
