/**
 * CANVAS FEATURE - Main Integration Entry Point
 * 
 * This file provides the React root component and integration utilities
 * for the Canvas feature. Import this in your main app.
 * 
 * @author Friday (AI Agent)
 * @version 0.3.0-canvas
 */

import React, { useState, useEffect, useRef } from 'react';
import CanvasView from './components/CanvasView';
import { loadCanvasState } from './services/canvasStorage';

/**
 * Canvas Feature Integration Component
 * 
 * Usage:
 * ```jsx
 * import { CanvasFeature } from './canvas';
 * 
 * function App() {
 *   return (
 *     <div>
 *       <VoiceInterface />
 *       <CanvasFeature websocket={ws} />
 *     </div>
 *   );
 * }
 * ```
 */
export const CanvasFeature = ({ websocket, autoOpen = false }) => {
    const [isOpen, setIsOpen] = useState(autoOpen);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    
    // Listen for WebSocket messages that should trigger Canvas
    useEffect(() => {
        if (!websocket) return;
        
        const handleMessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                
                // Auto-open Canvas when Friday generates long content
                if (message.type === 'friday_response' && message.text) {
                    const lineCount = message.text.split('\n').length;
                    if (lineCount > 10 && !isOpen) {
                        setIsOpen(true);
                    }
                }
                
                // Handle canvas-specific triggers
                if (message.type === 'openCanvas') {
                    setIsOpen(true);
                }
            } catch (error) {
                console.error('Failed to parse WebSocket message:', error);
            }
        };
        
        websocket.addEventListener('message', handleMessage);
        return () => websocket.removeEventListener('message', handleMessage);
    }, [websocket, isOpen]);
    
    // Warn before closing if unsaved changes
    const handleClose = () => {
        if (hasUnsavedChanges) {
            if (confirm('Du har ugemte ændringer. Er du sikker på, at du vil lukke Canvas?')) {
                setIsOpen(false);
                setHasUnsavedChanges(false);
            }
        } else {
            setIsOpen(false);
        }
    };
    
    // Keyboard shortcut to toggle Canvas (Ctrl/Cmd + K)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
    
    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    padding: '12px 20px',
                    backgroundColor: '#4CAF50',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '25px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    zIndex: 1000
                }}
                title="Åbn Canvas (Ctrl+K)"
            >
                📝 Åbn Canvas
            </button>
        );
    }
    
    return (
        <CanvasView
            websocket={websocket}
            onClose={handleClose}
            onUnsavedChanges={setHasUnsavedChanges}
        />
    );
};

/**
 * Canvas Utilities
 */
export const canvasUtils = {
    /**
     * Check if Canvas is supported in current browser
     */
    isSupported: () => {
        return (
            typeof window !== 'undefined' &&
            'indexedDB' in window &&
            'localStorage' in window &&
            'WebSocket' in window
        );
    },
    
    /**
     * Get Canvas state from storage
     */
    getState: async () => {
        return await loadCanvasState();
    },
    
    /**
     * Trigger Canvas programmatically
     */
    open: () => {
        window.dispatchEvent(new CustomEvent('openCanvas'));
    },
    
    /**
     * Close Canvas programmatically
     */
    close: () => {
        window.dispatchEvent(new CustomEvent('closeCanvas'));
    }
};

/**
 * Canvas Feature Flag
 * Check if Canvas feature should be enabled
 */
export const isCanvasEnabled = () => {
    // Feature flag from environment or config
    if (typeof window !== 'undefined') {
        return (
            window.FRIDAY_FEATURES?.canvas !== false &&
            canvasUtils.isSupported()
        );
    }
    return false;
};

/**
 * Default export: Main component
 */
export default CanvasFeature;

/**
 * Re-export components for advanced usage
 */
export { default as TextEditor } from './components/TextEditor';
export { default as CodeEditor } from './components/CodeEditor';
export { default as DrawingCanvas } from './components/DrawingCanvas';
export { default as ShortcutsMenu } from './components/ShortcutsMenu';
export { default as VersionHistory } from './components/VersionHistory';
export { default as ShareDialog } from './components/ShareDialog';

/**
 * Re-export services
 */
export {
    saveCanvasState,
    loadCanvasState,
    clearCanvasState,
    exportCanvasState,
    importCanvasState
} from './services/canvasStorage';
