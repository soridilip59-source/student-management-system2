import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminDashboard } from './AdminDashboard';
import { TeacherDashboard } from './TeacherDashboard';
import { StudentDashboard } from './StudentDashboard';

export const DashboardIndex = ({ onNavigate }) => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'admin':
      return <AdminDashboard onNavigate={onNavigate} />;
    case 'teacher':
      return <TeacherDashboard onNavigate={onNavigate} />;
    case 'student':
      return <StudentDashboard onNavigate={onNavigate} />;
    default:
      return <AdminDashboard onNavigate={onNavigate} />;
  }
};
