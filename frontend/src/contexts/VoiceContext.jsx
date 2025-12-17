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

    // We need navigate here, but VoiceProvider is usually high up in the tree.
    // Ideally, VoiceProvider should be inside Router.
    // Assuming Layout is inside Router as per standard React Router setup.
    const navigate = useNavigate();

    const startListening = useCallback(() => {
        setIsListening(true);
        setIsOverlayOpen(true);
        setError(null);
        setTranscript('');
        setInterimTranscript('');
        setFeedback(null);

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setError('Browser does not support voice commands.');
            setIsListening(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);

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

                const result = processVoiceCommand(final, navigate, { toggleDarkMode });

                if (result.matched) {
                    setFeedback(result.feedback);
                    setTimeout(() => {
                        setIsOverlayOpen(false);
                        setIsListening(false);
                        setFeedback(null);
                    }, 6000);
                } else {
                    setFeedback(`Did you say "${final}"? Try "Go to Cart" or "Search for..."`);
                }
            } else {
                setInterimTranscript(interim);
            }
        };

        recognition.onerror = (event) => {
            setError(event.error === 'no-speech' ? 'No speech detected.' : 'Voice recognition error.');
            setIsListening(false);
            setFeedback('Sorry, I didn\'t catch that.');
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    }, [navigate]);

    const closeOverlay = useCallback(() => {
        setIsOverlayOpen(false);
        setIsListening(false);
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
