/**
 * Utility functions for Google Analytics event tracking
 */

/**
 * Initialize the dataLayer array if it doesn't exist
 */
export const initializeDataLayer = () => {
  window.dataLayer = window.dataLayer || [];
};

/**
 * Send an event to Google Tag Manager
 * @param {string} eventName - The name of the event to track
 * @param {Object} eventParameters - Additional parameters for the event
 */
export const sendEvent = (eventName, eventParameters = {}) => {
  if (!window.dataLayer) {
    initializeDataLayer();
  }
  
  window.dataLayer.push({
    event: eventName,
    ...eventParameters
  });
  
  // Log event in development for debugging
  if (process.env.NODE_ENV !== 'production') {
    console.log('Analytics event:', eventName, eventParameters);
  }
};

/**
 * Track when the game is opened for the first time
 */
export const trackGameFirstOpen = () => {
  sendEvent('game_first_open');
};

/**
 * Track when a specific level is played
 * @param {string} levelId - The ID of the level being played
 */
export const trackLevelStarted = (levelId) => {
  sendEvent('level_started', { level_id: levelId });
};

/**
 * Track when the credits are viewed
 */
export const trackCreditsViewed = () => {
  sendEvent('credits_viewed');
}; 