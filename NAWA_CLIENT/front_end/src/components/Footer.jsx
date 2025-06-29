import React from "react";

const Footer = () => {
  return (
    <footer className="bg-[#f3f2ef] border-t border-gray-200 pt-8 pb-4 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1: School info */}
          <div className="col-span-1">
            <div className="flex flex-col items-start">
              <div className="group">
                <img
                  src="/school_logo.png"
                  className="h-16 w-auto mb-3 transition-transform duration-300 group-hover:scale-105"
                  alt="School Logo"
                />
              </div>
              <h3 className="text-[#0a66c2] font-semibold text-sm tracking-wide mb-2">
                NAWA TARA ENGLISH SCHOOL
              </h3>
              <p className="text-gray-600 text-sm">
                Providing quality education since 2070 BS. Our focus is on academic excellence, 
                character development, and innovative learning approaches.
              </p>
            </div>
          </div>
          
          {/* Column 2: Address & Contact */}
          <div className="col-span-1">
            <h3 className="text-base font-semibold text-gray-900 mb-3 relative inline-flex items-center">
              <svg className="w-5 h-5 mr-2 text-[#0a66c2]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Address
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-[#0a66c2] origin-left transform scale-x-100"></span>
            </h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start group">
                <span className="mt-0.5 mr-3 p-1 rounded-full bg-blue-50 text-[#0a66c2] group-hover:bg-blue-100 transition-colors duration-200">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="text-gray-600 text-sm">
                  Jamungacchi 04, Biratnagar, Morang, Nepal
                </span>
              </li>
              <li className="flex items-start group">
                <span className="mt-0.5 mr-3 p-1 rounded-full bg-blue-50 text-[#0a66c2] group-hover:bg-blue-100 transition-colors duration-200">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </span>
                <div className="text-gray-600 text-sm">
                  <p>021460535</p>
                  
                </div>
              </li>
            </ul>
          </div>
          
          {/* Column 3: Quick Links */}
          <div className="col-span-1">
            <h3 className="text-base font-semibold text-gray-900 mb-3 relative inline-flex items-center">
              <svg className="w-5 h-5 mr-2 text-[#0a66c2]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
              </svg>
              Quick Links
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-[#0a66c2] origin-left transform scale-x-100"></span>
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="/about-us" className="text-gray-600 text-sm hover:text-[#0a66c2] hover:underline transition-colors duration-200 flex items-center group">
                  <svg className="w-3 h-3 mr-2 text-gray-400 group-hover:text-[#0a66c2] transition-colors duration-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  About Us
                </a>
              </li>
              <li>
                <a href="/notice" className="text-gray-600 text-sm hover:text-[#0a66c2] hover:underline transition-colors duration-200 flex items-center group">
                  <svg className="w-3 h-3 mr-2 text-gray-400 group-hover:text-[#0a66c2] transition-colors duration-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Notices
                </a>
              </li>
              <li>
                <a href="/contact-us" className="text-gray-600 text-sm hover:text-[#0a66c2] hover:underline transition-colors duration-200 flex items-center group">
                  <svg className="w-3 h-3 mr-2 text-gray-400 group-hover:text-[#0a66c2] transition-colors duration-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/login-form" className="text-gray-600 text-sm hover:text-[#0a66c2] hover:underline transition-colors duration-200 flex items-center group">
                  <svg className="w-3 h-3 mr-2 text-gray-400 group-hover:text-[#0a66c2] transition-colors duration-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Login
                </a>
              </li>
            </ul>
          </div>
          
          {/* Column 4: Connect with us */}
          <div className="col-span-1">
            <h3 className="text-base font-semibold text-gray-900 mb-3 relative inline-flex items-center">
              <svg className="w-5 h-5 mr-2 text-[#0a66c2]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              Connect With Us
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-[#0a66c2] origin-left transform scale-x-100"></span>
            </h3>
            <div className="mt-4 flex space-x-2">
              {/* Facebook */}
              <a href="https://www.facebook.com/profile.php?id=100054327980067" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center p-2 rounded-full border border-gray-300 bg-white text-[#1877F2] hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-all duration-300 shadow-sm">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                </svg>
              </a>
              {/* Email */}
              <a href="mailto:info@nawataraenglishschool.com" className="inline-flex items-center justify-center p-2 rounded-full border border-gray-300 bg-white text-[#0a66c2] hover:bg-[#0a66c2] hover:text-white hover:border-[#0a66c2] transition-all duration-300 shadow-sm">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 6.705A2 2 0 014 5h16a2 2 0 011.99 1.705L12 13.414 2.01 6.705zM2 8.868V19a2 2 0 002 2h16a2 2 0 002-2V8.868l-8 6.4-8-6.4z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        {/* Divider */}
        <div className="border-t border-gray-200 pt-6 pb-2">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Copyright */}
            <div className="text-gray-500 text-sm mb-2 md:mb-0">
              ©️ {new Date().getFullYear()} Nawa Tara English School. All rights reserved.
            </div>
            {/* Designed by Devignity */}
            <div className="text-gray-500 text-xs">
              Designed and Developed by: <a href="https://devignity.tech/" target="_blank" rel="noopener noreferrer" className="text-[#0a66c2] hover:underline font-semibold">Devignity</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;