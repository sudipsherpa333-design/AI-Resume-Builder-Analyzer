import Resume from '../models/Resume.js';
import AIService from '../services/aiService.js';
import Resume from '../models/Resume.js';
import User from '../models/User.js';

// Generate AI content for resume
export const generateContent = async (req, res) => {
  try {
    const { section, resumeId, options = {} } = req.body;
    const userId = req.user._id;

    // Find resume
    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    let generatedContent;
    let aiCost = 1; // Default AI credit cost

    switch (section) {
      case 'summary':
        generatedContent = await AIService.generateSummary(
          resume.personalInfo,
          resume.experiences
        );
        aiCost = 2;
        break;

      case 'experience':
        const { jobTitle, company, description } = options;
        generatedContent = await AIService.generateExperienceBullets(
          jobTitle,
          company,
          description
        );
        aiCost = 3;
        break;

      case 'skills':
        const skillsSuggestions = await AIService.generateSkillsSuggestions(
          resume.skills.map(s => s.name),
          resume.personalInfo.professionalTitle,
          options.industry
        );
        generatedContent = skillsSuggestions;
        aiCost = 2;
        break;

      case 'optimize':
        generatedContent = await AIService.optimizeContent(
          options.subsection,
          options.content,
          resume.personalInfo.professionalTitle
        );
        aiCost = 3;
        break;

      case 'coverLetter':
        generatedContent = await AIService.generateCoverLetter(
          resume,
          options.jobDescription,
          options.companyName
        );
        aiCost = 5;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid section specified'
        });
    }

    // Deduct AI credits from user
    const user = await User.findById(userId);
    if (user.aiCredits < aiCost) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient AI credits',
        creditsNeeded: aiCost,
        creditsAvailable: user.aiCredits
      });
    }

    user.aiCredits -= aiCost;
    await user.save();

    // Save AI action to resume history
    resume.aiAnalysis.suggestions.push({
      section,
      suggestion: `AI generated ${section}`,
      priority: 'medium',
      applied: false,
      generatedAt: new Date()
    });

    resume.metadata.aiEnhancementCount += 1;
    resume.metadata.lastAIGenerated = new Date();
    await resume.save();

    res.status(200).json({
      success: true,
      data: {
        content: generatedContent,
        creditsUsed: aiCost,
        creditsRemaining: user.aiCredits,
        section
      }
    });

  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating AI content',
      error: error.message
    });
  }
};

// Analyze resume with AI
export const analyzeResume = async (req, res) => {
  try {
    const { resumeId } = req.body;
    const userId = req.user._id;

    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Check AI credits
    const user = await User.findById(userId);
    const analysisCost = 5;

    if (user.aiCredits < analysisCost) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient AI credits for analysis',
        creditsNeeded: analysisCost,
        creditsAvailable: user.aiCredits
      });
    }

    // Perform ATS analysis
    const analysis = await AIService.analyzeATS({
      personalInfo: resume.personalInfo,
      experiences: resume.experiences,
      education: resume.education,
      skills: resume.skills
    });

    // Update resume with analysis
    resume.aiAnalysis = {
      atsScore: analysis.overallScore,
      keywordScore: analysis.atsCompatibility,
      readabilityScore: analysis.sections?.summary?.score || 0,
      suggestions: Object.entries(analysis.sections || {}).map(([section, data]) => ({
        section,
        suggestion: data.suggestions?.[0] || 'No specific suggestion',
        priority: 'medium',
        applied: false
      })),
      lastAnalyzed: new Date()
    };

    resume.metadata.lastATSScore = analysis.overallScore;
    await resume.save();

    // Deduct credits
    user.aiCredits -= analysisCost;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        analysis,
        creditsUsed: analysisCost,
        creditsRemaining: user.aiCredits
      }
    });

  } catch (error) {
    console.error('Resume analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing resume',
      error: error.message
    });
  }
};

