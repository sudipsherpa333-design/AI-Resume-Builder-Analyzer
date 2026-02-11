import React from 'react';

const QuestionCard = ({ question, answer, onAnswerChange }) => {
  return (
    <div style={styles.card}>
      <h3 style={styles.question}>{question}</h3>
      <textarea
        value={answer}
        onChange={(e) => onAnswerChange(e.target.value)}
        placeholder="Type your answer here..."
        style={styles.textarea}
        rows={4}
      />
    </div>
  );
};

const styles = {
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    marginBottom: '1rem',
  },
  question: {
    fontSize: '1.125rem',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#1e293b',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '16px',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
};

export default QuestionCard;