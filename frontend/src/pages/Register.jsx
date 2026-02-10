// Modern Register Page
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerAdmin, saveAuthData } from '../services/api';
import {
  Building2,
  User,
  Mail,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Globe2,
  Clock,
  CheckCircle2,
  Upload,
  X,
  ShieldCheck,
  Zap,
  LayoutDashboard,
  AlertCircle
} from 'lucide-react';

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
      if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
      else if (formData.companyName.length < 2) newErrors.companyName = 'Company name must be at least 2 characters';

      if (!formData.officeAddress.trim()) newErrors.officeAddress = 'Office address is required';

      if (formData.latitude && (isNaN(formData.latitude) || formData.latitude < -90 || formData.latitude > 90)) {
        newErrors.latitude = 'Invalid latitude';
      }

      if (formData.longitude && (isNaN(formData.longitude) || formData.longitude < -180 || formData.longitude > 180)) {
        newErrors.longitude = 'Invalid longitude';
      }
    }

    if (currentStep === 2) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';

      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) newErrors.email = 'Invalid email';

      if (!formData.mobile.trim()) newErrors.mobile = 'Mobile number is required';

      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 8) newErrors.password = 'Min 8 characters';

      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50"></div>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Decorative Color Strip */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] md:w-[120%] h-[300px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rotate-[-10deg] blur-3xl opacity-30 animate-pulse"></div>

      <div className="relative w-full max-w-6xl bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white overflow-hidden flex flex-col md:flex-row min-h-[600px] transition-all duration-500">
        {/* Branding Sidebar */}
        <div className="md:w-[400px] bg-indigo-600 relative overflow-hidden text-white p-12 flex flex-col justify-between shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700"></div>
          <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

          <div className="relative z-10">
            <Link to="/login" className="inline-flex items-center text-indigo-200 hover:text-white transition-colors text-sm font-bold mb-8">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
            </Link>
            <h1 className="text-4xl font-[900] tracking-tight mb-2">CRM<span className="text-indigo-200">Portal.</span></h1>
            <p className="text-indigo-100 font-medium opacity-80">Join industry leaders.</p>
          </div>

          <div className="relative z-10 space-y-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                  <Zap className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Instant Setup</h3>
                  <p className="text-xs text-indigo-100/70 mt-1 leading-relaxed">Get your company up and running in less than 2 minutes.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                  <LayoutDashboard className="w-5 h-5 text-purple-300" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Powerful Dashboard</h3>
                  <p className="text-xs text-indigo-100/70 mt-1 leading-relaxed">Everything you need to manage your team in one place.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                  <ShieldCheck className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Enterprise Security</h3>
                  <p className="text-xs text-indigo-100/70 mt-1 leading-relaxed">Bank-grade encryption and secure data handling.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-xs text-indigo-300/50 mt-12">
            Step {step} of 2
          </div>
        </div>

        {/* Form Area */}
        <div className="flex-1 p-8 md:p-12 overflow-y-auto max-h-[90vh] md:max-h-full scrollbar-none">
          <div className="max-w-xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-[900] text-slate-800 tracking-tight mb-2">Create Account</h2>
              <p className="text-slate-500">Register your company and start managing.</p>
            </div>

            {/* Steps Progress */}
            <div className="flex items-center gap-4 mb-8">
              <div className={`flex-1 h-2 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-indigo-600' : 'bg-slate-100'}`}></div>
              <div className={`flex-1 h-2 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-100'}`}></div>
            </div>

            {apiError && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-rose-600">{apiError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
                  {/* Logo Upload */}
                  <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="relative shrink-0">
                      {logoPreview ? (
                        <>
                          <img src={logoPreview} alt="Logo" className="w-20 h-20 rounded-xl object-cover shadow-sm bg-white" />
                          <button onClick={removeLogo} type="button" className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 hover:bg-rose-600 shadow-sm"><X className="w-3 h-3" /></button>
                        </>
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-white border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                          <Upload className="w-6 h-6 mb-1" />
                          <span className="text-[9px] font-bold uppercase">Logo</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="btn-secondary text-xs py-2 px-4 cursor-pointer relative overflow-hidden">
                        <span>Upload Logo</span>
                        <input type="file" accept="image/*" onChange={handleLogoChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </label>
                      <p className="text-[10px] text-slate-400 mt-2 font-medium">Max 5MB. Formats: PNG, JPG.</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Company Name</label>
                    <div className="relative group">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        className={`input-field pl-12 ${errors.companyName ? 'border-rose-200 bg-rose-50' : ''}`}
                        placeholder="Acme Inc."
                      />
                    </div>
                    {errors.companyName && <p className="text-rose-500 text-xs font-bold mt-1.5 ml-1">{errors.companyName}</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Office Address</label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <textarea
                        name="officeAddress"
                        value={formData.officeAddress}
                        onChange={handleChange}
                        rows={3}
                        className={`input-field pl-12 resize-none ${errors.officeAddress ? 'border-rose-200 bg-rose-50' : ''}`}
                        placeholder="123 Business St, Tech City"
                      />
                    </div>
                    {errors.officeAddress && <p className="text-rose-500 text-xs font-bold mt-1.5 ml-1">{errors.officeAddress}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Latitude <span className="text-slate-300 font-normal normal-case">(Optional)</span></label>
                      <input
                        type="number"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleChange}
                        step="any"
                        className="input-field"
                        placeholder="12.9716"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Longitude <span className="text-slate-300 font-normal normal-case">(Optional)</span></label>
                      <input
                        type="number"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleChange}
                        step="any"
                        className="input-field"
                        placeholder="77.5946"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Timezone</label>
                      <div className="relative">
                        <Globe2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                          name="timezone"
                          value={formData.timezone}
                          onChange={handleChange}
                          className="input-field pl-10 py-3 text-xs"
                        >
                          {TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label.split('(')[0].trim()}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Work Hours</label>
                      <div className="flex items-center gap-2">
                        <select name="workingHoursStart" value={formData.workingHoursStart} onChange={handleChange} className="input-field px-2 py-3 text-xs text-center flex-1">
                          {TIME_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.value}</option>)}
                        </select>
                        <span className="text-slate-400">-</span>
                        <select name="workingHoursEnd" value={formData.workingHoursEnd} onChange={handleChange} className="input-field px-2 py-3 text-xs text-center flex-1">
                          {TIME_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.value}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className={`input-field pl-12 ${errors.fullName ? 'border-rose-200 bg-rose-50' : ''}`}
                        placeholder="John Doe"
                      />
                    </div>
                    {errors.fullName && <p className="text-rose-500 text-xs font-bold mt-1.5 ml-1">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`input-field pl-12 ${errors.email ? 'border-rose-200 bg-rose-50' : ''}`}
                        placeholder="admin@company.com"
                      />
                    </div>
                    {errors.email && <p className="text-rose-500 text-xs font-bold mt-1.5 ml-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mobile Number</label>
                    <div className="relative group">
                      <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        className={`input-field pl-12 ${errors.mobile ? 'border-rose-200 bg-rose-50' : ''}`}
                        placeholder="+91 9876543210"
                      />
                    </div>
                    {errors.mobile && <p className="text-rose-500 text-xs font-bold mt-1.5 ml-1">{errors.mobile}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className={`input-field pl-10 ${errors.password ? 'border-rose-200 bg-rose-50' : ''}`}
                          placeholder="Password"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Confirm</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className={`input-field pl-10 ${errors.confirmPassword ? 'border-rose-200 bg-rose-50' : ''}`}
                          placeholder="Confirm"
                        />
                      </div>
                    </div>
                  </div>
                  {(errors.password || errors.confirmPassword) && (
                    <p className="text-rose-500 text-xs font-bold mt-1 ml-1">{errors.password || errors.confirmPassword}</p>
                  )}

                  <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex gap-3">
                    <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                    <p className="text-xs text-indigo-800 leading-relaxed font-medium">
                      You're creating an <span className="font-bold">Admin Account</span>. This gives you full control over the company dashboard.
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-4 flex gap-4">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold text-sm transition-all"
                  >
                    Back
                  </button>
                )}
                <button
                  type={step === 2 ? 'submit' : 'button'}
                  onClick={step === 1 ? handleNext : undefined}
                  disabled={loading}
                  className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      {step === 1 ? 'Continue' : 'Create Account'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;