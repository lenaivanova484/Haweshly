import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { ExpenseSubCategory } from './types';
import { resolveIcon } from './icons';
import BeinIcon from '../../assets/icons/bein.svg';
import ShahidIcon from '../../assets/icons/shahid.svg';
import NetflixIcon from '../../assets/icons/netflix.svg';
import YouTubeIcon from '../../assets/icons/youtube.svg';
import SpotifyIcon from '../../assets/icons/spotify.svg';
import AmazonPrimeIcon from '../../assets/icons/amazon-prime.svg';
import DisneyPlusIcon from '../../assets/icons/disney-plus.svg';
import UberIcon from '../../assets/icons/uber.svg';
import VodafoneIcon from '../../assets/icons/vodafone.svg';
import EtisalatIcon from '../../assets/icons/etisalat.svg';
import WEIcon from '../../assets/icons/we.svg';
import OrangeIcon from '../../assets/icons/orange.svg';
import WatchitIcon from '../../assets/icons/watchit.svg';
import AnghamiIcon from '../../assets/icons/anghami.svg';
import OsnPlusIcon from '../../assets/icons/osn_plus.svg';
import DidiIcon from '../../assets/icons/didi.svg';
import CareemIcon from '../../assets/icons/careem.svg';
import IndriveIcon from '../../assets/icons/indrive.svg';

/**
 * Icon type that can be either:
 * - A FontAwesome icon name (string) - e.g., 'faPlay'
 * - A React component for custom SVG - e.g., ShahidIcon
 */
export type SubcategoryIconType = string | React.ComponentType<{ width?: number; height?: number }>;

/**
 * Mapping of subcategories to their icons.
 * For brands with custom SVGs, import via ES6 import - Metro transforms them into components.
 * For others, use FontAwesome icon names as fallback.
 *
 * To add more SVG icons:
 * 1. Place your SVG file in assets/icons/[name].svg
 * 2. Import at top: import IconName from '../../assets/icons/[name].svg';
 * 3. Add to map: 'Brand Name': IconName,
 */
export const SUBCATEGORY_ICONS: Record<ExpenseSubCategory, SubcategoryIconType> = {
  // Subscriptions - Mix of custom SVGs and FontAwesome fallbacks
  
  bein: BeinIcon,                      // TODO: Add custom SVG if available
  Netflix: NetflixIcon,             // TODO: Add custom SVG if available
  YouTube: YouTubeIcon,               // TODO: Add custom SVG if available
  Spotify: SpotifyIcon,               // TODO: Add custom SVG if available
  'Apple Music': 'faApple',         // TODO: Add custom SVG if available
  'Disney+': DisneyPlusIcon,      // TODO: Add custom SVG if available
  'Amazon Prime': AmazonPrimeIcon,      // TODO: Add custom SVG if available
  Shahid: ShahidIcon,               // ✅ Using custom SVG component
  WatchIt: WatchitIcon,                  // TODO: Add custom SVG if available
  Anghami: AnghamiIcon,               // TODO: Add custom SVG if available
  'OSN+': OsnPlusIcon,                   // TODO: Add custom SVG if available
  Facebook: 'faFacebook',           // FontAwesome only
  Discord: 'faDiscord',             // FontAwesome only
  'Club Membership': 'faIdBadge',   // FontAwesome only
  'Other Subs': 'faEllipsis',       // FontAwesome only

  // Transport
  Uber: UberIcon,                   // TODO: Import UberIcon when available
  Careem: CareemIcon,                  // TODO: Import CareemIcon when available
  InDrive: IndriveIcon,                // TODO: Import InDriveIcon when available
  Didi: DidiIcon,                // TODO: Import DidiIcon when available
  Taxi: 'faTaxi',
  Motorcycle: 'faMotorcycle',
  Bus: 'faBus',
  Train: 'faTrain',
  Metro: 'faSubway',
  Flight: 'faPlane',
  Ship: 'faShip',
  'Other Transport': 'faCarSide',

  // Food
  Restaurant: 'faUtensils',
  Cafe: 'faCoffee',
  Groceries: 'faCartShopping',
  Snacks: 'faCookie',
  Delivery: 'faBagShopping',
  Bakery: 'faBreadSlice',

  // Entertainment
  Movie: 'faFilm',
  'Theater': 'faTheaterMasks',
  Concert: 'faMusic',
  Gaming: 'faGamepad',
  Sports: 'faBasketball',
  Music: 'faHeadphones',
  Show: 'faMicrophone',

  // Donations
  Charity: 'faHandHoldingHeart',
  NGO: 'faHandshake',
  Gifts: 'faGift',
  Hospital: 'faHospital',
  Mosque: 'faMosque',
  Church: 'faChurch',
  'Other Donations': 'faHeart',

  // Shopping
  Clothes: 'faTshirt',
  Shoes: 'faShoePrints',
  Accessories: 'faCrown',
  Home: 'faHouse',
  Beauty: 'faSpa',

  // Health
  Medication: 'faPills',
  Doctor: 'faStethoscope',
  Dentist: 'faTooth',
  Gym: 'faDumbbell',
  'Mental Health': 'faBrain',

  // Education
  Tuition: 'faUniversity',
  Books: 'faBook',
  Course: 'faGraduationCap',
  Training: 'faChalkboardUser',

  // Tech
  Software: 'faLaptop',
  Hardware: 'faMemory',
  Gadgets: 'faHeadphones',
  Apps: 'faMobileScreen',

  // Bills
  Vodafone: VodafoneIcon,             // TODO: Import VodafoneIcon when available
  Orange: OrangeIcon,               // TODO: Import OrangeIcon when available
  'e&': EtisalatIcon,                 // TODO: Import EtisalatIcon when available
  WE: WEIcon,                   // TODO: Import WeIcon when available
  Electricity: 'faBolt',
  Water: 'faTint',
  Gas: 'faFire',
  Internet: 'faWifi',

  // Insurance
  'Medical Insurance': 'faHospital',
  'Car Insurance': 'faCarCrash',
  'Life Insurance': 'faHeart',
  'Travel Insurance': 'faPlaneDeparture',
  'Property Insurance': 'faHouseCrack',
  'Mobile Insurance': 'faMobileScreen',
  'Other Insurance': 'faShieldHalved',
};

/**
 * Helper component that renders an icon based on its type.
 * Handles both FontAwesome icons and custom SVG components.
 *
 * @param icon - Icon name (string) or component
 * @param size - Size in pixels (used for both types)
 * @param color - Color for FontAwesome icons
 */
export const IconComponent: React.FC<{
  icon: SubcategoryIconType;
  size: number;
  color?: string;
}> = ({ icon, size, color = '#000' }) => {
  // If icon is a string, render FontAwesome icon
  if (typeof icon === 'string') {
    return (
      <FontAwesomeIcon
        icon={resolveIcon(icon)}
        size={size}
        color={color}
      />
    );
  }

  // If icon is a component, render it with width/height
  const SvgIcon = icon;
  return <SvgIcon width={size * 1.15} height={size * 1.15} />;
};

/**
 * Check if an icon is a custom component (not a string)
 */
export const isCustomSvgIcon = (icon: SubcategoryIconType): boolean => {
  return typeof icon === 'function';
};

/**
 * Get the FontAwesome icon name if available, otherwise return null
 */
export const getFontAwesomeIcon = (icon: SubcategoryIconType): string | null => {
  return typeof icon === 'string' ? icon : null;
};
