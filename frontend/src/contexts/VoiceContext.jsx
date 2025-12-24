import React, { createContext, useState, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { processVoiceCommand } from '../utils/voiceCommands';
import { useTheme } from './ThemeContext';
import api from '../store/api/api';

const VoiceContext = createContext(null);

export const VoiceProvider = ({ children }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [error, setError] = useState(null);
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);

    // Theme Control
    const { toggleDarkMode } = useTheme();

    const navigate = useNavigate();

    // Text to Speech Helper
    const speak = useCallback((text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop any current speech
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            utterance.pitch = 1;
            utterance.volume = 1;
            window.speechSynthesis.speak(utterance);
        }
    }, []);

    const startListening = useCallback(() => {
        setIsListening(true);
        setIsOverlayOpen(true);
        setError(null);
        setTranscript('');
        setInterimTranscript('');
        setFeedback(null);

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            const msg = 'Browser does not support voice commands.';
            setError(msg);
            speak(msg);
            setIsListening(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false; // Keep false for command-based interaction
        recognition.interimResults = true; // Essential for visual feedback
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event) => {
            let interim = '';
            let final = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final += event.results[i][0].transcript;
                } else {
                    interim += event.results[i][0].transcript;
                }
            }

            if (final) {
                setTranscript(final);
                setInterimTranscript('');

                // 1. Try Local Simple Commands first (Optimization)
                const localResult = processVoiceCommand(final, navigate, { toggleDarkMode });

                // If it's a simple navigation match (not a fallback search), use it
                if (localResult.matched && !localResult.isSearchFallback) {
                    setFeedback(localResult.feedback);
                    speak(localResult.feedback);
                    setTimeout(() => {
                        setIsOverlayOpen(false);
                        setIsListening(false);
                        setFeedback(null);
                    }, 2000);
                    return;
                }

                // 2. If no local match (or it was a generic search), ask the AI Brain
                setFeedback("Analyzing...");

                api.post('/chatbot/message', { message: final, history: [] })
                    .then(res => {
                        const data = res.data; // { text, action, params }

                        // Speak the AI's response text
                        if (data.text) {
                            speak(data.text);
                            setFeedback(data.text);
                        }

                        // Execute AI Action
                        if (data.action === 'SEARCH' && data.params) {
                            const { query, category, minPrice, maxPrice, sort, color } = data.params;
                            const searchParams = new URLSearchParams();

                            if (query) searchParams.set('search', query);
                            if (category) searchParams.set('category', category); // Might need ID mapping, but product page might handle text
                            if (minPrice) searchParams.set('minPrice', minPrice);
                            if (maxPrice) searchParams.set('maxPrice', maxPrice);
                            if (sort) searchParams.set('sortBy', sort === 'newest' ? 'newest' : 'price'); // Simplified mapping
                            if (color) searchParams.set('search', `${query || ''} ${color}`.trim()); // Append color to search if no specific filter

                            navigate(`/products?${searchParams.toString()}`);
                        } else if (data.action === 'NAVIGATE') {
                            // AI might return generic navigate
                            // For now, rely on local for nav, or implement if needed
                        }

                        setTimeout(() => {
                            setIsOverlayOpen(false);
                            setIsListening(false);
                            setFeedback(null);
                        }, 3000);
                    })
                    .catch(err => {
                        console.error("AI Voice Error", err);
                        speak("I'm having trouble connecting. Returning to simple search.");
                        // Fallback to local search
                        if (localResult.matched) {
                            // It was a search fallback
                            navigate(`/products?search=${encodeURIComponent(final)}`);
                        }
                    });

            } else {
                setInterimTranscript(interim);
            }
        };

        recognition.onerror = (event) => {
            console.error("Voice recognition error", event.error);
            let msg = 'Voice recognition error.';
            if (event.error === 'no-speech') msg = 'No speech detected.';
            if (event.error === 'network') msg = 'Network error. check connection.';
            if (event.error === 'not-allowed') msg = 'Microphone permission denied.';

            setError(msg);
            speak(msg);
            setIsListening(false);
        };

        recognition.onend = () => {
            // If we stopped listening but overlay is open and no result yet, 
            // it might mean silence timeout. 
            // We'll let the user manually close or retry if they want.
            setIsListening(false);
        };

        try {
            recognition.start();
        } catch (e) {
            console.error("Failed to start recognition", e);
            setIsListening(false);
            setError("Could not start voice recognition.");
        }
    }, [navigate, toggleDarkMode, speak]);

    const closeOverlay = useCallback(() => {
        setIsOverlayOpen(false);
        setIsListening(false);
        window.speechSynthesis.cancel();
    }, []);

    const value = {
        isListening,
        transcript,
        interimTranscript,
        feedback,
        error,
        startListening,
        isOverlayOpen,
        closeOverlay
    };

    return (
        <VoiceContext.Provider value={value}>
            {children}
        </VoiceContext.Provider>
    );
};

export const useVoice = () => {
    const context = useContext(VoiceContext);
    if (!context) {
        throw new Error('useVoice must be used within a VoiceProvider');
    }
    return context;
};
