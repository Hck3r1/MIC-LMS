import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCourses } from '../../contexts/CourseContext';
import {
  TrophyIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const Certificates = () => {
  const { user } = useAuth();
  const { getAuthMe } = useCourses();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const me = await getAuthMe();
      if (me.success && me.me) {
        // Get completed courses (100% progress)
        const completedCourses = (me.me.enrolledCourses || []).filter(enrollment => {
          const progress = enrollment.progress || 0;
          return progress >= 100;
        });

        // Transform to certificate format
        const certificateData = completedCourses.map(enrollment => {
          const course = enrollment.course || enrollment;
          return {
            id: course._id,
            courseTitle: course.title,
            courseDescription: course.description,
            instructor: course.instructor,
            completedAt: enrollment.completedAt || new Date(),
            progress: enrollment.progress || 100,
            category: course.category,
            duration: course.duration
          };
        });

        setCertificates(certificateData);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = async (courseId, courseTitle) => {
    try {
      setDownloading(courseId);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://lms-backend-u90k.onrender.com/api'}/certificates/${courseId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `certificate-${courseTitle.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        const errorData = await response.json();
        alert(`Error generating certificate: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Certificate download error:', error);
      alert('Failed to download certificate. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">My Certificates</h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">Your learning achievements and course completion certificates</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{certificates.length}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Certificates Earned</div>
            </div>
          </div>
        </div>

        {/* Certificates Grid */}
        {certificates.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-100 to-orange-200 dark:from-yellow-900/30 dark:to-orange-800/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrophyIcon className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">No Certificates Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Complete your first course to earn your first certificate! Keep learning and building your skills.
            </p>
            <a
              href="/courses"
              className="inline-flex items-center bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <AcademicCapIcon className="w-5 h-5 mr-2" />
              Browse Courses
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate) => (
              <div key={certificate.id} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-yellow-300 dark:hover:border-yellow-600">
                {/* Certificate Header */}
                <div className="relative p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                      <TrophyIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Completed</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-gray-100">100%</div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                    {certificate.courseTitle}
                  </h3>
                  
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <AcademicCapIcon className="w-4 h-4 mr-1" />
                    <span className="truncate">
                      {certificate.instructor?.firstName} {certificate.instructor?.lastName}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    <span>{formatDate(certificate.completedAt)}</span>
                  </div>
                </div>

                {/* Certificate Content */}
                <div className="p-6">
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {certificate.courseDescription}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      <span>{certificate.duration}h</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircleIcon className="w-4 h-4 mr-1 text-green-500" />
                      <span className="text-green-600 dark:text-green-400 font-medium">Verified</span>
                    </div>
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={() => handleDownloadCertificate(certificate.id, certificate.courseTitle)}
                    disabled={downloading === certificate.id}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {downloading === certificate.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                        Download Certificate
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Achievement Stats */}
        {certificates.length > 0 && (
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">Your Learning Journey</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrophyIcon className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{certificates.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Certificates Earned</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AcademicCapIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {certificates.reduce((total, cert) => total + (cert.duration || 0), 0)}h
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Learning Hours</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">100%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Certificates;
