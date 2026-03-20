/**
 * EXAMPLE: Testing Buttons for Settings Screen
 *
 * This is an EXAMPLE showing how to add debug/testing buttons to your Settings screen.
 * Copy the relevant parts into your actual Settings screen component.
 *
 * DO NOT import this file directly - it's just a reference!
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import {
  testOccasionGreeting,
  listAllOccasions,
  viewTriggeredOccasions,
  resetAllOccasions,
} from './occasionGreetings.test';
import type { Language } from '../../constants/strings';

/**
 * Example Section Component for Settings Screen
 *
 * Add this to your Settings screen under a "Developer Tools" or "Debug" section
 */
export function OccasionTestingSection({ language }: { language: Language }) {
  const handleTestGreeting = async () => {
    try {
      await testOccasionGreeting(language);
      Alert.alert(
        'Test Complete',
        'Check the console logs for details. If today matches an occasion, you should see a notification.',
      );
    } catch (error) {
      Alert.alert('Error', `Failed to test: ${error}`);
    }
  };

  const handleListOccasions = () => {
    listAllOccasions();
    Alert.alert('Occasions Listed', 'Check the console to see all occasions.');
  };

  const handleViewTriggered = async () => {
    try {
      await viewTriggeredOccasions();
      Alert.alert('Triggered Occasions', 'Check the console to see triggered occasions.');
    } catch (error) {
      Alert.alert('Error', `Failed to view: ${error}`);
    }
  };

  const handleResetOccasions = async () => {
    try {
      await resetAllOccasions();
      Alert.alert(
        'Reset Complete',
        'All occasion tracking cleared. Occasions can now be triggered again.',
      );
    } catch (error) {
      Alert.alert('Error', `Failed to reset: ${error}`);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Occasion Greetings (Debug)</Text>

      <TouchableOpacity style={styles.button} onPress={handleTestGreeting}>
        <Text style={styles.buttonText}>🧪 Test Occasion Greeting</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleListOccasions}>
        <Text style={styles.buttonText}>📋 List All Occasions</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleViewTriggered}>
        <Text style={styles.buttonText}>👁️ View Triggered Occasions</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleResetOccasions}>
        <Text style={styles.buttonText}>🔄 Reset All Tracking</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

/**
 * HOW TO INTEGRATE INTO YOUR SETTINGS SCREEN:
 *
 * 1. Open your Settings screen component (likely in src/screens/Settings.tsx or similar)
 *
 * 2. Import the testing functions:
 *    ```typescript
 *    import {
 *      testOccasionGreeting,
 *      listAllOccasions,
 *      viewTriggeredOccasions,
 *      resetAllOccasions,
 *    } from '../src/services/__tests__/occasionGreetings.test';
 *    ```
 *
 * 3. Add buttons similar to the component above (adapt styling to match your app)
 *
 * 4. For production, wrap this section in __DEV__ check:
 *    ```typescript
 *    {__DEV__ && (
 *      <OccasionTestingSection language={language} />
 *    )}
 *    ```
 *
 * 5. Or remove these debug buttons before production release
 */

/**
 * ALTERNATIVE: Simple Button Integration
 *
 * If you don't want a full component, just add individual buttons:
 *
 * ```typescript
 * // In your Settings screen JSX:
 * {__DEV__ && (
 *   <>
 *     <TouchableOpacity
 *       onPress={async () => {
 *         await testOccasionGreeting(language);
 *         console.log('Test complete - check logs');
 *       }}>
 *       <Text>Test Occasion Greeting</Text>
 *     </TouchableOpacity>
 *
 *     <TouchableOpacity
 *       onPress={async () => {
 *         await resetAllOccasions();
 *         console.log('Reset complete');
 *       }}>
 *       <Text>Reset Occasion Tracking</Text>
 *     </TouchableOpacity>
 *   </>
 * )}
 * ```
 */
