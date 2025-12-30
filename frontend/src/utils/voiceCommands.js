export const voiceCommands = [
    // --- Navigation Commands ---
    {
        pattern: /^(go to|open|show|visit|take me to)?\s*(home|homepage)\s*$/i,
        action: (navigate) => navigate('/'),
        feedback: 'Going Home',
    },
    {
        pattern: /^(go to|open|show|visit|view)?\s*(cart|basket|shopping bag|my cart)\s*$/i,
        action: (navigate) => navigate('/cart'),
        feedback: 'Opening Cart',
    },
    {
        pattern: /^(go to|open|show|visit|see)?\s*(wishlist|favorites|saved items)\s*$/i,
        action: (navigate) => navigate('/wishlist'),
        feedback: 'Opening Wishlist',
    },
    {
        pattern: /^(go to|open|show|visit|check)?\s*(orders|my orders|order history|my stuff)\s*$/i,
        action: (navigate) => navigate('/orders'),
        feedback: 'Opening Orders',
    },
    {
        pattern: /^(go to|open|show|visit|my)?\s*(profile|account|my account|settings)\s*$/i,
        action: (navigate) => navigate('/profile'),
        feedback: 'Opening Profile',
    },
    {
        pattern: /^(log out|sign out|logout|signout|leave)\s*$/i,
        action: (navigate) => {
            // Ideally dispatch logout, but for nav-only context:
            navigate('/login');
            return 'Logging out';
        },
        feedback: 'Logging out',
    },
    {
        pattern: /^(go to|open|show)?\s*(login|sign in|log in)\s*$/i,
        action: (navigate) => navigate('/login'),
        feedback: 'Opening Login',
    },
    {
        pattern: /^(go to|open|show)?\s*(register|signup|sign up|create account)\s*$/i,
        action: (navigate) => navigate('/register'),
        feedback: 'Opening Registration',
    },
    {
        pattern: /^(go to|open|show)?\s*(dashboard|admin dashboard|admin panel)\s*$/i,
        action: (navigate) => navigate('/admin/dashboard'),
        feedback: 'Opening Dashboard',
    },

    // --- Dynamic Category Navigation ---
    {
        pattern: /^(show|view|open|find|go to|browse)?\s*(electronics|gadgets|fashion|clothing|men|women|home|decor|furniture|beauty|health|sports|books|toys|laptops|mobiles|phones|shoes)\s*$/i,
        action: (navigate, transcript) => {
            // Extract the category keyword
            const categories = ['electronics', 'fashion', 'clothing', 'men', 'women', 'home', 'decor', 'furniture', 'beauty', 'health', 'sports', 'books', 'toys', 'laptops', 'mobiles', 'phones', 'shoes'];
            const found = categories.find(c => transcript.toLowerCase().includes(c));
            if (found) {
                navigate(`/products?category=${found}`);
                return `Showing ${found}`;
            }
            return 'Opening Category';
        },
        feedback: (transcript) => `Browsing Category`,
    },

    // --- Product Filtering & Sorting ---
    {
        pattern: /^(sort|order|arrange)?\s*by\s*(price|cost)\s*(low|high|cheapest|expensive)?\s*$/i,
        action: (navigate, transcript) => {
            if (transcript.includes('high') || transcript.includes('expensive')) {
                navigate('/products?sort=price_desc');
                return 'Sorting by Price High to Low';
            }
            navigate('/products?sort=price_asc');
            return 'Sorting by Price Low to High';
        },
        feedback: 'Sorting Products',
    },
    {
        pattern: /^(sort|order|arrange)?\s*by\s*(newest|latest|new)\s*$/i,
        action: (navigate) => navigate('/products?sort=newest'),
        feedback: 'Showing Newest Items',
    },
    {
        pattern: /^(show|find)?\s*cheapest\s*(items|products|stuff)?\s*$/i,
        action: (navigate) => navigate('/products?sort=price_asc'),
        feedback: 'Showing Cheapest Items',
    },

    // --- Advanced Interaction ---
    {
        pattern: /^(switch to|turn on|enable|toggle|change to)?\s*(dark mode|light mode|theme|dark theme|light theme)\s*$/i,
        action: (_nav, _txt, { toggleDarkMode }) => {
            if (toggleDarkMode) {
                toggleDarkMode();
                return 'Toggling Theme';
            }
            return 'Theme control unavailable';
        },
        feedback: 'Toggling Theme',
    },
    {
        pattern: /^(go to|open|proceed to)?\s*(checkout|payment|pay)\s*$/i,
        action: (navigate) => navigate('/checkout'),
        feedback: 'Proceeding to Checkout',
    },

    // --- General Browser Control ---
    {
        pattern: /^(go|navigate)?\s*back\s*$/i,
        action: (navigate) => navigate(-1),
        feedback: 'Going back',
    },
    {
        pattern: /^(go|navigate)?\s*forward\s*$/i,
        action: (navigate) => navigate(1),
        feedback: 'Going forward',
    },

    // 4. Help & Assistance
    {
        pattern: /^(help|what can i do|commands|what can i say|options|assist me)\s*$/i,
        action: () => {
            return 'You can say "Cart", "Search for Shoes", or "Theme"';
        },
        feedback: 'Showing Help',
    },

    // 5. Order Tracking
    {
        pattern: /^(track|where is|check status of)?\s*(my order|order|package)\s*$/i,
        action: (navigate) => navigate('/orders'),
        feedback: 'Opening Order Tracking',
    },
    {
        pattern: /^(contact|support|customer service|help desk)\s*$/i,
        action: () => window.location.href = 'mailto:support@eshop.com',
        feedback: 'Opening Email Support',
    },


    // Page Actions
    {
        pattern: /^(scroll|go|move)?\s*down\s*$/i,
        action: () => window.scrollBy({ top: 500, behavior: 'smooth' }),
        feedback: 'Scrolling down',
    },
    {
        pattern: /^(scroll|go|move)?\s*up\s*$/i,
        action: () => window.scrollBy({ top: -500, behavior: 'smooth' }),
        feedback: 'Scrolling up',
    },
    {
        pattern: /^(scroll|go|jump)?\s*to\s*(top|start)\s*$/i,
        action: () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return 'Scrolling to top';
        },
        feedback: 'Scrolling to top',
    },

    // --- Help ---
    {
        pattern: /^(help|what can i do|commands|what can i say|options|assist me)\s*$/i,
        action: () => 'Try saying "Show me laptops", "Sort by price", or "Go to cart"',
        feedback: 'Showing Help',
    },
    {
        pattern: /^(clear|empty|remove all from)?\s*(cart|basket)\s*$/i,
        action: (navigate) => {
            // This would ideally dispatch a redux action, but we need dispatch access.
            // For now, we'll navigate to cart where user can see it.
            navigate('/cart');
            return 'Opening Cart to manage items';
        },
        feedback: 'Opening Cart',
    }
];

