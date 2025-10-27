import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourses } from '../../contexts/CourseContext';
import { useSubmissions } from '../../contexts/SubmissionsContext';
import axios from 'axios';
import { 
  BookOpenIcon, 
  UsersIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

const API_URL = process.env.REACT_APP_API_URL || 'https://lms-backend-u90k.onrender.com/api';

const StudentProgress = () => {
  const navigate = useNavigate();
  const { courses, fetchInstructorCourses, fetchCourseEnrollments } = useCourses();
  const { fetchSubmissions } = useSubmissions();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [expandedStudents, setExpandedStudents] = useState(new Set());

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/courses?instructor=me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data?.success) {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      setLoading(false);
    }
  };

  const handleCourseSelect = async (courseId) => {
    setLoadingStudents(true);
    setSelectedCourse(courseId);
    
    try {
      const token = localStorage.getItem('token');
      
      // Fetch students
      const studentsRes = await axios.get(`${API_URL}/courses/${courseId}/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const enrolledStudents = studentsRes.data?.data?.students || [];

      // Fetch course structure with modules and assignments
      const courseRes = await axios.get(`${API_URL}/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const courseModules = courseRes.data?.data?.course?.modules || [];

      // Fetch submissions for each assignment
      const studentsWithSubmissions = await Promise.all(
        enrolledStudents.map(async (enrollment) => {
          const studentSubmissions = {};
          
          for (const module of courseModules) {
            const assignmentsRes = await axios.get(`${API_URL}/assignments/module/${module._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const assignments = assignmentsRes.data?.data?.assignments || [];
            studentSubmissions[module._id] = { module, assignments: [] };

            for (const assignment of assignments) {
              try {
                const submissionsRes = await axios.get(`${API_URL}/submissions/assignment/${assignment._id}`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                const submissions = submissionsRes.data?.data?.submissions || [];
                
                // Find submission for this student - submission uses studentId field
                const studentSubmission = submissions.find(s => {
                  // Handle both populated and unpopulated studentId
                  const submissionStudentId = s.studentId?._id 
                    ? s.studentId._id.toString() 
                    : s.studentId?.toString() || String(s.studentId);
                  const enrollmentStudentId = enrollment.student._id 
                    ? enrollment.student._id.toString() 
                    : enrollment.student.toString();
                  return submissionStudentId === enrollmentStudentId;
                });
                
                studentSubmissions[module._id].assignments.push({
                  ...assignment,
                  submitted: !!studentSubmission,
                  submission: studentSubmission || null
                });
              } catch (error) {
                studentSubmissions[module._id].assignments.push({
                  ...assignment,
                  submitted: false,
                  submission: null
                });
              }
            }
          }

          return {
            ...enrollment,
            submissions: studentSubmissions
          };
        })
      );

      setStudents(studentsWithSubmissions);
      setModules(courseModules);
    } catch (error) {
      console.error('Error loading student progress:', error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const getSubmissionStatus = (assignment) => {
    if (assignment.submitted) {
      if (assignment.submission?.grade !== undefined) {
        return { status: 'graded', icon: CheckCircleIcon, color: 'text-green-600 dark:text-green-400' };
      }
      return { status: 'submitted', icon: ClockIcon, color: 'text-yellow-600 dark:text-yellow-400' };
    }
    return { status: 'not-submitted', icon: XCircleIcon, color: 'text-red-600 dark:text-red-400' };
  };

  const getStatsForStudent = (student) => {
    let totalAssignments = 0;
    let submittedAssignments = 0;
    let gradedAssignments = 0;

    Object.values(student.submissions || {}).forEach(moduleData => {
      moduleData.assignments.forEach(assignment => {
        totalAssignments++;
        if (assignment.submitted) submittedAssignments++;
        if (assignment.submission?.grade !== undefined) gradedAssignments++;
      });
    });

    return { totalAssignments, submittedAssignments, gradedAssignments };
  };

  const toggleStudentExpansion = (studentId) => {
    const newExpanded = new Set(expandedStudents);
    if (newExpanded.has(studentId)) {
      newExpanded.delete(studentId);
    } else {
      newExpanded.add(studentId);
    }
    setExpandedStudents(newExpanded);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/tutor/dashboard')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center space-x-3">
            <UsersIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Student Progress</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Track student enrollment and assignment submissions per course</p>
        </div>

        {/* Course Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Select a Course</h2>
          
          {courses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpenIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No courses found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map(course => (
                <div
                  key={course._id}
                  onClick={() => handleCourseSelect(course._id)}
                  className={`relative cursor-pointer rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                    selectedCourse === course._id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-500'
                  }`}
                >
                  <div className="p-4">
                    {/* Course Thumbnail */}
                    <div className="aspect-video w-full mb-3 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                      {course.thumbnail ? (
                        <img 
                          src={course.thumbnail} 
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpenIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                        </div>
                      )}
                    </div>
                    
                    {/* Course Info */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                        {course.title}
                      </h3>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {course.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span className="capitalize">{course.difficulty}</span>
                        <span>{course.duration}h</span>
                        <span className="capitalize">{course.category}</span>
                      </div>
                      
                      {/* Status Badge */}
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          course.isPublished 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                        }`}>
                          {course.isPublished ? 'Published' : 'Draft'}
                        </span>
                        
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {course.enrolledStudents?.length || 0} students
                        </span>
                      </div>
                    </div>
                    
                    {/* Selection Indicator */}
                    {selectedCourse === course._id && (
                      <div className="absolute top-2 right-2">
                        <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                          <CheckCircleIcon className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {loadingStudents && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        )}

        {/* Students List */}
        {!loadingStudents && selectedCourse && students.length > 0 && (
          <div className="space-y-6">
            {students.map((enrollment) => {
              const stats = getStatsForStudent(enrollment);
              const student = enrollment.student;
              
              return (
                <div key={enrollment._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {/* Student Header - Clickable */}
                  <div 
                    className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    onClick={() => toggleStudentExpansion(enrollment._id)}
                  >
                    <div className="flex items-center space-x-4">
                      {student.avatar ? (
                        <img src={student.avatar} alt={student.firstName} className="w-16 h-16 rounded-full object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xl font-semibold text-gray-700 dark:text-gray-300">
                          {student.firstName?.charAt(0) || 'S'}
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                          {student.firstName} {student.lastName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{student.email}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {/* Stats */}
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                            {stats.submittedAssignments}/{stats.totalAssignments}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Submitted</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {stats.gradedAssignments}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Graded</div>
                        </div>
                      </div>
                      
                      {/* Expand Icon */}
                      <div className="flex items-center">
                        {expandedStudents.has(enrollment._id) ? (
                          <ChevronUpIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        ) : (
                          <ChevronDownIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Modules - Collapsible */}
                  {expandedStudents.has(enrollment._id) && modules.length > 0 && (
                    <div className="px-6 pb-6 pt-0 border-t border-gray-200 dark:border-gray-700">
                      <div className="space-y-4 mt-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Module Progress</h4>
                      
                      {modules.map((module) => {
                        const moduleData = enrollment.submissions[module._id];
                        if (!moduleData) return null;
                        
                        const moduleAssignments = moduleData.assignments || [];
                        const moduleStats = {
                          total: moduleAssignments.length,
                          submitted: moduleAssignments.filter(a => a.submitted).length,
                          graded: moduleAssignments.filter(a => a.submission?.grade !== undefined).length
                        };

                        return (
                          <div key={module._id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">{module.title}</h5>
                              <div className="flex items-center space-x-2 text-sm">
                                <span className="text-gray-600 dark:text-gray-400">
                                  {moduleStats.submitted}/{moduleStats.total} submitted
                                </span>
                                {moduleStats.graded > 0 && (
                                  <span className="text-green-600 dark:text-green-400">
                                    {moduleStats.graded} graded
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              {moduleAssignments.map((assignment) => {
                                const statusInfo = getSubmissionStatus(assignment);
                                const StatusIcon = statusInfo.icon;
                                
                                return (
                                  <div key={assignment._id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                                    <div className="flex items-center space-x-2">
                                      <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                                      <span className="text-sm text-gray-900 dark:text-gray-100">{assignment.title}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className={`text-xs px-2 py-1 rounded ${
                                        statusInfo.status === 'graded' 
                                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                                          : statusInfo.status === 'submitted'
                                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                                      }`}>
                                        {statusInfo.status === 'graded' ? 'Graded' : 
                                         statusInfo.status === 'submitted' ? 'Submitted' : 
                                         'Not Submitted'}
                                      </span>
                                      {assignment.submission?.grade !== undefined && (
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                          {assignment.submission.grade}/{assignment.maxPoints} pts
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  )}

                  {/* Empty State for Modules */}
                  {expandedStudents.has(enrollment._id) && modules.length === 0 && (
                    <div className="px-6 pb-6 pt-0 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">
                        No modules found for this course.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Empty States */}
        {!loadingStudents && selectedCourse && students.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <UsersIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Students Enrolled</h3>
            <p className="text-gray-600 dark:text-gray-400">
              This course doesn't have any enrolled students yet.
            </p>
          </div>
        )}

        {!loadingStudents && !selectedCourse && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <BookOpenIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Select a Course</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Choose a course from the dropdown above to view student progress and assignment submissions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProgress;

