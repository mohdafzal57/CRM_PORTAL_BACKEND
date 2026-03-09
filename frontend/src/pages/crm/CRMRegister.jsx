// CRM Dedicated Register Page
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerAdmin, saveAuthData } from '../../services/api';
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
    CheckCircle2,
    ShieldCheck,
    Zap,
    AlertCircle
} from 'lucide-react';

const CRMRegister = () => {
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
    });

    // UI states
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        setApiError('');
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) newErrors.email = 'Invalid email';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 8) newErrors.password = 'Min 8 characters';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        if (!formData.officeAddress.trim()) newErrors.officeAddress = 'Office address is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

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
            // Default CRM settings
            submitData.append('timezone', 'UTC');
            submitData.append('workingHoursStart', '09:00');
            submitData.append('workingHoursEnd', '18:00');

            const response = await registerAdmin(submitData);

            if (response.success) {
                saveAuthData(response.data.token, response.data.user);
                navigate('/crm');
            }
        } catch (error) {
            console.error('Registration Error Details:', error.response?.data);

            let errorMessage = 'Registration failed. Please try again.';

            if (error.response?.data) {
                const data = error.response.data;
                // Check for express-validator style errors
                if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
                    errorMessage = data.errors[0].message || data.errors[0].msg;
                }
                // Check for direct message or error field
                else if (data.message || data.error) {
                    errorMessage = data.message || data.error;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            setApiError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-50 flex items-center justify-center p-4">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50"></div>

            <div className="relative w-full max-w-6xl bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                {/* Branding Sidebar */}
                <div className="md:w-[400px] bg-emerald-600 relative overflow-hidden text-white p-12 flex flex-col justify-between shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-700"></div>

                    <div className="relative z-10">
                        <Link to="/crm/login" className="inline-flex items-center text-emerald-200 hover:text-white transition-colors text-sm font-bold mb-8">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to CRM Login
                        </Link>
                        <h1 className="text-4xl font-[900] tracking-tight mb-2">CRM<span className="text-emerald-200">Portal.</span></h1>
                        <p className="text-emerald-100 font-medium opacity-80">Empower your sales team.</p>
                    </div>

                    <div className="relative z-10 space-y-8">
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                    <Zap className="w-5 h-5 text-amber-300" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">Sales Velocity</h3>
                                    <p className="text-xs text-emerald-100/70 mt-1">Accelerate your closing process.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                    <ShieldCheck className="w-5 h-5 text-emerald-300" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">Secure Pipeline</h3>
                                    <p className="text-xs text-emerald-100/70 mt-1">Manage deals with confidence.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Area */}
                <div className="flex-1 p-8 md:p-12 overflow-y-auto">
                    <div className="max-w-xl mx-auto">
                        <div className="mb-8">
                            <h2 className="text-3xl font-[900] text-slate-800 tracking-tight mb-2">CRM Registration</h2>
                            <p className="text-slate-500">Scale your business with our CRM tools.</p>
                        </div>

                        {apiError && (
                            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                                <p className="text-sm font-medium text-rose-600">{apiError}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Company</label>
                                    <div className="relative group">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                        <input name="companyName" value={formData.companyName} onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent focus:border-emerald-500 rounded-xl outline-none transition-all text-sm font-bold" placeholder="Acme Inc." />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Admin Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                        <input name="fullName" value={formData.fullName} onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent focus:border-emerald-500 rounded-xl outline-none transition-all text-sm font-bold" placeholder="John Smith" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                    <input name="email" value={formData.email} onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent focus:border-emerald-500 rounded-xl outline-none transition-all text-sm font-bold" placeholder="admin@acme.com" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mobile</label>
                                <div className="relative group">
                                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                    <input name="mobile" value={formData.mobile} onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent focus:border-emerald-500 rounded-xl outline-none transition-all text-sm font-bold" placeholder="+1 234 567 890" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Office Address</label>
                                <div className="relative group">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                    <input name="officeAddress" value={formData.officeAddress} onChange={handleChange} className={`w-full pl-12 pr-4 py-3 bg-slate-50 border ${errors.officeAddress ? 'border-rose-200 bg-rose-50' : 'border-transparent focus:border-emerald-500'} rounded-xl outline-none transition-all text-sm font-bold`} placeholder="123 Sales St, Suite 100" />
                                </div>
                                {errors.officeAddress && <p className="text-rose-500 text-xs font-bold mt-1.5 ml-1">{errors.officeAddress}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Password</label>
                                    <input type="password" name="password" value={formData.password} onChange={handleChange} className={`w-full px-4 py-3 bg-slate-50 border ${errors.password ? 'border-rose-200 bg-rose-50' : 'border-transparent focus:border-emerald-500'} rounded-xl outline-none transition-all text-sm font-bold`} placeholder="••••••••" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Confirm</label>
                                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={`w-full px-4 py-3 bg-slate-50 border ${errors.confirmPassword ? 'border-rose-200 bg-rose-50' : 'border-transparent focus:border-emerald-500'} rounded-xl outline-none transition-all text-sm font-bold`} placeholder="••••••••" />
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-xl transition-all">
                                {loading ? 'Processing...' : 'Register CRM Account'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CRMRegister;
