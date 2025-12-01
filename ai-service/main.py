import sys
import json
import logging
from scoring import calculate_resume_score
from keyword_matching import extract_keywords, match_keywords
from text_extraction import extract_text_from_resume

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def analyze_resume(resume_data):
    """
    Main function to analyze resume data
    """
    try:
        # Extract text from resume data
        resume_text = extract_text_from_resume(resume_data)
        
        # Calculate overall score
        overall_score = calculate_resume_score(resume_data, resume_text)
        
        # Extract and match keywords
        extracted_keywords = extract_keywords(resume_text)
        keyword_matches = match_keywords(extracted_keywords, resume_data.get('job_title', ''))
        
        # Identify strengths and weaknesses
        strengths = identify_strengths(resume_data, overall_score)
        weaknesses = identify_weaknesses(resume_data, overall_score)
        
        # Calculate ATS score
        ats_score = calculate_ats_score(resume_data, resume_text)
        
        return {
            'overall_score': overall_score,
            'ats_score': ats_score,
            'keyword_matches': keyword_matches,
            'strengths': strengths,
            'weaknesses': weaknesses,
            'extracted_keywords': extracted_keywords[:10]  # Top 10 keywords
        }
        
    except Exception as e:
        logger.error(f"Error in resume analysis: {str(e)}")
        return {
            'overall_score': 0,
            'ats_score': 0,
            'keyword_matches': [],
            'strengths': [],
            'weaknesses': ['Analysis failed due to technical error'],
            'error': str(e)
        }

def identify_strengths(resume_data, score):
    """Identify resume strengths"""
    strengths = []
    
    if score >= 80:
        strengths.append("Excellent overall structure and content")
    
    if len(resume_data.get('experience', [])) >= 2:
        strengths.append("Good amount of professional experience")
    
    if len(resume_data.get('skills', [])) >= 8:
        strengths.append("Strong and diverse skill set")
    
    if resume_data.get('professionalSummary'):
        strengths.append("Well-written professional summary")
    
    return strengths

def identify_weaknesses(resume_data, score):
    """Identify resume weaknesses"""
    weaknesses = []
    
    if score < 60:
        weaknesses.append("Overall resume needs significant improvement")
    
    if len(resume_data.get('experience', [])) < 1:
        weaknesses.append("Limited professional experience")
    
    if len(resume_data.get('skills', [])) < 5:
        weaknesses.append("Skill section needs more relevant skills")
    
    if not resume_data.get('professionalSummary'):
        weaknesses.append("Missing professional summary")
    
    return weaknesses

def calculate_ats_score(resume_data, resume_text):
    """Calculate ATS compatibility score"""
    score = 100
    
    # Check for common ATS issues
    if len(resume_text) > 2000:
        score -= 10  # Too long
    
    if 'table' in resume_text.lower() or 'column' in resume_text.lower():
        score -= 15  # Complex formatting
    
    # Check for essential sections
    essential_sections = ['experience', 'education', 'skills']
    missing_sections = [section for section in essential_sections if not resume_data.get(section)]
    score -= len(missing_sections) * 10
    
    return max(score, 0)

if __name__ == "__main__":
    try:
        # Read resume data from command line arguments
        resume_data_json = sys.argv[1]
        resume_data = json.loads(resume_data_json)
        
        # Analyze resume
        result = analyze_resume(resume_data)
        
        # Output result as JSON
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            'overall_score': 0,
            'ats_score': 0,
            'keyword_matches': [],
            'strengths': [],
            'weaknesses': ['Analysis failed: ' + str(e)],
            'error': str(e)
        }
        print(json.dumps(error_result))