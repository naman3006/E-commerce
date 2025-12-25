import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import logo from '../../assets/LOGO2.jpeg';
import useVoiceNavigation from '../../hooks/useVoiceNavigation';
import LanguageSwitcher from '../LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { getOptimizedImageUrl } from '../../utils/urlUtils';

const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, token } = useSelector((state) => state.auth);
    const { cart } = useSelector((state) => state.cart);
    const { notifications } = useSelector((state) => state.notifications);
    const { t } = useTranslation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // Use the new navigation text hook (now uses Context)
    const {
        isListening,
        transcript,
        startListening,
        error: voiceError
    } = useVoiceNavigation();

    // Sync input with voice transcript for visual confirmation
    useEffect(() => {
        if (transcript) {
            setSearchQuery(transcript);
        }
    }, [transcript]);

    useEffect(() => {
        if (voiceError) {
            console.error(voiceError);
        }
    }, [voiceError]);

    const unreadCount = (notifications || []).filter((n) => n && !n.read).length;
    const cartCount = cart?.items?.length || 0;

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    const navLinks = [
        { name: t('navbar.shop') || 'Products', path: '/products' },
    ];

    const authLinks = [
        { name: `${t('navbar.cart') || 'Cart'}`, path: '/cart', badge: cartCount > 0, count: cartCount },
        { name: t('navbar.rewards') || 'Rewards', path: '/rewards' },
        { name: t('navbar.wishlist') || 'Wishlist', path: '/wishlist' },
        { name: t('navbar.orders') || 'Orders', path: '/orders' },
    ];

    const adminLinks = [
        { name: t('navbar.dashboard') || 'Dashboard', path: '/admin/dashboard' },
        { name: t('navbar.orders') || 'Orders', path: '/admin/orders' },
        { name: t('navbar.products') || 'Products', path: '/products/manage' },
        { name: t('navbar.categories') || 'Categories', path: '/categories/manage' },
        { name: t('navbar.coupons') || 'Coupons', path: '/admin/coupons' },
    ];

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-soft"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link to="/" className="flex-shrink-0 group relative overflow-hidden rounded-lg">
                        <motion.img
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            src={logo}
                            className="h-12 w-auto"
                            alt="Logo"
                        />
                    </Link>

                    {/* Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-lg mx-8 relative">
                        <motion.div
                            animate={{ scale: isSearchFocused ? 1.02 : 1 }}
                            className={`w-full relative rounded-full transition-all duration-300 ${isSearchFocused ? 'shadow-lg ring-2 ring-primary-100' : 'shadow-sm'}`}
                        >
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className={`h-5 w-5 transition-colors ${isSearchFocused ? 'text-primary-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                            <input
                                type="text"
                                placeholder={isListening ? "Listening..." : (t('navbar.search_placeholder') || "I'm shopping for...")}
                                className={`block w-full pl-10 pr-10 py-2.5 border rounded-full leading-5 bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white transition-all ${isListening ? 'border-primary-500' : 'border-gray-200 focus:border-primary-500'}`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        navigate(`/products?search=${encodeURIComponent(e.target.value)}`);
                                    }
                                }}
                            />
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className={`absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer ${isListening ? 'text-primary-500' : 'text-gray-400 hover:text-primary-500'}`}
                                onClick={startListening}
                                title="Voice Search"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                                </svg>
                            </motion.button>
                        </motion.div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center md:hidden gap-4">
                        {token && (
                            <Link
                                to="/notifications"
                                className={`relative p-2 rounded-full hover:bg-gray-100 transition-colors ${unreadCount > 0 ? 'text-primary-600' : 'text-gray-500'}`}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </Link>
                        )}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-gray-600 hover:text-primary-600 focus:outline-none"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </motion.button>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-8 items-center">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="relative text-gray-600 hover:text-primary-600 font-medium transition-colors duration-200 py-2"
                            >
                                {link.name}
                                {location.pathname === link.path && (
                                    <motion.div
                                        layoutId="navbar-underline"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full"
                                    />
                                )}
                            </Link>
                        ))}

                        {token && (
                            <>
                                {authLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        to={link.path}
                                        className="relative text-gray-600 hover:text-primary-600 font-medium transition-colors duration-200 py-2 flex items-center gap-1"
                                    >
                                        {link.name.split(' (')[0]}
                                        {link.badge && (
                                            <motion.span
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="bg-primary-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1"
                                            >
                                                {link.count}
                                            </motion.span>
                                        )}
                                        {location.pathname === link.path && (
                                            <motion.div
                                                layoutId="navbar-underline"
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full"
                                            />
                                        )}
                                    </Link>
                                ))}

                                {/* Admin Dropdown */}
                                {user?.role === 'admin' && (
                                    <div className="relative group">
                                        <button className="text-gray-600 hover:text-primary-600 font-medium flex items-center gap-1 transition-colors py-2">
                                            Admin
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </button>
                                        <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 origin-top-left">
                                            <div className="py-2">
                                                {adminLinks.map((link) => (
                                                    <Link
                                                        key={link.name}
                                                        to={link.path}
                                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                                                    >
                                                        {link.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Language Switcher */}
                                <LanguageSwitcher />

                                {/* Notifications */}
                                <Link
                                    to="/notifications"
                                    className={`relative p-2 rounded-full hover:bg-gray-100 transition-colors ${unreadCount > 0 ? 'text-primary-600' : 'text-gray-500'}`}
                                >
                                    <motion.div whileHover={{ rotate: 15 }}>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                    </motion.div>
                                    <AnimatePresence>
                                        {unreadCount > 0 && (
                                            <motion.span
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                exit={{ scale: 0 }}
                                                className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white"
                                            >
                                                {unreadCount}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </Link>

                                {/* User Profile Dropdown */}
                                <div className="relative ml-4">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="flex items-center space-x-2 focus:outline-none"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border-2 border-primary-200 overflow-hidden">
                                            {user.avatar ? (
                                                <img src={getOptimizedImageUrl(user.avatar)} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                user?.name?.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                    </motion.button>

                                    <AnimatePresence>
                                        {isProfileOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 origin-top-right z-50"
                                            >
                                                <div className="px-4 py-3 border-b border-gray-100">
                                                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                                                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                                </div>
                                                <Link
                                                    to="/profile"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    Profile
                                                </Link>
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    Logout
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>
                        )}

                        {!token && (
                            <div className="flex items-center space-x-4">
                                <LanguageSwitcher />
                                <Link to="/login" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                                    {t('common.login')}
                                </Link>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Link to="/register" className="bg-primary-600 px-5 py-2.5 rounded-full text-white hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/30 font-medium">
                                        {t('common.register')}
                                    </Link>
                                </motion.div>
                            </div>
                        )}
                    </nav>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="md:hidden overflow-hidden border-t border-gray-100"
                        >
                            <div className="py-4 space-y-2">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        to={link.path}
                                        className="block px-4 py-2 text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-lg"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {link.name}
                                    </Link>
                                ))}

                                {token ? (
                                    <>
                                        {authLinks.map((link) => (
                                            <Link
                                                key={link.name}
                                                to={link.path}
                                                className="block px-4 py-2 text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-lg"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                {link.name.split(' (')[0]}
                                            </Link>
                                        ))}

                                        {user?.role === 'admin' && (
                                            <>
                                                <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin</div>
                                                {adminLinks.map((link) => (
                                                    <Link
                                                        key={link.name}
                                                        to={link.path}
                                                        className="block px-4 py-2 pl-8 text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-lg"
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                    >
                                                        {link.name}
                                                    </Link>
                                                ))}
                                            </>
                                        )}

                                        <div className="pt-4 mt-4 border-t border-gray-100">
                                            <Link
                                                to="/profile"
                                                className="flex items-center px-4 py-2 gap-3 hover:bg-gray-50"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                                    {user.avatar ? <img src={getOptimizedImageUrl(user.avatar)} className="w-full h-full rounded-full object-cover" /> : user.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{user.name}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </Link>
                                            <div className="px-4 py-2 flex items-center justify-between">
                                                <span className="text-gray-600">Language</span>
                                                <LanguageSwitcher />
                                            </div>
                                            <button
                                                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                                                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 mt-2"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-2 p-4">
                                        <Link to="/login" className="block w-full text-center px-4 py-2 border border-primary-600 text-primary-600 rounded-lg font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                                            Login
                                        </Link>
                                        <Link to="/register" className="block w-full text-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium shadow-md" onClick={() => setIsMobileMenuOpen(false)}>
                                            Register
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.header>
    );
};

export default Navbar;
