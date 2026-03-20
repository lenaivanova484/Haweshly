export interface OccasionGreeting {
  id: string;
  type: 'gregorian' | 'hijri';
  title: string;
  date_hint: string;
  message_en: string;
  message_ar: string;
}

export const occasionGreetings: OccasionGreeting[] = [
  // ========== Gregorian Occasions ==========
  {
    id: 'gregorian_new_year',
    type: 'gregorian',
    title: 'Happy New Year 🎉',
    date_hint: 'Jan 1',
    message_en: 'Happy New Year! 🎉 Fresh start, new goals ahead.',
    message_ar: 'كل سنة وأنت طيب! 🎉 بداية جديدة وأهداف جديدة.',
  },
  {
    id: 'gregorian_valentine',
    type: 'gregorian',
    title: 'Happy Valentine\'s Day ❤️',
    date_hint: 'Feb 14',
    message_en: 'Happy Valentine\'s Day! ❤️ Celebrate love and joy today.',
    message_ar: 'عيد حب سعيد! ❤️ احتفل بالحب والسعادة النهارده.',
  },
  {
    id: 'gregorian_mothers_day',
    type: 'gregorian',
    title: 'Happy Mother\'s Day 🌸',
    date_hint: 'Mar 21',
    message_en: 'Happy Mother\'s Day! 🌸 Honor the amazing moms today.',
    message_ar: 'عيد أم سعيد! 🌸 كل سنة وكل الأمهات بخير.',
  },
  {
    id: 'gregorian_black_friday',
    type: 'gregorian',
    title: 'Black Friday 🛍️',
    date_hint: 'Nov (4th Fri)',
    message_en: "It's Black Friday! 🛍️ Smart shopping brings big savings.",
    message_ar: 'النهارده بلاك فرايدي! 🛍️ التسوق الذكي يوفر كتير.',
  },
  {
    id: 'gregorian_end_of_year',
    type: 'gregorian',
    title: 'End of Year 🎊',
    date_hint: 'Dec 31',
    message_en: 'Year\'s ending! 🎊 Reflect on your achievements and wins.',
    message_ar: 'السنة قربت تخلص! 🎊 فكر في إنجازاتك ونجاحاتك.',
  },

  // ========== Islamic (Hijri) Occasions ==========
  {
    id: 'hijri_new_year',
    type: 'hijri',
    title: 'Happy Hijri New Year 🎉',
    date_hint: '1 Muharram',
    message_en: 'Happy Hijri New Year! 🎉 May blessings fill your year.',
    message_ar: 'كل سنة هجرية وأنت طيب! 🎉 ربنا يبارك في سنتك الجديدة.',
  },
  {
    id: 'hijri_ramadan',
    type: 'hijri',
    title: 'Ramadan Kareem 🌙',
    date_hint: '1 Ramadan',
    message_en: 'Ramadan Kareem! 🌙 Month of blessings and reflection begins.',
    message_ar: 'رمضان كريم! 🌙 شهر الخير والبركة ابتدى.',
  },
  {
    id: 'hijri_eid_fitr',
    type: 'hijri',
    title: 'Eid Al-Fitr 🌟',
    date_hint: '1 Shawwal',
    message_en: 'Eid Mubarak! 🌟 Celebrate joy and togetherness today.',
    message_ar: 'عيد سعيد! 🌟 عيد مبارك عليك وعلى عائلتك.',
  },
  {
    id: 'hijri_arafah',
    type: 'hijri',
    title: 'Day of Arafah 🤲',
    date_hint: '9 Dhul Hijjah',
    message_en: 'Day of Arafah! 🤲 A blessed day of prayer.',
    message_ar: 'يوم عرفة! 🤲 يوم مبارك ومستجاب الدعوة.',
  },
  {
    id: 'hijri_eid_adha',
    type: 'hijri',
    title: 'Eid Al-Adha 🐑',
    date_hint: '10 Dhul Hijjah',
    message_en: 'Eid Mubarak! 🐑 May your celebrations bring happiness.',
    message_ar: 'عيد أضحى مبارك! 🐑 كل سنة وأنت طيب.',
  },
  {
    id: 'hijri_mawlid',
    type: 'hijri',
    title: 'Mawlid Al-Nabi ✨',
    date_hint: '12 Rabi al-Awwal',
    message_en: 'Mawlid Al-Nabi! ✨ Wishing you peace and spiritual joy.',
    message_ar: 'مولد نبوي شريف ✨ نتمنى لك سلام وفرحة روحانية.',
  },
];

/**
 * Get occasion by ID
 */
export function getOccasionById(id: string): OccasionGreeting | undefined {
  return occasionGreetings.find(occ => occ.id === id);
}

/**
 * Get all Gregorian occasions
 */
export function getGregorianOccasions(): OccasionGreeting[] {
  return occasionGreetings.filter(occ => occ.type === 'gregorian');
}

/**
 * Get all Hijri occasions
 */
export function getHijriOccasions(): OccasionGreeting[] {
  return occasionGreetings.filter(occ => occ.type === 'hijri');
}
