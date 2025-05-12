'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Mock data for industry niches
const allNiches = [
  { id: 1, name: 'Software Development', icon: '💻', description: 'Programming, software engineering, and app development' },
  { id: 2, name: 'Data Science', icon: '📊', description: 'Data analysis, machine learning, and AI' },
  { id: 3, name: 'Digital Marketing', icon: '📱', description: 'SEO, social media, and online advertising' },
  { id: 4, name: 'Design', icon: '🎨', description: 'UX/UI, graphic design, and visual communication' },
  { id: 5, name: 'Finance', icon: '💰', description: 'Accounting, investment, and financial planning' },
  { id: 6, name: 'Healthcare', icon: '🏥', description: 'Medical, nursing, and healthcare management' },
  { id: 7, name: 'Business', icon: '📈', description: 'Management, entrepreneurship, and operations' },
  { id: 8, name: 'Education', icon: '🎓', description: 'Teaching, training, and educational technology' },
  { id: 9, name: 'Cybersecurity', icon: '🔒', description: 'Network security, ethical hacking, and information protection' },
  { id: 10, name: 'Engineering', icon: '⚙️', description: 'Various engineering disciplines and innovations' },
  { id: 11, name: 'Project Management', icon: '📋', description: 'Planning, execution, and oversight of projects' },
  { id: 12, name: 'Artificial Intelligence', icon: '🤖', description: 'AI technologies, machine learning, and robotics' },
  { id: 13, name: 'Cloud Computing', icon: '☁️', description: 'Cloud services, architecture, and deployment' },
  { id: 14, name: 'Content Creation', icon: '📝', description: 'Writing, video production, and content strategy' },
  { id: 15, name: 'Language Learning', icon: '🗣️', description: 'Foreign languages and linguistics' },
  { id: 16, name: 'Other', icon: '🔍', description: 'Specify your own area of interest' },
];

// Mock questions for tailoring learning paths
const mockQuestions = [
  { 
    id: 'experience', 
    question: 'What is your current experience level?', 
    description: 'This helps us determine the starting point for your learning path',
    options: [
      { value: 'beginner', label: 'Beginner', description: 'Little to no experience in this field' },
      { value: 'some_knowledge', label: 'Some Knowledge', description: 'Basic understanding but limited practical experience' },
      { value: 'intermediate', label: 'Intermediate', description: 'Some practical experience and theoretical knowledge' },
      { value: 'advanced', label: 'Advanced', description: 'Significant experience but looking to specialize further' }
    ]
  },
  { 
    id: 'goal', 
    question: 'What is your primary goal?', 
    description: 'Your end goal will help shape your learning journey',
    options: [
      { value: 'career_change', label: 'Career Change', description: 'Transitioning to a new field' },
      { value: 'skill_enhancement', label: 'Skill Enhancement', description: 'Improving existing knowledge and capabilities' },
      { value: 'certification', label: 'Certification', description: 'Preparing for specific industry certifications' },
      { value: 'personal_interest', label: 'Personal Interest', description: 'Learning for self-improvement or hobby' }
    ]
  },
  { 
    id: 'timeframe', 
    question: 'What is your target timeframe?', 
    description: 'How much time can you dedicate to completing this learning path',
    options: [
      { value: '1-3_months', label: '1-3 Months', description: 'Short-term intensive learning' },
      { value: '3-6_months', label: '3-6 Months', description: 'Balanced learning pace' },
      { value: '6-12_months', label: '6-12 Months', description: 'Comprehensive learning with practice time' },
      { value: '1+_year', label: '1+ Year', description: 'In-depth mastery with extensive practice' }
    ]
  },
  { 
    id: 'commitment', 
    question: 'How much time can you commit weekly?', 
    description: 'Your weekly availability helps us determine the intensity of the path',
    options: [
      { value: '1-5_hours', label: '1-5 Hours', description: 'Limited time each week' },
      { value: '5-10_hours', label: '5-10 Hours', description: 'Moderate commitment' },
      { value: '10-20_hours', label: '10-20 Hours', description: 'Substantial part-time commitment' },
      { value: '20+_hours', label: '20+ Hours', description: 'Full-time or near full-time commitment' }
    ]
  },
  { 
    id: 'learning_style', 
    question: 'What is your preferred learning style?', 
    description: 'Everyone learns differently - this helps us recommend suitable resources',
    options: [
      { value: 'visual', label: 'Visual', description: 'Learning through images, diagrams, and videos' },
      { value: 'reading_writing', label: 'Reading/Writing', description: 'Learning through text-based resources' },
      { value: 'interactive', label: 'Interactive/Practical', description: 'Learning by doing and practicing' },
      { value: 'combination', label: 'Combination', description: 'A mix of different learning styles' }
    ]
  },
];

