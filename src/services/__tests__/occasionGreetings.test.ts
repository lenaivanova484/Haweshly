/**
 * occasionGreetings.test.ts
 *
 * Testing utilities for the occasion greeting system.
 * Use these functions in development to test occasion notifications.
 *
 * HOW TO USE:
 * 1. Import these functions in your dev screen or debug menu
 * 2. Call them with button presses
 * 3. Check notifications and logs
 */

import {
  checkAndSendOccasionGreetings,
  clearAllTriggeredOccasions,
  getTriggeredOccasionsList,
} from '../../services/occasionGreetings';
import { occasionGreetings } from '../../constants/occasionGreetings';
import type { Language } from '../../constants/strings';

/**
 * Test utility: Clear all tracked occasions and trigger check
 *
 * Use this to test occasion notifications without changing device date.
 * Note: This will only work if TODAY actually matches an occasion date.
 *
 * @param language - Language for notification ('en' or 'ar')
 * @example
 * ```typescript
 * // In your debug screen:
 * <Button onPress={() => testOccasionGreeting('ar')} title="Test Occasion (AR)" />
 * ```
 */
export async function testOccasionGreeting(language: Language): Promise<void> {
  console.log('========== TESTING OCCASION GREETING ==========');
  console.log('1. Clearing all tracked occasions...');
  await clearAllTriggeredOccasions();

  console.log('2. Checking for occasion...');
  await checkAndSendOccasionGreetings(language);

  console.log('3. Getting triggered occasions list...');
  const triggered = await getTriggeredOccasionsList();
  console.log('Triggered:', JSON.stringify(triggered, null, 2));
  console.log('========== TEST COMPLETE ==========');
}

/**
 * Test utility: View all available occasions
 *
 * Lists all occasions with their IDs and date hints.
 * Useful for understanding what occasions are configured.
 */
export function listAllOccasions(): void {
  console.log('========== ALL OCCASIONS ==========');
  console.log('\n📅 GREGORIAN OCCASIONS:');
  occasionGreetings
    .filter(o => o.type === 'gregorian')
    .forEach(o => {
      console.log(`  - ${o.title} (${o.date_hint})`);
      console.log(`    ID: ${o.id}`);
      console.log(`    EN: ${o.message_en}`);
      console.log(`    AR: ${o.message_ar}\n`);
    });

  console.log('\n🌙 HIJRI OCCASIONS:');
  occasionGreetings
    .filter(o => o.type === 'hijri')
    .forEach(o => {
      console.log(`  - ${o.title} (${o.date_hint})`);
      console.log(`    ID: ${o.id}`);
      console.log(`    EN: ${o.message_en}`);
      console.log(`    AR: ${o.message_ar}\n`);
    });
  console.log('========== END ==========');
}

/**
 * Test utility: View currently triggered occasions
 *
 * Shows which occasions have been triggered and when.
 */
export async function viewTriggeredOccasions(): Promise<void> {
  console.log('========== TRIGGERED OCCASIONS ==========');
  const triggered = await getTriggeredOccasionsList();

  if (triggered.length === 0) {
    console.log('No occasions have been triggered yet.');
  } else {
    triggered.forEach(t => {
      console.log(`  - ${t.occasionId}`);
      console.log(`    Year: ${t.year}`);
      console.log(`    Triggered at: ${t.triggeredAt}\n`);
    });
  }
  console.log('========== END ==========');
}

/**
 * Test utility: Reset all occasion tracking
 *
 * Clears all triggered occasions so they can fire again.
 * Useful for testing the same occasion multiple times.
 */
export async function resetAllOccasions(): Promise<void> {
  console.log('========== RESETTING OCCASIONS ==========');
  await clearAllTriggeredOccasions();
  console.log('All occasion tracking cleared!');
  console.log('Occasions can now be triggered again.');
  console.log('========== RESET COMPLETE ==========');
}

/**
 * Test utility: Simulate occasion check (with logs)
 *
 * Runs the full occasion check cycle with detailed logging.
 * Does NOT clear tracking first - so if today's occasion was
 * already triggered, it won't fire again.
 *
 * @param language - Language for notification
 */
export async function simulateOccasionCheck(language: Language): Promise<void> {
  console.log('========== SIMULATING OCCASION CHECK ==========');
  console.log(`Language: ${language}`);
  console.log(`Current Date: ${new Date().toLocaleDateString()}`);
  console.log('Checking occasions...');

  await checkAndSendOccasionGreetings(language);

  console.log('Check complete. See logs above for results.');
  console.log('========== SIMULATION COMPLETE ==========');
}

// ========== Example Debug Component ==========
/**
 * Example: Add this to your Settings screen for testing
 *
 * ```typescript
 * import {
 *   testOccasionGreeting,
 *   listAllOccasions,
 *   viewTriggeredOccasions,
 *   resetAllOccasions,
 * } from '../services/__tests__/occasionGreetings.test';
 *
 * // In your Settings component:
 * <View>
 *   <Button
 *     title="Test Occasion (AR)"
 *     onPress={() => testOccasionGreeting('ar')}
 *   />
 *   <Button
 *     title="List All Occasions"
 *     onPress={() => listAllOccasions()}
 *   />
 *   <Button
 *     title="View Triggered"
 *     onPress={() => viewTriggeredOccasions()}
 *   />
 *   <Button
 *     title="Reset All"
 *     onPress={() => resetAllOccasions()}
 *   />
 * </View>
 * ```
 */
