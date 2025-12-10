import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './OnboardingTutorial.css';

function OnboardingTutorial({ onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [keepData, setKeepData] = useState(true);
  const [showFinalChoice, setShowFinalChoice] = useState(false);
  const [targetRect, setTargetRect] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState('bottom');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [viewport, setViewport] = useState({ width: window.innerWidth, height: window.innerHeight });
  const touchStartX = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to Clarity AI!',
      description: 'We\'ve added sample data so you can explore all features. Let\'s take a quick tour!',
      route: '/chatbot',
      targetSelector: '.diamond-logo-container.centered',
      highlightPadding: 20,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      )
    },
    {
      id: 'chatbot-input',
      title: 'Ask Anything',
      description: 'Type questions about your finances here. Try: "How much did I spend on food?"',
      route: '/chatbot',
      targetSelector: '.landing-input-form',
      highlightPadding: 8,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )
    },
    {
      id: 'dashboard',
      title: 'Your Dashboard',
      description: 'See spending patterns, income trends, and account balances at a glance.',
      route: '/dashboard',
      targetSelector: '.summary-cards, .dashboard-content',
      highlightPadding: 12,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
      )
    },
    {
      id: 'transactions',
      title: 'Track Transactions',
      description: 'View and categorize your transactions. See where every dollar goes.',
      route: '/categorize',
      targetSelector: '.transactions-list, .transaction-categories, .categorize-page',
      highlightPadding: 12,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
      )
    },
    {
      id: 'networth',
      title: 'Net Worth Tracker',
      description: 'Monitor your total assets minus liabilities for a complete financial picture.',
      route: '/networth',
      targetSelector: '.net-worth-summary, .net-worth-container',
      highlightPadding: 12,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      )
    }
  ];

  const currentStepData = steps[currentStep];
  const isMobile = viewport.width < 768;

  // Handle viewport resize
  useEffect(() => {
    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Prevent body scroll when onboarding is active
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Navigate to the correct route for current step
  useEffect(() => {
    if (currentStepData && location.pathname !== currentStepData.route) {
      setIsTransitioning(true);
      navigate(currentStepData.route);
    }
  }, [currentStep, currentStepData, navigate, location.pathname]);

  // Find and measure target element
  const measureTarget = useCallback(() => {
    if (!currentStepData?.targetSelector) {
      setTargetRect(null);
      return;
    }

    // Try multiple selectors (comma-separated fallbacks)
    const selectors = currentStepData.targetSelector.split(',').map(s => s.trim());
    let element = null;

    for (const selector of selectors) {
      element = document.querySelector(selector);
      if (element) break;
    }

    if (element) {
      const rect = element.getBoundingClientRect();
      const padding = currentStepData.highlightPadding || 8;

      setTargetRect({
        x: rect.x - padding,
        y: rect.y - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
        originalRect: rect
      });

      // Calculate tooltip position
      const targetCenterY = rect.y + rect.height / 2;
      const isInUpperHalf = targetCenterY < viewport.height / 2;
      setTooltipPosition(isInUpperHalf ? 'bottom' : 'top');
    } else {
      // Element not found - show tooltip at bottom
      setTargetRect(null);
      setTooltipPosition('bottom');
    }

    setIsTransitioning(false);
  }, [currentStepData, viewport.height]);

  // Measure after navigation and with a delay for DOM updates
  useEffect(() => {
    const timers = [
      setTimeout(measureTarget, 100),
      setTimeout(measureTarget, 300),
      setTimeout(measureTarget, 600)
    ];
    return () => timers.forEach(clearTimeout);
  }, [currentStep, location.pathname, measureTarget]);

  // Handle swipe gestures
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentStep < steps.length - 1) {
        handleNext();
      } else if (diff < 0 && currentStep > 0) {
        handlePrevious();
      }
    }
    touchStartX.current = null;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setIsTransitioning(true);
      setCurrentStep(currentStep + 1);
    } else {
      setShowFinalChoice(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setIsTransitioning(true);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    onComplete(keepData);
  };

  const handleSkipTutorial = () => {
    if (onSkip) {
      onSkip();
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showFinalChoice) return;

      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'Escape') {
        handleSkipTutorial();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, showFinalChoice]);

  // Final choice screen
  if (showFinalChoice) {
    return (
      <div className="onboarding-final-choice">
        <div className="final-choice-card">
          <div className="final-choice-header">
            <div className="final-choice-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2>You're All Set!</h2>
          </div>

          <p className="final-choice-description">
            What would you like to do with the sample data?
          </p>

          <div className="data-options">
            <label className="data-option-card">
              <input
                type="radio"
                name="dataChoice"
                checked={keepData}
                onChange={() => setKeepData(true)}
              />
              <div className="option-content">
                <div className="option-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <div className="option-text">
                  <strong>Keep exploring</strong>
                  <small>Continue with sample data</small>
                </div>
              </div>
            </label>

            <label className="data-option-card">
              <input
                type="radio"
                name="dataChoice"
                checked={!keepData}
                onChange={() => setKeepData(false)}
              />
              <div className="option-content">
                <div className="option-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </div>
                <div className="option-text">
                  <strong>Start fresh</strong>
                  <small>Clear sample data</small>
                </div>
              </div>
            </label>
          </div>

          <button className="final-choice-button" onClick={handleFinish}>
            Get Started
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="onboarding-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Skip button */}
      <button className="skip-tutorial-btn" onClick={handleSkipTutorial}>
        Skip
      </button>

      {/* SVG Spotlight Overlay */}
      <svg className="spotlight-overlay" preserveAspectRatio="none">
        <defs>
          <mask id="spotlight-mask">
            <rect fill="white" x="0" y="0" width="100%" height="100%" />
            {targetRect && (
              <rect
                fill="black"
                x={targetRect.x}
                y={targetRect.y}
                width={targetRect.width}
                height={targetRect.height}
                rx="12"
                className="spotlight-cutout"
              />
            )}
          </mask>
        </defs>
        <rect
          fill="rgba(0, 0, 0, 0.8)"
          x="0"
          y="0"
          width="100%"
          height="100%"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Highlight ring around target */}
      {targetRect && (
        <div
          className="spotlight-ring"
          style={{
            left: targetRect.x,
            top: targetRect.y,
            width: targetRect.width,
            height: targetRect.height,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className={`onboarding-tooltip ${tooltipPosition} ${isMobile ? 'mobile' : 'desktop'} ${isTransitioning ? 'transitioning' : ''}`}
        style={!isMobile && targetRect ? {
          left: Math.min(
            Math.max(16, targetRect.x + targetRect.width / 2 - 180),
            viewport.width - 376
          ),
          ...(tooltipPosition === 'bottom'
            ? { top: targetRect.y + targetRect.height + 16 }
            : { bottom: viewport.height - targetRect.y + 16 }
          )
        } : {}}
      >
        {/* Drag handle for mobile */}
        {isMobile && <div className="tooltip-drag-handle" />}

        {/* Arrow pointer */}
        {!isMobile && targetRect && (
          <div
            className={`tooltip-arrow ${tooltipPosition}`}
            style={{
              left: Math.max(20, Math.min(
                targetRect.x + targetRect.width / 2 - (Math.min(
                  Math.max(16, targetRect.x + targetRect.width / 2 - 180),
                  viewport.width - 376
                )),
                340
              ))
            }}
          />
        )}

        <div className="tooltip-header">
          <div className="tooltip-icon">{currentStepData.icon}</div>
          <div className="tooltip-title-section">
            <h3>{currentStepData.title}</h3>
            <div className="step-indicator">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>
        </div>

        <p className="tooltip-description">{currentStepData.description}</p>

        {/* Progress dots */}
        <div className="progress-indicators">
          {steps.map((_, index) => (
            <button
              key={index}
              className={`progress-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
              onClick={() => {
                setIsTransitioning(true);
                setCurrentStep(index);
              }}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="tooltip-actions">
          <button
            className="tooltip-btn secondary"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            Back
          </button>
          <button className="tooltip-btn primary" onClick={handleNext}>
            {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>

        {/* Swipe hint for mobile */}
        {isMobile && (
          <p className="swipe-hint">Swipe left or right to navigate</p>
        )}
      </div>
    </div>
  );
}

export default OnboardingTutorial;