export const processVoiceCommand = (transcript, navigate, extraContext = {}) => {
    const lowerTranscript = transcript.toLowerCase().trim();

    // Check exact matches first
    for (const cmd of voiceCommands) {
        if (cmd.pattern.test(lowerTranscript)) {
            const result = cmd.action(navigate, lowerTranscript, extraContext);
            const feedbackMsg = typeof result === 'string' ? result :
                (typeof cmd.feedback === 'function' ? cmd.feedback(lowerTranscript) : cmd.feedback);

            return { matched: true, feedback: feedbackMsg };
        }
    }

    // Smart Search Fallback
    // Matches: "search for shoes", "find red dress", "show me laptops", "laptops"
    // We want to avoid navigating for garbage like "ummm" or very short noises if possible,
    // but users might search for "box".

    const searchTriggers = /^(search for|find|show me|look for|search)\s+/;
    let searchQuery = lowerTranscript;

    if (searchTriggers.test(lowerTranscript)) {
        searchQuery = lowerTranscript.replace(searchTriggers, '');
    } else {
        // If no trigger word, but it's not a command, treat as search 
        // ONLY if it has enough length to be a valid search term, prevents random noise
        if (lowerTranscript.length < 3) {
            return { matched: false, feedback: null };
        }
    }

    // Clean up punctuation
    searchQuery = searchQuery.replace(/[?.!]+$/, '');

    if (searchQuery.length > 1) {
        navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
        return { matched: true, isSearchFallback: true, feedback: `Searching for "${searchQuery}"` };
    }

    return { matched: false, feedback: null };
};
