import type {ImageSourcePropType} from 'react-native';

export type TabKey = 'locations' | 'checklists' | 'articles' | 'ideas' | 'settings';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type LocationImageKey =
  | 'lakeBled'
  | 'triglav'
  | 'dolomites'
  | 'blackForest'
  | 'plitvice'
  | 'bohinj'
  | 'highlands'
  | 'lofoten'
  | 'pyrenees'
  | 'annecy'
  | 'saxon'
  | 'tatra'
  | 'lakeDistrict'
  | 'madeira'
  | 'chamonix'
  | 'garda'
  | 'rila'
  | 'berchtesgaden'
  | 'picos'
  | 'hallstatt'
  | 'vanoise'
  | 'saimaa'
  | 'ardennes'
  | 'tara'
  | 'connemara'
  | 'highTatras'
  | 'oulanka'
  | 'lucerne'
  | 'aurlandsfjord';

export type Location = {
  id: string;
  title: string;
  city: string;
  country: string;
  type: string;
  difficulty: Difficulty;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  description: string;
  image: LocationImageKey;
};

export type PackingTemplate = {
  id: string;
  emoji: string;
  title: string;
  items: string[];
};

export type ActivityIdea = {
  id: string;
  emoji: string;
  type: string;
  title: string;
  description: string;
  custom?: boolean;
};

export type Article = {
  id: string;
  emoji: string;
  tag: string;
  title: string;
  body: string[];
};

export type QuizQuestion = {
  id: string;
  question: string;
  answers: string[];
  correctIndex: number;
};

export type CustomChecklist = {
  id: string;
  emoji: string;
  title: string;
  items: string[];
};

export type CustomIdea = ActivityIdea & {
  custom: true;
};

export type AppState = {
  hasOnboarded: boolean;
  savedLocationIds: string[];
  checklistProgress: Record<string, string[]>;
  checklistExtras: Record<string, string[]>;
  customChecklists: CustomChecklist[];
  likedIdeaIds: string[];
  customIdeas: CustomIdea[];
  pushEnabled: boolean;
  quizBest: number;
};

export type AssetSet = {
  splashBackground: ImageSourcePropType;
  onboarding: {
    discover: ImageSourcePropType;
    pack: ImageSourcePropType;
    thrive: ImageSourcePropType;
  };
  empty: ImageSourcePropType;
  locations: Record<LocationImageKey, ImageSourcePropType>;
};
