import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { findCart } from "../../store/slices/cartSlice";
import { findWishlist } from "../../store/slices/wishlistSlice";
import { findAllNotifications } from "../../store/slices/notificationsSlice";
import Navbar from "./Navbar";
import ChatWidget from "../Chat/ChatWidget";
import { VoiceProvider, useVoice } from "../../contexts/VoiceContext";
import VoiceAssistantOverlay from "../VoiceAssistant/VoiceAssistantOverlay";
import VoiceFloatingButton from "../VoiceAssistant/VoiceFloatingButton";

// Inner component to consume voice context for the overlay
const VoiceOverlayWrapper = () => {
  const { isOverlayOpen, isListening, transcript, interimTranscript, feedback, closeOverlay } = useVoice();
  return (
    <VoiceAssistantOverlay
      isOpen={isOverlayOpen}
      isListening={isListening}
      transcript={transcript}
      interimTranscript={interimTranscript}
      feedback={feedback}
      onClose={closeOverlay}
    />
  );
};

const LayoutContainer = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(findCart());
      dispatch(findWishlist());
      dispatch(findAllNotifications());
    }
  }, [dispatch, token]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-body">
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          <p>&copy; 2025 E-Shop. Crafted with ❤️ for excellence.</p>
        </div>
      </footer>
      <VoiceOverlayWrapper />
      <VoiceFloatingButton />
      <ChatWidget /> {/* Render ChatWidget at the bottom */}
    </div>
  );
}

const Layout = () => {
  return (
    <VoiceProvider>
      <LayoutContainer />
    </VoiceProvider>
  );
};

export default Layout;
