import re
import nltk
from nltk.tokenize import sent_tokenize

def extract_text_from_resume(resume_data):
    """
    Extract and combine text from resume data structure
    """
    text_parts = []
    
    # Personal Information
    personal_info = resume_data.get('personalInfo', {})
    if personal_info:
        text_parts.append(f"{personal_info.get('firstName', '')} {personal_info.get('lastName', '')}")
        text_parts.append(personal_info.get('jobTitle', ''))
        text_parts.append(personal_info.get('summary', ''))
    
    # Professional Summary
    professional_summary = resume_data.get('professionalSummary', '')
    if professional_summary:
        text_parts.append(professional_summary)
    
    # Experience
    experiences = resume_data.get('experience', [])
    for exp in experiences:
        text_parts.append(exp.get('position', ''))
        text_parts.append(exp.get('company', ''))
        text_parts.append(exp.get('description', ''))
    
    # Education
    education = resume_data.get('education', [])
    for edu in education:
        text_parts.append(edu.get('degree', ''))
        text_parts.append(edu.get('institution', ''))
        text_parts.append(edu.get('field', ''))
        text_parts.append(edu.get('description', ''))
    
    # Skills
    skills = resume_data.get('skills', [])
    for skill in skills:
        text_parts.append(skill.get('name', ''))
    
    # Projects
    projects = resume_data.get('projects', [])
    for project in projects:
        text_parts.append(project.get('name', ''))
        text_parts.append(project.get('description', ''))
        text_parts.append(project.get('technologies', ''))
    
    # Certifications
    certifications = resume_data.get('certifications', [])
    for cert in certifications:
        text_parts.append(cert.get('name', ''))
        text_parts.append(cert.get('issuer', ''))
        text_parts.append(cert.get('description', ''))
    
    # Combine all text parts and clean
    combined_text = ' '.join([str(part) for part in text_parts if part])
    cleaned_text = clean_text(combined_text)
    
    return cleaned_text

def clean_text(text):
    """
    Clean and normalize text
    """
    if not text:
        return ""
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove special characters but keep basic punctuation
    text = re.sub(r'[^\w\s.,!?;:]', ' ', text)
    
    # Remove multiple spaces
    text = re.sub(r' +', ' ', text)
    
    return text.strip()

def extract_sections(text):
    """
    Extract different sections from resume text (basic implementation)
    """
    sections = {
        'experience': [],
        'education': [],
        'skills': [],
        'summary': []
    }
    
    sentences = sent_tokenize(text)
    
    for sentence in sentences:
        sentence_lower = sentence.lower()
        
        # Very basic section identification
        if any(word in sentence_lower for word in ['experience', 'worked', 'job', 'position']):
            sections['experience'].append(sentence)
        elif any(word in sentence_lower for word in ['education', 'university', 'college', 'degree']):
            sections['education'].append(sentence)
        elif any(word in sentence_lower for word in ['skill', 'proficient', 'expert', 'knowledge']):
            sections['skills'].append(sentence)
        elif any(word in sentence_lower for word in ['summary', 'objective', 'profile']):
            sections['summary'].append(sentence)
    
    return sections