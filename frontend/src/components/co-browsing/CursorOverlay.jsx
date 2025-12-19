import React from 'react';
import NavigationIcon from '@mui/icons-material/Navigation'; // Using as arrow cursor
import { Box } from '@mui/material';
import { motion } from 'framer-motion';

const CursorOverlay = ({ participants, reactions, myId }) => {
    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 9999,
                overflow: 'hidden'
            }}
        >
            {Object.entries(participants).map(([socketId, data]) => {
                if (socketId === myId) return null; // Don't show own cursor

                return (
                    <motion.div
                        key={socketId}
                        initial={{ opacity: 0 }}
                        animate={{
                            x: data.x * window.innerWidth, // Convert relative back to pixels
                            y: data.y * window.innerHeight,
                            opacity: 1
                        }}
                        transition={{ duration: 0.1, ease: 'linear' }}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                        }}
                    >
                        <NavigationIcon
                            sx={{
                                color: data.color,
                                transform: 'rotate(-45deg)',
                                filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))'
                            }}
                        />
                        <Box
                            sx={{
                                bgcolor: data.color,
                                color: 'white',
                                px: 1,
                                py: 0.2,
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                ml: 2,
                                mt: 0,
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {data.username}
                        </Box>
                    </motion.div>
                );
            })}

            {reactions && reactions.map(reaction => (
                <motion.div
                    key={reaction.id}
                    initial={{
                        x: reaction.x * window.innerWidth,
                        y: reaction.y * window.innerHeight,
                        scale: 0.5,
                        opacity: 1
                    }}
                    animate={{
                        y: (reaction.y * window.innerHeight) - 100,
                        scale: 1.5,
                        opacity: 0
                    }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        fontSize: '2rem',
                        zIndex: 10000
                    }}
                >
                    {reaction.emoji}
                </motion.div>
            ))}
        </div>
    );
};

export default CursorOverlay;
