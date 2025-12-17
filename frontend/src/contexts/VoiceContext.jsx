import React, { createContext, useState, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { processVoiceCommand } from '../utils/voiceCommands';
import { useTheme } from './ThemeContext';

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

                // Process the final command
                const result = processVoiceCommand(final, navigate, { toggleDarkMode });

                if (result.matched) {
                    setFeedback(result.feedback);
                    speak(result.feedback);

                    // Close overlay after a short delay to show success state
                    setTimeout(() => {
                        setIsOverlayOpen(false);
                        setIsListening(false);
                        setFeedback(null);
                    }, 2000);
                } else {
                    const fallbackMsg = `Did you say "${final}"? Try "Go to Cart" or "Search for..."`;
                    setFeedback(fallbackMsg);
                    speak("I didn't catch that correctly. Please try again.");
                }
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
