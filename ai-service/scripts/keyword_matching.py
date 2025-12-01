import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
import string
import re

# Initialize NLTK components
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

def extract_keywords(text, max_keywords=20):
    """
    Extract important keywords from text using TF-IDF and NLP techniques
    """
    if not text:
        return []
    
    # Preprocess text
    processed_text = preprocess_text(text)
    
    # Use TF-IDF to extract important keywords
    vectorizer = TfidfVectorizer(
        max_features=max_keywords,
        stop_words='english',
        ngram_range=(1, 2)  # Include single words and bigrams
    )
    
    try:
        tfidf_matrix = vectorizer.fit_transform([processed_text])
        feature_names = vectorizer.get_feature_names_out()
        
        # Get TF-IDF scores and sort keywords by importance
        scores = tfidf_matrix.toarray().flatten()
        keyword_scores = list(zip(feature_names, scores))
        keyword_scores.sort(key=lambda x: x[1], reverse=True)
        
        return [keyword for keyword, score in keyword_scores if score > 0.1]
    
    except Exception as e:
        # Fallback to simple keyword extraction
        return simple_keyword_extraction(processed_text, max_keywords)

def preprocess_text(text):
    """
    Preprocess text for keyword extraction
    """
    # Convert to lowercase
    text = text.lower()
    
    # Remove punctuation and numbers
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\d+', '', text)
    
    # Tokenize
    tokens = word_tokenize(text)
    
    # Remove stopwords and short tokens, then lemmatize
    processed_tokens = [
        lemmatizer.lemmatize(token) 
        for token in tokens 
        if token not in stop_words and len(token) > 2
    ]
    
    return ' '.join(processed_tokens)

def simple_keyword_extraction(text, max_keywords):
    """
    Simple keyword extraction as fallback
    """
    tokens = word_tokenize(text.lower())
    
    # Filter and count tokens
    word_freq = {}
    for token in tokens:
        if (token not in stop_words and 
            len(token) > 3 and 
            token not in string.punctuation):
            word_freq[token] = word_freq.get(token, 0) + 1
    
    # Sort by frequency and return top keywords
    sorted_keywords = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
    return [keyword for keyword, freq in sorted_keywords[:max_keywords]]

def match_keywords(extracted_keywords, job_title):
    """
    Match extracted keywords with job title relevance
    """
    if not job_title:
        return extracted_keywords[:10]  # Return top 10 if no job title
    
    # Get industry-specific target keywords
    target_keywords = get_target_keywords(job_title)
    
    # Find matches between extracted and target keywords
    matches = []
    for keyword in extracted_keywords:
        if any(target in keyword for target in target_keywords):
            matches.append(keyword)
        elif any(keyword in target for target in target_keywords):
            matches.append(keyword)
    
    return matches if matches else extracted_keywords[:5]

def get_target_keywords(job_title):
    """
    Get target keywords based on job title
    """
    job_title_lower = job_title.lower()
    
    keyword_mapping = {
        'software': ['programming', 'development', 'coding', 'software', 'engineer', 'developer'],
        'data': ['analysis', 'analytics', 'data', 'database', 'sql', 'python', 'machine learning'],
        'manager': ['management', 'leadership', 'team', 'project', 'strategy', 'planning'],
        'design': ['design', 'ui', 'ux', 'creative', 'graphic', 'visual', 'prototype'],
        'marketing': ['marketing', 'campaign', 'social media', 'seo', 'content', 'brand'],
        'sales': ['sales', 'revenue', 'client', 'customer', 'negotiation', 'business development']
    }
    
    target_keywords = []
    for category, keywords in keyword_mapping.items():
        if category in job_title_lower:
            target_keywords.extend(keywords)
    
    # Add general professional keywords
    target_keywords.extend([
        'communication', 'problem solving', 'teamwork', 'leadership',
        'project management', 'analysis', 'strategy', 'development'
    ])
    
    return list(set(target_keywords))  # Remove duplicates