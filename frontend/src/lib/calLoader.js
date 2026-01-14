// Singleton to ensure Cal.com embed script is loaded only once
let calScriptLoaded = false;
let calScriptLoading = false;
let calScriptCallbacks = [];

/**
 * Loads the Cal.com embed script globally
 * Uses singleton pattern to prevent duplicate script tags and custom element registration errors
 * @returns {Promise<void>}
 */
export const loadCalScript = () => {
    return new Promise((resolve, reject) => {
        // If already loaded, resolve immediately
        if (calScriptLoaded) {
            resolve();
            return;
        }

        // If currently loading, queue the callback
        if (calScriptLoading) {
            calScriptCallbacks.push({ resolve, reject });
            return;
        }

        // Check if script already exists in DOM
        const existingScript = document.querySelector('script[src*="cal.com/embed/embed.js"]');
        if (existingScript) {
            calScriptLoaded = true;
            resolve();
            return;
        }

        // Start loading
        calScriptLoading = true;

        const script = document.createElement('script');
        script.src = 'https://app.cal.com/embed/embed.js';
        script.async = true;

        script.onload = () => {
            calScriptLoaded = true;
            calScriptLoading = false;

            // Resolve all pending callbacks
            calScriptCallbacks.forEach(cb => cb.resolve());
            calScriptCallbacks = [];
            resolve();
        };

        script.onerror = (error) => {
            calScriptLoading = false;

            // Reject all pending callbacks
            calScriptCallbacks.forEach(cb => cb.reject(error));
            calScriptCallbacks = [];
            reject(error);
        };

        document.head.appendChild(script);
    });
};

/**
 * Checks if Cal.com script is loaded
 * @returns {boolean}
 */
export const isCalScriptLoaded = () => calScriptLoaded;
