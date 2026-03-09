/**
 * API Cache Utility
 * Lightweight in-memory cache for GET requests with TTL, request deduplication,
 * and pattern-based invalidation.
 */
import api from './axios';

// Cache storage: Map<url, { data, timestamp }>
const cache = new Map();

// In-flight request tracker for deduplication: Map<url, Promise>
const pendingRequests = new Map();

const DEFAULT_TTL = 60000; // 60 seconds

/**
 * Performs a GET request with caching.
 * - Returns cached response if within TTL
 * - Deduplicates concurrent requests to the same URL
 * - Caches successful responses
 *
 * @param {string} url - The API endpoint
 * @param {object} [options] - Options
 * @param {number} [options.ttl=60000] - Time-to-live in ms
 * @param {boolean} [options.forceRefresh=false] - Bypass cache and fetch fresh
 * @returns {Promise} - Axios response
 */
export const cachedGet = async (url, options = {}) => {
    const { ttl = DEFAULT_TTL, forceRefresh = false } = options;

    // 1. Check cache (unless forced refresh)
    if (!forceRefresh && cache.has(url)) {
        const cached = cache.get(url);
        const age = Date.now() - cached.timestamp;

        if (age < ttl) {
            console.debug(`[apiCache] HIT: ${url}`);
            try {
                // Return a deep clone so consumers can't mutate the cached data
                return { ...structuredClone(cached.data), _fromCache: true };
            } catch (e) {
                console.warn(`[apiCache] structuredClone failed for ${url}, returning shallow copy`, e);
                return { ...cached.data, _fromCache: true };
            }
        }

        console.debug(`[apiCache] EXPIRED: ${url}`);
        // Expired — remove stale entry
        cache.delete(url);
    }

    // 2. Deduplicate in-flight requests
    if (pendingRequests.has(url)) {
        console.debug(`[apiCache] PENDING: ${url}`);
        return pendingRequests.get(url);
    }

    console.debug(`[apiCache] MISS: ${url}`);
    // 3. Make the actual request
    const requestPromise = api.get(url)
        .then(response => {
            // Cache the successful response
            cache.set(url, {
                data: response,
                timestamp: Date.now(),
            });

            // Clean up pending tracker
            pendingRequests.delete(url);

            return response;
        })
        .catch(error => {
            // Clean up pending tracker on failure
            pendingRequests.delete(url);
            throw error;
        });

    pendingRequests.set(url, requestPromise);

    return requestPromise;
};

/**
 * Invalidate cache entries.
 * - No argument: clears entire cache
 * - String argument: clears entries whose URL starts with the matching string
 *
 * @param {string} [urlPattern] - Prefix to match against cached URLs
 */
export const invalidateCache = (urlPattern) => {
    if (!urlPattern) {
        console.debug('[apiCache] Clearing entire cache');
        cache.clear();
        return;
    }

    console.debug(`[apiCache] Invalidating pattern: ${urlPattern}`);
    for (const key of cache.keys()) {
        if (key.startsWith(urlPattern)) {
            console.debug(`[apiCache] DELETED: ${key}`);
            cache.delete(key);
        }
    }
};

export default cachedGet;
