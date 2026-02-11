import React from 'react';

const ResumeCard = ({ resume, onAnalyze, onEdit, onDelete }) => {
  return (
    <div style={styles.card}>
      <h3 style={styles.title}>{resume.title}</h3>
      <p style={styles.date}>
                Created: {new Date(resume.createdAt).toLocaleDateString()}
      </p>

      {resume.score && (
        <div style={styles.score}>
          <span style={styles.scoreLabel}>AI Score:</span>
          <span style={styles.scoreValue}>{resume.score}/100</span>
        </div>
      )}

      <div style={styles.actions}>
        <button
          onClick={() => onEdit(resume)}
          style={styles.btn}
        >
                    Edit
        </button>
        <button
          onClick={() => onAnalyze(resume)}
          style={{ ...styles.btn, ...styles.analyzeBtn }}
        >
                    Analyze
        </button>
        <button
          onClick={() => onDelete(resume._id)}
          style={{ ...styles.btn, ...styles.deleteBtn }}
        >
                    Delete
        </button>
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#1e293b',
  },
  date: {
    color: '#64748b',
    fontSize: '0.875rem',
    marginBottom: '12px',
  },
  score: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
  scoreLabel: {
    color: '#64748b',
    fontSize: '0.875rem',
  },
  scoreValue: {
    color: '#059669',
    fontWeight: '600',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  btn: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  analyzeBtn: {
    background: '#3b82f6',
    color: 'white',
  },
  deleteBtn: {
    background: '#ef4444',
    color: 'white',
  },
};

export default ResumeCard;