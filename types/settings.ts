import { GameState } from './game';

export type SaveSlotId = 'autosave' | 'slot_1' | 'slot_2' | 'slot_3';

export interface SaveSlotRecord {
  slotId: SaveSlotId;
  label: string;
  savedAt: string; // ISO string
  inPrologue: boolean;
  gameState: GameState;
}

export type DiceDisplayMode = 'numbers' | 'dots';

export type SupportedLanguage =
  | 'en'
  | 'zu'
  | 'xh'
  | 'af'
  | 'st'
  | 'nso'
  | 'tn'
  | 'ts'
  | 'ss'
  | 've'
  | 'nr';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  region: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', region: 'Global / SA' },
  {
    code: 'zu',
    name: 'Zulu',
    nativeName: 'isiZulu',
    region: 'KwaZulu-Natal / EThekwini',
  },
  {
    code: 'xh',
    name: 'Xhosa',
    nativeName: 'isiXhosa',
    region: 'Eastern & Western Cape',
  },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', region: 'Nationwide' },
  {
    code: 'st',
    name: 'Sotho',
    nativeName: 'Sesotho',
    region: 'Free State & Gauteng',
  },
  {
    code: 'nso',
    name: 'Northern Sotho',
    nativeName: 'Sepedi',
    region: 'Limpopo & Gauteng',
  },
  {
    code: 'tn',
    name: 'Tswana',
    nativeName: 'Setswana',
    region: 'North West & Gauteng',
  },
  {
    code: 'ts',
    name: 'Tsonga',
    nativeName: 'Xitsonga',
    region: 'Limpopo & Mpumalanga',
  },
  { code: 'ss', name: 'Swati', nativeName: 'siSwati', region: 'Mpumalanga' },
  { code: 've', name: 'Venda', nativeName: 'Tshivenḓa', region: 'Limpopo' },
  {
    code: 'nr',
    name: 'Ndebele',
    nativeName: 'isiNdebele',
    region: 'Mpumalanga & Gauteng',
  },
];

export interface GameSettings {
  masterMuted: boolean;
  ambientVolume: number; // 0 to 100
  sfxVolume: number; // 0 to 100
  reduceScreenFlicker: boolean;
  autoShowTutorial: boolean;
  diceDisplayMode: DiceDisplayMode;
  language: SupportedLanguage;
}

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  masterMuted: false,
  ambientVolume: 75,
  sfxVolume: 85,
  reduceScreenFlicker: false,
  autoShowTutorial: true,
  diceDisplayMode: 'numbers',
  language: 'en',
};
