import React, { useState } from 'react';
import CRMLayout from '../../components/crm/CRMLayout';
import { Settings as SettingsIcon, Bell, Shield, Eye, Globe, Save } from 'lucide-react';

const Settings = () => {
    const [settings, setSettings] = useState({
        emailNotifications: true,
        browserNotifications: true,
        twoFactorAuth: false,
        publicProfile: true,
        language: 'English'
    });

    const toggleSetting = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <CRMLayout>
            <div className="max-w-4xl mx-auto py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <SettingsIcon className="text-blue-500" />
                        Portal Settings
                    </h1>
                    <p className="text-gray-500">Customize your CRM experience and security preferences</p>
                </div>

                <div className="space-y-6">
                    {/* Notifications */}
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Bell size={20} className="text-blue-500" />
                            Notifications
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <div>
                                    <p className="font-semibold text-gray-900">Email Notifications</p>
                                    <p className="text-sm text-gray-500">Receive lead alerts and reports via email</p>
                                </div>
                                <button
                                    onClick={() => toggleSetting('emailNotifications')}
                                    className={`w-12 h-6 rounded-full transition-colors ${settings.emailNotifications ? 'bg-blue-500' : 'bg-gray-300'} relative`}
                                >
                                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.emailNotifications ? 'right-1' : 'left-1'}`}></span>
                                </button>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <div>
                                    <p className="font-semibold text-gray-900">Desktop Notifications</p>
                                    <p className="text-sm text-gray-500">Real-time alerts in your browser</p>
                                </div>
                                <button
                                    onClick={() => toggleSetting('browserNotifications')}
                                    className={`w-12 h-6 rounded-full transition-colors ${settings.browserNotifications ? 'bg-blue-500' : 'bg-gray-300'} relative`}
                                >
                                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.browserNotifications ? 'right-1' : 'left-1'}`}></span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Shield size={20} className="text-green-500" />
                            Security
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <div>
                                    <p className="font-semibold text-gray-900">Two-Factor Authentication</p>
                                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                                </div>
                                <button
                                    onClick={() => toggleSetting('twoFactorAuth')}
                                    className={`w-12 h-6 rounded-full transition-colors ${settings.twoFactorAuth ? 'bg-blue-500' : 'bg-gray-300'} relative`}
                                >
                                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.twoFactorAuth ? 'right-1' : 'left-1'}`}></span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                            <Save size={20} />
                            Save All Settings
                        </button>
                    </div>
                </div>
            </div>
        </CRMLayout>
    );
};

export default Settings;
