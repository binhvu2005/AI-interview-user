import React from 'react';
import { Navigate } from 'react-router-dom';
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';
import PreparationPage from '../pages/Interview/PreparationPage';
import InterviewPage from '../pages/Interview/InterviewPage';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import SettingsPage from '../pages/User/SettingsPage';
import ProfilePage from '../pages/User/ProfilePage';
import VaultPage from '../pages/User/VaultPage';
import UpgradePage from '../pages/User/UpgradePage';
import ForumListPage from '../pages/Forum/ForumListPage';
import ForumDetailPage from '../pages/Forum/ForumDetailPage';
import ResultsPage from '../pages/Result/ResultsPage';
import ShowcasePage from '../pages/Showcase/ShowcasePage';
import ShowcaseDetailPage from '../pages/Showcase/ShowcaseDetailPage';
import JoinInterview from '../pages/Spectator/JoinInterview';
import SpectatorPage from '../pages/Spectator/SpectatorPage';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// Info pages
import AboutPage from '../pages/Info/AboutPage';
import BlogPage from '../pages/Info/BlogPage';
import ContactPage from '../pages/Info/ContactPage';
import HelpPage from '../pages/Info/HelpPage';
import PrivacyPage from '../pages/Info/PrivacyPage';
import TermsPage from '../pages/Info/TermsPage';

export const AppRoutes = [
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ]
  },
  {
    element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/preparation', element: <PreparationPage /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/vault', element: <VaultPage /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '/upgrade', element: <UpgradePage /> },
      { path: '/forum', element: <ForumListPage /> },
      { path: '/forum/:id', element: <ForumDetailPage /> },
      { path: '/results', element: <ResultsPage /> },
      { path: '/results/:id', element: <ResultsPage /> },
      { path: '/showcase', element: <ShowcasePage /> },
      { path: '/showcase/:id', element: <ShowcaseDetailPage /> },
      { path: '/join', element: <JoinInterview /> },
    ]
  },
  {
    element: <MainLayout />,
    children: [
      { path: '/about', element: <AboutPage /> },
      { path: '/blog', element: <BlogPage /> },
      { path: '/contact', element: <ContactPage /> },
      { path: '/help', element: <HelpPage /> },
      { path: '/privacy', element: <PrivacyPage /> },
      { path: '/terms', element: <TermsPage /> },
    ]
  },
  {
    path: '/interview',
    element: <ProtectedRoute><InterviewPage /></ProtectedRoute>
  },
  {
    path: '/watch/:code',
    element: <SpectatorPage />
  }
];

