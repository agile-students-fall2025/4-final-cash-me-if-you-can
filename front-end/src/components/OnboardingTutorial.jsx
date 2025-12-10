import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './OnboardingTutorial.css';

function OnboardingTutorial({ onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [keepData, setKeepData] = useState(true);
  const [showFinalChoice, setShowFinalChoice] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome!',
      description: 'We have added sample data so you can explore all features. This tutorial will show you around.',
      note: 'Sample data is for demo only - you can clear it anytime.',
      route: '/chatbot',
      targetSelector: '.diamond-logo-container.centered',
      position: 'bottom',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    },
    {
      id: 'dashboard',
      title: 'Your Dashboard',
      description: 'View spending patterns, income, and balances with interactive charts.',
      route: '/dashboard',
      targetSelector: '.summary-card',
      position: 'bottom',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
      )
    },
    {
      id: 'transactions',
      title: 'Manage Transactions',
      description: 'Add, edit, and categorize your transactions to track where your money goes.',
      route: '/categorize',
      targetSelector: '.transaction-categories',
      position: 'top',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
      )
    },
    {
      id: 'networth',
      title: 'Track Net Worth',
      description: 'Monitor your assets and liabilities for a complete financial picture.',
      route: '/networth',
      targetSelector: '.net-worth-container',
      position: 'bottom',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v12M8 9h8M8 15h8" />
        </svg>
      )
    },
    {
      id: 'chatbot',
      title: 'AI Assistant',
      description: 'Ask anything about your finances. Try asking about your spending.',
      route: '/chatbot',
      targetSelector: '.landing-input',
      position: 'top',
      suggestedQuery: 'How much did I spend on groceries this month?',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M9 10h.01M15 10h.01M9.5 14a3.5 3.5 0 0 0 5 0" />
        </svg>
      )
    }
  ];

  const currentStepData = steps[currentStep];

  useEffect(() => {
    if (currentStepData && location.pathname !== currentStepData.route) {
      navigate(currentStepData.route);
    }
  }, [currentStep, currentStepData, navigate, location.pathname]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowFinalChoice(true);
    }
  };

  const handleTrySuggestedQuery = () => {
    const query = currentStepData.suggestedQuery;
    if (query) {
      // Store the suggested query for the chatbot to pick up
      localStorage.setItem('onboarding_suggested_query', query);
      // The chatbot page will auto-send this query
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
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
            <h2>You are All Set!</h2>
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
    <div className="onboarding-tooltip-container">
      <button className="skip-tutorial-btn" onClick={handleSkipTutorial}>
        Skip
      </button>

      <div className="onboarding-tooltip">
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

        {currentStepData.note && (
          <p className="tooltip-note">{currentStepData.note}</p>
        )}

        {currentStepData.suggestedQuery && (
          <div className="suggested-query-box">
            <div className="query-header">
              <span className="query-label">Try this query:</span>
              <button className="try-query-btn" onClick={handleTrySuggestedQuery}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
                Send
              </button>
            </div>
            <code>{currentStepData.suggestedQuery}</code>
          </div>
        )}

        <div className="tooltip-footer">
          <div className="progress-indicators">
            {steps.map((_, index) => (
              <span
                key={index}
                className={`progress-dot ${index === currentStep ? 'active' : ''} ${
                  index < currentStep ? 'completed' : ''
                }`}
              />
            ))}
          </div>

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
        </div>
      </div>
    </div>
  );
}

export default OnboardingTutorial;