// Steps in the learning path journey
enum PathStep {
  SELECT_NICHE = 'select_niche',
  ANSWER_QUESTIONS = 'answer_questions',
  VIEW_PATH = 'view_path',
}

export default function LearningPathsPage() {
  // State for the learning path journey
  const [step, setStep] = useState<PathStep>(PathStep.SELECT_NICHE);
  const [selectedNiche, setSelectedNiche] = useState<number | null>(null);
  const [customNiche, setCustomNiche] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loadingPath, setLoadingPath] = useState(false);
  const [displayedNiches, setDisplayedNiches] = useState(allNiches);

  // Filter niches based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setDisplayedNiches(allNiches);
    } else {
      const filtered = allNiches.filter(niche => 
        niche.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        niche.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setDisplayedNiches(filtered);
    }
  }, [searchQuery]);

  // Select a niche
  const handleSelectNiche = (nicheId: number) => {
    setSelectedNiche(nicheId);
    
    // If Other is selected, we stay on this step until a custom niche is entered
    if (nicheId !== 16) {
      setStep(PathStep.ANSWER_QUESTIONS);
      setCurrentQuestionIndex(0);
    }
  };

  // Handle custom niche input
  const handleCustomNicheSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customNiche.trim()) {
      setStep(PathStep.ANSWER_QUESTIONS);
      setCurrentQuestionIndex(0);
    }
  };

  // Update answer for current question
  const handleSelectAnswer = (questionId: string, answer: string) => {
    setAnswers({
      ...answers,
      [questionId]: answer,
    });
  };

  // Navigate to next question or finish quiz
  const handleNextQuestion = () => {
    if (currentQuestionIndex < mockQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // All questions answered, show loading animation then show path
      setLoadingPath(true);
      setTimeout(() => {
        setLoadingPath(false);
        setStep(PathStep.VIEW_PATH);
      }, 1500); // Simulate API call with 1.5 second delay
    }
  };

  // Navigate to previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Get niche name (selected or custom)
  const getNicheName = () => {
    if (selectedNiche === 16) return customNiche;
    const niche = allNiches.find(n => n.id === selectedNiche);
    return niche ? niche.name : '';
  };

  // Reset to beginning
  const handleReset = () => {
    setStep(PathStep.SELECT_NICHE);
    setSelectedNiche(null);
    setCustomNiche('');
    setCurrentQuestionIndex(0);
    setAnswers({});
  };

  // Render niche selection screen
  const renderNicheSelection = () => {
    return (
      <div>
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Explore Learning Pathways</h1>
          <p className="text-gray-600">
            Discover personalized learning paths tailored to your career goals and interests.
            Select an industry to begin your journey.
          </p>
        </div>

        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <Input
              className="pl-10 pr-4 py-2 w-full"
              placeholder="Search industries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {displayedNiches.map((niche) => (
            <Card 
              key={niche.id} 
              className={`
                cursor-pointer hover:shadow-md transition-all 
                ${selectedNiche === niche.id ? 'ring-2 ring-blue-500 shadow-lg transform scale-[1.02]' : 'hover:scale-[1.02]'}
              `}
              onClick={() => handleSelectNiche(niche.id)}
            >
              <CardContent className="p-6">
                <div className="text-3xl mb-4">{niche.icon}</div>
                <CardTitle className="mb-2 text-lg">{niche.name}</CardTitle>
                <CardDescription className="text-sm">{niche.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {displayedNiches.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500">No industries match your search. Try a different term or explore "Other".</p>
            <Button 
              className="mt-4" 
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                handleSelectNiche(16);
              }}
            >
              Create Custom Path
            </Button>
          </div>
        )}

        {selectedNiche === 16 && (
          <Card className="mt-8 max-w-lg mx-auto">
            <CardHeader>
              <CardTitle>Create Custom Learning Path</CardTitle>
              <CardDescription>
                Tell us about the specific field you're interested in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCustomNicheSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customNiche">Field of Interest</Label>
                  <Input
                    id="customNiche"
                    type="text"
                    placeholder="E.g. Quantum Computing, Culinary Arts, etc."
                    value={customNiche}
                    onChange={(e) => setCustomNiche(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Continue</Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Render interactive question flow
  const renderQuestionFlow = () => {
    const currentQuestion = mockQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / mockQuestions.length) * 100;
    
    return (
      <div className="max-w-3xl mx-auto">
        {/* Progress bar and steps */}
        <div className="mb-8">
          <div className="flex justify-between mb-2 text-sm font-medium text-gray-500">
            <span>Getting Started</span>
            <span>Building Your Path</span>
            <span>Almost Done</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="mt-2 text-xs text-gray-500 text-right">
            Question {currentQuestionIndex + 1} of {mockQuestions.length}
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="inline-block text-3xl bg-blue-100 text-blue-700 p-3 rounded-full mb-3">
            {getNicheName() === 'Software Development' ? '💻' : 
             getNicheName() === 'Data Science' ? '📊' : '🚀'}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Customize Your {getNicheName()} Path</h1>
          <p className="text-gray-600 mt-2">
            We'll create a personalized learning plan just for you
          </p>
        </div>

        <Card className="mb-6 shadow-lg">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
            <CardDescription>{currentQuestion.description}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <div
                  key={option.value}
                  className={`
                    border rounded-lg p-4 cursor-pointer transition-all
                    ${answers[currentQuestion.id] === option.value 
                      ? 'border-blue-500 bg-blue-50 shadow-md transform scale-[1.02]' 
                      : 'hover:border-gray-300 hover:bg-gray-50'}
                  `}
                  onClick={() => handleSelectAnswer(currentQuestion.id, option.value)}
                >
                  <div className="flex items-start">
                    <div 
                      className={`
                        w-5 h-5 mt-0.5 rounded-full border flex-shrink-0
                        ${answers[currentQuestion.id] === option.value 
                          ? 'border-blue-500 bg-blue-500' 
                          : 'border-gray-300'}
                      `}
                    >
                      {answers[currentQuestion.id] === option.value && (
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium text-gray-900">{option.label}</h4>
                      <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Button 
              variant="outline" 
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            <Button 
              onClick={handleNextQuestion}
              disabled={!answers[currentQuestion.id]}
            >
              {currentQuestionIndex === mockQuestions.length - 1 ? 'Generate My Path' : 'Next Question'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  };

  // Render loading animation
  const renderLoading = () => {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Crafting Your Learning Path</h2>
        <p className="text-gray-600 text-center max-w-md">
          We're analyzing your preferences and creating a personalized roadmap for your journey in {getNicheName()}...
        </p>
      </div>
    );
  };

  return (
    <div>
      {step === PathStep.SELECT_NICHE && renderNicheSelection()}
      {step === PathStep.ANSWER_QUESTIONS && !loadingPath && renderQuestionFlow()}
      {loadingPath && renderLoading()}
      {step === PathStep.VIEW_PATH && (
        <LearningPathView 
          niche={getNicheName()}
          answers={answers}
          onReset={handleReset}
        />
      )}
    </div>
  );
}

function LearningPathView({ 
  niche, 
  answers,
  onReset
}: { 
  niche: string;
  answers: Record<string, string>;
  onReset: () => void;
}) {
  // Format answer labels for display
  const getAnswerLabel = (questionId: string, value: string) => {
    const question = mockQuestions.find(q => q.id === questionId);
    if (!question) return value;
    
    const option = question.options.find(o => o.value === value);
    return option ? option.label : value;
  };

  // Mock learning path data - would come from API
  const mockPath = {
    title: `${niche} Professional Roadmap`,
    subtitle: "Your Personalized Learning Journey",
    description: `A comprehensive learning path designed specifically for ${getAnswerLabel('experience', answers.experience || '')} learners looking to ${answers.goal?.includes('career') ? 'transition into' : 'advance in'} the ${niche} field.`,
    estimatedTime: getAnswerLabel('timeframe', answers.timeframe || ''),
    commitment: getAnswerLabel('commitment', answers.commitment || ''),
    learningStyle: getAnswerLabel('learning_style', answers.learning_style || ''),
    stages: [
      {
        id: 1,
        title: 'Foundation Building',
        description: 'Establish the core knowledge and skills needed for success in this field',
        topics: [
          {
            id: 1,
            title: 'Core Concepts & Terminology',
            description: 'Understanding the fundamental concepts, vocabulary, and principles',
            importance: 'Essential for all further learning and professional communication',
            timeEstimate: '2-3 weeks',
            keypoints: [
              'Industry-standard terminology',
              'Foundational theories and frameworks',
              'Historical context and evolution of the field'
            ],
            resources: [
              { type: 'Book', name: 'The Essential Guide to Fundamentals', rating: 4.8 },
              { type: 'Course', name: 'Introduction to Core Principles', rating: 4.7 },
              { type: 'Article', name: 'Terminology Explained Simply', rating: 4.5 }
            ]
          },
          {
            id: 2,
            title: 'Essential Tools & Technologies',
            description: 'Mastering the basic tools and technologies used in the industry',
            importance: 'Provides practical skills for immediate application',
            timeEstimate: '3-4 weeks',
            keypoints: [
              'Industry-standard software and platforms',
              'Basic operations and workflows',
              'Productivity enhancement techniques'
            ],
            resources: [
              { type: 'Video Series', name: 'Tool Mastery: Beginner to Intermediate', rating: 4.9 },
              { type: 'Interactive Tutorial', name: 'Hands-on Practice Lab', rating: 4.6 },
              { type: 'Documentation', name: 'Official Tool Guidelines', rating: 4.3 }
            ]
          }
        ]
      },
      {
        id: 2,
        title: 'Skill Development',
        description: 'Build practical, applicable skills with hands-on practice',
        topics: [
          {
            id: 3,
            title: 'Practical Applications',
            description: 'Learning through real-world scenarios and applications',
            importance: 'Bridges the gap between theory and practice',
            timeEstimate: '4-6 weeks',
            keypoints: [
              'Real-world problem solving',
              'Case studies and examples',
              'Practical application techniques'
            ],
            resources: [
              { type: 'Project', name: 'Guided Real-World Project', rating: 4.8 },
              { type: 'Workshop', name: 'Applied Skills Workshop', rating: 4.7 },
              { type: 'Case Study', name: 'Industry Success Stories', rating: 4.5 }
            ]
          },
          {
            id: 4,
            title: 'Advanced Techniques',
            description: 'Moving beyond basics to more sophisticated approaches',
            importance: 'Differentiates you in competitive environments',
            timeEstimate: '5-7 weeks',
            keypoints: [
              'Optimization strategies',
              'Efficiency improvements',
              'Complex problem solving'
            ],
            resources: [
              { type: 'Advanced Course', name: 'Mastering Complex Techniques', rating: 4.9 },
              { type: 'Expert Guide', name: 'Advanced Practitioner Handbook', rating: 4.6 },
              { type: 'Community Forum', name: 'Expert Discussion Group', rating: 4.4 }
            ]
          }
        ]
      },
      {
        id: 3,
        title: 'Specialization & Mastery',
        description: 'Focus on specific areas of expertise and build professional credibility',
        topics: [
          {
            id: 5,
            title: 'Specialized Focus Areas',
            description: 'Deep dive into specific niches within the broader field',
            importance: 'Creates valuable expertise in high-demand areas',
            timeEstimate: '6-8 weeks',
            keypoints: [
              'Niche-specific knowledge',
              'Specialized tools and methodologies',
              'Cutting-edge developments'
            ],
            resources: [
              { type: 'Specialization Course', name: 'Expert Track: Specialization', rating: 4.8 },
              { type: 'Research Papers', name: 'Current Developments Collection', rating: 4.5 },
              { type: 'Expert Interview', name: 'Insights from Field Leaders', rating: 4.7 }
            ]
          },
          {
            id: 6,
            title: 'Professional Development',
            description: 'Building professional presence and credibility in the field',
            importance: 'Essential for career advancement and recognition',
            timeEstimate: '4-6 weeks',
            keypoints: [
              'Portfolio development',
              'Professional networking',
              'Industry certification preparation'
            ],
            resources: [
              { type: 'Guide', name: 'Building Your Professional Brand', rating: 4.9 },
              { type: 'Network', name: 'Industry Professional Community', rating: 4.6 },
              { type: 'Certification', name: 'Professional Certification Prep', rating: 4.8 }
            ]
          }
        ]
      }
    ]
  };

  return (
    <div className="pb-16">
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 py-16 px-4 mb-10 rounded-xl text-white">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center mb-6">
            <div className="text-5xl bg-white/20 p-5 rounded-full backdrop-blur-sm mb-4 md:mb-0 md:mr-6">
              {niche === 'Software Development' ? '💻' : 
              niche === 'Data Science' ? '📊' : '🚀'}
            </div>
            <div>
              <h1 className="text-4xl font-bold">{mockPath.title}</h1>
              <p className="text-blue-100 mt-1 text-xl">{mockPath.subtitle}</p>
            </div>
          </div>
          <p className="text-xl text-blue-50">{mockPath.description}</p>
          
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span>Timeframe: {mockPath.estimatedTime}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span>Weekly Commitment: {mockPath.commitment}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-3-.712V17a1 1 0 001 1z" />
              </svg>
              <span>Learning Style: {mockPath.learningStyle}</span>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-400/30 rounded-full blur-xl"></div>
          <div className="absolute left-1/4 bottom-5 w-60 h-60 bg-indigo-400/20 rounded-full blur-xl"></div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        {/* Path Navigation */}
        <div className="sticky top-[4.5rem] z-20 bg-white shadow rounded-xl mb-8 overflow-hidden">
          <div className="flex items-center overflow-x-auto">
            {mockPath.stages.map((stage, index) => (
              <a 
                key={stage.id}
                href={`#stage-${stage.id}`}
                className="flex-shrink-0 px-6 py-4 font-medium hover:bg-gray-50 transition-colors"
              >
                <span className="flex items-center">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 mr-2 text-sm font-bold">
                    {index + 1}
                  </span>
                  {stage.title}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Path Content */}
        <div className="space-y-12">
          {mockPath.stages.map((stage) => (
            <div key={stage.id} id={`stage-${stage.id}`} className="scroll-mt-32">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 mr-3 font-bold">
                  {stage.id}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{stage.title}</h2>
              </div>
              <p className="text-gray-700 mb-8 max-w-3xl">{stage.description}</p>

              <div className="space-y-8">
                {stage.topics.map((topic) => (
                  <Card key={topic.id} className="overflow-hidden border-l-4 border-l-blue-500">
                    <CardContent className="p-0">
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-2">{topic.title}</h3>
                        <p className="text-gray-600 mb-4">{topic.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Why It's Important</h4>
                            <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-md">{topic.importance}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Time Commitment</h4>
                            <p className="text-gray-600 text-sm bg-blue-50 p-3 rounded-md flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              {topic.timeEstimate}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">What You'll Learn</h4>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {topic.keypoints.map((point, idx) => (
                              <li key={idx} className="flex items-start">
                                <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-700">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Recommended Resources</h4>
                          <div className="space-y-2">
                            {topic.resources.map((resource, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-md p-3">
                                <div className="flex items-center">
                                  <span className="text-xs font-medium text-gray-500 bg-gray-200 rounded-full px-2 py-1 mr-3">{resource.type}</span>
                                  <a href="#" className="text-blue-600 hover:underline">{resource.name}</a>
                                </div>
                                <div className="flex items-center">
                                  <span className="text-yellow-500 mr-1">★</span>
                                  <span className="text-sm">{resource.rating}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Call to action buttons */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" size="lg" className="gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Download Learning Path
          </Button>
          <Button size="lg" className="gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Begin Learning Journey
          </Button>
          <Button variant="ghost" size="lg" onClick={onReset} className="gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Create New Path
          </Button>
        </div>
      </div>
    </div>
  );
} 