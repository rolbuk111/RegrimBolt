export interface Feature {
  id: string;
  name: string;
  description: string;
  viewed: boolean;
  releaseDate: string;
}

const FEATURES_STORAGE_KEY = 'bolt_viewed_features';
const KNOWN_FEATURES: Omit<Feature, 'viewed'>[] = [
  {
    id: 'dark-mode',
    name: 'Dark Mode',
    description: 'Enable dark mode for better night viewing',
    releaseDate: '2024-03-15',
  },
  {
    id: 'tab-management',
    name: 'Tab Management',
    description: 'Customize your tab layout',
    releaseDate: '2024-03-20',
  },
];

function getViewedFeatures(): Set<string> {
  try {
    const stored = localStorage.getItem(FEATURES_STORAGE_KEY);
    return new Set(stored ? JSON.parse(stored) : []);
  } catch {
    return new Set();
  }
}

function saveViewedFeatures(viewed: Set<string>): void {
  try {
    localStorage.setItem(FEATURES_STORAGE_KEY, JSON.stringify(Array.from(viewed)));
  } catch {
    // localStorage unavailable (SSR or private browsing)
  }
}

export const getFeatureFlags = async (): Promise<Feature[]> => {
  const viewed = getViewedFeatures();

  return KNOWN_FEATURES.map((feature) => ({
    ...feature,
    viewed: viewed.has(feature.id),
  }));
};

export const markFeatureViewed = async (featureId: string): Promise<void> => {
  const viewed = getViewedFeatures();
  viewed.add(featureId);
  saveViewedFeatures(viewed);
};
