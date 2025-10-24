import React from 'react';
import { Link } from 'react-router-dom';
import MICLogo from './MICLogo';
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <MICLogo className="w-10 h-10" textClassName="text-xl font-bold text-white" />
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Empowering Oyo State residents with world-class IT education. Join our comprehensive 
              learning platform for web development, UI/UX design, data science, video editing, 
              and graphics design.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPinIcon className="w-5 h-5 text-primary-400" />
                <span className="text-gray-300 text-sm">Ibadan, Oyo State, Nigeria</span>
              </div>
              <div className="flex items-center space-x-3">
                <PhoneIcon className="w-5 h-5 text-primary-400" />
                <span className="text-gray-300 text-sm">+234 (0) 123 456 7890</span>
              </div>
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="w-5 h-5 text-primary-400" />
                <span className="text-gray-300 text-sm">info@mic.oyostate.gov.ng</span>
              </div>
            </div>
          </div>

          {/* Programs */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <AcademicCapIcon className="w-5 h-5 mr-2 text-primary-400" />
              IT Programs
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/courses?category=web-development" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Web Development
                </Link>
              </li>
              <li>
                <Link to="/courses?category=ui-ux" className="text-gray-300 hover:text-primary-400 transition-colors">
                  UI/UX Design
                </Link>
              </li>
              <li>
                <Link to="/courses?category=data-science" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Data Science
                </Link>
              </li>
              <li>
                <Link to="/courses?category=video-editing" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Video Editing
                </Link>
              </li>
              <li>
                <Link to="/courses?category=graphics-design" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Graphics Design
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <UserGroupIcon className="w-5 h-5 mr-2 text-primary-400" />
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/student/dashboard" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Student Portal
                </Link>
              </li>
              <li>
                <Link to="/tutor/dashboard" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Tutor Portal
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <p className="text-gray-300 text-sm">
                © 2024 MIC Oyo State LMS. All rights reserved.
              </p>
            </div>
            
            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <ChartBarIcon className="w-4 h-4 text-primary-400" />
                <span className="text-gray-300 text-sm">Powered by Oyo State Government</span>
              </div>
            </div>
          </div>
          
          {/* Additional Info */}
          <div className="mt-4 pt-4 border-t border-gray-700 text-center">
            <p className="text-gray-400 text-xs">
              Empowering Oyo State residents with world-class IT education and career opportunities
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

