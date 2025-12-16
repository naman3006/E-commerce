// src/pages/Home.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import ProductCard from '../components/ProductCard/ProductCard';
import { findAllProducts } from '../store/slices/productsSlice';
import { toast } from 'react-toastify';

import { Link } from 'react-router-dom';

const Home = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.products);
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(findAllProducts({ limit: 4, sortBy: 'rating', sortOrder: 'desc' }));
  }, [dispatch]);

  const productList = products?.products || products || [];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gray-900 shadow-2xl text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-gray-900 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center mix-blend-overlay opacity-20"></div>

        <div className="relative px-8 py-24 sm:px-16 sm:py-32 flex flex-col items-center text-center max-w-4xl mx-auto">
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-indigo-100 text-sm font-semibold tracking-wider mb-6 animate-slide-down">
            {t('home.new_collection')}
          </span>
          <h1 className="text-5xl sm:text-7xl font-bold font-display tracking-tight mb-8 leading-tight animate-fade-in" dangerouslySetInnerHTML={{ __html: t('home.hero_title') }}>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-2xl font-light animate-slide-up leading-relaxed">
            {t('home.hero_subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link
              to="/products"
              className="px-8 py-4 bg-transparent border border-white/30 text-white rounded-full font-bold hover:bg-white/10 backdrop-blur-sm transition-all"
            >
              {t('home.shop_now')}
            </Link>
            <Link
              to="/products"
              className="px-8 py-4 bg-transparent border border-white/30 text-white rounded-full font-bold hover:bg-white/10 backdrop-blur-sm transition-all"
            >
              {t('home.view_lookbook')}
            </Link>
          </div>
        </div>
      </div>

      <section className="animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 font-display">{t('home.featured_collection')}</h2>
            <p className="text-gray-500 mt-2">{t('home.featured_subtitle')}</p>
          </div>
          <Link to="/products" className="group flex items-center gap-1 text-primary-600 font-semibold hover:text-primary-700">
            {t('common.view_all')}
            <span className="transform group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {productList.map((product, index) => (
              <ProductCard key={product._id || index} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-t border-gray-100">
        <div className="flex flex-col items-center text-center p-6">
          <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{t('home.premium_quality')}</h3>
          <p className="text-gray-500 text-sm">{t('home.premium_desc')}</p>
        </div>
        <div className="flex flex-col items-center text-center p-6">
          <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{t('home.fast_shipping')}</h3>
          <p className="text-gray-500 text-sm">{t('home.fast_shipping_desc')}</p>
        </div>
        <div className="flex flex-col items-center text-center p-6">
          <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{t('home.support')}</h3>
          <p className="text-gray-500 text-sm">{t('home.support_desc')}</p>
        </div>
      </section>
    </div>
  );
};

export default Home;