// Chat with AI about resume
export const chatWithAI = async (req, res) => {
  try {
    const { resumeId, message, conversationId } = req.body;
    const userId = req.user._id;

    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Check AI credits (chat is free for now, could be 1 credit per message)
    const chatCost = 1;
    const user = await User.findById(userId);

    if (user.aiCredits < chatCost) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient AI credits',
        creditsNeeded: chatCost,
        creditsAvailable: user.aiCredits
      });
    }

    // Get conversation history from session or database
    const conversationHistory = req.session.conversationHistory || [];

    // Get AI response
    const aiResponse = await AIService.chatAboutResume(
      message,
      resume,
      conversationHistory
    );

    // Update conversation history
    conversationHistory.push(
      { role: 'user', content: message },
      { role: 'assistant', content: aiResponse }
    );

    // Keep only last 10 messages
    if (conversationHistory.length > 20) {
      conversationHistory.splice(0, conversationHistory.length - 20);
    }

    req.session.conversationHistory = conversationHistory;

    // Deduct credits
    user.aiCredits -= chatCost;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        response: aiResponse,
        conversationId,
        creditsUsed: chatCost,
        creditsRemaining: user.aiCredits
      }
    });

  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Error chatting with AI',
      error: error.message
    });
  }
};

// Apply AI suggestion to resume
export const applyAISuggestion = async (req, res) => {
  try {
    const { resumeId, section, suggestion, content } = req.body;
    const userId = req.user._id;

    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Apply content to appropriate section
    switch (section) {
      case 'summary':
        resume.personalInfo.summary = content;
        resume.personalInfo.isAIEnhanced = true;
        break;

      case 'experience':
        // For experience, we need to know which experience entry
        const { experienceIndex } = req.body;
        if (experienceIndex !== undefined && resume.experiences[experienceIndex]) {
          resume.experiences[experienceIndex].description = content;
          resume.experiences[experienceIndex].isAIEnhanced = true;
        }
        break;

      case 'skills':
        // Parse skills array
        if (Array.isArray(content)) {
          content.forEach(skillName => {
            const existingSkill = resume.skills.find(s => s.name === skillName);
            if (!existingSkill) {
              resume.skills.push({
                name: skillName,
                category: 'technical',
                proficiency: 5,
                isAIRecommended: true
              });
            }
          });
        }
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid section'
        });
    }

    // Mark suggestion as applied
    const suggestionIndex = resume.aiAnalysis.suggestions.findIndex(
      s => s.section === section && s.suggestion === suggestion
    );

    if (suggestionIndex !== -1) {
      resume.aiAnalysis.suggestions[suggestionIndex].applied = true;
      resume.aiAnalysis.suggestions[suggestionIndex].appliedAt = new Date();
    }

    resume.metadata.aiEnhancementCount += 1;
    await resume.save();

    res.status(200).json({
      success: true,
      data: {
        message: 'AI suggestion applied successfully',
        resume: resume
      }
    });

  } catch (error) {
    console.error('Apply suggestion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error applying AI suggestion',
      error: error.message
    });
  }
};

// Get AI credits balance
export const getAICredits = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('aiCredits');

    res.status(200).json({
      success: true,
      data: {
        credits: user.aiCredits
      }
    });

  } catch (error) {
    console.error('Get credits error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting AI credits',
      error: error.message
    });
  }
};

// Purchase AI credits
export const purchaseAICredits = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;
    const userId = req.user._id;

    // In production, integrate with Stripe/PayPal here
    const creditCost = {
      100: 9.99,
      500: 39.99,
      1000: 69.99,
      5000: 299.99
    };

    if (!creditCost[amount]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credit amount'
      });
    }

    // Simulate payment processing
    const paymentSuccessful = true; // Replace with actual payment processing

    if (!paymentSuccessful) {
      return res.status(400).json({
        success: false,
        message: 'Payment failed'
      });
    }

    // Add credits to user
    const user = await User.findById(userId);
    user.aiCredits += parseInt(amount);
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        message: `Successfully purchased ${amount} AI credits`,
        newBalance: user.aiCredits,
        amountPaid: creditCost[amount]
      }
    });

  } catch (error) {
    console.error('Purchase credits error:', error);
    res.status(500).json({
      success: false,
      message: 'Error purchasing AI credits',
      error: error.message
    });
  }
};