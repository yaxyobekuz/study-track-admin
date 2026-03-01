// Data
import { animationCatalog } from "../data/animations.data";

const ANIMATION_RANDOM_CACHE_PREFIX = "admin_animations_random";

/**
 * Normalizes a scalar or list value into an array.
 * @param {string | Array<string> | undefined} value - Input value.
 * @returns {Array<string>} Normalized non-empty array.
 */
const normalizeToArray = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (value) return [value];
  return [];
};

/**
 * Returns a list of animations by optional filters.
 * @param {Object} filters - Animation filter options.
 * @param {string} [filters.family] - Animation family such as "emoji" or "duck".
 * @param {string} [filters.category] - Animation category such as "greeting" or "statistics".
 * @param {string | Array<string>} [filters.sentiment] - Animation sentiment such as "positive", "neutral", or "negative".
 * @returns {Array} Filtered animation metadata list.
 */
export const getAnimations = ({ family, category, sentiment } = {}) => {
  const sentiments = normalizeToArray(sentiment);

  return animationCatalog.filter((item) => {
    const familyMatch = family ? item.family === family : true;
    const categoryMatch = category ? item.category === category : true;
    const sentimentMatch = sentiments.length
      ? sentiments.includes(item.sentiment)
      : true;

    return familyMatch && categoryMatch && sentimentMatch;
  });
};

/**
 * Returns a single animation metadata item by id.
 * @param {string} id - Animation id from catalog.
 * @returns {Object | null} Found animation metadata or null.
 */
export const getAnimationById = (id) => {
  if (!id) return null;
  return animationCatalog.find((item) => item.id === id) || null;
};

/**
 * Returns random animation metadata from a list.
 * @param {Array} animations - Candidate animation metadata list.
 * @returns {Object | null} Random animation metadata item or null.
 */
export const getRandomAnimation = (animations) => {
  if (!Array.isArray(animations) || animations.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * animations.length);
  return animations[randomIndex] || null;
};

/**
 * Returns a random animation by filters.
 * @param {Object} filters - Animation filter options.
 * @param {string} [filters.family] - Animation family such as "emoji" or "duck".
 * @param {string} [filters.category] - Animation category such as "greeting" or "statistics".
 * @param {string | Array<string>} [filters.sentiment] - Animation sentiment such as "positive", "neutral", or "negative".
 * @returns {Object | null} Random animation metadata item or null.
 */
export const getRandomAnimationByFilters = (filters = {}) => {
  const animations = getAnimations(filters);
  return getRandomAnimation(animations);
};

const getSafeLocalStorage = () => {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const buildCacheKey = ({ cacheKey, family, category, sentiment }) => {
  const finalCacheKey = cacheKey || "default";
  const familyKey = family || "all-families";
  const categoryKey = category || "all-categories";
  const sentiments = normalizeToArray(sentiment);
  const sentimentKey = sentiments.length
    ? [...new Set(sentiments)].sort().join("|")
    : "all-sentiments";

  return `${ANIMATION_RANDOM_CACHE_PREFIX}:${finalCacheKey}:${familyKey}:${categoryKey}:${sentimentKey}`;
};

/**
 * Clears cached random animation for the provided filter scope.
 * @param {Object} options - Cache scope options.
 * @param {string} [options.cacheKey] - Optional custom cache key.
 * @param {string} [options.family] - Animation family scope.
 * @param {string} [options.category] - Animation category scope.
 * @param {string | Array<string>} [options.sentiment] - Animation sentiment scope.
 * @returns {void}
 */
export const clearTimedRandomAnimation = (options = {}) => {
  const storage = getSafeLocalStorage();
  if (!storage) return;

  const key = buildCacheKey(options);
  storage.removeItem(key);
};

/**
 * Returns random animation with localStorage TTL cache.
 * @param {Object} options - Random and cache options.
 * @param {string} [options.family] - Animation family such as "emoji" or "duck".
 * @param {string} [options.category] - Animation category such as "greeting" or "statistics".
 * @param {string | Array<string>} [options.sentiment] - Animation sentiment such as "positive", "neutral", or "negative".
 * @param {number} [options.ttlMs] - Cache lifetime in milliseconds.
 * @param {string} [options.cacheKey] - Optional custom cache namespace.
 * @param {number} [options.now] - Current timestamp for deterministic testing.
 * @returns {Object | null} Cached or newly generated random animation metadata.
 */
export const getTimedRandomAnimation = (options = {}) => {
  const {
    family,
    category,
    sentiment,
    ttlMs = 60 * 60 * 1000,
    cacheKey,
    now = Date.now(),
  } = options;

  const scopedFilters = { family, category, sentiment };
  const animations = getAnimations(scopedFilters);
  if (!animations.length) return null;

  const storage = getSafeLocalStorage();
  if (!storage || ttlMs <= 0) {
    return getRandomAnimation(animations);
  }

  const key = buildCacheKey({ cacheKey, family, category, sentiment });
  const cachedRaw = storage.getItem(key);

  if (cachedRaw) {
    try {
      const cached = JSON.parse(cachedRaw);
      const isCacheAlive = cached?.expiresAt > now;

      if (isCacheAlive && cached?.animationId) {
        const cachedAnimation = animations.find(
          (item) => item.id === cached.animationId
        );

        if (cachedAnimation) {
          return cachedAnimation;
        }
      }
    } catch {
      storage.removeItem(key);
    }
  }

  const randomAnimation = getRandomAnimation(animations);
  if (!randomAnimation) return null;

  const nextCache = {
    animationId: randomAnimation.id,
    expiresAt: now + ttlMs,
  };

  storage.setItem(key, JSON.stringify(nextCache));
  return randomAnimation;
};
