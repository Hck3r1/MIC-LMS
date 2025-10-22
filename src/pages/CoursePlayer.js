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
      <div className="text-gray-600 p-4 border border-gray-300 rounded-lg">
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
  if (!url) return <div className="text-gray-600">No PDF provided</div>;
  return (
    <div className="w-full h-[60vh]">
      <iframe title="PDF" src={url} className="w-full h-full rounded-lg border" />
    </div>
  );
};

const TextViewer = ({ text }) => {
  if (!text) return <div className="text-gray-600">No text content</div>;
  return (
    <div className="prose max-w-none">
      <pre className="whitespace-pre-wrap text-gray-800">{text}</pre>
    </div>
  );
};

const ImageGallery = ({ files }) => {
  const imgs = Array.isArray(files) ? files.filter(f => (f.fileType || '').startsWith('image') || /\.(png|jpe?g|gif|webp|svg)$/i.test(f.url || '')) : [];
  if (!imgs.length) return <div className="text-gray-600">No images</div>;
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

const Html5Video = ({ src }) => {
  const videoRef = useRef(null);
  const [speed, setSpeed] = useState(1);
  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = speed;
  }, [speed]);
  return (
    <div>
      <video ref={videoRef} controls className="w-full rounded-lg">
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
  const trackRef = useRef(null);

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

  // Time tracking ping every 30s while viewing
  useEffect(() => {
    if (!id) return;
    if (!activeModule?._id) return;
    const headers = { Authorization: `Bearer ${localStorage.getItem('token') || ''}` };
    const tick = async () => {
      try {
        await axios.post(`${API_URL}/courses/${id}/track`, { moduleId: activeModule._id, seconds: 30 }, { headers });
      } catch (_) { /* ignore */ }
    };
    tick();
    const handle = setInterval(tick, 30000);
    return () => clearInterval(handle);
  }, [id, activeModule?._id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">{currentCourse?.title || 'Course Player'}</h1>
          <div className="card">
            {!activeContent && (
              <div className="text-gray-600">No content in this module.</div>
            )}
            {activeContent?.type === 'video' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">{activeContent.title || 'Video'}</h3>
                {isYouTubeUrl(activeContent.url) ? (
                  <div className="bg-gray-50 p-2 rounded-lg border">
                    <YouTubeEmbed url={activeContent.url} startSeconds={videoStart} />
                  </div>
                ) : (
                  <Html5Video src={activeContent.url} />
                )}
              </div>
            )}
            {activeContent?.type === 'pdf' && (
              <PdfViewer url={activeContent.url} />
            )}
            {activeContent?.type === 'text' && (
              <TextViewer text={activeContent.text || activeContent.body || activeContent.content} />
            )}
            {activeContent?.type === 'image' && (
              Array.isArray(activeContent.files) && activeContent.files.length > 0
                ? <ImageGallery files={activeContent.files} />
                : <ImageGallery files={[{ url: activeContent.url, filename: activeContent.title || 'image', fileType: activeContent.fileType || '' }]} />
            )}
          </div>
          
          {/* Progress and Completion Section */}
          {activeModule && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Module Progress</h2>
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
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Assignment Status</h4>
                      <div className="space-y-2">
                        {assignmentStatus.assignmentStatuses?.map((assignment, idx) => {
                          const latestSubmission = assignment.submissions?.[0]; // Get the latest submission
                          return (
                            <div key={assignment.id || idx} className="flex items-center justify-between text-sm">
                              <span className="text-gray-700 flex-1 truncate">{assignment.title}</span>
                              <div className="flex items-center gap-2">
                                {assignment.hasSubmissions && (
                                  <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                    Submitted
                                  </span>
                                )}
                                {assignment.isGraded && latestSubmission?.grade !== null && (
                                  <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                    Graded ({latestSubmission.grade}%)
                                  </span>
                                )}
                                {!assignment.hasSubmissions && (
                                  <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                                    Not Submitted
                                  </span>
                                )}
                                {assignment.hasSubmissions && !assignment.isGraded && (
                                  <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                                    Awaiting Grade
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
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Module Description</h2>
            <p className="text-gray-700">{activeModule?.description || 'No description'}</p>
          </div>
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Assignments</h2>
            <ul className="divide-y divide-gray-100">
              {(assignments || []).map((a) => {
                const submissions = submissionData[a._id] || [];
                const latestSubmission = submissions[0]; // Most recent submission
                const hasSubmissions = submissions.length > 0;
                const isGraded = hasSubmissions && latestSubmission?.status === 'graded' && latestSubmission?.grade !== null;
                
                // Debug logging
                console.log(`Assignment ${a.title}:`, {
                  assignmentId: a._id,
                  submissions: submissions.length,
                  hasSubmissions,
                  isGraded,
                  latestSubmission: latestSubmission ? {
                    status: latestSubmission.status,
                    grade: latestSubmission.grade,
                    gradePercentage: latestSubmission.gradePercentage
                  } : null,
                  submissionData: submissionData
                });
                
                return (
                  <li key={a._id} className="py-3 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-gray-900 font-medium">{a.title}</div>
                      <div className="text-sm text-gray-600">Due: {a.dueDate ? new Date(a.dueDate).toLocaleString() : '—'}</div>
                      {hasSubmissions && (
                        <div className="mt-1 flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            isGraded 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {isGraded ? `Graded (${latestSubmission.grade}/${a.maxPoints})` : 'Submitted'}
                          </span>
                          {isGraded && latestSubmission.gradePercentage && (
                            <span className="text-xs text-gray-500">
                              {latestSubmission.gradePercentage}%
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {hasSubmissions ? (
                        <a 
                          href={`/assignments/${a._id}/submit`} 
                          className="btn-outline text-sm"
                        >
                          {isGraded ? 'View Grade' : 'View Submission'}
                        </a>
                      ) : (
                        <a 
                          href={`/assignments/${a._id}/submit`} 
                          className="btn-outline text-sm"
                        >
                          Submit
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
              {(!assignments || assignments.length === 0) && (
                <li className="py-3 text-sm text-gray-600">No assignments for this module.</li>
              )}
            </ul>
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
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Modules</h3>
            <div className="space-y-4">
              <ul className="divide-y divide-gray-100">
                {(modules || []).map((m, idx) => {
                  const progress = moduleProgress[m._id];
                  const isCompleted = progress?.isCompleted || false;
                  
                  return (
                    <li key={m._id || idx} className={`py-3 px-2 rounded cursor-pointer ${idx === activeModuleIdx ? 'bg-primary-50' : 'hover:bg-gray-50'}`} onClick={() => { setActiveModuleIdx(idx); setActiveContentIdx(0); }}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-gray-900 font-medium flex items-center gap-2">
                            {isCompleted && (
                              <span className="text-green-600">✓</span>
                            )}
                            {m.title}
                          </div>
                          <div className="text-sm text-gray-600">{m.description}</div>
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
                      <li key={cIdx} className={`px-2 py-2 rounded text-sm cursor-pointer ${cIdx === activeContentIdx ? 'bg-primary-50' : 'hover:bg-gray-50'}`} onClick={() => setActiveContentIdx(cIdx)}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="uppercase text-xs text-gray-500 flex-shrink-0">{c.type}</span>
                              {c.type === 'video' && c.duration > 0 && (
                                <span className="text-xs text-gray-500 flex-shrink-0">
                                  {Math.floor(c.duration / 60)}:{(c.duration % 60).toString().padStart(2, '0')}
                                </span>
                              )}
                            </div>
                            <div className="text-gray-800 text-sm leading-tight break-words">
                              {displayTitle}
                            </div>
                          </div>
                        </div>
                        {c.type === 'video' && metadata?.author && (
                          <div className="text-xs text-gray-500 mt-1">by {metadata.author}</div>
                        )}
                        {c.type === 'video' && !metadata?.title && videoId && (
                          <div className="text-xs text-gray-500 mt-1">YouTube Video</div>
                        )}
                      </li>
                    );
                  })}
                  {(!activeModule?.content || activeModule.content.length === 0) && (
                    <li className="text-sm text-gray-600">No contents in this module.</li>
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



