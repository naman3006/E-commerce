// src/pages/Home.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import ProductCard from '../components/ProductCard/ProductCard';
import { findAllProducts } from '../store/slices/productsSlice';
import { toast } from 'react-toastify';

import { Link } from 'react-router-dom';

import { motion } from 'framer-motion';

const Home = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.products);
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(findAllProducts({ limit: 4, sortBy: 'rating', sortOrder: 'desc' }));
  }, [dispatch]);

  const productList = products?.products || products || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl shadow-2xl text-white min-h-[500px] flex items-center"
      >
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-gray-900">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-gray-900 to-black opacity-90"></div>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center mix-blend-overlay opacity-30"
          />
          {/* Abstract Shapes */}
          <motion.div
            animate={{ y: [0, -20, 0], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-50%] left-[-20%] w-[800px] h-[800px] bg-primary-600/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ y: [0, 20, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative px-6 py-12 sm:px-12 sm:py-24 flex flex-col items-center text-center max-w-5xl mx-auto z-10">
          <motion.span
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-block py-1.5 px-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-indigo-100 text-sm font-semibold tracking-wider mb-6 shadow-glass"
          >
            {t('home.new_collection')}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 50 }}
            className="text-5xl sm:text-7xl md:text-8xl font-bold font-display tracking-tight mb-8 leading-tight drop-shadow-lg"
            dangerouslySetInnerHTML={{ __html: t('home.hero_title') }}
          >
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-lg sm:text-xl text-gray-200 mb-10 max-w-2xl font-light leading-relaxed drop-shadow-md"
          >
            {t('home.hero_subtitle')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-5"
          >
            <Link
              to="/products"
              className="px-10 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-full font-bold shadow-lg shadow-primary-600/30 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              {t('home.shop_now')}
            </Link>
            <Link
              to="/products"
              className="px-10 py-4 bg-white/10 border border-white/30 text-white rounded-full font-bold hover:bg-white/20 backdrop-blur-md transition-all transform hover:scale-105 active:scale-95"
            >
              {t('home.view_lookbook')}
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <section>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-10 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-display tracking-tight relative inline-block">
              {t('home.featured_collection')}
              <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-primary-500 rounded-full"></span>
            </h2>
            <p className="text-gray-500 mt-2 max-w-md text-lg">{t('home.featured_subtitle')}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/products" className="group flex items-center gap-2 text-primary-600 font-bold hover:text-primary-700 bg-primary-50 px-4 py-2 rounded-full transition-all hover:bg-primary-100">
              {t('common.view_all')}
              <span className="transform group-hover:translate-x-1 transition-transform bg-primary-200 rounded-full p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </span>
            </Link>
          </motion.div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"
              ></motion.div>
            </div>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {productList.map((product, index) => (
              <motion.div key={product._id || index} variants={itemVariants}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Features Grid */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 py-16 border-t border-gray-100/50"
      >
        {[
          { icon: "M5 13l4 4L19 7", title: t('home.premium_quality'), desc: t('home.premium_desc') },
          { icon: "M13 10V3L4 14h7v7l9-11h-7z", title: t('home.fast_shipping'), desc: t('home.fast_shipping_desc') },
          { icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z", title: t('home.support'), desc: t('home.support_desc') }
        ].map((feature, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            className="group flex flex-col items-center text-center p-8 rounded-3xl hover:bg-white hover:shadow-glass transition-all duration-300 border border-transparent hover:border-gray-100"
          >
            <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 mb-6 group-hover:scale-110 group-hover:bg-primary-500 group-hover:text-white transition-all duration-300 shadow-sm">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} /></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">{feature.title}</h3>
            <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </motion.section>
    </div>
  );
};

export default Home;