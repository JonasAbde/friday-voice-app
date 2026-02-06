/**
 * Jest Setup File
 * Configures test environment for Canvas feature
 */

import '@testing-library/jest-dom';

// Mock window.matchMedia (for responsive tests)
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock IndexedDB
global.indexedDB = {
    open: jest.fn(() => ({
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
        result: {
            transaction: jest.fn(() => ({
                objectStore: jest.fn(() => ({
                    get: jest.fn(() => ({ onsuccess: null, onerror: null, result: null })),
                    put: jest.fn(() => ({ onsuccess: null, onerror: null })),
                    delete: jest.fn(() => ({ onsuccess: null, onerror: null })),
                })),
            })),
        },
    })),
};

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock WebSocket
global.WebSocket = jest.fn(() => ({
    readyState: 1,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    send: jest.fn(),
    close: jest.fn(),
}));

// Suppress console warnings in tests
global.console = {
    ...console,
    warn: jest.fn(),
    error: jest.fn(),
};
