import React, { useState, useRef, useEffect } from 'react';
import '@google/model-viewer';
import { QRCodeSVG } from 'qrcode.react';
import {
    ViewInAr,
    Cameraswitch,
    QrCode,
    Close,
    Fullscreen,
    FullscreenExit,
    Share,
    Download
} from '@mui/icons-material';

const ARViewer = ({ src, poster, alt, placement = 'floor' }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showQR, setShowQR] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const viewerRef = useRef(null);
    const containerRef = useRef(null);

    // Check if device is mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const currentUrl = window.location.href;

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const takeSnapshot = async () => {
        if (viewerRef.current) {
            try {
                const blob = await viewerRef.current.toBlob({ mimeType: 'image/png' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `ar-snapshot-${Date.now()}.png`;
                a.click();
                URL.revokeObjectURL(url);
            } catch (e) {
                console.error("Snapshot failed", e);
            }
        }
    };

    if (!src) return null;

    return (
        <div
            ref={containerRef}
            className={`relative w-full bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shadow-sm group transition-all duration-300 ${isFullscreen ? 'h-screen' : 'h-[500px]'}`}
        >
            {/* Loading Overlay */}
            {loading && !error && (
                <div className="absolute inset-0 flex items-center justify-center z-20 bg-white/80 backdrop-blur-sm transition-opacity duration-300">
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-sm text-indigo-700 font-semibold tracking-wide">Loading 3D Experience...</p>
                    </div>
                </div>
            )}

            {/* Error Overlay */}
            {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-gray-50 text-red-500 p-4 text-center">
                    <svg className="w-12 h-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="font-medium">Failed to load 3D model</p>
                    <button
                        onClick={() => { setError(false); setLoading(true); }}
                        className="mt-4 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Controls Overlay (Top Right) */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                    onClick={toggleFullscreen}
                    className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:bg-white text-gray-700 hover:text-indigo-600 transition-all transform hover:scale-105"
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                    {isFullscreen ? <FullscreenExit fontSize="small" /> : <Fullscreen fontSize="small" />}
                </button>

                {!isMobile && (
                    <button
                        onClick={() => setShowQR(!showQR)}
                        className={`p-2 backdrop-blur-md rounded-full shadow-lg transition-all transform hover:scale-105 ${showQR ? 'bg-indigo-600 text-white' : 'bg-white/90 text-gray-700 hover:bg-white hover:text-indigo-600'}`}
                        title="View on Mobile"
                    >
                        <QrCode fontSize="small" />
                    </button>
                )}

                <button
                    onClick={takeSnapshot}
                    className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:bg-white text-gray-700 hover:text-indigo-600 transition-all transform hover:scale-105"
                    title="Take Snapshot"
                >
                    <Cameraswitch fontSize="small" />
                </button>
            </div>

            {/* QR Code Modal for Desktop */}
            {showQR && !isMobile && (
                <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex items-center justify-center animate-fade-in p-4">
                    <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full relative transform transition-all scale-100">
                        <button
                            onClick={() => setShowQR(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <Close />
                        </button>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">View in your space</h3>
                        <p className="text-gray-500 text-sm mb-6 text-center">Scan this QR code with your phone to view this product in Augmented Reality.</p>

                        <div className="bg-white p-2 rounded-xl border-2 border-dashed border-indigo-100 flex justify-center mb-4">
                            <QRCodeSVG value={currentUrl} size={200} level="H" includeMargin={true} />
                        </div>

                        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                            <ViewInAr fontSize="small" />
                            <span>Compatible with iOS & Android</span>
                        </div>
                    </div>
                </div>
            )}

            {/* 3D Model Viewer */}
            <model-viewer
                ref={viewerRef}
                src={src}
                poster={poster || '/placeholder.svg'}
                alt={alt || "A 3D model of the product"}
                ar
                ar-modes="webxr scene-viewer quick-look"
                camera-controls
                auto-rotate
                shadow-intensity="1"
                shadow-softness="1"
                environment-image="neutral"
                exposure="1"
                ar-placement={placement}
                style={{ width: '100%', height: '100%' }}
                onLoad={() => setLoading(false)}
                onError={(e) => {
                    console.error("Model Viewer Error:", e);
                    setLoading(false);
                    setError(true);
                }}
            >
                {/* Custom AR Button (only visible on AR-capable devices) */}
                <div slot="ar-button" className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                    <button className="flex items-center space-x-2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl hover:bg-black transition-all transform active:scale-95 group">
                        <ViewInAr className="group-hover:animate-pulse" />
                        <span className="font-semibold tracking-wide">View in AR</span>
                    </button>
                </div>

                {/* Annotation / Help Text (optional, disappears after interaction) */}
                <div id="annotation" className="absolute top-4 left-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000 delay-1000">
                    Interact to rotate & zoom
                </div>
            </model-viewer>
        </div>
    );
};

export default ARViewer;
