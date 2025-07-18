import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CircularProgress, Box } from '@mui/material';

// Feedback Widget
import FeedbackWidget from './components/FeedbackWidget';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { LearningProvider } from './context/LearningContext';
import { LearningPathProvider } from './context/LearningPathContext';
import { GamificationProvider } from './context/GamificationContext';
import { AnalyticsProvider } from './context/AnalyticsContext';
import UserPreferencesContext, { UserPreferencesProvider } from './context/UserPreferencesContext';

// Layout Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import PrivateRoute from './components/common/PrivateRoute';

// Loading component for suspense fallback
const LoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: 'calc(100vh - 140px)'
    }}
  >
    <CircularProgress size={60} thickness={4} />
  </Box>
);

// Lazy-loaded Pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Learn = lazy(() => import('./pages/Learn'));
const LearningPath = lazy(() => import('./pages/LearningPath'));
const Content = lazy(() => import('./pages/Content'));
const ContentCreation = lazy(() => import('./pages/ContentCreation'));
const History = lazy(() => import('./pages/History'));
const Profile = lazy(() => import('./pages/Profile'));
const Gamification = lazy(() => import('./pages/Gamification'));
const Analytics = lazy(() => import('./pages/Analytics'));
const UserPreferences = lazy(() => import('./pages/UserPreferences'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Theme will be created dynamically based on user preferences
const createAppTheme = (mode = 'light') => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#1976d2',
        light: '#42a5f5',
        dark: '#1565c0',
      },
      secondary: {
        main: '#9c27b0',
        light: '#ba68c8',
        dark: '#7b1fa2',
      },
      background: {
        default: mode === 'light' ? '#f5f5f5' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 500,
      },
      h2: {
        fontWeight: 500,
      },
      h3: {
        fontWeight: 500,
      },
      h4: {
        fontWeight: 500,
      },
      h5: {
        fontWeight: 500,
      },
      h6: {
        fontWeight: 500,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: mode === 'light'
              ? '0 4px 12px 0 rgba(0,0,0,0.05)'
              : '0 4px 12px 0 rgba(0,0,0,0.2)',
          },
        },
      },
    },
  });
};

function App() {
  return (
    <UserPreferencesProvider>
      <AppWithPreferences />
    </UserPreferencesProvider>
  );
}

// Inner component that has access to user preferences
function AppWithPreferences() {
  // Get theme preference from context
  const { preferences } = React.useContext(UserPreferencesContext);

  // Create theme based on user preference
  const theme = createAppTheme(preferences.theme);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <LearningProvider>
          <LearningPathProvider>
            <GamificationProvider>
              <AnalyticsProvider>
                <Router>
                  <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    theme={preferences.theme}
                  />
                  <Navbar />
                  <main style={{ minHeight: 'calc(100vh - 140px)', paddingTop: '64px' }}>
                    <Suspense fallback={<LoadingFallback />}>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                        <Route path="/learn" element={<PrivateRoute><Learn /></PrivateRoute>} />
                        <Route path="/learning-path/:pathId?" element={<PrivateRoute><LearningPath /></PrivateRoute>} />
                        <Route path="/content/:contentId" element={<PrivateRoute><Content /></PrivateRoute>} />
                        <Route path="/content/create" element={<PrivateRoute><ContentCreation /></PrivateRoute>} />
                        <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
                        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                        <Route path="/preferences" element={<PrivateRoute><UserPreferences /></PrivateRoute>} />
                        <Route path="/gamification" element={<PrivateRoute><Gamification /></PrivateRoute>} />
                        <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </main>
                  <Footer />
                  {/* Add feedback widget to all pages */}
                  <FeedbackWidget />
                </Router>
              </AnalyticsProvider>
            </GamificationProvider>
          </LearningPathProvider>
        </LearningProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
