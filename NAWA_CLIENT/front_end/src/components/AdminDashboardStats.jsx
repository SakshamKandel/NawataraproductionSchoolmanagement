import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl } from '../config/api';

const AdminDashboardStats = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalNotices: 0,
    totalFeeStructures: 0,
    studentsByGrade: {},
    recentActivity: [],
    monthlyFeeCollection: 0,
    loading: true,
    error: null
  });

  const [animatedStats, setAnimatedStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalNotices: 0,
    totalFeeStructures: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!stats.loading) {
      animateNumbers();
    }
  }, [stats.loading]);

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...');

      // Fetch students using working endpoint
      let students = [];
      try {
        const response = await axios.get(getApiUrl('/students'), {
          withCredentials: true,
          params: { limit: 1000 }
        });
        // Handle different response structures
        students = response.data?.students || response.data || [];
        console.log('Fetched students data:', students);
      } catch (error) {
        console.warn('Students endpoint failed, trying teacher endpoint:', error);
        try {
          const response = await axios.get(getApiUrl('/teacher/students'), {
            withCredentials: true,
            params: { limit: 1000 }
          });
          students = response.data?.students || response.data || [];
          console.log('Fetched students from teacher endpoint:', students);
        } catch (err) {
          console.warn('All student endpoints failed:', err);
          students = [];
        }
      }

      // Fetch teachers
      let teachers = [];
      try {
        const response = await axios.get(getApiUrl('/getTeachers'), { withCredentials: true });
        teachers = response.data || [];
        console.log('Fetched teachers data:', teachers);
      } catch (error) {
        console.warn('Failed to fetch teachers:', error);
      }

      // Fetch notices using working endpoint
      let notices = [];
      try {
        const response = await axios.get(getApiUrl('/notices/admin'), { withCredentials: true });
        notices = response.data || [];
        console.log('Fetched notices data:', notices);
      } catch (error) {
        console.warn('Admin notices failed, trying public notices:', error);
        try {
          const response = await axios.get(getApiUrl('/notices/public'), { withCredentials: true });
          notices = response.data || [];
        } catch (err) {
          console.warn('All notice endpoints failed:', err);
        }
      }

      // Fetch fee structures
      let feeStructures = [];
      try {
        const response = await axios.get(getApiUrl('/fetch/class/structure/fees'), { withCredentials: true });
        // Handle different response structures
        feeStructures = response.data?.data || response.data || [];
        console.log('Fetched fee structures:', feeStructures);
      } catch (error) {
        console.warn('Failed to fetch fee structures:', error);
      }

      // Ensure students is an array before using reduce
      const studentsArray = Array.isArray(students) ? students : [];
      console.log('Processing students array:', studentsArray.length, 'students');

      // Calculate grade distribution
      const gradeDistribution = studentsArray.reduce((acc, student) => {
        const grade = student.grade || 'Unknown';
        acc[grade] = (acc[grade] || 0) + 1;
        return acc;
      }, {});

      // Only set stats with real data
      setStats({
        totalStudents: studentsArray.length,
        totalTeachers: teachers.length,
        totalNotices: Array.isArray(notices) ? notices.length : 0,
        totalFeeStructures: Array.isArray(feeStructures) ? feeStructures.length : 0,
        studentsByGrade: gradeDistribution,
        recentActivity: Array.isArray(notices) ? notices.slice(0, 3) : [],
        loading: false,
        error: null
      });
      
      console.log('Dashboard stats updated:', {
        totalStudents: studentsArray.length,
        totalTeachers: teachers.length,
        totalNotices: Array.isArray(notices) ? notices.length : 0,
        totalFeeStructures: Array.isArray(feeStructures) ? feeStructures.length : 0,
        gradeDistribution: gradeDistribution
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load dashboard data'
      }));
    }
  };


  const animateNumbers = () => {
    const duration = 1500;
    const steps = 50;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOut = 1 - Math.pow(1 - progress, 2);

      setAnimatedStats({
        totalStudents: Math.floor(stats.totalStudents * easeOut),
        totalTeachers: Math.floor(stats.totalTeachers * easeOut),
        totalNotices: Math.floor(stats.totalNotices * easeOut),
        totalFeeStructures: Math.floor(stats.totalFeeStructures * easeOut)
      });

      if (currentStep === steps) {
        clearInterval(timer);
        setAnimatedStats({
          totalStudents: stats.totalStudents,
          totalTeachers: stats.totalTeachers,
          totalNotices: stats.totalNotices,
          totalFeeStructures: stats.totalFeeStructures
        });
      }
    }, interval);
  };

  const StatCard = ({ title, value, icon, description, isLoading }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#0a66c2] hover:shadow-sm transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-[#e7f3ff] rounded-lg flex items-center justify-center text-[#0a66c2] mr-3">
              {icon}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</h3>
            </div>
          </div>
          <div className="mb-2">
            {isLoading ? (
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <p className="text-3xl font-semibold text-[#0a66c2] font-mono">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
            )}
          </div>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );

  const GradeChart = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-[#e7f3ff] rounded-lg flex items-center justify-center text-[#0a66c2] mr-3">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-[#0a66c2]">Students by Grade</h3>
      </div>
      
      {Object.keys(stats.studentsByGrade).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(stats.studentsByGrade)
            .sort(([a], [b]) => {
              const order = ['Nursery', 'L.K.G.', 'U.K.G.', '1', '2', '3', '4', '5', '6'];
              return order.indexOf(a) - order.indexOf(b);
            })
            .map(([grade, count]) => (
              <div
                key={grade}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0"
              >
                <div className="flex flex-col sm:flex-row sm:items-center flex-1">
                  <span className="text-sm font-medium text-gray-700 w-full sm:w-16 mb-1 sm:mb-0">{grade}</span>
                  <div className="w-full sm:w-48 bg-gray-200 rounded-full h-2 sm:ml-4">
                    <div
                      className="bg-[#0a66c2] h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${stats.totalStudents > 0 ? (count / stats.totalStudents) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-semibold text-[#0a66c2] sm:ml-4 text-right">{count}</span>
              </div>
            ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm italic">No grade data available</p>
      )}
    </div>
  );

  const RecentActivity = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-[#e7f3ff] rounded-lg flex items-center justify-center text-[#0a66c2] mr-3">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-[#0a66c2]">Recent Activity</h3>
      </div>
      
      {stats.recentActivity.length > 0 ? (
        <div className="space-y-4">
          {stats.recentActivity.map((notice, index) => (
            <div key={index} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
              <div className="w-2 h-2 bg-[#0a66c2] rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{notice.title}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(notice.publishDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm italic">No recent activity</p>
      )}
    </div>
  );

  if (stats.loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
        <div className="animate-pulse">
          <div className="flex items-center mb-6">
            <div className="h-6 bg-gray-200 rounded w-48"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-50 rounded-lg p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (stats.error) {
    return (
      <div className="bg-white border border-red-200 rounded-lg p-6 mb-8">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600 mr-3">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-red-800">Unable to load dashboard data</h3>
            <p className="text-sm text-red-600 mt-1">Please check your connection and try again</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-[#e7f3ff] rounded-lg flex items-center justify-center text-[#0a66c2] mr-4">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[#0a66c2]">School Management Overview</h2>
            <p className="text-sm text-gray-600 mt-1">Real-time insights and key metrics</p>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Students"
          value={animatedStats.totalStudents}
          icon={
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
            </svg>
          }
          description="Currently enrolled students"
          isLoading={stats.loading}
        />
        
        <StatCard
          title="Total Teachers"
          value={animatedStats.totalTeachers}
          icon={
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
            </svg>
          }
          description="Teaching staff members"
          isLoading={stats.loading}
        />
        
        <StatCard
          title="Active Notices"
          value={animatedStats.totalNotices}
          icon={
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
            </svg>
          }
          description="Published announcements"
          isLoading={stats.loading}
        />
        
        <StatCard
          title="Fee Structures"
          value={animatedStats.totalFeeStructures}
          icon={
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zM14 6a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h6z"/>
            </svg>
          }
          description="Active fee structures by class"
          isLoading={stats.loading}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-[#e7f3ff] rounded-lg flex items-center justify-center text-[#0a66c2] mr-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Academic Year</h3>
          </div>
          <p className="text-3xl font-semibold text-[#0a66c2] font-mono mb-2">2081 BS</p>
          <p className="text-sm text-gray-600">Current academic session</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-[#e7f3ff] rounded-lg flex items-center justify-center text-[#0a66c2] mr-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">System Status</h3>
          </div>
          <p className="text-3xl font-semibold text-[#0a66c2] font-mono mb-2">Active</p>
          <p className="text-sm text-gray-600">All systems operational</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GradeChart />
        <RecentActivity />
      </div>
    </div>
  );
};

export default AdminDashboardStats;