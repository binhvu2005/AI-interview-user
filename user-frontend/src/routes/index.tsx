import React, { Suspense, lazy } from 'react';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// Pages load on demand: heavy libraries (face-api.js, recharts, Quill, simple-peer) then only download
// with the page that uses them instead of all landing in the first bundle.
const LoginPage = lazy(() => import('../pages/Auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/Auth/RegisterPage'));
const PreparationPage = lazy(() => import('../pages/Interview/PreparationPage'));
const InterviewPage = lazy(() => import('../pages/Interview/InterviewPage'));
const DashboardPage = lazy(() => import('../pages/Dashboard/DashboardPage'));
const SettingsPage = lazy(() => import('../pages/User/SettingsPage'));
const ProfilePage = lazy(() => import('../pages/User/ProfilePage'));
const VaultPage = lazy(() => import('../pages/User/VaultPage'));
const UpgradePage = lazy(() => import('../pages/User/UpgradePage'));
const ForumListPage = lazy(() => import('../pages/Forum/ForumListPage'));
const ForumDetailPage = lazy(() => import('../pages/Forum/ForumDetailPage'));
const ResultsPage = lazy(() => import('../pages/Result/ResultsPage'));
const ShowcasePage = lazy(() => import('../pages/Showcase/ShowcasePage'));
const ShowcaseDetailPage = lazy(() => import('../pages/Showcase/ShowcaseDetailPage'));
const JoinInterview = lazy(() => import('../pages/Spectator/JoinInterview'));
const SpectatorPage = lazy(() => import('../pages/Spectator/SpectatorPage'));

// Info pages
const AboutPage = lazy(() => import('../pages/Info/AboutPage'));
const BlogPage = lazy(() => import('../pages/Info/BlogPage'));
const ContactPage = lazy(() => import('../pages/Info/ContactPage'));
const HelpPage = lazy(() => import('../pages/Info/HelpPage'));
const PrivacyPage = lazy(() => import('../pages/Info/PrivacyPage'));
const TermsPage = lazy(() => import('../pages/Info/TermsPage'));
const TestPage = lazy(() => import('../pages/Test/TestPage'));

// Study pages
const StudyListPage = lazy(() => import('../pages/Study/StudyListPage'));
const StudyDetailPage = lazy(() => import('../pages/Study/StudyDetailPage'));
const StudyQuizPage = lazy(() => import('../pages/Study/StudyQuizPage'));

const PageLoader = () => (
  <div className="flex-1 min-h-[50vh] flex items-center justify-center">
    <span className="material-symbols-outlined text-primary text-3xl animate-spin">progress_activity</span>
  </div>
);

// Suspense sits inside each layout, so the header and sidebar stay on screen while a page chunk loads.
const page = (Page: React.LazyExoticComponent<React.ComponentType>) => (
  <Suspense fallback={<PageLoader />}>
    <Page />
  </Suspense>
);

export const AppRoutes = [
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: page(LoginPage) },
      { path: '/register', element: page(RegisterPage) },
    ]
  },
  {
    element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
    children: [
      { path: '/dashboard', element: page(DashboardPage) },
      { path: '/preparation', element: page(PreparationPage) },
      { path: '/profile', element: page(ProfilePage) },
      { path: '/vault', element: page(VaultPage) },
      { path: '/settings', element: page(SettingsPage) },
      { path: '/upgrade', element: page(UpgradePage) },
      { path: '/forum', element: page(ForumListPage) },
      { path: '/forum/:id', element: page(ForumDetailPage) },
      { path: '/results', element: page(ResultsPage) },
      { path: '/results/:id', element: page(ResultsPage) },
      { path: '/showcase', element: page(ShowcasePage) },
      { path: '/showcase/:id', element: page(ShowcaseDetailPage) },
      { path: '/join', element: page(JoinInterview) },
      { path: '/study', element: page(StudyListPage) },
      { path: '/study/quiz', element: page(StudyQuizPage) },
      { path: '/study/:slug', element: page(StudyDetailPage) },
    ]
  },
  {
    element: <MainLayout />,
    children: [
      { path: '/about', element: page(AboutPage) },
      { path: '/blog', element: page(BlogPage) },
      { path: '/contact', element: page(ContactPage) },
      { path: '/help', element: page(HelpPage) },
      { path: '/privacy', element: page(PrivacyPage) },
      { path: '/terms', element: page(TermsPage) },
      { path: '/test', element: page(TestPage) },
    ]
  },
  {
    path: '/interview',
    element: <ProtectedRoute>{page(InterviewPage)}</ProtectedRoute>
  },
  {
    path: '/watch/:code',
    element: page(SpectatorPage)
  }
];
