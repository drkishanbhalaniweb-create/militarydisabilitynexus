import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';

// Eager load critical components (above the fold)
import Home from './pages/Home';
import Layout from './components/Layout';
import Community from './pages/Community';
import QuestionDetail from './pages/QuestionDetail';

// Lazy load non-critical routes
const Services = lazy(() => import('./pages/Services'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));
const CaseStudies = lazy(() => import('./pages/CaseStudies'));
const CaseStudyDetail = lazy(() => import('./pages/CaseStudyDetail'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Forms = lazy(() => import('./pages/Forms'));
const AidAttendanceForm = lazy(() => import('./pages/AidAttendanceForm'));
const IntakeForm = lazy(() => import('./pages/IntakeForm'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const PaymentCanceled = lazy(() => import('./pages/PaymentCanceled'));
const TestPayment = lazy(() => import('./pages/TestPayment'));
const ClaimReadinessReview = lazy(() => import('./pages/ClaimReadinessReview'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Disclaimer = lazy(() => import('./pages/Disclaimer'));

// Lazy load diagnostic pages
const Diagnostic = lazy(() => import('./pages/Diagnostic'));
const DiagnosticResults = lazy(() => import('./pages/DiagnosticResults'));

// Lazy load admin panel (separate chunk)
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminContacts = lazy(() => import('./pages/admin/Contacts'));
const AdminFormSubmissions = lazy(() => import('./pages/admin/FormSubmissions'));
const AdminServices = lazy(() => import('./pages/admin/Services'));
const AdminBlog = lazy(() => import('./pages/admin/Blog'));
const AdminCaseStudies = lazy(() => import('./pages/admin/CaseStudies'));
const AdminServiceForm = lazy(() => import('./pages/admin/ServiceForm'));
const AdminBlogForm = lazy(() => import('./pages/admin/BlogForm'));
const AdminCaseStudyForm = lazy(() => import('./pages/admin/CaseStudyForm'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminCommunity = lazy(() => import('./pages/admin/Community'));
const AdminDiagnostics = lazy(() => import('./pages/admin/Diagnostics'));
const ProtectedRoute = lazy(() => import('./components/admin/ProtectedRoute'));

import './App.css';

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-emerald-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
      <p className="text-slate-600 font-medium">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <Suspense fallback={<PageLoader />}>
          <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="services" element={<Services />} />
          <Route path="services/:slug" element={<ServiceDetail />} />
          <Route path="case-studies" element={<CaseStudies />} />
          <Route path="case-studies/:slug" element={<CaseStudyDetail />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<BlogPost />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="forms" element={<Forms />} />
          <Route path="intake" element={<IntakeForm />} />
          <Route path="aid-attendance-form" element={<AidAttendanceForm />} />
          <Route path="payment/success" element={<PaymentSuccess />} />
          <Route path="payment/canceled" element={<PaymentCanceled />} />
          <Route path="test-payment" element={<TestPayment />} />
          <Route path="claim-readiness-review" element={<ClaimReadinessReview />} />
          <Route path="terms" element={<TermsAndConditions />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="disclaimer" element={<Disclaimer />} />
          <Route path="community" element={<Community />} />
          <Route path="community/question/:slug" element={<QuestionDetail />} />
          <Route path="diagnostic" element={<Diagnostic />} />
          <Route path="diagnostic/results" element={<DiagnosticResults />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/contacts"
          element={
            <ProtectedRoute>
              <AdminContacts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/form-submissions"
          element={
            <ProtectedRoute>
              <AdminFormSubmissions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/services"
          element={
            <ProtectedRoute>
              <AdminServices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/blog"
          element={
            <ProtectedRoute>
              <AdminBlog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/case-studies"
          element={
            <ProtectedRoute>
              <AdminCaseStudies />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/services/new"
          element={
            <ProtectedRoute>
              <AdminServiceForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/services/edit/:id"
          element={
            <ProtectedRoute>
              <AdminServiceForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/blog/new"
          element={
            <ProtectedRoute>
              <AdminBlogForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/community"
          element={
            <ProtectedRoute>
              <AdminCommunity />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/diagnostics"
          element={
            <ProtectedRoute>
              <AdminDiagnostics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/blog/edit/:id"
          element={
            <ProtectedRoute>
              <AdminBlogForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/case-studies/new"
          element={
            <ProtectedRoute>
              <AdminCaseStudyForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/case-studies/edit/:id"
          element={
            <ProtectedRoute>
              <AdminCaseStudyForm />
            </ProtectedRoute>
          }
        />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
