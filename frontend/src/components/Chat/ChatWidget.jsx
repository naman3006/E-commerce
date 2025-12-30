import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { IconButton, Paper, Typography, Box, Avatar, TextField, InputAdornment } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloseIcon from '@mui/icons-material/Close';
import MicIcon from '@mui/icons-material/Mic';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart, clearCart } from '../../store/slices/cartSlice';
import api from "../../store/api/api";

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: '1', text: "Hi! I'm your AI assistant. How can I help you today?", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const { token } = useSelector(state => state.auth);
    const bottomRef = useRef(null);
    const recognitionRef = useRef(null);
    const silenceTimerRef = useRef(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    // Initialize Speech Recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                if (finalTranscript || interimTranscript) {
                    setInput((prev) => {
                        // If we have a final result, append it. If not, we might be essentially replacing the "interim" part 
                        // but logic here is simple: just set input to what we hear.
                        // A better approach for continuous dictation is appending, but for simple command/chat, replacing or appending to existing buffer:
                        // To keep it simple: Let's just use the latest full transcript provided by the API if possible, 
                        // but handling incremental updates is tricky without full rewrite.
                        // Easy way: Add the new bit to the *end*?
                        // Let's rely on the fact that we clear silence timer.

                        // Actually, just setting input to 'interimTranscript' might overwrite previous text if we paused?
                        // For a simple chat input:
                        return (finalTranscript + interimTranscript).trim();
                        // Note: This replaces current input. If user typed "hello " and said "world", it would become "world".
                        // Improvement: Append? For now, let's keep it simple as "voice input mode"
                    });

                    // Reset silence timer
                    clearTimeout(silenceTimerRef.current);
                    silenceTimerRef.current = setTimeout(() => {
                        stopListening();
                    }, 4000);
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                stopListening();
            };

            recognitionRef.current.onend = () => {
                if (isListening) {
                    // If it stopped but we think we are listening (e.g. valid pause?), restart?
                    // No, "onend" usually means it's done.
                    setIsListening(false);
                }
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            clearTimeout(silenceTimerRef.current);
        };
    }, []);

    const startListening = () => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
                setIsListening(true);
                // Set initial silence timer
                clearTimeout(silenceTimerRef.current);
                silenceTimerRef.current = setTimeout(() => {
                    stopListening();
                }, 4000);
            } catch (e) {
                if (e.name === 'InvalidStateError' || e.message?.includes('already started')) {
                    // It's already running, just ensure we are in listening state and reset timer
                    setIsListening(true);
                    clearTimeout(silenceTimerRef.current);
                    silenceTimerRef.current = setTimeout(() => {
                        stopListening();
                    }, 4000);
                } else {
                    console.error("Failed to start", e);
                }
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
        clearTimeout(silenceTimerRef.current);
    };

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    const handleSend = async (messageText = null) => {
        // Use provided text or fall back to input state
        const textToSend = typeof messageText === 'string' ? messageText : input;

        if (!textToSend.trim()) return;

        const userMsg = { id: Date.now().toString(), text: textToSend, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            // Prepare history for API
            const history = messages.map(m => ({
                sender: m.sender,
                text: m.text
            }));

            // Send message to API
            const res = await api.post('/chatbot/message', { message: userMsg.text, history });
            const response = res.data.data; // Now contains { text, action, params }

            // Handle Advanced Actions
            if (response.action) {
                switch (response.action) {
                    case 'SEARCH':
                        if (response.params?.query) {
                            navigate(`/products?search=${encodeURIComponent(response.params.query)}`);
                        }
                        break;
                    case 'NAVIGATE':
                        if (response.params?.route) {
                            navigate(response.params.route);
                        }
                        break;
                    case 'ADD_TO_CART':
                        if (response.params?.productId) {
                            if (!token) {
                                setMessages(prev => [...prev, { id: Date.now().toString(), text: "Please login to add items to your cart.", sender: 'bot' }]);
                                setTimeout(() => navigate('/login'), 2000);
                                setIsTyping(false);
                                return; // Stop processing
                            }
                            dispatch(addToCart({
                                productId: response.params.productId,
                                quantity: response.params.quantity || 1
                            })).then((actionResult) => {
                                if (addToCart.fulfilled.match(actionResult)) {
                                    // Success
                                } else {
                                    console.error("Failed to add to cart");
                                }
                            });
                        }
                        break;
                    case 'TRACK_ORDER':
                        if (response.params?.orderId) {
                            if (!token) {
                                navigate('/login');
                            } else {
                                navigate(`/orders/${response.params.orderId}`);
                            }
                        }
                        break;
                    case 'CLEAR_CART':
                        dispatch(clearCart());
                        break;
                }
            }

            setMessages(prev => [...prev, { id: Date.now().toString(), text: response.text, sender: 'bot' }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { id: Date.now().toString(), text: "I'm having trouble connecting right now. Please try again.", sender: 'bot' }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="mb-4"
                    >
                        <Paper
                            className="w-[350px] h-[500px] flex flex-col overflow-hidden shadow-2xl rounded-2xl border border-indigo-50"
                            elevation={6}
                        >
                            {/* Header */}
                            <div className="bg-indigo-600 p-4 flex items-center justify-between text-white">
                                <div className="flex items-center gap-3">
                                    <Avatar sx={{ bgcolor: 'white', color: '#4f46e5' }}>
                                        <SmartToyIcon />
                                    </Avatar>
                                    <div>
                                        <Typography variant="subtitle1" fontWeight="bold">AI Assistant</Typography>
                                        <Typography variant="caption" className="opacity-80">Online</Typography>
                                    </div>
                                </div>
                                <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: 'white' }}>
                                    <CloseIcon />
                                </IconButton>
                            </div>

                            {/* Chat Area */}
                            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-4">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm
                                                ${msg.sender === 'user'
                                                    ? 'bg-indigo-600 text-white rounded-tr-none'
                                                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                                }`}
                                        >
                                            {(msg.text || '').split('\n').map((line, i) => (
                                                <p key={i} className="mb-1 last:mb-0">{line}</p>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex gap-1">
                                            <motion.div
                                                className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                                                animate={{ y: [0, -5, 0] }}
                                                transition={{ repeat: Infinity, duration: 0.6 }}
                                            />
                                            <motion.div
                                                className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                                                animate={{ y: [0, -5, 0] }}
                                                transition={{ repeat: Infinity, duration: 0.6, delay: 0.1 }}
                                            />
                                            <motion.div
                                                className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                                                animate={{ y: [0, -5, 0] }}
                                                transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                                            />
                                        </div>
                                    </div>
                                )}
                                <div ref={bottomRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-3 bg-white border-t border-gray-100">
                                {/* Suggested Actions */}
                                {messages.length < 3 && (
                                    <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
                                        {['Track Order', 'My Cart', 'Active Coupons'].map((action) => (
                                            <button
                                                key={action}
                                                onClick={() => handleSend(action)}
                                                className="whitespace-nowrap px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full border border-indigo-100 hover:bg-indigo-100 transition-colors"
                                            >
                                                {action}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <TextField
                                    fullWidth
                                    placeholder={isListening ? "Listening..." : "Type a message..."}
                                    variant="outlined"
                                    size="small"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '20px',
                                            backgroundColor: isListening ? '#eff6ff' : '#f9fafb',
                                            '& fieldset': { borderColor: isListening ? '#6366f1' : 'transparent' },
                                            '&:hover fieldset': { borderColor: '#e5e7eb' },
                                            '&.Mui-focused fieldset': { borderColor: '#4f46e5' },
                                        }
                                    }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={toggleListening}
                                                    color={isListening ? "error" : "default"}
                                                    className={isListening ? "animate-pulse" : ""}
                                                >
                                                    <MicIcon />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => handleSend()}
                                                    color="primary"
                                                    disabled={!input.trim() || isTyping}
                                                >
                                                    <SendIcon />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </div>
                        </Paper>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-200 z-50 hover:bg-indigo-700 transition-colors"
                style={{ boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.4)' }}
            >
                {isOpen ? <CloseIcon /> : <SmartToyIcon />}
            </motion.button>
        </div>
    );
};

export default ChatWidget;
