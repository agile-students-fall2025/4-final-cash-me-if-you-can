import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignIn = (e) => {
    e.preventDefault();
    navigate('/home');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>cash me if you can</h1>
          <p>Sign in to your account</p>
        </div>

        <form className="login-form" onSubmit={handleSignIn}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="signin-button">
            Sign In
          </button>

          <div className="form-footer">
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
