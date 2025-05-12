'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data for demonstration
const mockSkillGapAnalysis = {
  matchedSkills: [
    { name: 'React', category: 'Frontend', relevance: 90 },
    { name: 'TypeScript', category: 'Language', relevance: 85 },
    { name: 'Next.js', category: 'Framework', relevance: 80 },
    { name: 'Git', category: 'DevOps', relevance: 75 },
    { name: 'Tailwind CSS', category: 'Frontend', relevance: 70 },
  ],
  missingSkills: [
    { name: 'GraphQL', category: 'Backend', relevance: 95, difficulty: 'Intermediate' },
    { name: 'AWS', category: 'Cloud', relevance: 90, difficulty: 'Advanced' },
    { name: 'Jest', category: 'Testing', relevance: 85, difficulty: 'Beginner' },
    { name: 'CI/CD', category: 'DevOps', relevance: 80, difficulty: 'Intermediate' },
  ],
  emphasizeSkills: [
    { name: 'JavaScript', category: 'Language', relevance: 90, recommendation: 'Highlight your experience with ES6+ features' },
    { name: 'REST API', category: 'Backend', relevance: 85, recommendation: 'Emphasize your experience building RESTful services' },
  ],
  projectRecommendations: [
    { 
      title: 'Build a GraphQL API with Apollo Server', 
      skills: ['GraphQL', 'Node.js', 'Apollo'], 
      description: 'Create a simple GraphQL API to demonstrate your understanding of GraphQL schema design and resolvers.',
      difficulty: 'Intermediate',
      timeEstimate: '2-3 weeks'
    },
    { 
      title: 'Set up CI/CD Pipeline with GitHub Actions', 
      skills: ['CI/CD', 'GitHub Actions', 'Testing'], 
      description: 'Implement automated testing and deployment for one of your existing projects using GitHub Actions.',
      difficulty: 'Intermediate',
      timeEstimate: '1-2 weeks'
    },
    { 
      title: 'Deploy a Serverless Application on AWS', 
      skills: ['AWS', 'Serverless', 'Lambda'], 
      description: 'Build and deploy a simple serverless application using AWS Lambda, API Gateway, and DynamoDB.',
      difficulty: 'Advanced',
      timeEstimate: '3-4 weeks'
    },
  ],
  keywordSuggestions: [
    'Full-stack development',
    'Front-end architecture',
    'UI/UX implementation',
    'API integration',
    'Component-based design',
    'Responsive web development'
  ],
  learningResources: [
    { 
      skill: 'GraphQL', 
      resources: [
        { type: 'Course', name: 'GraphQL Fundamentals', link: '#', provider: 'Udemy', rating: 4.8 },
        { type: 'Documentation', name: 'Apollo GraphQL Docs', link: '#', provider: 'Apollo', rating: 4.9 },
        { type: 'Tutorial', name: 'Building a GraphQL Server', link: '#', provider: 'Digital Ocean', rating: 4.7 },
      ]
    },
    { 
      skill: 'AWS', 
      resources: [
        { type: 'Course', name: 'AWS Certified Developer', link: '#', provider: 'A Cloud Guru', rating: 4.9 },
        { type: 'Documentation', name: 'AWS Developer Guide', link: '#', provider: 'AWS', rating: 4.8 },
        { type: 'Hands-on Lab', name: 'AWS Serverless Workshop', link: '#', provider: 'AWS', rating: 4.7 },
      ]
    },
    { 
      skill: 'CI/CD', 
      resources: [
        { type: 'Course', name: 'DevOps with GitHub Actions', link: '#', provider: 'Pluralsight', rating: 4.7 },
        { type: 'Tutorial', name: 'Continuous Integration Best Practices', link: '#', provider: 'GitHub', rating: 4.8 },
        { type: 'Guide', name: 'CI/CD Pipeline Implementation', link: '#', provider: 'Martin Fowler', rating: 4.9 },
      ]
    },
  ],
  jobFitScore: 75,
  industry: 'Technology',
  role: 'Frontend Developer',
};

