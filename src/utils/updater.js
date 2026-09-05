import { check } from '@tauri-apps/plugin-updater';

/**
 * Checks for updates and returns update info.
 * @param {Object} [options]
 * @param {boolean} [options.autoInstall=false] - Whether to automatically download and install if an update is found.
 * @param {Function} [options.onProgress] - Optional callback for download progress.
 * @returns {Promise<{available: boolean, currentVersion?: string, newVersion?: string, body?: string, date?: string, update?: any, error?: any}>}
 */
export async function checkForAppUpdates({ autoInstall = false, onProgress } = {}) {
  // The updater plugin is desktop-only (Windows/macOS/Linux).
  // Safe exit on web or mobile platforms (Android/iOS).
  if (typeof window === 'undefined' || !window.__TAURI_INTERNALS__) {
    return { available: false };
  }

  try {
    const update = await check();
    if (!update) {
      return { available: false };
    }

    if (update.available) {
      if (autoInstall) {
        let downloaded = 0;
        let contentLength = 0;

        await update.downloadAndInstall((event) => {
          switch (event.event) {
            case 'Started':
              contentLength = event.data.contentLength || 0;
              if (onProgress) onProgress({ status: 'started', contentLength });
              break;
            case 'Progress':
              downloaded += event.data.chunkLength;
              if (onProgress) {
                onProgress({
                  status: 'downloading',
                  downloaded,
                  contentLength,
                  percent: contentLength ? Math.round((downloaded / contentLength) * 100) : null
                });
              }
              break;
            case 'Finished':
              if (onProgress) onProgress({ status: 'finished' });
              break;
          }
        });
      }

      return {
        available: true,
        currentVersion: update.currentVersion,
        newVersion: update.version,
        body: update.body,
        date: update.date,
        update
      };
    }

    return { available: false };
  } catch (error) {
    console.error('Failed to check for updates:', error);
    return { available: false, error };
  }
}
