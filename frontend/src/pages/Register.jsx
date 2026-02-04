/**
 * Admin Registration Page
 * Only allows admin registration with company creation
 * Role is FORCED to ADMIN - no selection allowed
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerAdmin, saveAuthData } from '../services/api';

// Timezone options
const TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
];

// Time options for working hours
const TIME_OPTIONS = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    const hour = h.toString().padStart(2, '0');
    const minute = m.toString().padStart(2, '0');
    const time24 = `${hour}:${minute}`;
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const ampm = h < 12 ? 'AM' : 'PM';
    const label = `${hour12}:${minute} ${ampm}`;
    TIME_OPTIONS.push({ value: time24, label });
  }
}

// Icon Components
const BuildingIcon = () => (
  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ImageIcon = () => (
  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const XIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
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

const InfoIcon = () => (
  <svg className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ErrorIcon = () => (
  <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Register = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    officeAddress: '',
    latitude: '',
    longitude: '',
    timezone: 'UTC',
    workingHoursStart: '09:00',
    workingHoursEnd: '18:00',
  });
  
  // Logo file state
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  // Handle logo upload
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, logo: 'Please upload a valid image (JPEG, PNG, GIF, WebP)' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, logo: 'Image size should be less than 5MB' }));
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, logo: '' }));
    }
  };

  // Remove logo
  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  // Validate form
  const validateStep = (currentStep) => {
    const newErrors = {};
    
    if (currentStep === 1) {
      if (!formData.companyName.trim()) {
        newErrors.companyName = 'Company name is required';
      } else if (formData.companyName.length < 2) {
        newErrors.companyName = 'Company name must be at least 2 characters';
      }
      
      if (!formData.officeAddress.trim()) {
        newErrors.officeAddress = 'Office address is required';
      }
      
      if (formData.latitude && (isNaN(formData.latitude) || formData.latitude < -90 || formData.latitude > 90)) {
        newErrors.latitude = 'Latitude must be between -90 and 90';
      }
      
      if (formData.longitude && (isNaN(formData.longitude) || formData.longitude < -180 || formData.longitude > 180)) {
        newErrors.longitude = 'Longitude must be between -180 and 180';
      }
    }
    
    if (currentStep === 2) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Full name is required';
      } else if (formData.fullName.length < 2) {
        newErrors.fullName = 'Name must be at least 2 characters';
      }
      
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      
      if (!formData.mobile.trim()) {
        newErrors.mobile = 'Mobile number is required';
      } else if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(formData.mobile)) {
        newErrors.mobile = 'Please enter a valid mobile number';
      }
      
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Password must contain uppercase, lowercase, and number';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  // Handle back
  const handleBack = () => {
    setStep(step - 1);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(2)) return;
    
    setLoading(true);
    setApiError('');
    
    try {
      const submitData = new FormData();
      submitData.append('companyName', formData.companyName.trim());
      submitData.append('fullName', formData.fullName.trim());
      submitData.append('email', formData.email.toLowerCase().trim());
      submitData.append('mobile', formData.mobile.trim());
      submitData.append('password', formData.password);
      submitData.append('officeAddress', formData.officeAddress.trim());
      if (formData.latitude) submitData.append('latitude', formData.latitude);
      if (formData.longitude) submitData.append('longitude', formData.longitude);
      submitData.append('timezone', formData.timezone);
      submitData.append('workingHoursStart', formData.workingHoursStart);
      submitData.append('workingHoursEnd', formData.workingHoursEnd);
      if (logoFile) submitData.append('companyLogo', logoFile);
      
      const response = await registerAdmin(submitData);
      
      if (response.success) {
        saveAuthData(response.data.token, response.data.user);
        navigate('/admin/dashboard');
      }
    } catch (error) {
      setApiError(error.message || 'Registration failed. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <Link to="/login" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
            <ArrowLeftIcon />
            Back to Login
          </Link>
          <div className="flex items-center justify-center mb-4">
            <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BuildingIcon />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Your Company</h1>
          <p className="mt-2 text-gray-600">Register as an Admin to get started</p>
          
          {/* Admin badge */}
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
            <ShieldIcon />
            Admin Registration
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className={`flex items-center ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > 1 ? <CheckIcon /> : '1'}
              </div>
              <span className="ml-2 font-medium hidden sm:inline">Company Info</span>
            </div>
            <div className={`w-16 sm:w-24 h-1 mx-2 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                2
              </div>
              <span className="ml-2 font-medium hidden sm:inline">Admin Details</span>
            </div>
          </div>
        </div>

        {/* API Error */}
        {apiError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start animate-fade-in">
            <ErrorIcon />
            <span className="text-red-700">{apiError}</span>
          </div>
        )}

        {/* Registration Form */}
        <div className="card animate-slide-up">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Company Information */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Company Information</h2>
                
                {/* Company Logo */}
                <div>
                  <label className="label">Company Logo (Optional)</label>
                  <div className="flex items-center space-x-4">
                    {logoPreview ? (
                      <div className="relative">
                        <img 
                          src={logoPreview} 
                          alt="Logo preview" 
                          className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={removeLogo}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 cursor-pointer"
                        >
                          <XIcon />
                        </button>
                      </div>
                    ) : (
                      <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
                        <ImageIcon />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                        />
                      </label>
                    )}
                    <div className="text-sm text-gray-500">
                      <p>Upload your company logo</p>
                      <p>Max 5MB, JPEG/PNG/GIF</p>
                    </div>
                  </div>
                  {errors.logo && <p className="error-text">{errors.logo}</p>}
                </div>

                {/* Company Name */}
                <div>
                  <label htmlFor="companyName" className="label">Company Name *</label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className={`input-field ${errors.companyName ? 'input-error' : ''}`}
                    placeholder="Enter your company name"
                  />
                  {errors.companyName && <p className="error-text">{errors.companyName}</p>}
                </div>

                {/* Office Address */}
                <div>
                  <label htmlFor="officeAddress" className="label">Office Address *</label>
                  <textarea
                    id="officeAddress"
                    name="officeAddress"
                    value={formData.officeAddress}
                    onChange={handleChange}
                    rows={3}
                    className={`input-field resize-none ${errors.officeAddress ? 'input-error' : ''}`}
                    placeholder="Enter your office address"
                  />
                  {errors.officeAddress && <p className="error-text">{errors.officeAddress}</p>}
                </div>

                {/* Coordinates (Optional) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="latitude" className="label">Latitude (Optional)</label>
                    <input
                      type="number"
                      id="latitude"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      step="any"
                      className={`input-field ${errors.latitude ? 'input-error' : ''}`}
                      placeholder="-90 to 90"
                    />
                    {errors.latitude && <p className="error-text">{errors.latitude}</p>}
                  </div>
                  <div>
                    <label htmlFor="longitude" className="label">Longitude (Optional)</label>
                    <input
                      type="number"
                      id="longitude"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      step="any"
                      className={`input-field ${errors.longitude ? 'input-error' : ''}`}
                      placeholder="-180 to 180"
                    />
                    {errors.longitude && <p className="error-text">{errors.longitude}</p>}
                  </div>
                </div>

                {/* Timezone */}
                <div>
                  <label htmlFor="timezone" className="label">Timezone *</label>
                  <select
                    id="timezone"
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleChange}
                    className="input-field"
                  >
                    {TIMEZONES.map(tz => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                </div>

                {/* Working Hours */}
                <div>
                  <label className="label">Working Hours *</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <select
                        name="workingHoursStart"
                        value={formData.workingHoursStart}
                        onChange={handleChange}
                        className="input-field"
                      >
                        {TIME_OPTIONS.map(time => (
                          <option key={time.value} value={time.value}>{time.label}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Start Time</p>
                    </div>
                    <div>
                      <select
                        name="workingHoursEnd"
                        value={formData.workingHoursEnd}
                        onChange={handleChange}
                        className="input-field"
                      >
                        {TIME_OPTIONS.map(time => (
                          <option key={time.value} value={time.value}>{time.label}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">End Time</p>
                    </div>
                  </div>
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-primary w-full flex items-center justify-center"
                >
                  Continue
                  <ArrowRightIcon />
                </button>
              </div>
            )}

            {/* Step 2: Admin Details */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Admin Account Details</h2>
                
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="label">Full Name *</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`input-field ${errors.fullName ? 'input-error' : ''}`}
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && <p className="error-text">{errors.fullName}</p>}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="label">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`input-field ${errors.email ? 'input-error' : ''}`}
                    placeholder="admin@company.com"
                  />
                  {errors.email && <p className="error-text">{errors.email}</p>}
                </div>

                {/* Mobile */}
                <div>
                  <label htmlFor="mobile" className="label">Mobile Number *</label>
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className={`input-field ${errors.mobile ? 'input-error' : ''}`}
                    placeholder="+1 234 567 8900"
                  />
                  {errors.mobile && <p className="error-text">{errors.mobile}</p>}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="label">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`input-field pr-12 ${errors.password ? 'input-error' : ''}`}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {errors.password && <p className="error-text">{errors.password}</p>}
                  <p className="text-xs text-gray-500 mt-1">
                    Min 8 characters with uppercase, lowercase & number
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="label">Confirm Password *</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`input-field ${errors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="Re-enter your password"
                  />
                  {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
                </div>

                {/* Note about admin role */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start">
                    <InfoIcon />
                    <div>
                      <p className="text-blue-800 font-medium">You will be registered as Admin</p>
                      <p className="text-blue-600 text-sm mt-1">
                        As the company admin, you can add employees, HR, and managers from your dashboard.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="btn-secondary flex-1 flex items-center justify-center"
                  >
                    <ArrowLeftIcon />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1 flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <div className="spinner mr-2"></div>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;