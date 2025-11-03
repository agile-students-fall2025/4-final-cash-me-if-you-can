import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext'
import './LoginPage.css';

function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const { user, changeFirstName, changeLastName, changeEmail, changePassword, resetUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/home');
  };


  const toggleMode = () => {
    setIsSignUp(!isSignUp);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>cash me if you can</h1>
          <p>{isSignUp ? 'Create your account' : 'Sign in to your account'}</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {isSignUp && (
            <>
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  value={user.firstName}
                  onChange={(e) => changeFirstName(e.target.value)}
                  placeholder="Enter your first name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  value={user.lastName}
                  onChange={(e) => changeLastName(e.target.value)}
                  placeholder="Enter your last name"
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={user.email}
              onChange={(e) => changeEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={user.password}
              onChange={(e) => changePassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="signin-button">
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>

          <div className="form-footer">
            {!isSignUp && <a href="#" className="forgot-password">Forgot password?</a>}
            <button type="button" className="toggle-mode" onClick={toggleMode}>
              {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
