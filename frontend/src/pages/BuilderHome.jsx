import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaUpload, FaPlus, FaSpinner } from 'react-icons/fa';

export default function BuilderHomeResponsive() {
    const navigate = useNavigate();
    const fileRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const handleFilePick = (file) => {
        if (!file) return;
        const allowed = ['pdf', 'doc', 'docx', 'txt'];
        const ext = (file.name.split('.').pop() || '').toLowerCase();
        if (!allowed.includes(ext)) {
            toast.error('Unsupported file type. Use PDF, DOC, DOCX or TXT.');
            return;
        }

        setIsUploading(true);
        const id = toast.loading('Importing resume...');

        setTimeout(() => {
            const parsed = {
                personal: {
                    firstName: 'Prabesh',
                    lastName: 'Joshi',
                    email: 'prabeshjoshi999@gmail.com',
                    phone: '980123456',
                },
                summary: 'Experienced software developer with 5+ years in web development.',
                experience: [{ id: Date.now(), position: 'Senior Software Engineer', company: 'Tech Solutions Inc.' }],
                education: [{ id: Date.now(), degree: 'B.Sc. Computer Science', institution: 'Tribhuvan University' }],
                skills: ['React', 'Node.js'],
            };

            try { sessionStorage.setItem('importedResumeData', JSON.stringify(parsed)); } catch (e) { }
            toast.success('Resume imported', { id });
            setIsUploading(false);
            navigate('/builder', { state: { source: 'import', importedData: parsed } });
        }, 1200);
    };

    const onFileChange = (e) => {
        const f = e.target.files?.[0];
        if (f) handleFilePick(f);
    };

    const onDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer?.files?.[0];
        if (f) handleFilePick(f);
    };

    const onDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const onDragLeave = () => setDragOver(false);

    const startFromScratch = () => {
        try { sessionStorage.removeItem('importedResumeData'); } catch (e) { }
        navigate('/builder', { state: { source: 'scratch' } });
    };

    return (
        <div className="home-root">
            <div className="home-bg" />
            <div className="home-content">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, type: 'spring' }}
                    className="home-header"
                >
                    <h1>Create your resume</h1>
                    <p>Import your resume or start fresh — it's fast and mobile-friendly.</p>
                </motion.div>

                <div className="home-maincards">
                    {/* Import Resume Card */}
                    <motion.div
                        whileHover={{ y: -5, boxShadow: '0 8px 32px rgba(59,130,246,0.11)' }}
                        className={`home-card ${dragOver ? 'drag' : ''}`}
                        tabIndex={0}
                        style={{}}
                    >
                        <div>
                            <div className="home-card-header">
                                <div className="home-card-icon import"><FaUpload /></div>
                                <div>
                                    <h2>Import Resume</h2>
                                    <div className="sub">Upload a resume and auto-extract data.</div>
                                </div>
                            </div>
                            <div
                                className={`home-dropzone ${dragOver ? 'active' : ''}`}
                                onDrop={onDrop}
                                onDragOver={onDragOver}
                                onDragLeave={onDragLeave}
                                onClick={() => fileRef.current?.click()}
                                role="button"
                                tabIndex={0}
                                onKeyDown={e => { if (e.key === 'Enter') fileRef.current?.click(); }}
                            >
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept=".pdf,.doc,.docx,.txt"
                                    onChange={onFileChange}
                                    style={{ display: 'none' }}
                                />
                                {isUploading
                                    ? (
                                        <div className="home-uploading">
                                            <FaSpinner className="spin" />
                                            <div className="bold">Analyzing resume...</div>
                                        </div>
                                    ) : (
                                        <>
                                            <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                                                <FaUpload className="home-dropicon" />
                                            </motion.div>
                                            <div className="home-droptitle">Drop file or click to upload</div>
                                            <div className="home-dropsubtitle">PDF, DOCX, TXT</div>
                                        </>
                                    )
                                }
                            </div>
                        </div>
                        <div className="home-cardfooter">
                            <small>Files are processed locally in demo mode.</small>
                        </div>
                    </motion.div>

                    {/* Start from Scratch Card */}
                    <motion.div
                        whileHover={{ y: -5, boxShadow: '0 8px 32px rgba(16,185,129,0.11)' }}
                        className="home-card"
                        tabIndex={0}
                        style={{}}
                    >
                        <div>
                            <div className="home-card-header">
                                <div className="home-card-icon scratch"><FaPlus /></div>
                                <div>
                                    <h2>Start Fresh</h2>
                                    <div className="sub">Use our guided step-by-step builder.</div>
                                </div>
                            </div>
                            <div className="home-features">
                                <ul>
                                    <li>ATS-friendly templates</li>
                                    <li>Smart content suggestions</li>
                                    <li>Instant PDF download</li>
                                </ul>
                            </div>
                        </div>
                        <button className="home-actionbtn" onClick={startFromScratch}>
                            Create From Scratch
                        </button>
                    </motion.div>
                </div>

                {/* Features/Stats Row */}
                <div className="home-feats">
                    {['ATS Optimized', 'Fast & Free', 'Professional'].map((text, i) => (
                        <div key={i} className="feat-card">
                            <div className="feat-title">{text}</div>
                        </div>
                    ))}
                </div>
            </div>
            <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .home-root {
          min-height: 100vh;
          background: #f8fafc;
          padding: 0 8px 32px 8px;
          font-family: 'Inter', sans-serif;
          position: relative;
        }
        .home-bg {
          position: absolute; inset: 0;
          background: repeating-linear-gradient(180deg,#f1f5f9 0 1px,transparent 1px 24px);
          opacity: 0.87; z-index: 0;
        }
        .home-content {
          position: relative;
          max-width: 940px;
          margin: 0 auto;
          z-index: 1;
          padding-top: 48px;
        }
        .home-header {
          text-align: center;
          margin-bottom: 36px;
        }
        .home-header h1 {
          font-size: 2.2rem;
          color: #1e293b;
          margin-bottom: 10px;
        }
        .home-header p {
          color: #64748b;
          font-size: 1.06rem;
        }
        .home-maincards {
          display: flex;
          gap: 32px;
          justify-content: center;
          align-items: stretch;
          flex-wrap: wrap;
          margin-bottom: 32px;
        }
        .home-card {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 4px 28px rgba(2,6,23,0.07);
          min-width: 280px;
          max-width: 370px;
          flex: 1 1 320px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 1.9rem 1.4rem 1.45rem 1.4rem;
          border: 1.5px solid #eef1f4;
          transition: box-shadow .22s, transform .22s;
        }
        .home-card.drag, .home-dropzone.active {
          border-color: #3b82f6 !important;
          box-shadow: 0 6px 28px rgba(59,130,246,0.13);
        }
        .home-card-header {
          display: flex;
          gap: 13px;
          align-items: center;
          margin-bottom: 10px;
        }
        .home-card-icon {
          width: 45px; height: 45px;
          border-radius: 10px;
          background: #3b82f6;
          color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
        }
        .home-card-icon.scratch { background: #10b981; }
        .sub { color: #64748b; font-size: 0.97em;}
        .home-dropzone {
          margin-top: 16px;
          border: 2px dashed #e2e8f0;
          border-radius: 10px;
          padding: 24px;
          text-align: center;
          background: #f9fafb;
          cursor: pointer;
          transition: border-color 0.18s, background 0.18s;
        }
        .home-dropzone.active { border-color: #3b82f6; background: #e0e7ff; }
        .home-dropicon { font-size: 34px; color: #94a3b8; margin-bottom: 10px; }
        .home-droptitle { font-weight: 700; color: #1e293b;}
        .home-dropsubtitle { font-size: 0.88rem; color: #94a3b8; margin-bottom: 2px;}
        .home-uploading { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 12px 0;}
        .home-cardfooter { margin-top: 12px; text-align: right; color: #64748b; font-size: 0.91em;}
        .home-features ul {list-style:none; margin:20px 0 0 0; padding:0;}
        .home-features li { color: #475569; font-size: 1.03rem; padding: 4px 0 4px 0; position:relative; padding-left:1.12em;}
        .home-features li:before {content:"✓"; font-size:1em; color:#10b981; font-weight:bold;position: absolute; left:0;}
        .home-actionbtn {
          margin-top: 20px;
          width: 100%;
          padding: 12px 0;
          border-radius: 10px;
          border: none;
          background: linear-gradient(90deg,#10b981,#06b6d4);
          color: #fff;
          font-weight: 800;
          font-size: 1.05em;
          box-shadow: 0 1.5px 6px rgba(16,185,129,0.10);
          cursor: pointer;
          transition: background .18s, filter .16s;
        }
        .home-actionbtn:hover { filter: brightness(1.09);}
        .home-feats {
          display: flex;
          gap: 18px;
          justify-content: center;
          margin-top: 28px;
          flex-wrap: wrap;
        }
        .feat-card {
          flex: 1 1 150px;
          background: #fff;
          border-radius: 10px;
          padding: 15px 0;
          text-align: center;
          font-size: 1.02em;
          font-weight: 700;
          color: #475569;
          border: 1px solid #eef1f4;
          box-shadow: 0 2px 9px rgba(80,170,247,0.07);
        }
        @media (max-width: 900px) {
          .home-maincards { flex-direction: column; gap: 24px;}
          .home-card {max-width:100%;}
        }
        @media (max-width: 600px) {
          .home-header h1{ font-size:1.37rem;}
          .home-maincards{gap:16px;}
          .home-content{padding-top:18px;}
          .feat-card {font-size: 1em; padding:10px 0;}
        }
      `}</style>
        </div>
    );
}