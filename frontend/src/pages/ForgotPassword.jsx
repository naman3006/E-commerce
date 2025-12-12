import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../store/api/api';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [stage, setStage] = useState('EMAIL'); // EMAIL, OTP, PASSWORD
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    // Removed ref since we handle auto-submit in onChange now

    // Helper to handle API errors consistently
    const handleError = (err) => {
        const status = err.response?.status;
        const msg = err.response?.data?.message || 'Something went wrong';

        if (status === 404) {
            toast.error('Account not found. Redirecting to registration...', { toastId: 'account-404' });
            setTimeout(() => navigate('/register'), 2000);
        } else {
            console.error('Forgot Password Error:', err);
            toast.error(msg, { toastId: 'api-error' });
        }
    };

    const handleEmailSubmit = async (e) => {
        if (e) e.preventDefault();
        const trimmedEmail = email.trim();
        if (!trimmedEmail) return toast.error('Please enter your email', { toastId: 'email-req' });

        setLoading(true);
        try {
            const res = await api.post('/auth/forgot-password', { email: trimmedEmail });
            toast.success('OTP sent to your email!', { toastId: 'otp-sent' });
            const data = res.data.data || res.data;
            if (data.previewUrl) {
                console.log('Ethereal Email Preview:', data.previewUrl);
                setPreviewUrl(data.previewUrl);
            }
            setStage('OTP');
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpVerify = useCallback(async (otpValue) => {
        const cleanOtp = otpValue.trim();
        if (!cleanOtp || cleanOtp.length !== 6) return;

        setLoading(true);
        try {
            const res = await api.post('/auth/verify-otp', { email: email.trim(), otp: cleanOtp });
            // Check res.data.data.isValid because of TransFormInterceptor
            if (res.data.data && res.data.data.isValid) {
                toast.success('OTP Verified!', { toastId: 'otp-success' });
                setStage('PASSWORD');
            } else {
                toast.error('Invalid OTP', { toastId: 'otp-invalid' });
            }
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    }, [email]);

    // Auto-submit OTP when 6 digits are entered
    // Auto-submit OTP when 6 digits are entered
    const handleOtpChange = (e) => {
        const val = e.target.value.replace(/\D/g, '');
        setOtp(val);

        if (val.length === 6 && stage === 'OTP' && !loading) {
            handleOtpVerify(val);
        }
    };

    const handlePasswordReset = async (e) => {
        if (e) e.preventDefault();
        if (newPassword !== confirmPassword) {
            return toast.error('Passwords do not match', { toastId: 'pwd-match' });
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', {
                email: email.trim(),
                otp: otp.trim(),
                newPassword
            });
            toast.success('Password reset successfully! Please login.', { toastId: 'reset-success' });
            navigate('/login');
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    };

    // Main submit handler (for button clicks / Enter key)
    const handleSubmit = (e) => {
        e.preventDefault();
        if (loading) return;

        if (stage === 'EMAIL') handleEmailSubmit();
        else if (stage === 'OTP') {
            if (otp.trim().length !== 6) {
                toast.error('Please enter a valid 6-digit OTP', { toastId: 'otp-len' });
            } else {
                lastAttemptedOtpRef.current = otp.trim();
                handleOtpVerify(otp);
            }
        }
        else if (stage === 'PASSWORD') handlePasswordReset();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {stage === 'EMAIL' && 'Reset Password'}
                        {stage === 'OTP' && 'Verify OTP'}
                        {stage === 'PASSWORD' && 'Set New Password'}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {stage === 'EMAIL' && "Enter your email to receive a One-Time Password."}
                        {stage === 'OTP' && `Enter the 6-digit code sent to ${email}.`}
                        {stage === 'PASSWORD' && "Create a new secure password."}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">

                        {stage === 'EMAIL' && (
                            <div>
                                <label htmlFor="email-address" className="sr-only">Email address</label>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        )}

                        {stage === 'OTP' && (
                            <div>
                                <label htmlFor="otp" className="sr-only">OTP</label>
                                <input
                                    id="otp"
                                    name="otp"
                                    type="text"
                                    required
                                    maxLength={6}
                                    className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm text-center tracking-widest text-xl"
                                    placeholder="000000"
                                    value={otp}
                                    onChange={handleOtpChange}
                                    autoFocus
                                />
                            </div>
                        )}

                        {stage === 'PASSWORD' && (
                            <div className="space-y-2">
                                <div>
                                    <label htmlFor="new-password" className="sr-only">New Password</label>
                                    <input
                                        id="new-password"
                                        name="newPassword"
                                        type="password"
                                        required
                                        className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                        placeholder="New Password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
                                    <input
                                        id="confirm-password"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                        placeholder="Confirm New Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Processing...' : (
                                stage === 'EMAIL' ? 'Send OTP' :
                                    stage === 'OTP' ? 'Verify OTP' :
                                        'Reset Password'
                            )}
                        </button>
                        {stage === 'OTP' && previewUrl && (
                            <div className="mt-4 text-center">
                                <a
                                    href={previewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-500 hover:text-blue-700 underline"
                                >
                                    [DEV] Open Ethereal Email
                                </a>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-center">
                        <div className="text-sm">
                            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Back to Sign in
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
