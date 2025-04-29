import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { LearningProvider } from '../context/LearningContext';
import { GamificationProvider } from '../context/GamificationContext';
import { AnalyticsProvider } from '../context/AnalyticsContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import LearningCard from '../components/learning/LearningCard';
import HistoryItem from '../components/learning/HistoryItem';
import ContentCard from '../components/content/ContentCard';
import BadgeCard from '../components/gamification/BadgeCard';
import ProgressBar from '../components/common/ProgressBar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import Modal from '../components/common/Modal';

// Mock context values
const mockAuthContext = {
  user: {
    _id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user'
  },
  isAuthenticated: true,
  loading: false,
  logout: jest.fn()
};

const mockLearningContext = {
  askQuestion: jest.fn(),
  saveContent: jest.fn(),
  deleteContent: jest.fn()
};

const mockGamificationContext = {
  points: 100,
  level: 5,
  streak: 7,
  badges: []
};

const mockAnalyticsContext = {
  trackPageView: jest.fn(),
  trackContentView: jest.fn()
};

// Helper function to render with all providers
const renderWithProviders = (ui, contextValues = {}) => {
  const allContextValues = {
    auth: { ...mockAuthContext, ...contextValues.auth },
    learning: { ...mockLearningContext, ...contextValues.learning },
    gamification: { ...mockGamificationContext, ...contextValues.gamification },
    analytics: { ...mockAnalyticsContext, ...contextValues.analytics }
  };
  
  return render(
    <BrowserRouter>
      <AuthProvider value={allContextValues.auth}>
        <LearningProvider value={allContextValues.learning}>
          <GamificationProvider value={allContextValues.gamification}>
            <AnalyticsProvider value={allContextValues.analytics}>
              {ui}
            </AnalyticsProvider>
          </GamificationProvider>
        </LearningProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Layout Components', () => {
  test('Navbar should render correctly when authenticated', () => {
    renderWithProviders(<Navbar />);
    
    expect(screen.getByText(/LearnSphere/i)).toBeInTheDocument();
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Learn/i)).toBeInTheDocument();
    expect(screen.getByText(/My Content/i)).toBeInTheDocument();
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
    expect(screen.getByText(/Test User/i)).toBeInTheDocument();
  });
  
  test('Navbar should render correctly when not authenticated', () => {
    renderWithProviders(<Navbar />, {
      auth: {
        user: null,
        isAuthenticated: false
      }
    });
    
    expect(screen.getByText(/LearnSphere/i)).toBeInTheDocument();
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
    expect(screen.getByText(/Register/i)).toBeInTheDocument();
    expect(screen.queryByText(/Dashboard/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Logout/i)).not.toBeInTheDocument();
  });
  
  test('Footer should render correctly', () => {
    renderWithProviders(<Footer />);
    
    expect(screen.getByText(/LearnSphere/i)).toBeInTheDocument();
    expect(screen.getByText(/© 2023/i)).toBeInTheDocument();
    expect(screen.getByText(/Privacy Policy/i)).toBeInTheDocument();
    expect(screen.getByText(/Terms of Service/i)).toBeInTheDocument();
  });
});

