import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/Auth/LoginPage';
import { RegisterPage } from './pages/Auth/RegisterPage';
import { DashboardIndex } from './pages/Dashboard/DashboardIndex';
import { StudentList } from './pages/Students/StudentList';
import { TeacherList } from './pages/Teachers/TeacherList';
import { CourseList } from './pages/Courses/CourseList';
import { AttendanceTracker } from './pages/Attendance/AttendanceTracker';
import { ExamList } from './pages/Exams/ExamList';
import { MarksEntry } from './pages/Marks/MarksEntry';
import { ReportCards } from './pages/Reports/ReportCards';
import { AuditLogs } from './pages/Audit/AuditLogs';
import { ProfilePage } from './pages/Profile/ProfilePage';

export function App() {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeExamIdForMarks, setActiveExamIdForMarks] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        <p className="mt-4 text-xs font-semibold tracking-wider uppercase text-slate-400">
          Loading EduTrack System...
        </p>
      </div>
    );
  }

  // Unauthenticated Flow
  if (!user) {
    if (authView === 'register') {
      return <RegisterPage onNavigateLogin={() => setAuthView('login')} />;
    }
    return <LoginPage onNavigateRegister={() => setAuthView('register')} />;
  }

  // Navigate directly to marks from exams list
  const handleNavigateToMarks = (examId) => {
    setActiveExamIdForMarks(examId);
    setCurrentTab('marks');
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardIndex onNavigate={setCurrentTab} />;
      case 'students':
        return <StudentList />;
      case 'teachers':
        return <TeacherList />;
      case 'courses':
        return <CourseList />;
      case 'attendance':
        return <AttendanceTracker />;
      case 'exams':
        return <ExamList onNavigateToMarks={handleNavigateToMarks} />;
      case 'marks':
        return <MarksEntry initialExamId={activeExamIdForMarks} />;
      case 'reports':
        return <ReportCards />;
      case 'audit':
        return <AuditLogs />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <DashboardIndex onNavigate={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setActiveExamIdForMarks(null);
          setCurrentTab(tab);
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0 transition-all">
        <Navbar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onNavigate={(tab) => {
            setActiveExamIdForMarks(null);
            setCurrentTab(tab);
          }}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
