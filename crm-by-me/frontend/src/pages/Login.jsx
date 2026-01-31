/**
 * Dual Login Page
 * Supports both Admin Login and Employee Login with toggle
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminLogin, employeeLogin, saveAuthData, isAuthenticated } from '../services/api';

// Icon Components
const BuildingIcon = () => (
  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const EmailIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const ErrorIcon = () => (
  <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const InfoIcon = () => (
  <svg className="w-4 h-4 inline-block mr-1 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckShieldIcon = () => (
  <svg className="w-4 h-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const Login = () => {
  const navigate = useNavigate();
  
  // Login type: 'admin' or 'employee'
  const [loginType, setLoginType] = useState('admin');
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Check if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate(`/${user.role?.toLowerCase()}/dashboard`);
      }
    }
  }, [navigate]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  // Switch login type
  const handleLoginTypeChange = (type) => {
    setLoginType(type);
    setErrors({});
    setApiError('');
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setApiError('');
    
    try {
      const loginFn = loginType === 'admin' ? adminLogin : employeeLogin;
      const response = await loginFn({
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
      });
      
      if (response.success) {
        saveAuthData(response.data.token, response.data.user);
        navigate(response.data.redirectTo || '/admin/dashboard');
      }
    } catch (error) {
      setApiError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo & Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BuildingIcon />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-gray-600">Sign in to your account to continue</p>
        </div>

        {/* Login Type Toggle */}
        <div className="mb-6 animate-fade-in">
          <div className="bg-white p-1.5 rounded-xl shadow-soft flex">
            <button
              type="button"
              onClick={() => handleLoginTypeChange('admin')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center cursor-pointer ${
                loginType === 'admin'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <ShieldIcon />
              Admin Login
            </button>
            <button
              type="button"
              onClick={() => handleLoginTypeChange('employee')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center cursor-pointer ${
                loginType === 'employee'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <UserIcon />
              Employee Login
            </button>
          </div>
        </div>

        {/* API Error */}
        {apiError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start animate-fade-in">
            <ErrorIcon />
            <span className="text-red-700">{apiError}</span>
          </div>
        )}

        {/* Login Form Card */}
        <div className="card animate-slide-up">
          {/* Login Type Info */}
          <div className={`mb-6 p-4 rounded-xl ${
            loginType === 'admin' 
              ? 'bg-purple-50 border border-purple-200' 
              : 'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex items-center">
              {loginType === 'admin' ? (
                <>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-purple-800">Admin Login</p>
                    <p className="text-sm text-purple-600">For company administrators only</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <UsersIcon />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-800">Employee Login</p>
                    <p className="text-sm text-blue-600">For HR, Managers, Employees & Interns</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="label">Email Address</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <EmailIcon />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input-field pl-12 ${errors.email ? 'input-error' : ''}`}
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <LockIcon />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input-field pl-12 pr-12 ${errors.password ? 'input-error' : ''}`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password && <p className="error-text">{errors.password}</p>}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <button type="button" className="text-sm text-primary-600 hover:text-primary-700 font-medium cursor-pointer">
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="spinner mr-2"></div>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRightIcon />
                </>
              )}
            </button>
          </form>

          {/* Employee note */}
          {loginType === 'employee' && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-500">
                <InfoIcon />
                Don't have an account? Contact your company admin.
              </p>
            </div>
          )}
        </div>

        {/* Register Link (Only for Admins) */}
        {loginType === 'admin' && (
          <p className="text-center text-gray-600 mt-8 animate-fade-in">
            New to the platform?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700">
              Register your company
            </Link>
          </p>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Secure login powered by JWT authentication</p>
          <div className="flex items-center justify-center mt-2 space-x-4">
            <span className="flex items-center">
              <CheckShieldIcon />
              256-bit SSL
            </span>
            <span className="flex items-center">
              <LockIcon />
              Encrypted
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;