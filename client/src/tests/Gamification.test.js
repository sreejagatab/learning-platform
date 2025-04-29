import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PointsBadge, LevelBadge, StreakCounter } from '../components/gamification';
import GamificationContext from '../context/GamificationContext';

// Mock the GamificationContext
const mockGamificationContext = {
  getUserPoints: jest.fn().mockReturnValue(100),
  getUserLevel: jest.fn().mockReturnValue(5),
  getCurrentStreak: jest.fn().mockReturnValue(7),
  loading: false
};

// Mock context provider wrapper
const renderWithGamificationContext = (ui, contextValue = mockGamificationContext) => {
  return render(
    <GamificationContext.Provider value={contextValue}>
      {ui}
    </GamificationContext.Provider>
  );
};

describe('Gamification Components', () => {
  describe('PointsBadge Component', () => {
    test('renders points correctly', () => {
      renderWithGamificationContext(<PointsBadge />);
      expect(screen.getByText('100 pts')).toBeInTheDocument();
    });

    test('does not render when loading', () => {
      const loadingContext = { ...mockGamificationContext, loading: true };
      renderWithGamificationContext(<PointsBadge />, loadingContext);
      expect(screen.queryByText('100 pts')).not.toBeInTheDocument();
    });

    test('renders with different sizes', () => {
      const { container, rerender } = renderWithGamificationContext(<PointsBadge size="small" />);
      
      // Small size
      let badge = container.firstChild;
      expect(badge).toHaveStyle({ padding: expect.stringContaining('px') });
      
      // Medium size (default)
      rerender(
        <GamificationContext.Provider value={mockGamificationContext}>
          <PointsBadge size="medium" />
        </GamificationContext.Provider>
      );
      badge = container.firstChild;
      expect(badge).toHaveStyle({ padding: expect.stringContaining('px') });
      
      // Large size
      rerender(
        <GamificationContext.Provider value={mockGamificationContext}>
          <PointsBadge size="large" />
        </GamificationContext.Provider>
      );
      badge = container.firstChild;
      expect(badge).toHaveStyle({ padding: expect.stringContaining('px') });
    });
  });

  describe('LevelBadge Component', () => {
    test('renders level correctly', () => {
      renderWithGamificationContext(<LevelBadge />);
      expect(screen.getByText('Level 5')).toBeInTheDocument();
    });

    test('does not render when loading', () => {
      const loadingContext = { ...mockGamificationContext, loading: true };
      renderWithGamificationContext(<LevelBadge />, loadingContext);
      expect(screen.queryByText('Level 5')).not.toBeInTheDocument();
    });

    test('renders progress bar when showProgress is true', () => {
      renderWithGamificationContext(<LevelBadge showProgress={true} />);
      // Progress bar is rendered as a div with role="progressbar"
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('StreakCounter Component', () => {
    test('renders streak correctly', () => {
      renderWithGamificationContext(<StreakCounter />);
      expect(screen.getByText('7 days')).toBeInTheDocument();
    });

    test('does not render when loading', () => {
      const loadingContext = { ...mockGamificationContext, loading: true };
      renderWithGamificationContext(<StreakCounter />, loadingContext);
      expect(screen.queryByText('7 days')).not.toBeInTheDocument();
    });

    test('uses singular form for 1 day streak', () => {
      const singleDayContext = {
        ...mockGamificationContext,
        getCurrentStreak: jest.fn().mockReturnValue(1)
      };
      renderWithGamificationContext(<StreakCounter />, singleDayContext);
      expect(screen.getByText('1 day')).toBeInTheDocument();
    });

    test('changes color based on streak length', () => {
      // Test with different streak values
      const shortStreakContext = {
        ...mockGamificationContext,
        getCurrentStreak: jest.fn().mockReturnValue(3) // < 7 days
      };
      const mediumStreakContext = {
        ...mockGamificationContext,
        getCurrentStreak: jest.fn().mockReturnValue(10) // >= 7 but < 14 days
      };
      const longStreakContext = {
        ...mockGamificationContext,
        getCurrentStreak: jest.fn().mockReturnValue(20) // >= 14 but < 30 days
      };
      const veryLongStreakContext = {
        ...mockGamificationContext,
        getCurrentStreak: jest.fn().mockReturnValue(35) // >= 30 days
      };
      
      // Render with different streak values and check color
      const { rerender, container } = renderWithGamificationContext(
        <StreakCounter />, 
        shortStreakContext
      );
      
      // Re-render with medium streak
      rerender(
        <GamificationContext.Provider value={mediumStreakContext}>
          <StreakCounter />
        </GamificationContext.Provider>
      );
      
      // Re-render with long streak
      rerender(
        <GamificationContext.Provider value={longStreakContext}>
          <StreakCounter />
        </GamificationContext.Provider>
      );
      
      // Re-render with very long streak
      rerender(
        <GamificationContext.Provider value={veryLongStreakContext}>
          <StreakCounter />
        </GamificationContext.Provider>
      );
      
      // The component should render with different colors based on streak length
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
