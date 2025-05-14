'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { resumeApi, skillGapApi } from '@/lib/api';
import { ResumeAnalysisResult, OptimizedResumeResult } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { hasToken } from '@/lib/auth';
import { Resume } from '@/lib/api';
import ReactMarkdown from 'react-markdown';

// Enum for tracking the analysis steps
enum AnalysisStep {
  UPLOAD = 'upload',
  ANALYZING = 'analyzing',
  RESULTS = 'results',
  OPTIMIZED = 'optimized',
}

export default function ResumeEnhancementPage() {
  const router = useRouter();
  const [step, setStep] = useState<AnalysisStep>(AnalysisStep.UPLOAD);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResult | null>(null);
  const [optimizedResume, setOptimizedResume] = useState<OptimizedResumeResult | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [error, setError] = useState<string | null>(null);
  const [userResumes, setUserResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  
  // File input ref for resetting
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load user's resumes when the component mounts
  useEffect(() => {
    const fetchResumes = async () => {
      if (!hasToken()) {
        router.push('/login');
        return;
      }
      
      setLoadingResumes(true);
      try {
        const response = await resumeApi.getUserResumes();
        setUserResumes(response.resumes);
      } catch (err) {
        console.error("Failed to fetch resumes:", err);
        setError("Failed to load your resumes");
      } finally {
        setLoadingResumes(false);
      }
    };
    
    fetchResumes();
  }, [router]);

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
      setSelectedResume(null); // Clear selected resume when file is uploaded
    }
  };

  // Reset file input
  const resetFileInput = () => {
    setResumeFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle resume selection
  const handleResumeSelect = (resumeId: string) => {
    const resume = userResumes.find(r => r.id === resumeId);
    if (resume) {
      setSelectedResume(resume);
      setResumeFile(null); // Clear uploaded file when resume is selected
      resetFileInput();
    }
  };

  // Start analysis
  const handleStartAnalysis = () => {
    // Validate inputs
    if (!resumeFile && !selectedResume) {
      setError('Please upload your resume or select an existing one');
      return;
    }

    // Show loading state
    setStep(AnalysisStep.ANALYZING);

    // Default job title and industry since they're still required by the backend
    const defaultJobTitle = "General Position";
    const defaultIndustry = "Technology";

    // Call the API to analyze the resume
    skillGapApi.analyzeResume(
      resumeFile, 
      selectedResume?.id || null,
      defaultJobTitle,
      defaultIndustry
    )
      .then((result: ResumeAnalysisResult) => {
        setAnalysisResult(result);
      setStep(AnalysisStep.RESULTS);
      })
      .catch((error: Error) => {
        console.error('Resume analysis failed:', error);
        setError(`Analysis failed: ${error.message || 'Unknown error'}`);
        setStep(AnalysisStep.UPLOAD);
      });
  };

  // Generate optimized resume
  const handleOptimizeResume = () => {
    if (!analysisResult) return;
    
    setStep(AnalysisStep.ANALYZING);
    
    // Use the same default values for job title and industry
    const defaultJobTitle = "General Position";
    const defaultIndustry = "Technology";
    
    skillGapApi.optimizeResume(
      resumeFile,
      selectedResume?.id || null,
      defaultJobTitle,
      defaultIndustry,
      analysisResult
    )
      .then((result: OptimizedResumeResult) => {
        setOptimizedResume(result);
        setStep(AnalysisStep.OPTIMIZED);
      })
      .catch((error: Error) => {
        console.error('Resume optimization failed:', error);
        setError(`Optimization failed: ${error.message || 'Unknown error'}`);
        setStep(AnalysisStep.RESULTS);
      });
  };

  // Reset and start over
  const handleReset = () => {
    setStep(AnalysisStep.UPLOAD);
    setResumeFile(null);
    setSelectedResume(null);
    setAnalysisResult(null);
    setOptimizedResume(null);
    setError(null);
    resetFileInput();
  };

  return (
    <div>
      {error && (
        <div className="max-w-3xl mx-auto mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
          <button 
            className="float-right font-bold"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}
      
      {step === AnalysisStep.UPLOAD && <ResumeUploadForm 
        resumeFile={resumeFile}
        fileInputRef={fileInputRef}
        handleFileChange={handleFileChange}
        resetFileInput={resetFileInput}
        selectedResume={selectedResume}
        userResumes={userResumes}
        handleResumeSelect={handleResumeSelect}
        loadingResumes={loadingResumes}
        handleStartAnalysis={handleStartAnalysis}
      />}
      {step === AnalysisStep.ANALYZING && <AnalyzingView />}
      {step === AnalysisStep.RESULTS && analysisResult && <ResultsView 
        result={analysisResult}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onReset={handleReset}
        onOptimize={handleOptimizeResume}
      />}
      {step === AnalysisStep.OPTIMIZED && optimizedResume && <OptimizedResumeView
        optimizedResume={optimizedResume}
        onBack={() => setStep(AnalysisStep.RESULTS)}
        onReset={handleReset}
      />}
    </div>
  );
}

// Component for the upload form
function ResumeUploadForm({ 
  resumeFile, 
  fileInputRef,
  handleFileChange, 
  resetFileInput,
  selectedResume, 
  userResumes,
  handleResumeSelect,
  loadingResumes,
  handleStartAnalysis 
}: { 
  resumeFile: File | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resetFileInput: () => void;
  selectedResume: Resume | null;
  userResumes: Resume[];
  handleResumeSelect: (resumeId: string) => void;
  loadingResumes: boolean;
  handleStartAnalysis: () => void;
}) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Resume Enhancement</h1>
        <p className="text-gray-600">
          Upload your resume for a comprehensive analysis and receive personalized recommendations to improve it.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Upload Your Resume</CardTitle>
          <CardDescription>
            We'll analyze your resume for ATS compatibility, content quality, and structure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stored Resumes Section */}
          {userResumes.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="stored-resume">Select from your saved resumes</Label>
              <div className="relative">
                <select
                  id="stored-resume"
                  value={selectedResume?.id || ""}
                  onChange={(e) => handleResumeSelect(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 appearance-none"
                  disabled={loadingResumes}
                >
                  <option value="">Select a saved resume</option>
                  {userResumes.map((resume) => (
                    <option key={resume.id} value={resume.id}>
                      {resume.title} {resume.is_primary ? "(Primary)" : ""}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {loadingResumes && (
                <div className="text-sm text-gray-500">Loading your resumes...</div>
              )}
            </div>
          )}

          {userResumes.length > 0 && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  OR
                </span>
              </div>
            </div>
          )}
          
          {/* Upload Resume File */}
          <div className="space-y-2">
            <Label htmlFor="resume-upload">Upload a new resume</Label>
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
                    onClick={resetFileInput}
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
                    htmlFor="resume-upload"
                    className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="resume-upload"
                      name="resume-upload"
                      type="file"
                      className="sr-only"
                        ref={fileInputRef}
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
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleStartAnalysis} disabled={!resumeFile && !selectedResume}>
            Analyze Resume
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Component for the optimized resume view
function OptimizedResumeView({ 
  optimizedResume, 
  onBack, 
  onReset 
}: { 
  optimizedResume: OptimizedResumeResult;
  onBack: () => void;
  onReset: () => void;
}) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Optimized Resume</h1>
        <p className="text-gray-600">
          Your resume has been professionally enhanced based on our analysis.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Improved Resume</CardTitle>
          <CardDescription>
            Estimated improvement: +{optimizedResume.improvementScore} points
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-white border rounded-lg shadow-sm">
            <div className="prose max-w-none">
              <ReactMarkdown>{optimizedResume.markdown}</ReactMarkdown>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="w-full bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Changes Made:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
              {optimizedResume.changesSummary.map((change, index) => (
                <li key={index}>{change}</li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-end">
            <Button variant="outline" onClick={onBack}>
              Back to Analysis
          </Button>
            <Button onClick={() => {}}>
              Download Resume
            </Button>
            <Button variant="ghost" onClick={onReset}>
              Start Over
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

// Component for the analyzing state
function AnalyzingView() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh]">
      <div className="relative w-24 h-24">
        <div className="w-24 h-24 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
        <div className="w-24 h-24 rounded-full border-l-4 border-r-4 border-transparent border-t-4 border-blue-200 animate-spin absolute top-0 left-0" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
      
      <div className="mt-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Your Resume</h2>
        <div className="max-w-md mx-auto">
          <p className="text-gray-600 mb-4">
            We're analyzing your resume for ATS compatibility, content quality, and structure to provide detailed recommendations.
          </p>
          <div className="flex flex-col space-y-3">
            <div className="flex items-center">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm text-gray-600">Extracting resume content</span>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center animate-pulse mr-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-sm text-gray-600">Checking ATS compatibility</span>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center mr-3">
              </div>
              <span className="text-sm text-gray-500">Analyzing content and structure</span>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center mr-3">
              </div>
              <span className="text-sm text-gray-500">Generating recommendations</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Component for the results view
function ResultsView({ 
  result, 
  activeTab,
  setActiveTab,
  onReset,
  onOptimize
}: { 
  result: ResumeAnalysisResult;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onReset: () => void;
  onOptimize: () => void;
}) {
  // Create a type-safe accessor for section analysis
  const getSectionAnalysis = (sectionName: string): any => {
    if (result.sectionAnalysis && result.sectionAnalysis[sectionName]) {
      return result.sectionAnalysis[sectionName];
    }
    return null;
  };
  
  const summarySection = getSectionAnalysis('summary');
  const experienceSection = getSectionAnalysis('experience');
  
  return (
    <div className="pb-16">
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 py-16 px-4 mb-10 rounded-xl text-white">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h1 className="text-4xl font-bold mb-2">Resume Analysis</h1>
              <p className="text-xl text-blue-100">
                {result.jobTitle} • {result.industry} Industry
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Overall Score: {result.overallScore}%</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>ATS Score: {result.atsScore}%</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Content Score: {result.contentScore}%</span>
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
                  strokeDasharray={`${result.overallScore}, 100`}
                  strokeLinecap="round"
                />
                <text x="18" y="18" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold fill-white">
                  {result.overallScore}%
                </text>
                <text x="18" y="23" textAnchor="middle" dominantBaseline="middle" className="text-xs fill-white">
                  Overall Score
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full sm:w-auto sm:inline-grid sm:grid-cols-5 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ats">ATS Compatibility</TabsTrigger>
            <TabsTrigger value="content">Content Analysis</TabsTrigger>
            <TabsTrigger value="sections">Section Feedback</TabsTrigger>
            <TabsTrigger value="examples">Improvement Examples</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Resume Analysis Summary</CardTitle>
                <CardDescription>Here's how your resume performs across key dimensions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Score Breakdown</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <ScoreCard 
                        title="ATS Compatibility" 
                        score={result.atsScore} 
                        description="How well your resume will be parsed by Applicant Tracking Systems"
                        icon={
                          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        }
                      />
                      <ScoreCard 
                        title="Content Quality" 
                        score={result.contentScore} 
                        description="The strength and impact of your resume content"
                        icon={
                          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        }
                      />
                      <ScoreCard 
                        title="Format & Structure" 
                        score={result.formatScore} 
                        description="The organization and layout of your resume"
                        icon={
                          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        }
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-semibold mb-4">Industry Benchmark</h3>
                    {result.industryBenchmark ? (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-blue-800 mb-2">
                        <span className="font-bold">Your Resume vs. Others in {result.industry}:</span> {result.industryBenchmark.overallRanking}
                      </p>
                      <p className="text-blue-800 mb-2">
                        <span className="font-bold">Top Area for Improvement:</span> {result.industryBenchmark.topAreaForImprovement}
                      </p>
                      <p className="text-blue-800">
                        <span className="font-bold">Your Competitive Edge:</span> {result.industryBenchmark.competitiveEdge}
                      </p>
                    </div>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-lg text-gray-600">
                        <p>Industry benchmark data is not available.</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-semibold mb-4">Keywords Analysis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Matched Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.keywordMatch?.matched?.map((keyword: string, index: number) => (
                            <div key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                              {keyword}
                            </div>
                          )) || <div className="text-gray-500 text-xs">No matched keywords found</div>}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Missing Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.keywordMatch?.missing?.map((keyword: string, index: number) => (
                            <div key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                              {keyword}
                            </div>
                          )) || <div className="text-gray-500 text-xs">No missing keywords found</div>}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                      <p className="font-medium">Recommendations:</p>
                      <ul className="list-disc list-inside space-y-1 mt-1">
                        {result.keywordMatch?.recommendations?.map((rec: string, index: number) => (
                          <li key={index}>{rec}</li>
                        )) || <li className="text-gray-500">No recommendations available</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="ats" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>ATS Compatibility</CardTitle>
                <CardDescription>Issues that may prevent your resume from being properly parsed by Applicant Tracking Systems</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {result.atsIssues?.map((issue: any, index: number) => (
                    <div key={index} className="border-b pb-6 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{issue.type}</h3>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          issue.impact === 'High' 
                            ? 'bg-red-100 text-red-800' 
                            : issue.impact === 'Medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}>
                          {issue.impact} Impact
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{issue.issue}</p>
                      <div className="bg-gray-50 p-3 rounded text-sm border-l-4 border-blue-500">
                        <span className="font-medium">Solution:</span> {issue.solution}
                      </div>
                    </div>
                  ))}
                  {(!result.atsIssues || result.atsIssues.length === 0) && (
                    <div className="text-center py-10">
                      <p className="text-gray-500">No ATS issues detected.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="content" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Content Analysis</CardTitle>
                <CardDescription>Issues with the language and impact of your resume content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {result.contentIssues?.map((issue: any, index: number) => (
                    <div key={index} className="border-b pb-6 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{issue.type}</h3>
                        <span className="text-xs font-medium px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                          {issue.instances} Instances Found
                        </span>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Examples Found:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                          {issue.examples?.map((example: string, i: number) => (
                            <li key={i}><span className="text-red-500 font-mono">{example}</span></li>
                          )) || <li className="text-gray-500">No examples available</li>}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Recommendations:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                          {issue.recommendations?.map((rec: string, i: number) => (
                            <li key={i}>{rec}</li>
                          )) || <li className="text-gray-500">No recommendations available</li>}
                        </ul>
                      </div>
                    </div>
                  ))}
                  {(!result.contentIssues || result.contentIssues.length === 0) && (
                    <div className="text-center py-10">
                      <p className="text-gray-500">No content issues detected.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="sections" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Section-by-Section Feedback</h2>
              <div className="space-y-6">
                {result.sectionAnalysis && Object.entries(result.sectionAnalysis).map(([key, section]: [string, any]) => (
                  <Card key={key} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className={`px-6 py-4 border-b flex justify-between items-center ${
                        section.score >= 85 ? 'bg-green-50 border-green-100' :
                        section.score >= 70 ? 'bg-yellow-50 border-yellow-100' :
                        'bg-red-50 border-red-100'
                      }`}>
                        <h3 className="font-semibold text-gray-900 capitalize">{key}</h3>
                        <div className="flex items-center">
                          <span className={`text-sm font-medium mr-2 ${
                            section.score >= 85 ? 'text-green-700' :
                            section.score >= 70 ? 'text-yellow-700' :
                            'text-red-700'
                          }`}>
                            Score: {section.score}%
                          </span>
                          <div className="w-12 h-12 relative">
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
                                stroke={
                                  section.score >= 85 ? '#10b981' :
                                  section.score >= 70 ? '#f59e0b' :
                                  '#ef4444'
                                }
                                strokeWidth="3"
                                strokeDasharray={`${section.score}, 100`}
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <p className="text-gray-700 mb-4">{section.feedback}</p>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Suggestions:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                          {section.suggestions && section.suggestions.map((suggestion: string, index: number) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                          {(!section.suggestions || section.suggestions.length === 0) && 
                            <li className="text-gray-500">No suggestions available</li>
                          }
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {(!result.sectionAnalysis || Object.keys(result.sectionAnalysis).length === 0) && (
                  <div className="text-center py-10">
                    <p className="text-gray-500">No section information available.</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="examples" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Before & After Examples</CardTitle>
                <CardDescription>See how you can transform your resume content for greater impact</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {summarySection?.beforeExample && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">Professional Summary</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="text-sm font-medium text-gray-500 mb-2">Before:</div>
                          <div className="text-gray-700">{summarySection.beforeExample}</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <div className="text-sm font-medium text-green-600 mb-2">After:</div>
                          <div className="text-gray-700">{summarySection.afterExample}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {experienceSection?.bulletPoints && (
                    <div className="space-y-4 pt-6 border-t">
                      <h3 className="font-semibold text-gray-900">Work Experience Bullet Points</h3>
                      <div className="space-y-6">
                        {experienceSection.bulletPoints.map((bullet: any, index: number) => (
                          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                              <div className="text-sm font-medium text-gray-500 mb-2">Before:</div>
                              <div className="text-gray-700">{bullet.before}</div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                              <div className="text-sm font-medium text-green-600 mb-2">After:</div>
                              <div className="text-gray-700">{bullet.after}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" size="lg" className="gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Download Report
          </Button>
          <Button size="lg" className="gap-2" onClick={onOptimize}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Get Enhanced Resume
          </Button>
          <Button variant="ghost" size="lg" onClick={onReset} className="gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Analyze New Resume
          </Button>
        </div>
      </div>
    </div>
  );
}

// Component for score display cards
function ScoreCard({ 
  title, 
  score, 
  description,
  icon
}: { 
  title: string;
  score: number;
  description: string;
  icon: React.ReactNode;
}) {
  // Define color based on score
  const getColor = () => {
    if (score >= 85) return 'green';
    if (score >= 70) return 'yellow';
    return 'red';
  };
  
  const color = getColor();
  
  return (
    <div className={`bg-${color}-50 p-4 rounded-lg border border-${color}-100`}>
      <div className="flex items-start">
        <div className={`p-2 rounded-full bg-${color}-100 text-${color}-700 mr-3`}>
          {icon}
        </div>
        <div>
          <h4 className="font-medium text-gray-900">{title}</h4>
          <div className="flex items-center mt-1 mb-2">
            <div className={`text-${color}-700 font-bold text-lg mr-2`}>{score}%</div>
            <div className={`w-full h-2 bg-gray-200 rounded-full overflow-hidden flex-1`}>
              <div 
                className={`h-full bg-${color}-500 rounded-full`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
} 