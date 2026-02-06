/**
 * SHORTCUTS MENU - Action Buttons (Danish UI)
 * 
 * Provides quick actions inspired by ChatGPT Canvas:
 * - Foreslå ændringer (Suggest edits)
 * - Juster længde (Adjust length)
 * - Tilføj final polish (Add final polish)
 * - Tilføj emojis (Add emojis)
 * - Fix bugs (for code)
 * - Oversæt til [sprog] (Translate to language)
 * 
 * @author Friday (AI Agent)
 * @version 0.3.0-canvas
 */

import React, { useState } from 'react';

const ShortcutsMenu = ({ onAction, canvasType }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [translateLang, setTranslateLang] = useState('en');
    
    // Text shortcuts
    const textShortcuts = [
        {
            id: 'suggest',
            icon: '💡',
            label: 'Foreslå ændringer',
            action: () => onAction('suggest-edits')
        },
        {
            id: 'shorter',
            icon: '📉',
            label: 'Gør kortere',
            action: () => onAction('adjust-length', 'shorter')
        },
        {
            id: 'longer',
            icon: '📈',
            label: 'Tilføj flere detaljer',
            action: () => onAction('adjust-length', 'longer')
        },
        {
            id: 'polish',
            icon: '✨',
            label: 'Final polish',
            action: () => onAction('final-polish')
        },
        {
            id: 'emojis',
            icon: '😊',
            label: 'Tilføj emojis',
            action: () => onAction('add-emojis')
        },
        {
            id: 'reading-level',
            icon: '📚',
            label: 'Juster læseniveau',
            action: () => onAction('reading-level')
        }
    ];
    
    // Code shortcuts
    const codeShortcuts = [
        {
            id: 'fix-bugs',
            icon: '🐛',
            label: 'Fix bugs',
            action: () => onAction('fix-bugs')
        },
        {
            id: 'add-comments',
            icon: '💬',
            label: 'Tilføj kommentarer',
            action: () => onAction('add-comments')
        },
        {
            id: 'optimize',
            icon: '⚡',
            label: 'Optimer kode',
            action: () => onAction('optimize-code')
        },
        {
            id: 'port-language',
            icon: '🔄',
            label: 'Port til andet sprog',
            action: () => onAction('port-language')
        },
        {
            id: 'add-tests',
            icon: '🧪',
            label: 'Tilføj unit tests',
            action: () => onAction('add-tests')
        }
    ];
    
    // Translation languages
    const languages = [
        { code: 'en', label: 'Engelsk' },
        { code: 'da', label: 'Dansk' },
        { code: 'de', label: 'Tysk' },
        { code: 'fr', label: 'Fransk' },
        { code: 'es', label: 'Spansk' },
        { code: 'it', label: 'Italiensk' },
        { code: 'sv', label: 'Svensk' },
        { code: 'no', label: 'Norsk' }
    ];
    
    const shortcuts = canvasType === 'code' ? codeShortcuts : textShortcuts;
    
    return (
        <div style={{
            position: 'relative',
            backgroundColor: '#252526',
            borderTop: '1px solid #3e3e42',
            padding: '8px 12px'
        }}>
            {/* Toggle Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: '#3c3c3c',
                    color: '#cccccc',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '13px',
                    fontWeight: '500'
                }}
            >
                <span>⚡ Hurtige handlinger</span>
                <span>{isExpanded ? '▼' : '▶'}</span>
            </button>
            
            {/* Expanded Menu */}
            {isExpanded && (
                <div style={{
                    marginTop: '8px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '8px'
                }}>
                    {/* Shortcuts Grid */}
                    {shortcuts.map(shortcut => (
                        <button
                            key={shortcut.id}
                            onClick={shortcut.action}
                            style={{
                                padding: '10px 14px',
                                backgroundColor: '#2a2a2a',
                                color: '#ffffff',
                                border: '1px solid #444',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                fontSize: '13px',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#3a3a3a';
                                e.currentTarget.style.borderColor = '#4CAF50';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#2a2a2a';
                                e.currentTarget.style.borderColor = '#444';
                            }}
                        >
                            <span style={{ fontSize: '18px' }}>{shortcut.icon}</span>
                            <span>{shortcut.label}</span>
                        </button>
                    ))}
                    
                    {/* Translation Widget */}
                    <div style={{
                        padding: '10px 14px',
                        backgroundColor: '#2a2a2a',
                        border: '1px solid #444',
                        borderRadius: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontSize: '13px',
                            color: '#ffffff'
                        }}>
                            <span style={{ fontSize: '18px' }}>🌍</span>
                            <span>Oversæt til:</span>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <select
                                value={translateLang}
                                onChange={(e) => setTranslateLang(e.target.value)}
                                style={{
                                    flex: 1,
                                    padding: '6px 8px',
                                    backgroundColor: '#3c3c3c',
                                    color: '#ffffff',
                                    border: '1px solid #555',
                                    borderRadius: '4px',
                                    fontSize: '12px'
                                }}
                            >
                                {languages.map(lang => (
                                    <option key={lang.code} value={lang.code}>
                                        {lang.label}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={() => onAction('translate', translateLang)}
                                style={{
                                    padding: '6px 12px',
                                    backgroundColor: '#4CAF50',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Mobile Hint */}
            <div style={{
                marginTop: '8px',
                fontSize: '11px',
                color: '#888',
                textAlign: 'center'
            }}>
                💡 Brug stemmekommandoer: "gør det kortere", "tilføj emojis", osv.
            </div>
        </div>
    );
};

export default ShortcutsMenu;
