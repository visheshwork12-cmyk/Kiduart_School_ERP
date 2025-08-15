import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import middleware from 'i18next-http-middleware';
import { fileURLToPath } from 'url';
import path from 'path';
import logger from '#config/logger.js';
import { LANGUAGES } from '#shared/constants/index.js';

import en from '#shared/i18n/en.json' with { type: 'json' };
import hi from '#shared/i18n/hi.json' with { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Translation dictionary for static/manual usage
 * This is useful outside Express requests where `req.t` isn't available
 */
const languages = {
  [LANGUAGES.ENGLISH]: en,
  [LANGUAGES.HINDI]: hi,
};

/**
 * Manual translation function
 * @param {string} key - Translation key (e.g., errors.not_found)
 * @param {string} [lang='en'] - Language code
 * @param {Object} [params={}] - Interpolation parameters
 * @returns {string} Translated string or the key if missing
 */
export const t = (key, lang = LANGUAGES.ENGLISH, params = {}) => {
  try {
    const langTranslations = languages[lang] || languages[LANGUAGES.ENGLISH];
    const keys = key.split('.');
    let result = langTranslations;

    for (const k of keys) {
      result = result?.[k];
      if (!result) break;
    }

    let translation = result || key;
    if (!result) {
      logger.warn(`Translation missing for key: ${key}, language: ${lang}`);
    }

    if (typeof translation === 'string') {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{{${param}}}`, value);
      });
    }

    return translation;
  } catch (error) {
    logger.error(`Translation error for key: ${key}, language: ${lang} - ${error.message}`);
    return key;
  }
};

/**
 * Initialize i18n with both middleware and backend
 * @param {import('express').Express} app - Express application instance
 */
export const initI18n = async (app) => {
  try {
    await i18next
      .use(Backend)
      .use(middleware.LanguageDetector)
      .init({
        fallbackLng: LANGUAGES.ENGLISH,
        preload: Object.values(LANGUAGES),
        backend: {
          loadPath: path.join(__dirname, '{{lng}}.json'),
        },
        interpolation: {
          escapeValue: false,
        },
        detection: {
          order: ['header', 'querystring'],
          lookupHeader: 'accept-language',
          lookupQuerystring: 'lang',
        },
        resources: {
          [LANGUAGES.ENGLISH]: { translation: en },
          [LANGUAGES.HINDI]: { translation: hi },
        },
      });

    logger.info(`🌍 i18n initialized with languages: ${Object.values(LANGUAGES).join(', ')}`);

    app.use(middleware.handle(i18next));
  } catch (error) {
    logger.error(`i18n initialization error: ${error.message}`);
    throw error;
  }
};
