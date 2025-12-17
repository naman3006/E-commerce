import React from 'react';
import { useVoice } from '../../contexts/VoiceContext';

const VoiceOverlay = () => {
    const { isOverlayOpen, closeOverlay, transcript, interimTranscript, feedback, error, isListening } = useVoice();

    if (!isOverlayOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-300">
            {/* Close Button */}
            <button
                onClick={closeOverlay}
                className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all"
            >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <div className="flex flex-col items-center max-w-2xl w-full px-4 text-center space-y-8">

                {/* Visualizer / Status Icon */}
                <div className="relative">
                    {/* Ripple/Pulse Effect when listening */}
                    {isListening && !feedback && !error && (
                        <>
                            <div className="absolute inset-0 rounded-full bg-primary-500/30 animate-ping"></div>
                            <div className="absolute inset-0 rounded-full bg-primary-500/20 animate-pulse delay-75"></div>
                        </>
                    )}

                    <div className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500
                        ${error ? 'bg-red-500' : (feedback ? 'bg-green-500' : 'bg-gradient-to-br from-primary-600 to-indigo-600')}`}
                    >
                        {error ? (
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ) : feedback ? (
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className={`w-12 h-12 text-white ${isListening ? 'animate-bounce-short' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                        )}
                    </div>
                </div>

                {/* Text Feedback */}
                <div className="space-y-4">
                    {error ? (
                        <h2 className="text-2xl font-bold text-red-400">{error}</h2>
                    ) : (
                        <h2 className="text-3xl font-bold text-white tracking-wide">
                            {feedback ? feedback : (isListening ? "Listening..." : "Processing...")}
                        </h2>
                    )}

                    {/* Live Transcript */}
                    {!feedback && !error && (
                        <p className="text-xl text-gray-300 min-h-[3rem] font-light">
                            {transcript || interimTranscript || "Say 'Go to Cart' or 'Search for shoes'..."}
                        </p>
                    )}
                </div>

                {/* Helpful Hints */}
                {!feedback && !error && (
                    <div className="pt-8 grid grid-cols-2 gap-4 text-sm text-gray-400">
                        <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                            "Go to Wishlist"
                        </div>
                        <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                            "Search for Laptops"
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoiceOverlay;
