import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CourseProvider } from './contexts/CourseContext';
import { SubmissionsProvider } from './contexts/SubmissionsContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import CoursePlayer from './pages/CoursePlayer';
import NotificationsPage from './pages/notifications/NotificationsPage';
import StudentDashboard from './pages/student/StudentDashboard';
import TutorDashboard from './pages/tutor/TutorDashboard';
import TutorNotifications from './pages/tutor/TutorNotifications';
import TutorCourses from './pages/tutor/TutorCourses';
import CreateCourse from './pages/tutor/CreateCourse';
import ManageCourse from './pages/tutor/ManageCourse';
import EditCourse from './pages/tutor/EditCourse';
import AssignmentsManage from './pages/tutor/AssignmentsManage';
import AssignmentSubmit from './pages/student/AssignmentSubmit';
import StudentGrades from './pages/student/StudentGrades';
import StudentCourses from './pages/student/StudentCourses';
import Certificates from './pages/student/Certificates';
import QuizTake from './pages/student/QuizTake';
import ForumPage from './pages/forums/ForumPage';
import ThreadPage from './pages/forums/ThreadPage';
import MessagesPage from './pages/messages/MessagesPage';
import ConversationPage from './pages/messages/ConversationPage';
import GradeSubmissions from './pages/tutor/GradeSubmissions';
import SubmissionGrade from './pages/tutor/SubmissionGrade';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CourseProvider>
          <SubmissionsProvider>
          <NotificationsProvider>
            <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:id" element={<CourseDetail />} />
                <Route path="/courses/:id/learn" element={<ProtectedRoute allowedRoles={['student','admin']}><CoursePlayer /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                <Route path="/forums/course/:courseId" element={<ProtectedRoute><ForumPage /></ProtectedRoute>} />
                <Route path="/forums/thread/:threadId" element={<ProtectedRoute><ThreadPage /></ProtectedRoute>} />
                <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
                <Route path="/messages/with/:userId" element={<ProtectedRoute><ConversationPage /></ProtectedRoute>} />
                
                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/student/*" element={
                  <ProtectedRoute allowedRoles={['student', 'admin']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/student/courses" element={
                  <ProtectedRoute allowedRoles={['student','admin']}>
                    <StudentCourses />
                  </ProtectedRoute>
                } />
                <Route path="/student/grades" element={
                  <ProtectedRoute allowedRoles={['student','admin']}>
                    <StudentGrades />
                  </ProtectedRoute>
                } />
                <Route path="/student/certificates" element={
                  <ProtectedRoute allowedRoles={['student','admin']}>
                    <Certificates />
                  </ProtectedRoute>
                } />
                <Route path="/tutor/*" element={
                  <ProtectedRoute allowedRoles={['tutor', 'admin']}>
                    <TutorDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/tutor/courses" element={
                  <ProtectedRoute allowedRoles={['tutor', 'admin']}>
                    <TutorCourses />
                  </ProtectedRoute>
                } />
                <Route path="/tutor/notifications" element={
                  <ProtectedRoute allowedRoles={['tutor', 'admin']}>
                    <TutorNotifications />
                  </ProtectedRoute>
                } />
                <Route path="/tutor/create-course" element={
                  <ProtectedRoute allowedRoles={['tutor', 'admin']}>
                    <CreateCourse />
                  </ProtectedRoute>
                } />
                <Route path="/tutor/courses/:id" element={
                  <ProtectedRoute allowedRoles={['tutor', 'admin']}>
                    <ManageCourse />
                  </ProtectedRoute>
                } />
                <Route path="/tutor/courses/:id/assignments" element={
                  <ProtectedRoute allowedRoles={['tutor', 'admin']}>
                    <AssignmentsManage />
                  </ProtectedRoute>
                } />
                <Route path="/tutor/submissions" element={
                  <ProtectedRoute allowedRoles={['tutor', 'admin']}>
                    <GradeSubmissions />
                  </ProtectedRoute>
                } />
                <Route path="/tutor/submissions/:id" element={
                  <ProtectedRoute allowedRoles={['tutor', 'admin']}>
                    <SubmissionGrade />
                  </ProtectedRoute>
                } />
                <Route path="/tutor/assignments/:assignmentId/grade" element={
                  <ProtectedRoute allowedRoles={['tutor', 'admin']}>
                    <GradeSubmissions />
                  </ProtectedRoute>
                } />
                <Route path="/tutor/courses/:id/edit" element={
                  <ProtectedRoute allowedRoles={['tutor', 'admin']}>
                    <EditCourse />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/assignments/:id/submit" element={
                  <ProtectedRoute allowedRoles={['student','admin']}>
                    <AssignmentSubmit />
                  </ProtectedRoute>
                } />
                <Route path="/student/quiz/:id" element={
                  <ProtectedRoute allowedRoles={['student','admin']}>
                    <QuizTake />
                  </ProtectedRoute>
                } />
                
                {/* 404 Route */}
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
          </NotificationsProvider>
        </SubmissionsProvider>
        </CourseProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
