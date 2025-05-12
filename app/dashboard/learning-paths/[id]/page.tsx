'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { learningPathsApi } from '@/lib/api';
import { LearningPath } from '@/lib/models/learning-path';
import { hasToken } from '@/lib/auth';

export default function LearningPathDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication on component mount
  useEffect(() => {
    if (!hasToken()) {
      router.push('/login');
    }
  }, [router]);

  // Fetch the learning path
  useEffect(() => {
    const fetchLearningPath = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Check authentication first
        if (!hasToken()) {
          router.push('/login');
          return;
        }
        
        const pathId = Array.isArray(id) ? id[0] : id;
        const path = await learningPathsApi.getPathById(pathId);
        setLearningPath(path);
      } catch (err) {
        console.error("Failed to fetch learning path:", err);
        
        // Check for authentication error
        if (err instanceof Error && err.message.includes('401')) {
          setError("Your session has expired. Please log in again.");
          router.push('/login');
          return;
        }
        
        setError("Failed to load learning path. It may have been deleted or you don't have permission to view it.");
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchLearningPath();
    }
  }, [id, isAuthenticated, router]);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Your Learning Path</h2>
        <p className="text-gray-600 text-center max-w-md">
          We're retrieving your personalized learning journey...
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Error Loading Learning Path</h2>
        <p className="text-gray-600 text-center max-w-md mb-6">
          {error}
        </p>
        <Button>
          <Link href="/dashboard/learning-paths">Browse Learning Paths</Link>
        </Button>
      </div>
    );
  }

  // Not found state
  if (!learningPath) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Learning Path Not Found</h2>
        <p className="text-gray-600 text-center max-w-md mb-6">
          We couldn't find the learning path you're looking for. It may have been deleted or you don't have permission to view it.
        </p>
        <Button>
          <Link href="/dashboard/learning-paths">Browse Learning Paths</Link>
        </Button>
      </div>
    );
  }

  // Render learning path
  return (
    <div className="pb-16">
      <div className="flex justify-between items-center mb-6">
        <Link href="/dashboard/learning-paths">
          <Button variant="outline" className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Paths
          </Button>
        </Link>
      </div>

      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 py-16 px-4 mb-10 rounded-xl text-white">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center mb-6">
            <div className="text-5xl bg-white/20 p-5 rounded-full backdrop-blur-sm mb-4 md:mb-0 md:mr-6">
              {learningPath.niche[0]}
            </div>
            <div>
              <h1 className="text-4xl font-bold">{learningPath.title}</h1>
              <p className="text-blue-100 mt-1 text-xl">Your Personalized Learning Journey</p>
            </div>
          </div>
          <p className="text-xl text-blue-50">{learningPath.description}</p>
          
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span>Timeframe: {learningPath.estimatedTime}</span>
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
            {learningPath.modules.map((module, index) => (
              <a 
                key={module.id}
                href={`#module-${module.id}`}
                className="flex-shrink-0 px-6 py-4 font-medium hover:bg-gray-50 transition-colors"
              >
                <span className="flex items-center">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 mr-2 text-sm font-bold">
                    {index + 1}
                  </span>
                  {module.title}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Path Content */}
        <div className="space-y-12">
          {learningPath.modules.map((module, index) => (
            <div key={module.id} id={`module-${module.id}`} className="scroll-mt-32">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 mr-3 font-bold">
                  {index + 1}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{module.title}</h2>
              </div>
              <p className="text-gray-700 mb-4 max-w-3xl">{module.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Difficulty</h4>
                  <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-md">{module.difficulty}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Time Commitment</h4>
                  <p className="text-gray-600 text-sm bg-blue-50 p-3 rounded-md flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {module.timeline}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {module.topics.map((topic, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Tips</h4>
                <p className="text-gray-600 text-sm bg-yellow-50 p-3 rounded-md">
                  {module.tips}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Recommended Resources</h4>
                <div className="space-y-2">
                  {module.resources.map((resource, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-md p-3">
                      <div className="flex items-center">
                        <span className="text-xs font-medium text-gray-500 bg-gray-200 rounded-full px-2 py-1 mr-3">
                          {resource.type}
                        </span>
                        <a href={resource.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {resource.name}
                        </a>
                      </div>
                      {resource.rating && (
                        <div className="flex items-center">
                          <span className="text-yellow-500 mr-1">★</span>
                          <span className="text-sm">{resource.rating}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action buttons */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Begin Learning Journey
          </Button>
          <Link href="/dashboard/learning-paths">
            <Button variant="outline" size="lg" className="gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Create New Path
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 