/**
 * CANVAS STORAGE SERVICE
 * 
 * Handles saving and loading canvas state to/from:
 * - IndexedDB (offline-first, client-side)
 * - Server (WebSocket sync)
 * - LocalStorage (fallback)
 * 
 * @author Friday (AI Agent)
 * @version 0.3.0-canvas
 */

// IndexedDB setup
const DB_NAME = 'FridayCanvasDB';
const DB_VERSION = 1;
const STORE_NAME = 'canvasStates';

let db = null;

// Initialize IndexedDB
const initDB = () => {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(db);
            return;
        }
        
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };
        
        request.onupgradeneeded = (event) => {
            const database = event.target.result;
            
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                database.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
};

/**
 * Save canvas state to storage
 * @param {Object} state - Canvas state to save
 * @returns {Promise<void>}
 */
export const saveCanvasState = async (state) => {
    try {
        // Save to IndexedDB
        const database = await initDB();
        const transaction = database.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        const stateWithId = {
            id: 'current', // Single state for now
            ...state,
            lastModified: new Date().toISOString()
        };
        
        await new Promise((resolve, reject) => {
            const request = store.put(stateWithId);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
        
        // Also save to localStorage as fallback
        try {
            localStorage.setItem('fridayCanvas', JSON.stringify(stateWithId));
        } catch (e) {
            console.warn('localStorage save failed:', e);
        }
        
        console.log('✅ Canvas state saved to IndexedDB');
    } catch (error) {
        console.error('❌ Failed to save canvas state:', error);
        
        // Fallback to localStorage only
        try {
            localStorage.setItem('fridayCanvas', JSON.stringify({
                id: 'current',
                ...state,
                lastModified: new Date().toISOString()
            }));
            console.log('✅ Canvas state saved to localStorage (fallback)');
        } catch (e) {
            console.error('❌ All storage methods failed:', e);
            throw new Error('Failed to save canvas state');
        }
    }
};

/**
 * Load canvas state from storage
 * @returns {Promise<Object|null>} Saved canvas state or null
 */
export const loadCanvasState = async () => {
    try {
        // Try IndexedDB first
        const database = await initDB();
        const transaction = database.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        
        const state = await new Promise((resolve, reject) => {
            const request = store.get('current');
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        
        if (state) {
            console.log('✅ Canvas state loaded from IndexedDB');
            return state;
        }
    } catch (error) {
        console.warn('IndexedDB load failed, trying localStorage:', error);
    }
    
    // Fallback to localStorage
    try {
        const stored = localStorage.getItem('fridayCanvas');
        if (stored) {
            const state = JSON.parse(stored);
            console.log('✅ Canvas state loaded from localStorage');
            return state;
        }
    } catch (error) {
        console.error('localStorage load failed:', error);
    }
    
    console.log('ℹ️  No saved canvas state found');
    return null;
};

/**
 * Clear all saved canvas state
 * @returns {Promise<void>}
 */
export const clearCanvasState = async () => {
    try {
        // Clear IndexedDB
        const database = await initDB();
        const transaction = database.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        await new Promise((resolve, reject) => {
            const request = store.delete('current');
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
        
        console.log('✅ Canvas state cleared from IndexedDB');
    } catch (error) {
        console.warn('IndexedDB clear failed:', error);
    }
    
    // Clear localStorage
    try {
        localStorage.removeItem('fridayCanvas');
        console.log('✅ Canvas state cleared from localStorage');
    } catch (error) {
        console.warn('localStorage clear failed:', error);
    }
};

/**
 * Export canvas state as JSON
 * @returns {Promise<string>} JSON string of canvas state
 */
export const exportCanvasState = async () => {
    const state = await loadCanvasState();
    return JSON.stringify(state, null, 2);
};

/**
 * Import canvas state from JSON
 * @param {string} jsonString - JSON string of canvas state
 * @returns {Promise<void>}
 */
export const importCanvasState = async (jsonString) => {
    try {
        const state = JSON.parse(jsonString);
        await saveCanvasState(state);
        console.log('✅ Canvas state imported successfully');
    } catch (error) {
        console.error('❌ Failed to import canvas state:', error);
        throw new Error('Invalid canvas state JSON');
    }
};
