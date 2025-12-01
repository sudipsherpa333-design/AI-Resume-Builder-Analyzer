import React, { useState } from "react";

const QuestionForm = () => {
    const [step, setStep] = useState(1);

    const nextStep = () => setStep((prev) => prev + 1);

    return (
        <div className="question-form">
            <h1>Build Your Career Profile</h1>

            {step === 1 && (
                <div>
                    <h2>1. What's your professional level?</h2>
                    <label><input type="checkbox" /> Student/Fresh Graduate</label><br />
                    <label><input type="checkbox" /> Entry Level (0–2 years)</label><br />
                    <label><input type="checkbox" /> Mid-Level (3–7 years)</label><br />
                    <label><input type="checkbox" /> Senior Professional (8+ years)</label><br />
                    <button onClick={nextStep}>Next</button>
                </div>
            )}

            {step === 2 && (
                <div>
                    <h2>2. Which department/field are you in?</h2>
                    <label><input type="checkbox" /> Engineering/IT</label><br />
                    <label><input type="checkbox" /> Business/Management</label><br />
                    <label><input type="checkbox" /> Design/Creative</label><br />
                    <label><input type="checkbox" /> Other</label><br />
                    <button onClick={nextStep}>Next</button>
                </div>
            )}

            {step === 3 && (
                <div>
                    <h2>3. What's your career objective?</h2>
                    <label><input type="checkbox" /> Internship</label><br />
                    <label><input type="checkbox" /> Entry-level job</label><br />
                    <label><input type="checkbox" /> Career growth</label><br />
                    <label><input type="checkbox" /> Freelance</label><br />
                    <button onClick={() => alert("Form submitted!")}>Submit</button>
                </div>
            )}
        </div>
    );
};

export default QuestionForm;
