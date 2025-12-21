import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.jsx';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'

  useEffect(() => {
    // Check if user is already logged in
    if (authService.isLoggedIn()) {
      const professionalType = localStorage.getItem('professionalType');
      if (professionalType) {
        navigate('/dashboard');
      } else {
        navigate('/select-profession');
      }
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (loginMethod === 'password') {
        const result = await authService.login(formData.identifier, formData.password);
        
        if (result.success) {
          // Login successful
          setTimeout(() => {
            const professionalType = localStorage.getItem('professionalType');
            if (professionalType) {
              navigate('/dashboard');
            } else {
              navigate('/select-profession');
            }
          }, 1000);
        } else {
          setError(result.error || 'Login failed');
        }
      } else {
        // OTP login flow
        const result = await authService.forgotPassword(formData.identifier);
        if (result.success) {
          alert(`OTP sent! Demo OTP: ${result.otp}`);
          setLoginMethod('otp');
        } else {
          setError(result.error || 'Failed to send OTP');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await authService.resetPassword(formData.password, 'newpassword123');
      if (result.success) {
        // Auto-login after password reset
        const loginResult = await authService.login(formData.identifier, 'newpassword123');
        if (loginResult.success) {
          setTimeout(() => {
            const professionalType = localStorage.getItem('professionalType');
            if (professionalType) {
              navigate('/dashboard');
            } else {
              navigate('/select-profession');
            }
          }, 1000);
        }
      } else {
        setError(result.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    const demoCreds = authService.getDemoCredentials();
    setFormData({
      identifier: demoCreds.email,
      password: demoCreds.password
    });
  };

  const toggleLoginMethod = () => {
    setLoginMethod(prev => prev === 'password' ? 'otp' : 'password');
    setError('');
    setFormData({ identifier: '', password: '' });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: 20,
          padding: '32px 24px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          width: '100%',
          maxWidth: 400
        }}>
          {/* Logo and Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 80,
              height: 80,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: 32
            }}>
              🏍️
            </div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: 24, color: '#333', fontWeight: 'bold' }}>
              Login Page
            </h1>
            <p style={{ margin: 0, color: '#666', fontSize: 14 }}>
              {loginMethod === 'password' ? 'Sign in to your account' : 'Enter OTP to continue'}
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={loginMethod === 'password' ? handleLogin : handleOtpLogin}>
            {/* Email/Phone Input */}
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 'bold',
                color: '#333',
                marginBottom: 8
              }}>
                {loginMethod === 'password' ? 'Email or Phone Number' : 'Phone Number'}
              </label>
              <input
                type={loginMethod === 'password' ? 'text' : 'tel'}
                name="identifier"
                value={formData.identifier}
                onChange={handleInputChange}
                placeholder={loginMethod === 'password' ? 'Enter email or phone' : 'Enter phone number'}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: 12,
                  fontSize: 16,
                  boxSizing: 'border-box',
                  transition: 'border-color 0.3s'
                }}
                required
              />
            </div>

            {/* Password/OTP Input */}
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 'bold',
                color: '#333',
                marginBottom: 8
              }}>
                {loginMethod === 'password' ? 'Password' : 'OTP'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={loginMethod === 'password' && !showPassword ? 'password' : 'text'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={loginMethod === 'password' ? 'Enter password' : 'Enter 6-digit OTP'}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    paddingRight: loginMethod === 'password' ? '50px' : '16px',
                    border: '2px solid #e0e0e0',
                    borderRadius: 12,
                    fontSize: 16,
                    boxSizing: 'border-box',
                    transition: 'border-color 0.3s'
                  }}
                  required
                />
                {loginMethod === 'password' && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 18,
                      color: '#666'
                    }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                background: '#ffebee',
                color: '#c62828',
                padding: '12px',
                borderRadius: 8,
                marginBottom: 20,
                fontSize: 14,
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                background: isLoading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                padding: '16px',
                fontSize: 16,
                fontWeight: 'bold',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                marginBottom: 16
              }}
            >
              {isLoading ? 'Signing In...' : (loginMethod === 'password' ? 'Sign In' : 'Verify OTP')}
            </button>

            {/* Demo Login Button */}
            {/* {loginMethod === 'password' && (
              <button
                type="button"
                onClick={handleDemoLogin}
                style={{
                  width: '100%',
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: 12,
                  padding: '12px',
                  fontSize: 14,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginBottom: 20
                }}
              >
                🚀 Try Demo Login
              </button>
            )} */}
          </form>
          {/* Register Link */}
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            Don’t have an account?{' '}
            <span style={{ color: '#2563eb', cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate('/register')}>
              Register
            </span>
          </div>

          {/* Toggle Login Method */}
          {/* <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <button
              onClick={toggleLoginMethod}
              style={{
                background: 'none',
                border: 'none',
                color: '#667eea',
                cursor: 'pointer',
                fontSize: 14,
                textDecoration: 'underline'
              }}
            >
              {loginMethod === 'password' ? 'Login with OTP' : 'Login with Password'}
            </button>
          </div> */}

          {/* Forgot Password */}
          {loginMethod === 'password' && (
            <div style={{ textAlign: 'center' }}>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: 14
                }}
              >
                Forgot Password?
              </button>
            </div>
          )}

          {/* Demo Credentials Info */}
          {/* <div style={{
            background: '#f8f9fa',
            borderRadius: 12,
            padding: 16,
            marginTop: 24,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
              <strong>Demo Credentials:</strong>
            </div>
            <div style={{ fontSize: 12, color: '#333', fontFamily: 'monospace' }}>
              Email: pilot@superdelivery.com<br />
              Password: password123
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Login;