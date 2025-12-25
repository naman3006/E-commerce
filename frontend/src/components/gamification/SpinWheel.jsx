import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, useAnimation } from 'framer-motion';
import confetti from 'canvas-confetti';
import { spinWheel, getSpinConfig, clearSpinResult } from '../../store/slices/gamificationSlice';
import { toast } from 'react-toastify';

const SpinWheel = () => {
    const dispatch = useDispatch();
    const controls = useAnimation();
    const { spinConfig, spinResult, loading, error, profile } = useSelector(state => state.gamification);

    // Local state for animation
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);

    // Default segments if config fails (fallback)
    const defaultSegments = [
        { label: '10 Pts', value: 10, color: '#4F46E5' },
        { label: 'Try Again', value: 0, color: '#EF4444' },
        { label: '50 Pts', value: 50, color: '#10B981' },
        { label: '5% OFF', value: '5%', color: '#F59E0B' },
        { label: '20 Pts', value: 20, color: '#EC4899' },
        { label: '100 Pts', value: 100, color: '#8B5CF6' },
    ];

    // Backend returns this config:
    // { id: 'reward_50_pts', label: '50 Points', type: 'point', value: 50, prob: 0.05, color: '#8b5cf6' }
    const segments = spinConfig?.length > 0 ? spinConfig : defaultSegments;
    const segmentAngle = 360 / segments.length;

    useEffect(() => {
        dispatch(getSpinConfig());
    }, [dispatch]);

    useEffect(() => {
        if (spinResult) {
            handleSpinResult(spinResult);
        }
    }, [spinResult]);

    useEffect(() => {
        if (error) {
            setIsSpinning(false);
            // toast.error(error); // Optional: let the user see the error in UI or toast
        }
    }, [error]);

    const handleSpin = async () => {
        if (isSpinning || loading) return;

        // Check if already spun today (optional frontend check, backend enforces it)
        if (profile?.lastSpinDate) {
            const lastSpin = new Date(profile.lastSpinDate);
            const now = new Date();
            if (lastSpin.getDate() === now.getDate() &&
                lastSpin.getMonth() === now.getMonth() &&
                lastSpin.getFullYear() === now.getFullYear()) {
                toast.info("You've already spun today! Come back tomorrow.");
                return;
            }
        }

        setIsSpinning(true);
        // Reset rotation if needed or just add to it

        dispatch(spinWheel())
            .unwrap()
            .catch((err) => {
                setIsSpinning(false);
                toast.error(typeof err === 'string' ? err : 'Spin failed. Try again.');
                dispatch(clearSpinResult());
            });
    };

    const handleSpinResult = async (result) => {
        // Find index of the result in segments
        // Be careful: result from backend might be a slightly different object reference or structure
        // We match primarily by ID

        let targetIndex = -1;

        if (result.id) {
            targetIndex = segments.findIndex(s => s.id === result.id);
        } else if (result.value !== undefined) {
            targetIndex = segments.findIndex(s => s.value === result.value && s.type === result.type);
        }

        if (targetIndex === -1) {
            console.warn("Could not match result to segment, using random fallback for visual");
            targetIndex = Math.floor(Math.random() * segments.length);
        }

        // Calculate rotation
        // 0 degrees at 3 o'clock usually for CSS rotation or 12 o'clock depending on start
        // Our segments generation starts at 0deg. 
        // Segment 0 center is at Angle/2.
        // To bring Segment i to the TOP (270deg or -90deg):
        // Rotation = - (i * angle + angle/2) - 90?

        // Simpler approach:
        // Assume pointer is at top (12 o'clock).
        // Segment 0 starts at 12 o'clock and goes clockwise.
        // Center of Segment 0 is at offset = segmentAngle / 2.
        // To start, we are at 0.
        // To get Segment 0 Center to 12 o'clock: Rotate - (segmentAngle / 2).
        // To get Segment 1 Center to 12 o'clock: Rotate - (segmentAngle + segmentAngle / 2).
        // General: Rotate - (index * segmentAngle + segmentAngle / 2).

        const extraSpins = 5; // Make it spin fast
        // We add to current rotation so it keeps spinning in one direction

        // Just add 360*5 then add the offset needed to reach the target section.

        const baseRotation = 360 * extraSpins; // 5 full spins
        const targetAngle = (targetIndex * segmentAngle) + (segmentAngle / 2); // Center of segment

        // Adjust for pointer being at TOP (which is usually -90 or 270 relative to 0 at right, 
        // BUT due to our CSS setup below (conic gradient from 0), 0 is at Top? 
        // Let's check the CSS: `conic-gradient(from 0deg...)`. 0deg in conic gradient is usually TOP.
        // So Segment 0 is from 0 to Angle. Center at Angle/2.
        // To get Segment 0 Center to Top (0deg), we need to rotate result by -Angle/2.

        const offsetToAlignTop = -targetAngle;

        // Add random jitter within the segment for realism (avoid landing exact center every time)
        const jitter = (Math.random() - 0.5) * (segmentAngle * 0.8);

        const newRotation = rotation + baseRotation + offsetToAlignTop + jitter;

        setRotation(newRotation);

        await controls.start({
            rotate: newRotation,
            transition: {
                duration: 4,
                ease: [0.2, 0.8, 0.2, 1], // Ease-out-cubic-ish
            }
        });

        setIsSpinning(false);

        // Celebration & Toast
        if (result.value > 0 || (result.type !== 'none' && result.value !== 0)) {
            confetti({
                particleCount: 120,
                spread: 70,
                origin: { y: 0.6 }
            });
            toast.success(`You won ${result.label || (result.value + ' Points')}!`);
        } else {
            toast.info(result.label || "Better luck next time!");
        }

        dispatch(clearSpinResult());
    };

    return (
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 flex flex-col items-center justify-center relative overflow-hidden h-full">
            <h3 className="text-2xl font-black text-gray-900 mb-2">Daily Spin</h3>
            <p className="text-gray-500 text-sm mb-6 text-center">Spin to win exclusive rewards!</p>

            <div className="relative w-64 h-64 mb-8">
                {/* Pointer */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="w-8 h-8 text-indigo-600 drop-shadow-lg">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 22L12 2L2 2L12 22Z" transform="rotate(180 12 12)" />
                        </svg>
                    </div>
                </div>

                {/* Wheel */}
                <motion.div
                    className="w-full h-full rounded-full border-4 border-indigo-100 shadow-xl relative overflow-hidden"
                    animate={controls}
                    initial={{ rotate: 0 }}
                    style={{ background: 'conic-gradient(from 0deg, var(--tw-gradient-stops))' }}
                >
                    <div className="w-full h-full rounded-full relative" style={{
                        background: `conic-gradient(
                            ${segments.map((s, i) => `${s.color || '#ccc'} ${i * (100 / segments.length)}% ${(i + 1) * (100 / segments.length)}%`).join(', ')}
                         )`
                    }}>
                        {segments.map((segment, index) => (
                            <div
                                key={index}
                                className="absolute top-0 left-1/2 w-[1px] h-1/2 origin-bottom transform"
                                style={{ transform: `translateX(-50%) rotate(${index * segmentAngle + segmentAngle / 2}deg)` }}
                            >
                                <div className="pt-4 -ml-10 w-20 text-center text-white font-bold text-xs drop-shadow-md transform -rotate-90" style={{
                                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                                }}>
                                    {segment.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Center Button */}
                <button
                    onClick={handleSpin}
                    disabled={isSpinning || loading}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-lg border-4 border-indigo-50 flex items-center justify-center z-10 hover:scale-105 active:scale-95 transition-all text-indigo-900 font-black text-sm uppercase"
                >
                    {isSpinning ? '...' : 'Spin'}
                </button>
            </div>

            <div className="text-center">
                <p className="text-xs text-indigo-400 font-medium">
                    {profile?.lastSpin && new Date(profile.lastSpin).toDateString() === new Date().toDateString()
                        ? "Next spin available tomorrow"
                        : "Spin available!"}
                </p>
            </div>
        </div>
    );
};

export default SpinWheel;
