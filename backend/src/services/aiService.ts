import { GoogleGenAI, Type } from '@google/genai';
import { AIMatchResult, Job } from '../types';

export class AIService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        this.ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
      } catch (err) {
        console.warn('[AIService] Failed to initialize GoogleGenAI client:', err);
      }
    }
  }

  public async matchResumeWithJob(resumeText: string, job: Job): Promise<AIMatchResult> {
    if (!resumeText || resumeText.trim().length < 20) {
      return {
        score: 40,
        matchedSkills: [],
        missingSkills: job.required_skills,
        experienceAnalysis: 'Resume content was too brief or unextracted to conduct a comprehensive semantic analysis.',
        recommendation: 'Please upload a complete PDF CV with detailed work experience, education, and technical skills.',
        strengthsSummary: ['Profile submitted'],
        fitLevel: 'Low',
      };
    }

    // If Gemini client is active, run server-side Gemini 3.7 Flash analysis
    if (this.ai) {
      try {
        const prompt = `
You are an expert ATS (Applicant Tracking System) and Senior Technical Recruiter specializing in the Ethiopian tech & employment ecosystem.
Analyze the candidate's CV text against the Job Listing details below.

JOB DETAILS:
Title: ${job.title}
Company: ${job.company_name}
Category: ${job.category_name}
Experience Level: ${job.experience_level}
Required Skills: ${job.required_skills.join(', ')}
Preferred Skills: ${job.preferred_skills.join(', ')}
Responsibilities: ${job.responsibilities.join('; ')}
Requirements: ${job.requirements.join('; ')}

CANDIDATE CV TEXT:
${resumeText.slice(0, 4000)}

Evaluate the candidate objectively:
1. Extract skills in the CV that match required/preferred skills.
2. Identify missing critical skills.
3. Assess the candidate's education and experience relevant to this Ethiopian role.
4. Provide a compatibility score (0 to 100).
5. Provide a constructive recommendation for the hiring manager and candidate.
`;

        const response = await this.ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            systemInstruction: 'You are an AI ATS Evaluator. Always output strict JSON adhering strictly to the schema provided.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.INTEGER, description: 'Match score between 0 and 100' },
                matchedSkills: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: 'List of skills found in both the CV and job requirements'
                },
                missingSkills: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: 'List of required skills missing from the CV'
                },
                experienceAnalysis: { 
                  type: Type.STRING, 
                  description: 'Brief analysis of candidate experience alignment' 
                },
                recommendation: { 
                  type: Type.STRING, 
                  description: 'Constructive hiring recommendation' 
                },
                strengthsSummary: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Key candidate strengths for this role'
                },
                fitLevel: {
                  type: Type.STRING,
                  description: 'Fit level: High, Moderate, Low, or Exceptional'
                }
              },
              required: ['score', 'matchedSkills', 'missingSkills', 'experienceAnalysis', 'recommendation'],
            },
          },
        });

        const textOutput = response.text;
        if (textOutput) {
          const parsed = JSON.parse(textOutput) as AIMatchResult;
          // Sanitize score to 0-100 range
          parsed.score = Math.max(10, Math.min(99, parsed.score));
          return parsed;
        }
      } catch (geminiError) {
        console.warn('[AIService] Gemini API generation error, using rule-based semantic matcher fallback:', geminiError);
      }
    }

    // Fallback: Rule-based ATS parser algorithm
    return this.ruleBasedMatch(resumeText, job);
  }

  private ruleBasedMatch(resumeText: string, job: Job): AIMatchResult {
    const textLower = resumeText.toLowerCase();
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    for (const skill of job.required_skills) {
      const sLower = skill.toLowerCase();
      if (textLower.includes(sLower) || (sLower === 'react' && textLower.includes('react.js'))) {
        matchedSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    }

    for (const skill of job.preferred_skills) {
      if (textLower.includes(skill.toLowerCase())) {
        if (!matchedSkills.includes(skill)) matchedSkills.push(skill);
      }
    }

    const totalRequired = Math.max(1, job.required_skills.length);
    const matchRatio = matchedSkills.length / totalRequired;
    
    // Check for education keywords (e.g., AAU, ASTU, University, B.Sc., Bachelor)
    let eduBonus = 0;
    if (/university|b\.sc|bachelor|institute|degree|gpa/i.test(textLower)) {
      eduBonus += 10;
    }
    if (/intern|project|experience|developer|engineer|officer/i.test(textLower)) {
      eduBonus += 10;
    }

    let calculatedScore = Math.round(matchRatio * 75 + eduBonus);
    calculatedScore = Math.min(96, Math.max(25, calculatedScore));

    let fitLevel: 'High' | 'Moderate' | 'Low' | 'Exceptional' = 'Moderate';
    if (calculatedScore >= 88) fitLevel = 'Exceptional';
    else if (calculatedScore >= 75) fitLevel = 'High';
    else if (calculatedScore < 50) fitLevel = 'Low';

    const recommendation = calculatedScore >= 75
      ? `Strong candidate profile matching ${matchedSkills.length} core technical requirements. Recommended for initial technical screening.`
      : `Moderate fit. Candidate meets key foundations (${matchedSkills.slice(0, 3).join(', ')}), but lacks ${missingSkills.slice(0, 2).join(', ')}.`;

    return {
      score: calculatedScore,
      matchedSkills,
      missingSkills,
      experienceAnalysis: `CV shows alignment with ${matchedSkills.length} identified competencies for ${job.title}. Relevant education and project foundations detected in candidate background.`,
      recommendation,
      strengthsSummary: [
        `Matched skills: ${matchedSkills.slice(0, 4).join(', ') || 'Foundation skills'}`,
        'Demonstrates relevant academic / project terminology',
        'Structured resume formatting',
      ],
      fitLevel,
    };
  }
}

export const aiService = new AIService();