describe('Learning Components', () => {
  test('LearningCard should render correctly', () => {
    const learningItem = {
      _id: 'item-123',
      title: 'JavaScript Basics',
      content: 'Learn the basics of JavaScript',
      type: 'article',
      createdAt: new Date().toISOString()
    };
    
    renderWithProviders(<LearningCard item={learningItem} />);
    
    expect(screen.getByText(/JavaScript Basics/i)).toBeInTheDocument();
    expect(screen.getByText(/Learn the basics of JavaScript/i)).toBeInTheDocument();
    expect(screen.getByText(/article/i)).toBeInTheDocument();
  });
  
  test('HistoryItem should render correctly', () => {
    const historyItem = {
      _id: 'history-123',
      query: 'What is JavaScript?',
      queryTimestamp: new Date().toISOString()
    };
    
    renderWithProviders(<HistoryItem item={historyItem} />);
    
    expect(screen.getByText(/What is JavaScript?/i)).toBeInTheDocument();
    expect(screen.getByText(/View/i)).toBeInTheDocument();
  });
  
  test('ContentCard should render correctly', () => {
    const contentItem = {
      _id: 'content-123',
      title: 'JavaScript Notes',
      content: 'My notes on JavaScript',
      type: 'note',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    renderWithProviders(<ContentCard content={contentItem} />);
    
    expect(screen.getByText(/JavaScript Notes/i)).toBeInTheDocument();
    expect(screen.getByText(/note/i)).toBeInTheDocument();
    expect(screen.getByText(/Edit/i)).toBeInTheDocument();
    expect(screen.getByText(/Delete/i)).toBeInTheDocument();
  });
  
  test('ContentCard should call deleteContent when delete button is clicked', async () => {
    const deleteContentMock = jest.fn();
    
    const contentItem = {
      _id: 'content-123',
      title: 'JavaScript Notes',
      content: 'My notes on JavaScript',
      type: 'note',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    renderWithProviders(
      <ContentCard content={contentItem} />,
      {
        learning: {
          deleteContent: deleteContentMock
        }
      }
    );
    
    // Click delete button
    fireEvent.click(screen.getByText(/Delete/i));
    
    // Confirm deletion in modal
    fireEvent.click(screen.getByText(/Confirm/i));
    
    // Check if deleteContent was called with the right ID
    await waitFor(() => {
      expect(deleteContentMock).toHaveBeenCalledWith('content-123');
    });
  });
});

describe('Gamification Components', () => {
  test('BadgeCard should render correctly', () => {
    const badge = {
      _id: 'badge-123',
      name: 'JavaScript Master',
      description: 'Completed 10 JavaScript lessons',
      icon: '/badges/js-master.png',
      earnedAt: new Date().toISOString()
    };
    
    renderWithProviders(<BadgeCard badge={badge} />);
    
    expect(screen.getByText(/JavaScript Master/i)).toBeInTheDocument();
    expect(screen.getByText(/Completed 10 JavaScript lessons/i)).toBeInTheDocument();
    expect(screen.getByAltText(/JavaScript Master/i)).toBeInTheDocument();
  });
});

describe('Common Components', () => {
  test('ProgressBar should render correctly', () => {
    renderWithProviders(<ProgressBar value={75} max={100} label="Progress" />);
    
    expect(screen.getByText(/Progress/i)).toBeInTheDocument();
    expect(screen.getByText(/75%/i)).toBeInTheDocument();
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '75');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });
  
  test('LoadingSpinner should render correctly', () => {
    renderWithProviders(<LoadingSpinner />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
  
  test('Alert should render correctly', () => {
    renderWithProviders(<Alert type="success" message="Operation successful" />);
    
    expect(screen.getByText(/Operation successful/i)).toBeInTheDocument();
    expect(screen.getByTestId('alert')).toHaveClass('alert-success');
  });
  
  test('Modal should render correctly and handle close', () => {
    const onCloseMock = jest.fn();
    
    renderWithProviders(
      <Modal isOpen={true} onClose={onCloseMock} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    
    expect(screen.getByText(/Test Modal/i)).toBeInTheDocument();
    expect(screen.getByText(/Modal content/i)).toBeInTheDocument();
    
    // Click close button
    fireEvent.click(screen.getByLabelText(/close/i));
    
    // Check if onClose was called
    expect(onCloseMock).toHaveBeenCalled();
  });
  
  test('Modal should not render when closed', () => {
    renderWithProviders(
      <Modal isOpen={false} onClose={jest.fn()} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    
    expect(screen.queryByText(/Test Modal/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Modal content/i)).not.toBeInTheDocument();
  });
});
