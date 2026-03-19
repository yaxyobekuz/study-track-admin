import { useCallback, useEffect, useRef } from "react";

// Utils
import {
  playSound as playSoundUtil,
  playRandomSound as playRandomSoundUtil,
  preloadSound as preloadSoundUtil,
  preloadAllSounds as preloadAllSoundsUtil,
  setGlobalVolume,
} from "@/shared/utils/sounds.utils";

/**
 * Hook for playing UI sounds with preloading and volume control.
 * @param {Object} [options] - Hook configuration options.
 * @param {number} [options.volume=1] - Default volume for sounds played via this hook (0 to 1).
 * @param {boolean} [options.preload=false] - Whether to preload all sounds on mount.
 * @returns {{playSound: Function, playRandomSound: Function, preloadSound: Function, preloadAllSounds: Function, setVolume: Function}} Sound playback helpers.
 */
const useSound = ({ volume = 1, preload = false } = {}) => {
  const volumeRef = useRef(volume);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    if (preload) {
      preloadAllSoundsUtil();
    }
  }, [preload]);

  /**
   * Plays a sound by catalog id.
   * @param {string} id - Sound id from catalog.
   * @param {Object} [options] - Playback options.
   * @param {number} [options.volume] - Volume override (0 to 1).
   * @returns {HTMLAudioElement | null} The audio element being played, or null.
   */
  const playSound = useCallback((id, options = {}) => {
    return playSoundUtil(id, {
      volume: options.volume ?? volumeRef.current,
    });
  }, []);

  /**
   * Plays a random sound matching the given filters.
   * @param {Object} [filters] - Sound filter and playback options.
   * @param {string} [filters.category] - Sound category.
   * @param {string | Array<string>} [filters.sentiment] - Sound sentiment.
   * @param {number} [filters.volume] - Volume override (0 to 1).
   * @returns {HTMLAudioElement | null} The audio element being played, or null.
   */
  const playRandomSound = useCallback((filters = {}) => {
    return playRandomSoundUtil({
      ...filters,
      volume: filters.volume ?? volumeRef.current,
    });
  }, []);

  /**
   * Preloads a single sound into the audio cache.
   * @param {string} id - Sound id from catalog.
   * @returns {HTMLAudioElement | null} The preloaded audio element or null.
   */
  const preloadSound = useCallback((id) => {
    return preloadSoundUtil(id);
  }, []);

  /**
   * Preloads all sounds in the catalog.
   * @returns {void}
   */
  const preloadAllSounds = useCallback(() => {
    preloadAllSoundsUtil();
  }, []);

  /**
   * Updates the hook-level default volume and global volume.
   * @param {number} newVolume - Volume level from 0 to 1.
   * @returns {void}
   */
  const setVolume = useCallback((newVolume) => {
    volumeRef.current = Math.min(1, Math.max(0, newVolume));
    setGlobalVolume(volumeRef.current);
  }, []);

  return {
    playSound,
    playRandomSound,
    preloadSound,
    preloadAllSounds,
    setVolume,
  };
};

export default useSound;
