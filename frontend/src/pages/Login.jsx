// Modern Login Page
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  User
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminLogin, employeeLogin, isAuthenticated, saveAuthData } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState('admin');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user && user.role) {
        if (user.role === 'ADMIN') navigate('/admin/dashboard');
        else if (user.role === 'EMPLOYEE') navigate('/employee/dashboard');

        else navigate(`/${user.role.toLowerCase()}/dashboard`);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, [navigate]);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setApiError('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
  
        const role = response.data.user.role;
  
        if (role === "EMPLOYEE") {
          navigate("/employee/dashboard");
        } else if (role === "ADMIN") {
          navigate("/admin/dashboard");
        } else {
          navigate(`/${role.toLowerCase()}/dashboard`);
        }
      }
  
    } catch (error) {
      setApiError(error.message || 'Login failed. Please check your credentials.');
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

      <div className="relative w-full max-w-5xl bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white overflow-hidden flex flex-col md:flex-row min-h-[600px]">

        {/* Left Side - Branding */}
        <div className="md:w-1/2 p-12 bg-indigo-600 relative overflow-hidden text-white flex flex-col justify-between">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700"></div>
          <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

          {/* Decorative Circles */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <h1 className="text-4xl font-[900] tracking-tight mb-2">CRM<span className="text-indigo-200">Portal.</span></h1>
            <p className="text-indigo-100 font-medium">Enterprise Management System</p>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="glass-layer bg-white/10 border-white/20 p-6 backdrop-blur-md rounded-2xl">
              <h3 className="text-lg font-bold mb-2">Why join us?</h3>
              <ul className="space-y-3 text-sm text-indigo-50">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Real-time Analytics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Seamless Collaboration
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Secure Data Management
                </li>
              </ul>
            </div>
            <p className="text-xs text-indigo-300">© 2024 CRM Portal. Secure & Reliable.</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white/50">
          <div className="mb-8">
            <h2 className="text-3xl font-[900] text-slate-800 tracking-tight mb-2">Welcome Back</h2>
            <p className="text-slate-500">Please sign in to your account</p>
          </div>

          {/* Type Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex mb-8">
            <button
              onClick={() => setLoginType('admin')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${loginType === 'admin'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              <Shield className="w-4 h-4" /> Admin
            </button>
            <button
              onClick={() => setLoginType('employee')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${loginType === 'employee'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              <User className="w-4 h-4" /> Employee
            </button>
          </div>

          {apiError && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-rose-600">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 ${errors.email ? 'border-rose-200 bg-rose-50' : 'border-transparent focus:border-indigo-500 focus:bg-white'} rounded-xl text-sm font-bold text-slate-700 outline-none transition-all placeholder:text-slate-400`}
                  placeholder="name@company.com"
                />
              </div>
              {errors.email && <p className="text-rose-500 text-xs font-bold mt-1.5 ml-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-3.5 bg-slate-50 border-2 ${errors.password ? 'border-rose-200 bg-rose-50' : 'border-transparent focus:border-indigo-500 focus:bg-white'} rounded-xl text-sm font-bold text-slate-700 outline-none transition-all placeholder:text-slate-400`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-rose-500 text-xs font-bold mt-1.5 ml-1">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                <span className="ml-2 text-xs font-bold text-slate-500 group-hover:text-slate-700 transition-colors">Remember me</span>
              </label>
              <button type="button" className="text-xs font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-wide">
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl font-bold text-sm shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {loginType === 'admin' && (
            <div className="mt-8 text-center">
              <span className="text-slate-500 text-sm">Need a company account? </span>
              <Link to="/register" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
                Register Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;