// Enum for tracking the upload steps
enum AnalysisStep {
  UPLOAD = 'upload',
  ANALYZING = 'analyzing',
  RESULTS = 'results',
}

export default function SkillGapAnalysisPage() {
  const [step, setStep] = useState<AnalysisStep>(AnalysisStep.UPLOAD);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [githubUrl, setGithubUrl] = useState('');
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [jobDescriptionUrl, setJobDescriptionUrl] = useState('');
  const [inputMethod, setInputMethod] = useState<'text' | 'url'>('text');
  const [analysisResult, setAnalysisResult] = useState(mockSkillGapAnalysis);

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  // Start analysis
  const handleStartAnalysis = () => {
    // Validate inputs
    if (!resumeFile) {
      alert('Please upload your resume');
      return;
    }

    if (inputMethod === 'text' && !jobDescriptionText) {
      alert('Please enter a job description');
      return;
    }

    if (inputMethod === 'url' && !jobDescriptionUrl) {
      alert('Please enter a job description URL');
      return;
    }

    // Show loading state
    setStep(AnalysisStep.ANALYZING);

    // Simulate API call with a timeout
    setTimeout(() => {
      setStep(AnalysisStep.RESULTS);
      // In a real app, we would fetch the actual results from the API
      setAnalysisResult(mockSkillGapAnalysis);
    }, 3000);
  };

  // Reset and start over
  const handleReset = () => {
    setStep(AnalysisStep.UPLOAD);
    setResumeFile(null);
    setGithubUrl('');
    setJobDescriptionText('');
    setJobDescriptionUrl('');
    setInputMethod('text');
  };

  // Calculate skill percentages for the chart
  const totalSkills = analysisResult.matchedSkills.length + analysisResult.missingSkills.length;
  const matchedPercentage = (analysisResult.matchedSkills.length / totalSkills) * 100;
  const missingPercentage = (analysisResult.missingSkills.length / totalSkills) * 100;

  // Render the file upload and job description input form
  const renderUploadForm = () => {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Skill Gap Analysis</h1>
          <p className="text-gray-600">
            Compare your skills against job requirements to identify gaps and get personalized recommendations to improve your job fit.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload Your Resume</CardTitle>
            <CardDescription>
              We'll analyze your resume to extract your skills and experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {resumeFile ? (
                  <div className="flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500 mb-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium text-gray-900">{resumeFile.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => setResumeFile(null)}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <div className="mt-4 flex text-sm leading-6 text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">PDF, DOC, or DOCX up to 5MB</p>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="github-url">GitHub Profile URL (Optional)</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                    github.com/
                  </span>
                  <Input
                    id="github-url"
                    type="text"
                    placeholder="username"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="rounded-l-none"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  We'll analyze your public repositories to better understand your technical skills
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
            <CardDescription>
              Enter the job description to compare against your skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={inputMethod} onValueChange={(v: string) => setInputMethod(v as 'text' | 'url')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="text">Enter Text</TabsTrigger>
                <TabsTrigger value="url">Job Posting URL</TabsTrigger>
              </TabsList>
              <TabsContent value="text" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="job-description">Paste Job Description</Label>
                  <textarea
                    id="job-description"
                    rows={8}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Paste the complete job description here..."
                    value={jobDescriptionText}
                    onChange={(e) => setJobDescriptionText(e.target.value)}
                  ></textarea>
                </div>
              </TabsContent>
              <TabsContent value="url" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="job-url">Job Posting URL</Label>
                  <Input
                    id="job-url"
                    type="url"
                    placeholder="https://example.com/job-posting"
                    value={jobDescriptionUrl}
                    onChange={(e) => setJobDescriptionUrl(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Enter the URL of the job posting (e.g., LinkedIn, Indeed, etc.)
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleStartAnalysis}>
              Analyze Skills
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  };

  // Render the loading/analyzing state
  const renderAnalyzing = () => {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="relative w-24 h-24">
          <div className="w-24 h-24 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
          <div className="w-24 h-24 rounded-full border-l-4 border-r-4 border-transparent border-t-4 border-blue-200 animate-spin absolute top-0 left-0" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        
        <div className="mt-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Your Skills</h2>
          <div className="max-w-md mx-auto">
            <p className="text-gray-600 mb-4">
              We're analyzing your resume and comparing it to the job description to identify skill gaps and opportunities.
            </p>
            <div className="flex flex-col space-y-3">
              <div className="flex items-center">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-gray-600">Extracting skills from your resume</span>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-gray-600">Identifying required skills from job description</span>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center animate-pulse mr-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-sm text-gray-600">Comparing skills and calculating gaps</span>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                </div>
                <span className="text-sm text-gray-500">Generating personalized recommendations</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render the analysis results
  const renderResults = () => {
    return (
      <div className="pb-16">
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 py-16 px-4 mb-10 rounded-xl text-white">
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0">
                <h1 className="text-4xl font-bold mb-2">Skill Gap Analysis</h1>
                <p className="text-xl text-blue-100">
                  {analysisResult.role} • {analysisResult.industry} Industry
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Job Fit Score: {analysisResult.jobFitScore}%</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 3V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V3L16 5L12 3L8 5L5 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 10H15M9 14H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span>{analysisResult.matchedSkills.length} Matched Skills</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 9V15M12 9L9 12M12 9L15 12M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{analysisResult.missingSkills.length} Skills to Develop</span>
                  </div>
                </div>
              </div>
              <div className="w-48 h-48 relative">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                  <path 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="3"
                    strokeDasharray="100, 100"
                  />
                  <path 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#4ade80"
                    strokeWidth="3"
                    strokeDasharray={`${matchedPercentage}, 100`}
                    strokeLinecap="round"
                  />
                  <text x="18" y="18" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold fill-white">
                    {analysisResult.jobFitScore}%
                  </text>
                  <text x="18" y="23" textAnchor="middle" dominantBaseline="middle" className="text-xs fill-white">
                    Job Fit
                  </text>
                </svg>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-400/30 rounded-full blur-xl"></div>
            <div className="absolute left-1/4 bottom-5 w-60 h-60 bg-indigo-400/20 rounded-full blur-xl"></div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4">
          <Tabs defaultValue="gaps" className="w-full">
            <TabsList className="grid w-full sm:w-auto sm:inline-grid sm:grid-cols-4 mb-8">
              <TabsTrigger value="gaps">Skill Gaps</TabsTrigger>
              <TabsTrigger value="matched">Matched Skills</TabsTrigger>
              <TabsTrigger value="projects">Recommended Projects</TabsTrigger>
              <TabsTrigger value="resources">Learning Resources</TabsTrigger>
            </TabsList>
            
            <TabsContent value="gaps" className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Skills to Develop</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {analysisResult.missingSkills.map((skill, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="bg-red-50 px-6 py-3 border-b border-red-100 flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                            <h3 className="font-semibold text-red-700">{skill.name}</h3>
                          </div>
                          <span className="text-xs font-medium text-gray-500 bg-white rounded-full px-2 py-1">
                            {skill.category}
                          </span>
                        </div>
                        <div className="p-6">
                          <div className="flex justify-between items-center mb-4">
                            <div className="text-sm text-gray-500">Relevance to Job</div>
                            <div className="text-sm font-medium">{skill.relevance}%</div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                            <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${skill.relevance}%` }}></div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              <span className="text-gray-600">Difficulty Level:</span>
                            </div>
                            <span className="font-medium">{skill.difficulty}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Skills to Emphasize</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {analysisResult.emphasizeSkills.map((skill, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="bg-yellow-50 px-6 py-3 border-b border-yellow-100 flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                            <h3 className="font-semibold text-yellow-700">{skill.name}</h3>
                          </div>
                          <span className="text-xs font-medium text-gray-500 bg-white rounded-full px-2 py-1">
                            {skill.category}
                          </span>
                        </div>
                        <div className="p-6">
                          <div className="flex justify-between items-center mb-4">
                            <div className="text-sm text-gray-500">Relevance to Job</div>
                            <div className="text-sm font-medium">{skill.relevance}%</div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                            <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${skill.relevance}%` }}></div>
                          </div>
                          <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-md text-sm text-yellow-800">
                            <p><span className="font-medium">Recommendation:</span> {skill.recommendation}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Resume Keyword Optimization</h2>
                <p className="text-gray-600 mb-6">Consider adding these keywords to your resume to improve ATS matching:</p>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.keywordSuggestions.map((keyword, index) => (
                    <div key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-sm">
                      {keyword}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="matched" className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Matched Skills</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {analysisResult.matchedSkills.map((skill, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="bg-green-50 px-6 py-3 border-b border-green-100 flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                            <h3 className="font-semibold text-green-700">{skill.name}</h3>
                          </div>
                          <span className="text-xs font-medium text-gray-500 bg-white rounded-full px-2 py-1">
                            {skill.category}
                          </span>
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-500">Relevance to Job</div>
                            <div className="text-sm font-medium">{skill.relevance}%</div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${skill.relevance}%` }}></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="projects" className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended Projects</h2>
                <p className="text-gray-600 mb-6">
                  These projects will help you develop the missing skills and strengthen your portfolio.
                </p>
                <div className="grid grid-cols-1 gap-6">
                  {analysisResult.projectRecommendations.map((project, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="bg-blue-50 p-6 border-b border-blue-100">
                          <h3 className="font-bold text-lg text-gray-900 mb-2">{project.title}</h3>
                          <p className="text-gray-600 mb-4">{project.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {project.skills.map((skill, skillIndex) => (
                              <span key={skillIndex} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="p-4 flex justify-between items-center">
                          <div className="flex items-center gap-6">
                            <div className="flex items-center">
                              <svg className="w-5 h-5 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm text-gray-600">{project.timeEstimate}</span>
                            </div>
                            <div className="flex items-center">
                              <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 8a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm text-gray-600">{project.difficulty}</span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Save Project
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="resources" className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Learning Resources</h2>
                <p className="text-gray-600 mb-6">
                  High-quality resources to help you develop the skills needed for this role.
                </p>
                <div className="space-y-8">
                  {analysisResult.learningResources.map((skillResource, index) => (
                    <div key={index}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <div className="w-2 h-6 bg-blue-500 rounded-full mr-3"></div>
                        {skillResource.skill}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {skillResource.resources.map((resource, resourceIndex) => (
                          <Card key={resourceIndex} className="overflow-hidden">
                            <CardContent className="p-4">
                              <div className="flex items-center mb-3">
                                <span className="text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-2 py-1 mr-2">
                                  {resource.type}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {resource.provider}
                                </span>
                              </div>
                              <a href={resource.link} className="text-blue-600 hover:underline font-medium block mb-3">
                                {resource.name}
                              </a>
                              <div className="flex items-center">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <svg key={i} className={`w-4 h-4 ${i < Math.floor(resource.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                                <span className="text-xs ml-1 text-gray-600">
                                  {resource.rating.toFixed(1)}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" size="lg" className="gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Download Report
            </Button>
            <Button size="lg" className="gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Enhance Resume
            </Button>
            <Button variant="ghost" size="lg" onClick={handleReset} className="gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              New Analysis
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {step === AnalysisStep.UPLOAD && renderUploadForm()}
      {step === AnalysisStep.ANALYZING && renderAnalyzing()}
      {step === AnalysisStep.RESULTS && renderResults()}
    </div>
  );
} 