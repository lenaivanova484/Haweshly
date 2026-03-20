import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { occasionGreetings, OccasionGreeting } from '../constants/occasionGreetings';
import { Language } from '../constants/strings';

// ========== Storage Keys ==========
const TRIGGERED_OCCASIONS_KEY = '@haweshly_triggered_occasions';

// ========== Channel Configuration ==========
const OCCASION_CHANNEL_ID = 'haweshly_occasions';

// ========== Types ==========
interface TriggeredOccasion {
  occasionId: string;
  type: 'gregorian' | 'hijri';
  year: number;
  triggeredAt: string;
}

interface HijriDate {
  day: number;
  month: number;
  year: number;
  monthName: string;
}

interface AladhanApiResponse {
  data: {
    hijri: {
      day: string;
      month: {
        number: number;
        en: string;
      };
      year: string;
    };
  };
}

interface HijriOccasionResult {
  occasion: OccasionGreeting;
  hijriDate: HijriDate;
}

// ========== Network Connectivity ==========

async function hasInternetConnection(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('https://www.google.com/generate_204', {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

// ========== Hijri Date API ==========

async function fetchCurrentHijriDate(): Promise<HijriDate | null> {
  const hasInternet = await hasInternetConnection();
  if (!hasInternet) {
    console.log('[OccasionGreetings] No internet connection - skipping Hijri date fetch');
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const url = `https://api.aladhan.com/v1/gToH/${day}-${month}-${year}`;

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('[OccasionGreetings] Hijri API returned error:', response.status);
      return null;
    }

    const data: AladhanApiResponse = await response.json();

    return {
      day: parseInt(data.data.hijri.day, 10),
      month: data.data.hijri.month.number,
      year: parseInt(data.data.hijri.year, 10),
      monthName: data.data.hijri.month.en,
    };
  } catch (error) {
    console.error('[OccasionGreetings] Failed to fetch Hijri date:', error);
    return null;
  }
}

// ========== Triggered Occasions Storage ==========

async function loadTriggeredOccasions(): Promise<TriggeredOccasion[]> {
  try {
    const raw = await AsyncStorage.getItem(TRIGGERED_OCCASIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('[OccasionGreetings] Failed to load triggered occasions:', error);
    return [];
  }
}

async function saveTriggeredOccasions(occasions: TriggeredOccasion[]): Promise<void> {
  try {
    await AsyncStorage.setItem(TRIGGERED_OCCASIONS_KEY, JSON.stringify(occasions));
  } catch (error) {
    console.error('[OccasionGreetings] Failed to save triggered occasions:', error);
  }
}

async function wasOccasionTriggered(
  occasionId: string,
  type: 'gregorian' | 'hijri',
  year: number,
): Promise<boolean> {
  const triggered = await loadTriggeredOccasions();
  return triggered.some(t => t.occasionId === occasionId && t.type === type && t.year === year);
}

async function markOccasionAsTriggered(
  occasionId: string,
  type: 'gregorian' | 'hijri',
  year: number,
): Promise<void> {
  const triggered = await loadTriggeredOccasions();
  const filtered = triggered.filter(t => !(t.occasionId === occasionId && t.type === type));

  filtered.push({
    occasionId,
    type,
    year,
    triggeredAt: new Date().toISOString(),
  });

  await saveTriggeredOccasions(filtered);
}

async function cleanupOldTriggeredOccasions(): Promise<void> {
  try {
    const triggered = await loadTriggeredOccasions();
    const currentGregorianYear = new Date().getFullYear();

    const hijriDate = await fetchCurrentHijriDate();
    const currentHijriYear = hijriDate?.year ?? null;

    let filtered = triggered.filter(
      t => t.type !== 'gregorian' || t.year >= currentGregorianYear - 2,
    );

    if (currentHijriYear !== null) {
      filtered = filtered.filter(
        t => t.type !== 'hijri' || t.year >= currentHijriYear - 2,
      );
    }

    if (filtered.length < triggered.length) {
      await saveTriggeredOccasions(filtered);
      console.log(
        `[OccasionGreetings] Cleaned up ${triggered.length - filtered.length} old occasions`,
      );
    }
  } catch (error) {
    console.error('[OccasionGreetings] Failed to cleanup old occasions:', error);
  }
}

// ========== Gregorian Occasion Detection ==========

async function checkGregorianOccasions(): Promise<OccasionGreeting | null> {
  const now = new Date();
  const currentYear = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  console.log(`[OccasionGreetings] Gregorian check — date: ${day}/${month}/${currentYear}`);

  const occasionDates: Record<string, { month: number; day: number }> = {
    gregorian_new_year:   { month: 1,  day: 1  },
    gregorian_valentine:  { month: 2,  day: 14 },
    gregorian_mothers_day:{ month: 3,  day: 21 },
    gregorian_end_of_year:{ month: 12, day: 31 },
  };

  // Check Black Friday (4th Friday of November)
  if (month === 11 && now.getDay() === 5) {
    const weekOfMonth = Math.floor((day - 1) / 7) + 1;
    if (weekOfMonth === 4) {
      const occasion = occasionGreetings.find(o => o.id === 'gregorian_black_friday');

      if (!occasion) {
        console.warn(
          '[OccasionGreetings] ID "gregorian_black_friday" not found in occasionGreetings. ' +
          'Check that the id field matches exactly.',
        );
      } else if (!(await wasOccasionTriggered(occasion.id, 'gregorian', currentYear))) {
        return occasion;
      }
    }
  }

  for (const [occasionId, date] of Object.entries(occasionDates)) {
    if (month === date.month && day === date.day) {
      const occasion = occasionGreetings.find(o => o.id === occasionId);

      if (!occasion) {
        console.warn(
          `[OccasionGreetings] ID "${occasionId}" not found in occasionGreetings. ` +
          'Check that the id field matches exactly.',
        );
        continue;
      }

      if (!(await wasOccasionTriggered(occasion.id, 'gregorian', currentYear))) {
        return occasion;
      }
    }
  }

  return null;
}

// ========== Hijri Occasion Detection ==========

async function checkHijriOccasions(): Promise<HijriOccasionResult | null> {
  const hijriDate = await fetchCurrentHijriDate();

  if (!hijriDate) {
    return null;
  }

  const { day, month, year } = hijriDate;

  console.log(`[OccasionGreetings] Hijri check — date: ${day}/${month}/${year} (${hijriDate.monthName})`);

  const occasionDates: Record<string, { month: number; day: number }> = {
    hijri_new_year: { month: 1,  day: 1  },
    hijri_ramadan:  { month: 9,  day: 1  },
    hijri_eid_fitr: { month: 10, day: 1  },
    hijri_arafah:   { month: 12, day: 9  },
    hijri_eid_adha: { month: 12, day: 10 },
    hijri_mawlid:   { month: 3,  day: 12 },
  };

  for (const [occasionId, date] of Object.entries(occasionDates)) {
    if (month === date.month && day === date.day) {
      const occasion = occasionGreetings.find(o => o.id === occasionId);

      if (!occasion) {
        console.warn(
          `[OccasionGreetings] ID "${occasionId}" not found in occasionGreetings. ` +
          'Check that the id field matches exactly.',
        );
        continue;
      }

      if (!(await wasOccasionTriggered(occasion.id, 'hijri', year))) {
        return { occasion, hijriDate };
      }
    }
  }

  return null;
}

// ========== Notification Sending ==========

async function sendOccasionNotification(
  occasion: OccasionGreeting,
  language: Language,
): Promise<void> {
  try {
    const settings = await notifee.requestPermission();
    if (
      settings.authorizationStatus === 0 // 0 = DENIED
    ) {
      console.warn('[OccasionGreetings] Notification permission denied — cannot send notification');
      return;
    }

    const channelId = await notifee.createChannel({
      id: OCCASION_CHANNEL_ID,
      name: 'Occasion Greetings',
      sound: 'default',
      importance: AndroidImportance.HIGH,
    });

    const message = language === 'ar' ? occasion.message_ar : occasion.message_en;

    await notifee.displayNotification({
      title: occasion.title,
      body: message,
      android: {
        channelId,
        pressAction: { id: 'default' },
        sound: 'default',
        smallIcon: 'ic_launcher',
      },
      ios: {
        sound: 'default',
      },
    });

    console.log(`[OccasionGreetings] ✅ Sent notification for: ${occasion.id}`);
  } catch (error) {
    console.error('[OccasionGreetings] Failed to send notification:', error);
  }
}

// ========== Main Check Function ==========

export async function checkAndSendOccasionGreetings(language: Language): Promise<void> {
  try {
    console.log('[OccasionGreetings] Checking for occasions...');

    await cleanupOldTriggeredOccasions();

    // --- Gregorian ---
    const gregorianOccasion = await checkGregorianOccasions();
    if (gregorianOccasion) {
      console.log(`[OccasionGreetings] Found Gregorian occasion: ${gregorianOccasion.id}`);
      await markOccasionAsTriggered(gregorianOccasion.id, 'gregorian', new Date().getFullYear());
      await sendOccasionNotification(gregorianOccasion, language);
    }

    // --- Hijri ---
    const hijriResult = await checkHijriOccasions();
    if (hijriResult) {
      const { occasion: hijriOccasion, hijriDate } = hijriResult;
      console.log(`[OccasionGreetings] Found Hijri occasion: ${hijriOccasion.id}`);
      await markOccasionAsTriggered(hijriOccasion.id, 'hijri', hijriDate.year);
      await sendOccasionNotification(hijriOccasion, language);
    }

    console.log('[OccasionGreetings] Check complete');
  } catch (error) {
    console.error('[OccasionGreetings] Error during occasion check:', error);
  }
}

export async function clearAllTriggeredOccasions(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TRIGGERED_OCCASIONS_KEY);
    console.log('[OccasionGreetings] Cleared all triggered occasions');
  } catch (error) {
    console.error('[OccasionGreetings] Failed to clear triggered occasions:', error);
  }
}

export async function getTriggeredOccasionsList(): Promise<TriggeredOccasion[]> {
  return loadTriggeredOccasions();
}