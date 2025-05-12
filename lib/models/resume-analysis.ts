export interface CategoryScore {
  category: string;
  score: number;
}

export interface ResumeRecommendation {
  text: string;
  type: 'improvement' | 'positive'; // 'improvement' shows warning icon, 'positive' shows check icon
}

export interface ResumeAnalysis {
  id?: string;
  userId?: string;
  overallScore: number;
  categoryScores: CategoryScore[];
  recommendations: ResumeRecommendation[];
  createdAt?: Date;
}

// Mock data for initial dashboard display until real data is available
export const mockResumeAnalysis: ResumeAnalysis = {
  overallScore: 85,
  categoryScores: [
    { category: 'ATS Compatibility', score: 85 },
    { category: 'Content Quality', score: 70 },
    { category: 'Structure', score: 90 },
    { category: 'Technical Language', score: 65 }
  ],
  recommendations: [
    { 
      text: 'Add more quantifiable achievements in your work experience section',
      type: 'improvement'
    },
    {
      text: 'Include more keywords related to cloud technologies (AWS, Azure)',
      type: 'improvement'
    },
    {
      text: 'Great job using strong action verbs throughout your resume',
      type: 'positive'
    },
    {
      text: 'Consider adding a more concise professional summary',
      type: 'improvement'
    }
  ]
}; 