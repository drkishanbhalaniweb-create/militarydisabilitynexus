
import {
  Brain,
  HeartPulse,
  Activity,
  Wind,
  Bone,
  Sparkles,
  Ear,
  Ribbon,
  Venus,
  Mars,
  Zap,
  Moon,
  Flame,
  Pill,
  HelpCircle,
  FileText,
  Compass,
  Hourglass,
  Shuffle,
  Link,
  Scale
} from 'lucide-react';

const iconMap = {
  // Body Systems (slugs)
  'neurology': Brain,
  'mental-health': HeartPulse,
  'gastrointestinal': Activity,
  'respiratory': Wind,
  'musculoskeletal': Bone,
  'dermatology': Sparkles,
  'audiology': Ear,
  'oncology': Ribbon,
  'nephrology': Activity,
  'ob-gyn': Venus,
  'male-reproductive': Mars,

  // Conditions (slugs)
  'migraine-headaches': Zap,
  'tbi': Brain,
  'radiculopathy': Zap,
  'ptsd': HeartPulse,
  'anxiety': HeartPulse,
  'sleep-apnea': Moon,
  'lumbar-spine': Bone,
  'eczema-dermatitis': Sparkles,
  'tinnitus': Ear,
  'gerd': Flame,
  'ibs': Pill,

  // Direct Lucide Component Name support (case-insensitive or exact)
  'brain': Brain,
  'heartpulse': HeartPulse,
  'heart-pulse': HeartPulse,
  'activity': Activity,
  'lungs': Wind,
  'wind': Wind,
  'bone': Bone,
  'sparkles': Sparkles,
  'ear': Ear,
  'ribbon': Ribbon,
  'venus': Venus,
  'mars': Mars,
  'zap': Zap,
  'moon': Moon,
  'flame': Flame,
  'pill': Pill,
  'filetext': FileText,
  'file-text': FileText,
  'compass': Compass,
  'hourglass': Hourglass,
  'shuffle': Shuffle,
  'link': Link,
  'scale': Scale,

  // PascalCase options
  'Brain': Brain,
  'HeartPulse': HeartPulse,
  'Activity': Activity,
  'Lungs': Wind,
  'Wind': Wind,
  'Bone': Bone,
  'Sparkles': Sparkles,
  'Ear': Ear,
  'Ribbon': Ribbon,
  'Venus': Venus,
  'Mars': Mars,
  'Zap': Zap,
  'Moon': Moon,
  'Flame': Flame,
  'Pill': Pill,
  'FileText': FileText,
  'Compass': Compass,
  'Hourglass': Hourglass,
  'Shuffle': Shuffle,
  'Link': Link,
  'Scale': Scale,
};

export default function DynamicIcon({ name, className = '', ...props }) {
  if (!name) return null;

  // Clean the icon key
  const cleanKey = String(name).trim();
  const IconComponent = iconMap[cleanKey] || iconMap[cleanKey.toLowerCase()] || HelpCircle;

  return <IconComponent className={className} {...props} />;
}
