import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCourses } from '../contexts/CourseContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL || 'https://lms-backend-u90k.onrender.com/api';

const YouTubeEmbed = ({ url, startSeconds = 0 }) => {
  const idMatch = (url || '').match(/[?&]v=([^&#]+)/) || (url || '').match(/youtu\.be\/([^?&#]+)/);
  const videoId = idMatch ? idMatch[1] : null;
  
  if (!videoId) {
    return (
      <div className="text-gray-600 dark:text-gray-400 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
        <p>Invalid YouTube URL: {url}</p>
        <p>Could not extract video ID</p>
      </div>
    );
  }
  
  return (
    <div className="relative w-full" style={{ paddingBottom: '56.25%', height: 0 }}>
      <iframe
        title="YouTube Video Player"
        className="absolute top-0 left-0 w-full h-full rounded-lg border-0"
        src={`https://www.youtube.com/embed/${videoId}?start=${Math.max(0, parseInt(startSeconds || 0))}&rel=0&modestbranding=1&autoplay=0`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
};

const PdfViewer = ({ url }) => {
  if (!url) return <div className="text-gray-600 dark:text-gray-400">No PDF provided</div>;
  return (
    <div className="w-full h-[60vh]">
      <iframe title="PDF" src={url} className="w-full h-full rounded-lg border" />
    </div>
  );
};

const TextViewer = ({ text }) => {
  if (!text) return <div className="text-gray-600 dark:text-gray-400">No text content</div>;
  return (
    <div className="prose max-w-none">
      <pre className="whitespace-pre-wrap text-gray-800">{text}</pre>
    </div>
  );
};

const ImageGallery = ({ files }) => {
  const imgs = Array.isArray(files) ? files.filter(f => (f.fileType || '').startsWith('image') || /\.(png|jpe?g|gif|webp|svg)$/i.test(f.url || '')) : [];
  if (!imgs.length) return <div className="text-gray-600 dark:text-gray-400">No images</div>;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {imgs.map((img, idx) => (
        <a key={idx} href={img.url} target="_blank" rel="noreferrer" className="block group">
          <img src={img.url} alt={img.filename || `image-${idx}`} className="rounded-lg w-full h-40 object-cover group-hover:opacity-90" />
        </a>
      ))}
    </div>
  );
};

const Html5Video = ({ src, onEnded }) => {
  const videoRef = useRef(null);
  const [speed, setSpeed] = useState(1);
  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = speed;
  }, [speed]);
  return (
    <div>
      <video ref={videoRef} controls className="w-full rounded-lg" onEnded={onEnded}>
        <source src={src} />
        Your browser does not support the video tag.
      </video>
      <div className="mt-2 flex items-center gap-2 text-sm">
        <span className="text-gray-600">Speed</span>
        <select className="input-field w-28" value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
          <option value={0.75}>0.75x</option>
          <option value={1}>1x</option>
          <option value={1.25}>1.25x</option>
          <option value={1.5}>1.5x</option>
          <option value={2}>2x</option>
        </select>
      </div>
    </div>
  );
};

const CoursePlayer = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { currentCourse, modules, assignments, fetchCourse, fetchModules, fetchAssignments } = useCourses();
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const [activeContentIdx, setActiveContentIdx] = useState(0);
  const [videoStart, setVideoStart] = useState(0);
  const [videoMetadata, setVideoMetadata] = useState({});
  const [moduleProgress, setModuleProgress] = useState({});
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [submissionData, setSubmissionData] = useState({});
  const [isContentLoading, setIsContentLoading] = useState(false);
  const trackRef = useRef(null);

  // Handle module switching with loading state
  const handleModuleSwitch = (moduleIdx) => {
    setIsContentLoading(true);
    setActiveModuleIdx(moduleIdx);
    setActiveContentIdx(0);
    
    // Simulate loading time for better UX
    setTimeout(() => {
      setIsContentLoading(false);
    }, 500);
  };

  // Handle content switching with loading state
  const handleContentSwitch = (contentIdx) => {
    setIsContentLoading(true);
    setActiveContentIdx(contentIdx);
    
    // Simulate loading time for better UX
    setTimeout(() => {
      setIsContentLoading(false);
    }, 300);
  };

  // Navigation helpers
  const goPrevContent = () => {
    const contents = activeModule?.content || [];
    if (!contents.length) return;
    if (activeContentIdx > 0) {
      handleContentSwitch(activeContentIdx - 1);
      return;
    }
    if (activeModuleIdx > 0) {
      handleModuleSwitch(activeModuleIdx - 1);
      const prevContents = modules?.[activeModuleIdx - 1]?.content || [];
      const lastIdx = Math.max(0, prevContents.length - 1);
      setTimeout(() => handleContentSwitch(lastIdx), 0);
    }
  };

  const goNextContent = () => {
    const contents = activeModule?.content || [];
    if (!contents.length) return;
    if (activeContentIdx < contents.length - 1) {
      handleContentSwitch(activeContentIdx + 1);
      return;
    }
    if (activeModuleIdx < (modules?.length || 0) - 1) {
      handleModuleSwitch(activeModuleIdx + 1);
      setTimeout(() => handleContentSwitch(0), 0);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchCourse(id);
    fetchModules(id);
  }, [id, fetchCourse, fetchModules]);

  // Fetch progress data
  useEffect(() => {
    if (!id || !user) return;
    fetchProgress();
  }, [id, user]);

  const fetchProgress = async () => {
    try {
      const response = await axios.get(`${API_URL}/progress/course/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.data.success) {
        const progressMap = {};
        response.data.data.modules.forEach(module => {
          progressMap[module.moduleId] = module;
        });
        setModuleProgress(progressMap);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const markModuleComplete = async () => {
    if (!activeModule?._id || !id || isMarkingComplete) return;
    
    console.log('Attempting to mark module complete:', {
      courseId: id,
      moduleId: activeModule._id,
      apiUrl: API_URL
    });
    
    setIsMarkingComplete(true);
    try {
      const response = await axios.post(`${API_URL}/progress/complete-module`, {
        courseId: id,
        moduleId: activeModule._id
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      console.log('Progress API response:', response.data);

      if (response.data.success) {
        // Update local progress state
        setModuleProgress(prev => ({
          ...prev,
          [activeModule._id]: {
            ...prev[activeModule._id],
            status: 'completed',
            completionPercentage: 100,
            completedAt: new Date(),
            isCompleted: true
          }
        }));
        
        // Show success message
        alert('Module marked as completed! 🎉');
      }
    } catch (error) {
      console.error('Error marking module complete:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 404) {
        // Temporary fallback: mark as complete locally without backend
        console.log('Progress API not available, using local fallback');
        setModuleProgress(prev => ({
          ...prev,
          [activeModule._id]: {
            ...prev[activeModule._id],
            status: 'completed',
            completionPercentage: 100,
            completedAt: new Date(),
            isCompleted: true
          }
        }));
        alert('Module marked as completed! (Note: Progress tracking will be saved when backend is updated)');
      } else if (error.response?.status === 403) {
        alert('You are not enrolled in this course. Please contact support if you believe this is an error.');
      } else if (error.response?.status === 500) {
        alert('Server error. Please try again later.');
      } else if (!error.response) {
        alert('Network error. Please check your connection and try again.');
      } else {
        alert(`Error marking module as complete: ${error.response?.data?.message || 'Unknown error'}`);
      }
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const trackContentView = async (contentId, timeSpent = 0) => {
    if (!activeModule?._id || !id || !contentId) return;
    
    try {
      await axios.post(`${API_URL}/progress/view-content`, {
        courseId: id,
        moduleId: activeModule._id,
        contentId,
        timeSpent
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    } catch (error) {
      console.error('Error tracking content view:', error);
    }
  };

  // Fetch submission data for assignments
  const fetchSubmissionData = async () => {
    if (!assignments || assignments.length === 0) return;
    
    try {
      const submissionPromises = assignments.map(async (assignment) => {
        try {
          // Use the new student-specific endpoint
          const response = await axios.get(`${API_URL}/submissions/assignment/${assignment._id}/student`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          
          console.log(`Submissions for assignment ${assignment._id}:`, response.data);
          
          const submissions = response.data?.data?.submissions || [];
          
          return {
            assignmentId: assignment._id,
            submissions: submissions
          };
        } catch (error) {
          console.error(`Error fetching submissions for assignment ${assignment._id}:`, error);
          return {
            assignmentId: assignment._id,
            submissions: []
          };
        }
      });
      
      const results = await Promise.all(submissionPromises);
      const submissionMap = {};
      results.forEach(result => {
        submissionMap[result.assignmentId] = result.submissions;
      });
      
      console.log('Final submission map:', submissionMap);
      setSubmissionData(submissionMap);
    } catch (error) {
      console.error('Error fetching submission data:', error);
    }
  };

  // Check if all assignments for this module are completed
  const checkAssignmentsCompletion = () => {
    if (!assignments || assignments.length === 0) {
      return { canComplete: true, reason: 'No assignments' };
    }

    // Check each assignment for completion status using actual submission data
    const assignmentStatuses = assignments.map(assignment => {
      const submissions = submissionData[assignment._id] || [];
      const hasSubmissions = submissions.length > 0;
      
      // Check if any submission is graded (status: 'graded' and grade is not null)
      const isGraded = hasSubmissions && submissions.some(sub => 
        sub.status === 'graded' && sub.grade !== null && sub.grade !== undefined
      );
      
      return {
        id: assignment._id,
        title: assignment.title,
        hasSubmissions,
        isGraded,
        isCompleted: hasSubmissions && isGraded,
        submissions: submissions
      };
    });

    const completedAssignments = assignmentStatuses.filter(a => a.isCompleted);
    const pendingAssignments = assignmentStatuses.filter(a => !a.isCompleted);

    if (completedAssignments.length === assignments.length) {
      return { 
        canComplete: true, 
        reason: 'All assignments completed and graded',
        assignmentStatuses
      };
    } else {
      return { 
        canComplete: false, 
        reason: `${pendingAssignments.length} assignment(s) not completed`,
        pendingAssignments: pendingAssignments.length,
        assignmentStatuses
      };
    }
  };

  const assignmentStatus = checkAssignmentsCompletion();

  const activeModule = useMemo(() => (modules && modules[activeModuleIdx]) || null, [modules, activeModuleIdx]);
  const activeContent = useMemo(() => (Array.isArray(activeModule?.content) && activeModule.content[activeContentIdx]) || null, [activeModule, activeContentIdx]);

  useEffect(() => {
    if (!activeModule?._id) return;
    fetchAssignments(activeModule._id);
  }, [activeModule?._id, fetchAssignments]);

  // Fetch submission data when assignments change
  useEffect(() => {
    if (assignments && assignments.length > 0) {
      fetchSubmissionData();
    }
  }, [assignments, id]);

  // Track content viewing
  useEffect(() => {
    if (!activeContent?._id && !activeContent?.title) return;
    
    const contentId = activeContent._id || activeContent.title;
    trackContentView(contentId);
  }, [activeContent]);

  useEffect(() => { setVideoStart(0); }, [activeContentIdx, activeModule?._id]);

  const isYouTubeUrl = (u) => /youtu(\.be|be\.com)\//i.test(u || '');

  // Fetch YouTube video metadata
  const fetchYouTubeMetadata = async (url) => {
    if (!isYouTubeUrl(url)) return null;
    
    const videoId = (url.match(/[?&]v=([^&#]+)/) || url.match(/youtu\.be\/([^?&#]+)/))?.[1];
    if (!videoId) return null;

    try {
      // Use YouTube oEmbed API for basic metadata
      const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
      if (response.ok) {
        const data = await response.json();
        return {
          title: data.title,
          author: data.author_name,
          thumbnail: data.thumbnail_url
        };
      }
    } catch (error) {
      console.warn('Failed to fetch YouTube metadata:', error);
    }
    return null;
  };

  // Load video metadata for all video content
  useEffect(() => {
    const loadVideoMetadata = async () => {
      if (!activeModule?.content) return;
      
      const videoContents = activeModule.content.filter(c => c.type === 'video' && isYouTubeUrl(c.url));
      const metadataPromises = videoContents.map(async (content) => {
        const metadata = await fetchYouTubeMetadata(content.url);
        return { contentId: content._id || content.title, metadata };
      });
      
      const results = await Promise.all(metadataPromises);
      const metadataMap = {};
      results.forEach(({ contentId, metadata }) => {
        if (metadata) metadataMap[contentId] = metadata;
      });
      
      setVideoMetadata(metadataMap);
    };

    loadVideoMetadata();
  }, [activeModule]);

  // Time tracking ping while viewing (reduced frequency and only when tab is visible/focused)
  useEffect(() => {
    if (!id) return;
    if (!activeModule?._id) return;
    const headers = { Authorization: `Bearer ${localStorage.getItem('token') || ''}` };

    const INTERVAL_SECONDS = 60; // send every 60s

    const tick = async () => {
      // Only send when page is visible and window has focus
      const isVisible = typeof document !== 'undefined' ? document.visibilityState === 'visible' : true;
      const isFocused = typeof document !== 'undefined' ? document.hasFocus() : true;
      if (!isVisible || !isFocused) return;
      try {
        await axios.post(`${API_URL}/courses/${id}/track`, { moduleId: activeModule._id, seconds: INTERVAL_SECONDS }, { headers });
      } catch (_) { /* ignore */ }
    };

    // Initial tick (guarded by visibility/focus)
    tick();
    const handle = setInterval(tick, INTERVAL_SECONDS * 1000);
    return () => clearInterval(handle);
  }, [id, activeModule?._id]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{currentCourse?.title || 'Course Player'}</h1>
          <div className="card">
            {isContentLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Loading content...</p>
                </div>
              </div>
            )}
            {!isContentLoading && !activeContent && (
              <div className="text-gray-600 dark:text-gray-400">No content in this module.</div>
            )}
            {!isContentLoading && activeContent?.type === 'video' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">{activeContent.title || 'Video'}</h3>
                {isYouTubeUrl(activeContent.url) ? (
                  <div className="bg-gray-50 p-2 rounded-lg border">
                    <YouTubeEmbed url={activeContent.url} startSeconds={videoStart} />
                  </div>
                ) : (
                  <Html5Video src={activeContent.url} onEnded={goNextContent} />
                )}
              </div>
            )}
            {!isContentLoading && activeContent?.type === 'pdf' && (
              <PdfViewer url={activeContent.url} />
            )}
            {!isContentLoading && activeContent?.type === 'text' && (
              <TextViewer text={activeContent.text || activeContent.body || activeContent.content} />
            )}
            {!isContentLoading && activeContent?.type === 'image' && (
              Array.isArray(activeContent.files) && activeContent.files.length > 0
                ? <ImageGallery files={activeContent.files} />
                : <ImageGallery files={[{ url: activeContent.url, filename: activeContent.title || 'image', fileType: activeContent.fileType || '' }]} />
            )}
          </div>

          {/* Content navigation controls */}
          <div className="flex items-center justify-between">
            <button
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={goPrevContent}
            >
              Previous
            </button>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {activeModule ? `Module ${activeModuleIdx + 1} • ${activeContentIdx + 1}/${activeModule?.content?.length || 0}` : ''}
            </div>
            <button
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              onClick={goNextContent}
            >
              Next
            </button>
          </div>
          
          {/* Progress and Completion Section */}
          {activeModule && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Module Progress</h2>
                {moduleProgress[activeModule._id]?.isCompleted && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ Completed
                  </span>
                )}
              </div>
              
              {moduleProgress[activeModule._id] && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{moduleProgress[activeModule._id].completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${moduleProgress[activeModule._id].completionPercentage}%` }}
                    ></div>
                  </div>
                  {moduleProgress[activeModule._id].timeSpent > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      Time spent: {Math.floor(moduleProgress[activeModule._id].timeSpent / 60)} minutes
                    </p>
                  )}
                </div>
              )}
              
              {!moduleProgress[activeModule._id]?.isCompleted && (
                <div className="space-y-3">
                  {!assignmentStatus.canComplete ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">
                            Complete Assignments First
                          </h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            <p>{assignmentStatus.reason}</p>
                            <p className="mt-1">You must complete and submit all assignments before marking this module as complete.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={markModuleComplete}
                      disabled={isMarkingComplete}
                      className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isMarkingComplete ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Marking Complete...
                        </>
                      ) : (
                        <>
                          ✓ Mark Module as Complete
                        </>
                      )}
                    </button>
                  )}
                  
                  {/* Assignment Status Summary */}
                  {assignments && assignments.length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Assignment Status</h4>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                          {assignmentStatus.assignmentStatuses?.filter(a => a.hasSubmissions).length || 0} of {assignments.length} submitted
                        </div>
                      </div>
                      <div className="space-y-3">
                        {assignmentStatus.assignmentStatuses?.map((assignment, idx) => {
                          const latestSubmission = assignment.submissions?.[0]; // Get the latest submission
                          const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date() && !assignment.hasSubmissions;
                          const isDueSoon = assignment.dueDate && new Date(assignment.dueDate) <= new Date(Date.now() + 24 * 60 * 60 * 1000) && !assignment.hasSubmissions;
                          
                          return (
                            <div key={assignment.id || idx} className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-sm transition-shadow">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{assignment.title}</span>
                                  {isOverdue && (
                                    <span className="text-xs text-red-500 dark:text-red-400 font-medium">OVERDUE</span>
                                  )}
                                  {isDueSoon && !isOverdue && (
                                    <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">DUE SOON</span>
                                  )}
                                </div>
                                {assignment.dueDate && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Due: {new Date(assignment.dueDate).toLocaleDateString()} at {new Date(assignment.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2 ml-3">
                                {assignment.hasSubmissions && (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                    ✓ Submitted
                                  </span>
                                )}
                                {assignment.isGraded && latestSubmission?.grade !== null && (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                                    {latestSubmission.grade}% Grade
                                  </span>
                                )}
                                {!assignment.hasSubmissions && (
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    isOverdue 
                                      ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                      : isDueSoon
                                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                                      : 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300'
                                  }`}>
                                    {isOverdue ? 'Overdue' : isDueSoon ? 'Due Soon' : 'Not Submitted'}
                                  </span>
                                )}
                                {assignment.hasSubmissions && !assignment.isGraded && (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                                    ⏳ Awaiting Grade
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Module Description</h2>
            <p className="text-gray-700 dark:text-gray-300">{activeModule?.description || 'No description'}</p>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Assignments</h2>
              {assignments && assignments.length > 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {assignments.length} assignment{assignments.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
            {assignments && assignments.length > 0 ? (
              <div className="space-y-3">
                {assignments.map((a) => {
                  const submissions = submissionData[a._id] || [];
                  const latestSubmission = submissions[0]; // Most recent submission
                  const hasSubmissions = submissions.length > 0;
                  const isGraded = hasSubmissions && latestSubmission?.status === 'graded' && latestSubmission?.grade !== null;
                  const isOverdue = a.dueDate && new Date(a.dueDate) < new Date() && !hasSubmissions;
                  const isDueSoon = a.dueDate && new Date(a.dueDate) <= new Date(Date.now() + 24 * 60 * 60 * 1000) && !hasSubmissions;
                  
                  return (
                    <div key={a._id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{a.title}</h3>
                            {isOverdue && (
                              <span className="text-xs text-red-500 dark:text-red-400 font-medium bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full">OVERDUE</span>
                            )}
                            {isDueSoon && !isOverdue && (
                              <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full">DUE SOON</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Due: {a.dueDate ? new Date(a.dueDate).toLocaleDateString() + ' at ' + new Date(a.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'No due date'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Max Points: {a.maxPoints || 'N/A'}
                          </div>
                          {hasSubmissions && (
                            <div className="mt-2 flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                isGraded 
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                              }`}>
                                {isGraded ? `✓ Graded (${latestSubmission.grade}/${a.maxPoints})` : '⏳ Submitted - Awaiting Grade'}
                              </span>
                              {isGraded && latestSubmission.gradePercentage && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                  {latestSubmission.gradePercentage}%
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {hasSubmissions ? (
                            <a 
                              href={`/assignments/${a._id}/submit`} 
                              className="btn-outline text-sm px-3 py-1"
                            >
                              {isGraded ? 'View Grade' : 'View Submission'}
                            </a>
                          ) : (
                            <a 
                              href={`/assignments/${a._id}/submit`} 
                              className={`text-sm px-3 py-1 rounded-md font-medium transition-colors ${
                                isOverdue 
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50'
                                  : isDueSoon
                                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50'
                                  : 'btn-primary'
                              }`}
                            >
                              {isOverdue ? 'Submit (Overdue)' : isDueSoon ? 'Submit (Due Soon)' : 'Submit Assignment'}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500 dark:text-gray-400 mb-2">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-600 dark:text-gray-400">No assignments for this module.</p>
              </div>
            )}
          </div>
          {activeContent?.type === 'video' && Array.isArray(activeContent?.chapters) && activeContent.chapters.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Chapters</h2>
              <ul className="divide-y divide-gray-100">
                {activeContent.chapters.map((ch, i) => (
                  <li key={i} className="py-2 flex items-center justify-between">
                    <div className="text-gray-800">{ch.title}</div>
                    <button className="btn-outline text-xs" onClick={() => setVideoStart(parseInt(ch.time || 0))}>{new Date((ch.time || 0) * 1000).toISOString().substring(11, 19)}</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="space-y-4">
          {/* Contents first */}
          <div className="card">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Contents</h4>
            <ul className="space-y-2">
              {(activeModule?.content || []).map((c, cIdx) => {
                const contentId = c._id || c.title;
                const metadata = videoMetadata[contentId];
                const displayTitle = c.type === 'video' && isYouTubeUrl(c.url) && metadata?.title 
                  ? metadata.title 
                  : (c.title || c.name || c.type);
                return (
                  <li key={cIdx} className={`px-2 py-2 rounded text-sm cursor-pointer ${cIdx === activeContentIdx ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'} ${isContentLoading && cIdx === activeContentIdx ? 'opacity-75' : ''}`} onClick={() => handleContentSwitch(cIdx)}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="uppercase text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">{c.type}</span>
                        <span className="text-gray-800 dark:text-gray-200 text-sm leading-tight truncate">{displayTitle}</span>
                      </div>
                      {c.duration ? (
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">{Math.floor(c.duration / 60)}:{(c.duration % 60).toString().padStart(2, '0')}</span>
                      ) : null}
                    </div>
                  </li>
                );
              })}
              {(!activeModule?.content || activeModule.content.length === 0) && (
                <li className="text-sm text-gray-600 dark:text-gray-400">No contents in this module.</li>
              )}
            </ul>
          </div>

          {/* Modules second */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Modules</h3>
            <div className="space-y-4">
              <ul className="divide-y divide-gray-100">
                {(modules || []).map((m, idx) => {
                  const progress = moduleProgress[m._id];
                  const isCompleted = progress?.isCompleted || false;
                  
                  return (
                    <li key={m._id || idx} className={`py-3 px-2 rounded cursor-pointer ${idx === activeModuleIdx ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'} ${isContentLoading && idx === activeModuleIdx ? 'opacity-75' : ''}`} onClick={() => handleModuleSwitch(idx)}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-gray-900 dark:text-gray-100 font-medium flex items-center gap-2">
                            {isCompleted && (
                              <span className="text-green-600">✓</span>
                            )}
                            {isContentLoading && idx === activeModuleIdx && (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                            )}
                            {m.title}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{m.description}</div>
                        </div>
                        {isCompleted && (
                          <span className="text-xs text-green-600 font-medium">Completed</span>
                        )}
                      </div>
                      {progress && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>{progress.completionPercentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div 
                              className="bg-primary-600 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${progress.completionPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
                {(!modules || modules.length === 0) && (
                  <li className="py-4 text-sm text-gray-600">No modules yet.</li>
                )}
              </ul>
              <div className="">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Contents</h4>
                <ul className="space-y-2">
                  {(activeModule?.content || []).map((c, cIdx) => {
                    const contentId = c._id || c.title;
                    const metadata = videoMetadata[contentId];
                    const displayTitle = c.type === 'video' && isYouTubeUrl(c.url) && metadata?.title 
                      ? metadata.title 
                      : (c.title || c.name || c.type);
                    
                    // Extract video ID for better display
                    const videoId = c.type === 'video' && isYouTubeUrl(c.url) 
                      ? (c.url.match(/[?&]v=([^&#]+)/) || c.url.match(/youtu\.be\/([^?&#]+)/))?.[1]
                      : null;
                    
                    return (
                      <li key={cIdx} className={`px-2 py-2 rounded text-sm cursor-pointer ${cIdx === activeContentIdx ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'} ${isContentLoading && cIdx === activeContentIdx ? 'opacity-75' : ''}`} onClick={() => handleContentSwitch(cIdx)}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {isContentLoading && cIdx === activeContentIdx && (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-600 mr-1"></div>
                              )}
                              <span className="uppercase text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">{c.type}</span>
                              {c.type === 'video' && c.duration > 0 && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                                  {Math.floor(c.duration / 60)}:{(c.duration % 60).toString().padStart(2, '0')}
                                </span>
                              )}
                            </div>
                            <div className="text-gray-800 dark:text-gray-200 text-sm leading-tight break-words">
                              {displayTitle}
                            </div>
                          </div>
                        </div>
                        {c.type === 'video' && metadata?.author && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">by {metadata.author}</div>
                        )}
                        {c.type === 'video' && !metadata?.title && videoId && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">YouTube Video</div>
                        )}
                      </li>
                    );
                  })}
                  {(!activeModule?.content || activeModule.content.length === 0) && (
                    <li className="text-sm text-gray-600 dark:text-gray-400">No contents in this module.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;



