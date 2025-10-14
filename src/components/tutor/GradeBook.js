import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  PencilIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const GradeBook = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    course: '',
    assignment: '',
    search: ''
  });
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    // Mock data - in real app, this would come from API
    const mockSubmissions = [
      {
        _id: '1',
        student: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com'
        },
        assignment: {
          title: 'React Components Assignment',
          course: 'Full-Stack React Development',
          maxPoints: 100,
          dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'submitted',
        grade: null,
        isLate: false
      },
      {
        _id: '2',
        student: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com'
        },
        assignment: {
          title: 'CSS Grid Layout',
          course: 'Web Development Basics',
          maxPoints: 50,
          dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        status: 'graded',
        grade: 85,
        isLate: false
      },
      {
        _id: '3',
        student: {
          firstName: 'Mike',
          lastName: 'Johnson',
          email: 'mike.johnson@example.com'
        },
        assignment: {
          title: 'JavaScript Fundamentals Quiz',
          course: 'JavaScript Basics',
          maxPoints: 25,
          dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        submittedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        status: 'graded',
        grade: 92,
        isLate: false
      }
    ];

    setSubmissions(mockSubmissions);
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'graded':
        return 'bg-green-100 text-green-800';
      case 'returned':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted':
        return ClockIcon;
      case 'graded':
        return CheckCircleIcon;
      case 'returned':
        return ExclamationTriangleIcon;
      default:
        return ClockIcon;
    }
  };

  const getGradeColor = (grade, maxPoints) => {
    if (!grade) return 'text-gray-500';
    const percentage = (grade / maxPoints) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesStatus = !filters.status || submission.status === filters.status;
    const matchesCourse = !filters.course || submission.assignment.course.includes(filters.course);
    const matchesAssignment = !filters.assignment || submission.assignment.title.includes(filters.assignment);
    const matchesSearch = !filters.search || 
      submission.student.firstName.toLowerCase().includes(filters.search.toLowerCase()) ||
      submission.student.lastName.toLowerCase().includes(filters.search.toLowerCase()) ||
      submission.assignment.title.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesCourse && matchesAssignment && matchesSearch;
  });

  const exportToCSV = () => {
    const csvContent = [
      ['Student Name', 'Course', 'Assignment', 'Grade', 'Status', 'Submitted Date'],
      ...filteredSubmissions.map(submission => [
        `${submission.student.firstName} ${submission.student.lastName}`,
        submission.assignment.course,
        submission.assignment.title,
        submission.grade || 'Not graded',
        submission.status,
        new Date(submission.submittedAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gradebook.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Grade Book</h2>
        <button
          onClick={exportToCSV}
          className="btn-outline inline-flex items-center"
        >
          <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="input-field pl-10"
                placeholder="Search students or assignments..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="input-field"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Statuses</option>
              <option value="submitted">Needs Grading</option>
              <option value="graded">Graded</option>
              <option value="returned">Returned</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select
              className="input-field"
              value={filters.course}
              onChange={(e) => setFilters({ ...filters, course: e.target.value })}
            >
              <option value="">All Courses</option>
              <option value="Full-Stack React Development">Full-Stack React Development</option>
              <option value="Web Development Basics">Web Development Basics</option>
              <option value="JavaScript Basics">JavaScript Basics</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assignment</label>
            <input
              type="text"
              className="input-field"
              placeholder="Filter by assignment..."
              value={filters.assignment}
              onChange={(e) => setFilters({ ...filters, assignment: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubmissions.map((submission) => {
                const StatusIcon = getStatusIcon(submission.status);
                return (
                  <tr key={submission._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 text-sm font-medium">
                            {submission.student.firstName[0]}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {submission.student.firstName} {submission.student.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{submission.student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{submission.assignment.title}</div>
                      <div className="text-sm text-gray-500">{submission.assignment.maxPoints} points</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{submission.assignment.course}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getGradeColor(submission.grade, submission.assignment.maxPoints)}`}>
                        {submission.grade ? `${submission.grade}/${submission.assignment.maxPoints}` : 'Not graded'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {submission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedSubmission(submission)}
                          className="text-primary-600 hover:text-primary-700"
                          title="View Submission"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        {submission.status === 'submitted' && (
                          <button
                            onClick={() => setSelectedSubmission(submission)}
                            className="text-green-600 hover:text-green-700"
                            title="Grade Submission"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredSubmissions.length === 0 && (
          <div className="text-center py-12">
            <FunnelIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No submissions found matching your filters</p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900">
            {submissions.filter(s => s.status === 'submitted').length}
          </div>
          <div className="text-sm text-gray-600">Pending Grades</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900">
            {submissions.filter(s => s.status === 'graded').length}
          </div>
          <div className="text-sm text-gray-600">Graded</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900">
            {submissions.length}
          </div>
          <div className="text-sm text-gray-600">Total Submissions</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900">
            {submissions.filter(s => s.isLate).length}
          </div>
          <div className="text-sm text-gray-600">Late Submissions</div>
        </div>
      </div>
    </div>
  );
};

export default GradeBook;
