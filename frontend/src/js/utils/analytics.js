/**
 * Utility functions for Google Analytics event tracking
 */

/**
 * Initialize the dataLayer array if it doesn't exist
 */
export const initializeDataLayer = () => {
  window.dataLayer = window.dataLayer || [];
};

// Import levelManager to check test mode status
import levelManager from '../objects/LevelManager';

export const sendEvent = (eventName, eventParameters = {}) => {
  const shouldSend = process.env.NODE_ENV === 'production' && !levelManager.LEVEL_PROGRESS.testingMode
  if (shouldSend) {
    if (!window.dataLayer) {
      initializeDataLayer();
    }
    
    window.dataLayer.push({
      event: eventName,
      ...eventParameters
    });
  }

  shouldLog = process.env.NODE_ENV !== 'production'
  if (shouldLog) {
    console.log('Analytics event:', eventName, eventParameters);
  }
};

/**
 * Track when the game is opened for the first time
 */
export const trackGameFirstOpen = () => {
  sendEvent('game_first_open');
};

export const trackLevelStarted = (levelId) => {
  sendEvent('level_started', { level_id: levelId });
};

export const trackCreditsViewed = () => {
  sendEvent('credits_viewed');
}; 

export const trackLevelCompleted = (levelId) => {
  sendEvent('level_completed', { level_id: levelId });
};

export const trackLevelFailed = (levelId) => {
  sendEvent('level_failed', { level_id: levelId });
};

export const trackRewardUnlocked = (rewardId, levelId) => {
  sendEvent('reward_unlocked', { reward_id: rewardId, level_id: levelId });
};