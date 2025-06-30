import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { contextCreate } from "../Context";
import AdminDashboardStats from "./AdminDashboardStats";

const Home = () => {
  const teacherLoggedIn = document.cookie.includes("teacherToken");
  const adminLoggedIn = document.cookie.includes("adminToken");
  const studentLoggedIn = document.cookie.includes("studentToken");
  const contextUse = useContext(contextCreate);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Clean Design */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-16 md:py-20">
            <div className="text-center">
              {/* School Logo/Icon */}
              <div className="mx-auto w-20 h-20 bg-[#0a66c2] rounded-full flex items-center justify-center mb-8">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
                  <path d="M3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0z"/>
                </svg>
              </div>

              {/* Welcome Message for Logged in Users */}
              {(teacherLoggedIn || adminLoggedIn || studentLoggedIn) && (
                <div className="mb-8">
                  <div className="inline-flex items-center px-4 py-2 bg-[#e7f3ff] rounded-full">
                    <div className="w-8 h-8 bg-[#0a66c2] rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                      {contextUse.name ? contextUse.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-[#0a66c2] font-medium">
                      Welcome back, {contextUse.name}
                    </span>
                  </div>
                </div>
              )}

              {/* Main Heading */}
              <h1 className="text-4xl md:text-6xl font-bold text-[#0a66c2] leading-tight mb-6">
                Nawa Tara
                <br />
                <span className="text-gray-600">English School</span>
              </h1>

              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
                Empowering minds, shaping futures. Quality education since 2070 BS with a commitment to academic excellence and character development.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/notice">
                  <button className="w-full sm:w-auto bg-[#0a66c2] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#004182] transition-colors duration-200 flex items-center justify-center">
                    View Latest Notices
                    <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </button>
                </Link>
                
                <Link to="/about-us">
                  <button className="w-full sm:w-auto border border-[#0a66c2] text-[#0a66c2] px-8 py-3 rounded-lg font-medium hover:bg-[#e7f3ff] transition-colors duration-200">
                    Learn About Us
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Dashboard Stats - Only show for admins */}
      {adminLoggedIn && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <AdminDashboardStats />
        </div>
      )}

      {/* School Stats Section - For all users */}
      {!adminLoggedIn && (
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#0a66c2] mb-4">Our Legacy</h2>
              <p className="text-lg text-gray-600">Building excellence in education for over a decade</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Established */}
              <div className="text-center">
                <div className="w-16 h-16 bg-[#e7f3ff] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[#0a66c2]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-4xl font-bold text-[#0a66c2] mb-2">2070 BS</h3>
                <p className="text-gray-600 font-medium">Year Established</p>
                <p className="text-sm text-gray-500 mt-2">Serving the community with dedication</p>
              </div>

              {/* Staff */}
              <div className="text-center">
                <div className="w-16 h-16 bg-[#e7f3ff] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[#0a66c2]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                  </svg>
                </div>
                <h3 className="text-4xl font-bold text-[#0a66c2] mb-2">60+</h3>
                <p className="text-gray-600 font-medium">Dedicated Staff</p>
                <p className="text-sm text-gray-500 mt-2">Experienced educators and support staff</p>
              </div>

              {/* Students */}
              <div className="text-center">
                <div className="w-16 h-16 bg-[#e7f3ff] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[#0a66c2]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h3 className="text-4xl font-bold text-[#0a66c2] mb-2">500+</h3>
                <p className="text-gray-600 font-medium">Active Students</p>
                <p className="text-sm text-gray-500 mt-2">Growing learners across all grades</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features Section - Clean and Minimal */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0a66c2] mb-4">Why Choose Nawa Tara</h2>
            <p className="text-lg text-gray-600">Excellence in education through proven methodologies</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Academic Excellence */}
            <div className="bg-white rounded-lg p-8 text-center border border-gray-200 hover:border-[#0a66c2] hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-[#e7f3ff] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-6 h-6 text-[#0a66c2]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#0a66c2] mb-4">Academic Excellence</h3>
              <p className="text-gray-600 leading-relaxed">
                Consistently producing top-performing students with innovative teaching methods and comprehensive curriculum design.
              </p>
            </div>

            {/* Modern Facilities */}
            <div className="bg-white rounded-lg p-8 text-center border border-gray-200 hover:border-[#0a66c2] hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-[#e7f3ff] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-6 h-6 text-[#0a66c2]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#0a66c2] mb-4">Modern Facilities</h3>
              <p className="text-gray-600 leading-relaxed">
                State-of-the-art classrooms, computer labs, science facilities, and sports grounds for comprehensive development.
              </p>
            </div>

            {/* Holistic Development */}
            <div className="bg-white rounded-lg p-8 text-center border border-gray-200 hover:border-[#0a66c2] hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-[#e7f3ff] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-6 h-6 text-[#0a66c2]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#0a66c2] mb-4">Holistic Development</h3>
              <p className="text-gray-600 leading-relaxed">
                Focus on character building, cultural activities, sports, and life skills alongside academic achievements.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-[#0a66c2] mb-4">Ready to Join Our Community?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Discover the difference quality education makes. Connect with us today.
          </p>
          
          <Link to="/contact-us">
            <button className="bg-[#0a66c2] text-white px-8 py-4 rounded-lg font-medium hover:bg-[#004182] transition-colors duration-200 text-lg">
              Get in Touch
            </button>
          </Link>
        </div>
      </div>

      {/* Footer Spacing */}
      <div className="h-8 bg-gray-50"></div>
    </div>
  );
};

export default Home;