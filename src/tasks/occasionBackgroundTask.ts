/**
 * occasionBackgroundTask.ts
 *
 * Standalone (React-free) occasion greeting processor used by:
 *  - react-native-background-fetch (periodic checks)
 *  - Can be called from any async context
 *
 * Reads language preference from AsyncStorage and checks for occasion greetings.
 * Designed to run even when the React component tree is not mounted.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkAndSendOccasionGreetings } from '../services/occasionGreetings';
import type { Language } from '../constants/strings';

/**
 * Runs a full occasion check cycle without any React context.
 * Safe to call from a headless JS task, background fetch, or any async context.
 */
export async function runOccasionBgCheck(): Promise<void> {
  try {
    console.log('[OccasionBgTask] Running background occasion check...');

    // Load user's language preference from AsyncStorage
    const lang = await AsyncStorage.getItem('language');
    const language: Language = (lang === 'ar') ? "ar" : "en";

    // Check and send occasion greetings
    await checkAndSendOccasionGreetings(language);

    console.log('[OccasionBgTask] Background occasion check complete');
  } catch (error) {
    console.error('[OccasionBgTask] Error during background occasion check:', error);
  }
}
