import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MICLogo from '../components/layout/MICLogo';
import {
  AcademicCapIcon,
  ChartBarIcon,
  UsersIcon,
  PlayIcon,
  StarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: AcademicCapIcon,
      title: 'IT Skills Development',
      description: 'Master web development, UI/UX design, data science, video editing, and graphics design with industry-standard courses.'
    },
    {
      icon: UsersIcon,
      title: 'Certified Instructors',
      description: 'Learn from MIC-certified professionals and industry experts with proven track records.'
    },
    {
      icon: ChartBarIcon,
      title: 'Progress Analytics',
      description: 'Track your learning journey with detailed analytics and personalized progress reports.'
    },
    {
      icon: PlayIcon,
      title: 'Community Learning',
      description: 'Connect with fellow MIC students and instructors through collaborative projects and discussions.'
    }
  ];

  const courses = [
    {
      category: 'Web Development',
      title: 'Full-Stack React Development',
      instructor: 'John Doe',
      rating: 4.8,
      students: 1240,
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop'
    },
    {
      category: 'UI/UX Design',
      title: 'Modern UI/UX Design Principles',
      instructor: 'Jane Smith',
      rating: 4.9,
      students: 890,
      thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop'
    },
    {
      category: 'Data Science',
      title: 'Python for Data Analysis',
      instructor: 'Mike Johnson',
      rating: 4.7,
      students: 1560,
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop'
    }
  ];

  const stats = [
    { number: '2,500+', label: 'MIC Students' },
    { number: '50+', label: 'IT Courses' },
    { number: '25+', label: 'Certified Instructors' },
    { number: '98%', label: 'Job Placement Rate' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-95" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <MICLogo className="w-10 h-10" textClassName="text-2xl font-bold text-white" />
                <span className="text-secondary-300 font-semibold">Official MIC Oyo State LMS</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
                Learn In-Demand IT Skills
                <span className="block text-secondary-400">from Certified Instructors</span>
              </h1>
              <p className="text-lg md:text-xl text-primary-100 mb-8 max-w-xl">
                Hands-on courses in Web Development, UI/UX, Data Science, Video Editing, and Graphics Design—built for Oyo State.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <Link
                    to={user?.role === 'student' ? '/student/dashboard' : '/tutor/dashboard'}
                    className="bg-white text-primary-600 hover:bg-gray-50 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 inline-flex items-center justify-center"
                  >
                    Go to Dashboard
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="bg-white text-primary-600 hover:bg-gray-50 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 inline-flex items-center justify-center"
                    >
                      Get Started Free
                      <ArrowRightIcon className="w-5 h-5 ml-2" />
                    </Link>
                    <Link
                      to="/courses"
                    className="border-2 border-white text-white hover:bg-white hover:text-primary-700 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 inline-flex items-center justify-center"
                    >
                      Browse Courses
                      <PlayIcon className="w-5 h-5 ml-2" />
                    </Link>
                  </>
                )}
              </div>
              <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl md:text-4xl font-extrabold text-secondary-400">{stat.number}</div>
                    <div className="text-primary-100 text-sm md:text-base">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20 shadow-xl">
                <div className="grid grid-cols-2 gap-4">
                  {courses.map((c, i) => (
                    <div key={i} className="bg-white/10 rounded-xl overflow-hidden border border-white/10">
                      <img src={c.thumbnail} alt={c.title} className="h-28 w-full object-cover" />
                      <div className="p-3">
                        <div className="text-xs text-primary-100 mb-1">{c.category}</div>
                        <div className="text-white font-semibold leading-snug line-clamp-2">{c.title}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {/* Value Props */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose MIC Oyo State LMS?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Empowering Oyo State residents with world-class IT education and career opportunities</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose MIC Oyo State LMS?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Empowering Oyo State residents with world-class IT education and career opportunities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Courses
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start your learning journey with our most popular courses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <div key={index} className="card overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {course.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    By {course.instructor}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-700 ml-1">
                          {course.rating}
                        </span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600">
                        {course.students} students
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/courses"
              className="btn-primary inline-flex items-center"
            >
              View All Courses
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-bg text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students who are already advancing their careers with our courses.
          </p>
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-primary-600 hover:bg-gray-50 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 inline-flex items-center justify-center"
              >
                Get Started Free
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;

