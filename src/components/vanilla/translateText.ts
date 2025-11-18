import axios from 'axios';

const getCacheKey = (text: string, target: string) => `${text}_${target}`;

const getCachedTranslation = (key: string): string | null => {
  try {
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : null;
  } catch (err) {
    console.error('Error reading from localStorage:', err);
    return null;
  }
};

const cacheTranslation = (key: string, translated: string) => {
  try {
    localStorage.setItem(key, JSON.stringify(translated));
    console.log(`Stored translation to cache: "${key}" -> "${translated}"`);
  } catch (err) {
    console.error('Error writing to localStorage:', err);
  }
};

export const translateText = async (text: string, target: string) => {
  const cacheKey = getCacheKey(text, target);

  const cached = getCachedTranslation(cacheKey);
  if (cached) {
    console.log('Returning cached translation for:', cacheKey);
    return cached;
  }

  try {
    const response = await axios.post(
      'http://localhost:5000/translate',
      {
        q: text,
        source: 'auto',
        target: target,
        format: 'text'
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const translatedText = response.data.translatedText; // LibreTranslate uses translatedText (capital T)

    // Save in persistent cache
    cacheTranslation(cacheKey, translatedText);

    return translatedText;
  } catch (error: any) {
    console.error('Translation API error:', error.response?.data || error.message);
    return text; // Return original text if translation fails
  }
};