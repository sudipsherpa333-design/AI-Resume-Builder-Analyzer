import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import re

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

def calculate_resume_score(resume_data, resume_text):
    """
    Calculate overall resume score based on multiple factors
    """
    scores = []
    
    # 1. Content Completeness Score (30%)
    completeness_score = calculate_completeness_score(resume_data)
    scores.append(completeness_score * 0.3)
    
    # 2. Keyword Relevance Score (25%)
    keyword_score = calculate_keyword_score(resume_text, resume_data.get('job_title', ''))
    scores.append(keyword_score * 0.25)
    
    # 3. Experience Quality Score (20%)
    experience_score = calculate_experience_score(resume_data.get('experience', []))
    scores.append(experience_score * 0.2)
    
    # 4. Education Score (15%)
    education_score = calculate_education_score(resume_data.get('education', []))
    scores.append(education_score * 0.15)
    
    # 5. Skills Score (10%)
    skills_score = calculate_skills_score(resume_data.get('skills', []))
    scores.append(skills_score * 0.1)
    
    return min(int(sum(scores)), 100)

def calculate_completeness_score(resume_data):
    """Calculate score based on resume completeness"""
    sections = [
        'personalInfo', 'professionalSummary', 'experience', 
        'education', 'skills'
    ]
    
    completed_sections = 0
    for section in sections:
        if section == 'personalInfo':
            if resume_data.get(section, {}).get('firstName') and resume_data.get(section, {}).get('email'):
                completed_sections += 1
        elif section == 'professionalSummary':
            if resume_data.get(section):
                completed_sections += 1
        else:
            if resume_data.get(section) and len(resume_data[section]) > 0:
                completed_sections += 1
    
    return (completed_sections / len(sections)) * 100

def calculate_keyword_score(resume_text, job_title):
    """Calculate score based on keyword relevance to job title"""
    if not job_title or not resume_text:
        return 50
    
    # Industry-specific keywords based on job title
    industry_keywords = get_industry_keywords(job_title)
    
    # Count matching keywords
    text_lower = resume_text.lower()
    matches = sum(1 for keyword in industry_keywords if keyword in text_lower)
    
    return min((matches / len(industry_keywords)) * 100, 100)

def get_industry_keywords(job_title):
    """Get relevant keywords based on job title"""
    job_title_lower = job_title.lower()
    
    # Software Engineering keywords
    if any(word in job_title_lower for word in ['software', 'developer', 'engineer', 'programmer']):
        return [
            'python', 'javascript', 'java', 'react', 'node', 'sql', 'database',
            'api', 'git', 'docker', 'aws', 'backend', 'frontend', 'fullstack',
            'agile', 'scrum', 'ci/cd', 'testing', 'debugging'
        ]
    
    # Data Science keywords
    elif any(word in job_title_lower for word in ['data', 'analyst', 'scientist', 'machine learning']):
        return [
            'python', 'r', 'sql', 'pandas', 'numpy', 'machine learning',
            'statistics', 'data analysis', 'visualization', 'tableau',
            'power bi', 'big data', 'hadoop', 'spark', 'deep learning'
        ]
    
    # Default general keywords
    return [
        'management', 'leadership', 'communication', 'teamwork',
        'problem solving', 'project', 'analysis', 'strategy',
        'planning', 'coordination', 'development', 'implementation'
    ]

def calculate_experience_score(experience):
    """Calculate score based on experience quality"""
    if not experience:
        return 0
    
    score = 0
    for exp in experience:
        # Score based on job duration (assuming months)
        duration_score = min(len(exp.get('description', '')) / 10, 10)
        # Score based on description length
        desc_score = min(len(exp.get('description', '')) / 50, 10)
        score += duration_score + desc_score
    
    return min(score, 100)

def calculate_education_score(education):
    """Calculate score based on education"""
    if not education:
        return 0
    
    score = len(education) * 20  # 20 points per education entry
    return min(score, 100)

def calculate_skills_score(skills):
    """Calculate score based on skills"""
    if not skills:
        return 0
    
    # More skills = better, but with diminishing returns
    base_score = min(len(skills) * 10, 60)
    
    # Bonus for skill levels
    level_bonus = 0
    for skill in skills:
        if skill.get('level') in ['advanced', 'expert']:
            level_bonus += 5
    
    return min(base_score + level_bonus, 100)