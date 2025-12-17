import React from 'react';
import { useVoice } from '../../contexts/VoiceContext';

const VoiceFloatingButton = () => {
    const { startListening, isListening } = useVoice();

    return (
        <button
            onClick={startListening}
            className={`fixed bottom-8 left-4 z-[90] p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 focus:outline-none 
            ${isListening
                    ? 'bg-red-500 animate-pulse'
                    : 'bg-gradient-to-r from-primary-600 to-indigo-600 hover:shadow-primary-500/50'
                } text-white`}
            title={isListening ? "Listening..." : "Voice Assistant"}
            aria-label="Voice Assistant"
        >
            <svg className={`w-8 h-8 ${isListening ? 'animate-bounce-short' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>

            {/* Ripple Effect Ring */}
            {!isListening && (
                <span className="absolute -inset-1 rounded-full border border-white/20 opacity-0 group-hover:opacity-100 animate-ping"></span>
            )}
        </button>
    );
};

export default VoiceFloatingButton;
