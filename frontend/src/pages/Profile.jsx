import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile, uploadAvatar, deleteAccount, getProfile } from '../store/slices/authSlice';
import { toast } from 'react-toastify';
import api from '../store/api/api';
import UserActivityLog from '../components/profile/UserActivityLog';
import OptimizedImage from '../components/common/OptimizedImage';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  // 2FA State
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [secret, setSecret] = useState('');
  const [otpauthUrl, setOtpauthUrl] = useState('');
  const [debugUrl, setDebugUrl] = useState('');
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error('Name and Email are required');
      return;
    }

    const phoneRegex = /^(\+?\d{10,15})?$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s+/g, ''))) {
      toast.error('Invalid phone number format');
      return;
    }

    try {
      await dispatch(updateProfile({
        id: user._id || user.id,
        data: {
          ...formData,
          phone: formData.phone.replace(/\s+/g, '')
        }
      })).unwrap();

      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    }
  };

  const handleEnable2FA = async () => {
    try {
      const response = await api.post('/auth/2fa/generate');
      setQrCodeUrl(response.data.qrCodeUrl);
      setSecret(response.data.secret);
      setOtpauthUrl(response.data.otpauthUrl);
      setDebugUrl(response.data.debugUrl);
      setShowTwoFactorSetup(true);
    } catch (err) {
      toast.error('Failed to generate 2FA QR Code');
    }
  };

  const handleVerify2FA = async () => {
    try {
      await api.post('/auth/2fa/turn-on', { twoFactorAuthenticationCode: twoFactorCode });
      toast.success('Two-factor authentication enabled!');
      setShowTwoFactorSetup(false);
      dispatch(getProfile());
    } catch (err) {
      toast.error('Invalid code. Please try again.');
    }
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 10 }
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-6xl mx-auto space-y-8 pb-12 px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Profile Header Card */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-3xl shadow-xl shadow-indigo-100 overflow-hidden border border-gray-100 relative group"
      >
        <div className="h-32 sm:h-48 bg-gradient-to-r from-primary-600 to-indigo-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          />
        </div>

        <div className="px-6 sm:px-8 pb-8 relative">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end -mt-16 sm:-mt-20 mb-6 gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left">
              <div className="relative group">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white p-1.5 shadow-2xl ring-4 ring-white relative z-10"
                >
                  <OptimizedImage
                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover bg-gray-50"
                  />

                  {/* Avatar Upload Overlay */}
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full cursor-pointer z-20 backdrop-blur-[2px]">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          try {
                            await dispatch(uploadAvatar({ id: user._id || user.id, file })).unwrap();
                            toast.success('Profile picture updated!');
                          } catch (err) {
                            toast.error(err.message || 'Failed to upload image');
                          }
                        }
                      }}
                    />
                    <div className="flex flex-col items-center">
                      <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <span className="text-xs font-semibold">Change</span>
                    </div>
                  </label>
                </motion.div>

                {user.avatar && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={async () => {
                      try {
                        await dispatch(updateProfile({ id: user._id || user.id, data: { avatar: null } })).unwrap();
                        toast.success('Profile picture removed');
                      } catch (err) {
                        toast.error('Failed to remove picture');
                      }
                    }}
                    className="absolute bottom-1 right-1 bg-white text-red-500 rounded-full p-2 shadow-lg border border-gray-100 z-30"
                    title="Remove photo"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </motion.button>
                )}
              </div>

              <div className="mb-2 sm:mb-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-display flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                  {user.name}
                  {(user.role === 'admin' || user.role === 'seller') && (
                    <span className={`text-xs px-3 py-1 rounded-full uppercase tracking-wide font-bold shadow-sm ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}>
                      {user.role}
                    </span>
                  )}
                </h1>
                <p className="text-gray-500 font-medium flex items-center justify-center sm:justify-start gap-2 mt-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  {user.email}
                </p>
                <div className="text-xs text-gray-400 mt-2 flex items-center justify-center sm:justify-start gap-1">
                  <span>Member since {new Date(user.createdAt || Date.now()).getFullYear()}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <motion.button
                whileHover={{ scale: 1.02, translateY: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsEditing(!isEditing)}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-md ${isEditing
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                  }`}
              >
                {isEditing ? (
                  <>Cancel</>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Edit Profile
                  </>
                )}
              </motion.button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!isEditing ? (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8"
              >
                {/* Left Column: Personal Info & Status */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Personal Info */}
                  <div className="bg-gray-50/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      Personal Details
                    </h3>
                    <div className="space-y-4">
                      <div className="group">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">Phone Number</label>
                        <p className={`font-semibold text-gray-900 ${!user.phone && 'text-gray-400 italic'}`}>
                          {user.phone ? `+91 ${user.phone}` : 'Not provided'}
                        </p>
                      </div>
                      <div className="group">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">User ID</label>
                        <p className="text-xs font-mono text-gray-500 bg-white px-2 py-1 rounded border border-gray-200 inline-block break-all">{user._id || user.id}</p>
                      </div>
                    </div>
                  </div>

                  {/* Account Status */}
                  <div className="bg-gray-50/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Account Status</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <span className="text-sm font-medium text-gray-600">Verification</span>
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Verified</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <span className="text-sm font-medium text-gray-600">Status</span>
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Active</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Security</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${user.isTwoFactorEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                          {user.isTwoFactorEnabled ? '2FA ON' : '2FA OFF'}
                        </span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={user.isTwoFactorEnabled
                          ? async () => {
                            try { await api.post('/auth/2fa/turn-off'); toast.success('2FA Disabled'); dispatch(getProfile()); }
                            catch (err) { toast.error('Failed to disable 2FA'); }
                          }
                          : handleEnable2FA}
                        className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${user.isTwoFactorEnabled
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                          }`}
                      >
                        {user.isTwoFactorEnabled ? 'Disable Two-Factor Auth' : 'Enable Two-Factor Auth'}
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Right Column: Loyalty & Activity */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Loyalty Card */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-8">
                        <div>
                          <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Total Rewards</p>
                          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">{user.loyaltyPoints || 0} <span className="text-2xl text-indigo-300">pts</span></h2>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                          <span className="font-bold text-sm uppercase tracking-wide">{user.loyaltyTier || 'Bronze'} Tier</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="bg-black/20 rounded-full h-3 mb-2 overflow-hidden backdrop-blur-sm">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, ((user.totalPointsEarned || 0) / 1000) * 100)}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                        />
                      </div>
                      <div className="flex justify-between text-xs text-indigo-200 font-medium">
                        <span>0 pts</span>
                        <span>Next Tier: 1000 pts</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Activity Log */}
                  <UserActivityLog />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="edit-form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="max-w-2xl mx-auto mt-12 bg-white rounded-3xl p-8 border border-gray-100 shadow-2xl shadow-gray-200/50"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Edit Personal Details</h2>
                  <p className="text-gray-500 mt-2">Update your information below</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all bg-gray-50 focus:bg-white"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all bg-gray-50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all bg-gray-50 focus:bg-white"
                        placeholder="1234567890"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 px-6 py-3.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-[2] px-6 py-3.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/30"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-3xl border border-red-100 p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-red-50 transition-shadow"
      >
        <div>
          <h3 className="text-lg font-bold text-red-600 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            Danger Zone
          </h3>
          <p className="text-gray-600 text-sm">Permanently delete your account and all associated data.</p>
        </div>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all whitespace-nowrap"
        >
          Delete Account
        </button>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Delete Account?</h3>
              <p className="text-gray-500 mb-6 text-center">Type your password to confirm.</p>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Password"
                className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-red-100 focus:border-red-500 outline-none mb-6"
                autoFocus
              />
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200">Cancel</button>
                <button
                  onClick={async () => {
                    try { await dispatch(deleteAccount({ id: user._id || user.id, password: deletePassword })).unwrap(); toast.info('Account deleted'); }
                    catch (err) { toast.error(err.message || 'Error'); }
                  }}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showTwoFactorSetup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center"
            >
              <h3 className="text-xl font-bold mb-4">Setup 2FA</h3>
              {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" className="mx-auto mb-4 w-48 h-48 border border-gray-100 rounded-lg p-2" />}
              {secret && <div className="mb-6 p-3 bg-gray-50 rounded-lg border border-gray-100"><p className="font-mono text-sm font-bold text-gray-700 select-all">{secret}</p></div>}
              <input type="text" value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)} placeholder="000000" className="w-full px-4 py-2 border rounded-lg mb-4 text-center tracking-[0.5em] font-bold text-xl" maxLength={6} />
              <div className="flex gap-3">
                <button onClick={() => setShowTwoFactorSetup(false)} className="flex-1 py-2 bg-gray-100 rounded-lg font-bold text-gray-600">Cancel</button>
                <button onClick={handleVerify2FA} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-bold">Verify</button>
              </div>
              {otpauthUrl && <a href={otpauthUrl} className="block mt-4 text-sm text-indigo-600 hover:underline">Open Authenticator ↗</a>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Profile;