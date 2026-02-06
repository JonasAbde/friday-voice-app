/**
 * CANVAS VIEW - Main Split View Container
 * 
 * Implements ChatGPT Canvas-like split view with:
 * - Chat on left (existing voice interface)
 * - Canvas on right (editable workspace)
 * - Responsive layout (mobile/desktop)
 * - Real-time sync via WebSocket
 * 
 * @author Friday (AI Agent)
 * @version 0.3.0-canvas
 * @created 2026-02-06
 */

import React, { useState, useEffect, useRef } from 'react';
import TextEditor from './TextEditor';
import CodeEditor from './CodeEditor';
import DrawingCanvas from './DrawingCanvas';
import ShortcutsMenu from './ShortcutsMenu';
import VersionHistory from './VersionHistory';
import ShareDialog from './ShareDialog';
import { saveCanvasState, loadCanvasState } from '../services/canvasStorage';

const CanvasView = ({ websocket, onClose }) => {
    // Canvas state
    const [canvasType, setCanvasType] = useState('text'); // 'text' | 'code' | 'drawing'
    const [content, setContent] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [versions, setVersions] = useState([]);
    const [currentVersionIndex, setCurrentVersionIndex] = useState(-1);
    const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(true);
    const [showShareDialog, setShowShareDialog] = useState(false);
    const [showVersionHistory, setShowVersionHistory] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [splitRatio, setSplitRatio] = useState(0.5); // 50/50 split
    
    // Refs
    const autoSaveTimer = useRef(null);
    const lastSavedContent = useRef('');
    
    // Detect mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    // Load initial canvas state
    useEffect(() => {
        const loadState = async () => {
            try {
                const state = await loadCanvasState();
                if (state) {
                    setCanvasType(state.type || 'text');
                    setContent(state.content || '');
                    setLanguage(state.language || 'javascript');
                    setVersions(state.versions || []);
                    setCurrentVersionIndex(state.versions ? state.versions.length - 1 : -1);
                    lastSavedContent.current = state.content || '';
                }
            } catch (error) {
                console.error('Failed to load canvas state:', error);
            }
        };
        loadState();
    }, []);
    
    // Auto-save every 5 seconds
    useEffect(() => {
        if (!isAutoSaveEnabled) return;
        
        autoSaveTimer.current = setInterval(() => {
            if (content !== lastSavedContent.current) {
                handleSave();
            }
        }, 5000);
        
        return () => {
            if (autoSaveTimer.current) {
                clearInterval(autoSaveTimer.current);
            }
        };
    }, [content, isAutoSaveEnabled]);
    
    // WebSocket sync
    useEffect(() => {
        if (!websocket) return;
        
        const handleMessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.type === 'canvasUpdate') {
                    setContent(message.content);
                    setCanvasType(message.canvasType);
                    if (message.language) setLanguage(message.language);
                }
            } catch (error) {
                console.error('Failed to parse WebSocket message:', error);
            }
        };
        
        websocket.addEventListener('message', handleMessage);
        return () => websocket.removeEventListener('message', handleMessage);
    }, [websocket]);
    
    // Handle content change
    const handleContentChange = (newContent) => {
        setContent(newContent);
        
        // Notify server via WebSocket
        if (websocket && websocket.readyState === WebSocket.OPEN) {
            websocket.send(JSON.stringify({
                type: 'canvasUpdate',
                content: newContent,
                canvasType,
                language
            }));
        }
    };
    
    // Save current state as new version
    const handleSave = async () => {
        try {
            const newVersion = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                content,
                type: canvasType,
                language
            };
            
            const newVersions = [...versions, newVersion];
            setVersions(newVersions);
            setCurrentVersionIndex(newVersions.length - 1);
            
            await saveCanvasState({
                type: canvasType,
                content,
                language,
                versions: newVersions
            });
            
            lastSavedContent.current = content;
            
            // Notify server
            if (websocket && websocket.readyState === WebSocket.OPEN) {
                websocket.send(JSON.stringify({
                    type: 'canvasSave',
                    version: newVersion
                }));
            }
        } catch (error) {
            console.error('Failed to save canvas state:', error);
        }
    };
    
    // Navigate version history
    const handleVersionNavigate = (direction) => {
        const newIndex = currentVersionIndex + direction;
        if (newIndex >= 0 && newIndex < versions.length) {
            const version = versions[newIndex];
            setContent(version.content);
            setCanvasType(version.type);
            if (version.language) setLanguage(version.language);
            setCurrentVersionIndex(newIndex);
        }
    };
    
    // Voice command handler
    const handleVoiceCommand = (command) => {
        const lowerCommand = command.toLowerCase();
        
        // Danish voice commands
        if (lowerCommand.includes('gør det kortere') || lowerCommand.includes('make it shorter')) {
            handleShortcutAction('adjust-length', 'shorter');
        } else if (lowerCommand.includes('tilføj flere detaljer') || lowerCommand.includes('add more details')) {
            handleShortcutAction('adjust-length', 'longer');
        } else if (lowerCommand.includes('tilføj emojis') || lowerCommand.includes('add emojis')) {
            handleShortcutAction('add-emojis');
        } else if (lowerCommand.includes('fix bugs') || lowerCommand.includes('ret fejl')) {
            handleShortcutAction('fix-bugs');
        } else if (lowerCommand.includes('oversæt til') || lowerCommand.includes('translate to')) {
            const targetLang = lowerCommand.includes('engelsk') ? 'English' : 
                              lowerCommand.includes('dansk') ? 'Danish' : 'English';
            handleShortcutAction('translate', targetLang);
        }
    };
    
    // Shortcut action handler
    const handleShortcutAction = async (action, param) => {
        if (!content) return;
        
        // Send to Friday AI via WebSocket
        if (websocket && websocket.readyState === WebSocket.OPEN) {
            websocket.send(JSON.stringify({
                type: 'voice_message',
                transcript: `Canvas action: ${action} ${param || ''} on content: ${content.substring(0, 200)}...`
            }));
        }
    };
    
    // Render appropriate editor
    const renderEditor = () => {
        switch (canvasType) {
            case 'code':
                return (
                    <CodeEditor
                        content={content}
                        language={language}
                        onChange={handleContentChange}
                        onLanguageChange={setLanguage}
                    />
                );
            case 'drawing':
                return (
                    <DrawingCanvas
                        content={content}
                        onChange={handleContentChange}
                    />
                );
            default:
                return (
                    <TextEditor
                        content={content}
                        onChange={handleContentChange}
                    />
                );
        }
    };
    
    return (
        <div className="canvas-view" style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            height: '100vh',
            width: '100vw',
            backgroundColor: '#1a1a1a',
            color: '#ffffff'
        }}>
            {/* Canvas Header */}
            <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                zIndex: 1000,
                padding: '12px',
                display: 'flex',
                gap: '8px',
                backgroundColor: 'rgba(26, 26, 26, 0.95)',
                borderBottomLeftRadius: '8px'
            }}>
                {/* Type Selector */}
                <select
                    value={canvasType}
                    onChange={(e) => setCanvasType(e.target.value)}
                    style={{
                        padding: '8px 12px',
                        backgroundColor: '#2a2a2a',
                        color: '#ffffff',
                        border: '1px solid #444',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                >
                    <option value="text">📝 Tekst</option>
                    <option value="code">💻 Kode</option>
                    <option value="drawing">🎨 Tegning</option>
                </select>
                
                {/* Version History */}
                <button
                    onClick={() => setShowVersionHistory(!showVersionHistory)}
                    style={{
                        padding: '8px 12px',
                        backgroundColor: '#2a2a2a',
                        color: '#ffffff',
                        border: '1px solid #444',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                    title="Versionshistorik"
                >
                    📜
                </button>
                
                {/* Share */}
                <button
                    onClick={() => setShowShareDialog(true)}
                    style={{
                        padding: '8px 12px',
                        backgroundColor: '#2a2a2a',
                        color: '#ffffff',
                        border: '1px solid #444',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                    title="Del"
                >
                    🔗
                </button>
                
                {/* Close */}
                <button
                    onClick={onClose}
                    style={{
                        padding: '8px 12px',
                        backgroundColor: '#c62828',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                    title="Luk Canvas"
                >
                    ✕
                </button>
            </div>
            
            {/* Main Canvas Area */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                marginTop: '56px'
            }}>
                {/* Editor */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    {renderEditor()}
                </div>
                
                {/* Shortcuts Menu */}
                <ShortcutsMenu
                    onAction={handleShortcutAction}
                    canvasType={canvasType}
                />
            </div>
            
            {/* Version History Sidebar */}
            {showVersionHistory && (
                <VersionHistory
                    versions={versions}
                    currentIndex={currentVersionIndex}
                    onNavigate={handleVersionNavigate}
                    onClose={() => setShowVersionHistory(false)}
                />
            )}
            
            {/* Share Dialog */}
            {showShareDialog && (
                <ShareDialog
                    content={content}
                    canvasType={canvasType}
                    language={language}
                    onClose={() => setShowShareDialog(false)}
                />
            )}
        </div>
    );
};

export default CanvasView;
