/**
 * VERSION HISTORY - Git-like Diff Viewer
 * 
 * Features:
 * - Show all saved versions with timestamps
 * - Visual diff (additions/deletions like git diff)
 * - Back/forward navigation
 * - Rollback to previous version
 * - Side-by-side or unified diff view
 * 
 * @author Friday (AI Agent)
 * @version 0.3.0-canvas
 */

import React, { useState, useEffect } from 'react';
import { DiffMatchPatch } from 'diff-match-patch';

const VersionHistory = ({ versions, currentIndex, onNavigate, onClose }) => {
    const [diffMode, setDiffMode] = useState('unified'); // 'unified' | 'split'
    const [selectedVersion, setSelectedVersion] = useState(null);
    const dmp = new DiffMatchPatch();
    
    useEffect(() => {
        if (versions.length > 0 && currentIndex >= 0) {
            setSelectedVersion(versions[currentIndex]);
        }
    }, [versions, currentIndex]);
    
    // Generate diff between two versions
    const generateDiff = (oldContent, newContent) => {
        try {
            // Parse content if it's JSON (Quill delta)
            let oldText = oldContent;
            let newText = newContent;
            
            try {
                const oldDelta = JSON.parse(oldContent);
                oldText = oldDelta.ops ? oldDelta.ops.map(op => op.insert || '').join('') : oldContent;
            } catch {}
            
            try {
                const newDelta = JSON.parse(newContent);
                newText = newDelta.ops ? newDelta.ops.map(op => op.insert || '').join('') : newContent;
            } catch {}
            
            const diffs = dmp.diff_main(oldText, newText);
            dmp.diff_cleanupSemantic(diffs);
            
            return diffs;
        } catch (error) {
            console.error('Failed to generate diff:', error);
            return [];
        }
    };
    
    // Render diff in unified format
    const renderUnifiedDiff = (diffs) => {
        return diffs.map((diff, index) => {
            const [operation, text] = diff;
            let backgroundColor = 'transparent';
            let color = '#cccccc';
            let prefix = ' ';
            
            if (operation === 1) { // Addition
                backgroundColor = 'rgba(76, 175, 80, 0.2)';
                color = '#8bc34a';
                prefix = '+';
            } else if (operation === -1) { // Deletion
                backgroundColor = 'rgba(244, 67, 54, 0.2)';
                color = '#f44336';
                prefix = '-';
            }
            
            return (
                <div
                    key={index}
                    style={{
                        backgroundColor,
                        color,
                        padding: '2px 8px',
                        fontFamily: 'Monaco, Menlo, "Courier New", monospace',
                        fontSize: '13px',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                    }}
                >
                    {prefix} {text}
                </div>
            );
        });
    };
    
    // Render diff in split view
    const renderSplitDiff = (diffs) => {
        const oldLines = [];
        const newLines = [];
        
        diffs.forEach(diff => {
            const [operation, text] = diff;
            
            if (operation === -1) {
                oldLines.push({ text, type: 'removed' });
            } else if (operation === 1) {
                newLines.push({ text, type: 'added' });
            } else {
                oldLines.push({ text, type: 'unchanged' });
                newLines.push({ text, type: 'unchanged' });
            }
        });
        
        return (
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1px',
                backgroundColor: '#3e3e42'
            }}>
                {/* Old Version */}
                <div style={{ backgroundColor: '#1e1e1e' }}>
                    <div style={{
                        padding: '8px',
                        backgroundColor: '#252526',
                        borderBottom: '1px solid #3e3e42',
                        fontSize: '12px',
                        color: '#888',
                        fontWeight: '500'
                    }}>
                        Tidligere version
                    </div>
                    {oldLines.map((line, index) => (
                        <div
                            key={index}
                            style={{
                                backgroundColor: line.type === 'removed' ? 'rgba(244, 67, 54, 0.2)' : 'transparent',
                                color: line.type === 'removed' ? '#f44336' : '#cccccc',
                                padding: '2px 8px',
                                fontFamily: 'Monaco, Menlo, "Courier New", monospace',
                                fontSize: '13px',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word'
                            }}
                        >
                            {line.text}
                        </div>
                    ))}
                </div>
                
                {/* New Version */}
                <div style={{ backgroundColor: '#1e1e1e' }}>
                    <div style={{
                        padding: '8px',
                        backgroundColor: '#252526',
                        borderBottom: '1px solid #3e3e42',
                        fontSize: '12px',
                        color: '#888',
                        fontWeight: '500'
                    }}>
                        Nuværende version
                    </div>
                    {newLines.map((line, index) => (
                        <div
                            key={index}
                            style={{
                                backgroundColor: line.type === 'added' ? 'rgba(76, 175, 80, 0.2)' : 'transparent',
                                color: line.type === 'added' ? '#8bc34a' : '#cccccc',
                                padding: '2px 8px',
                                fontFamily: 'Monaco, Menlo, "Courier New", monospace',
                                fontSize: '13px',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word'
                            }}
                        >
                            {line.text}
                        </div>
                    ))}
                </div>
            </div>
        );
    };
    
    // Format timestamp
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('da-DK', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    // Get diff for current version
    const getCurrentDiff = () => {
        if (!selectedVersion || currentIndex <= 0) return null;
        
        const previousVersion = versions[currentIndex - 1];
        return generateDiff(previousVersion.content, selectedVersion.content);
    };
    
    const currentDiff = getCurrentDiff();
    
    return (
        <div style={{
            position: 'fixed',
            right: 0,
            top: 0,
            width: '400px',
            maxWidth: '100vw',
            height: '100vh',
            backgroundColor: '#1a1a1a',
            borderLeft: '1px solid #3e3e42',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000
        }}>
            {/* Header */}
            <div style={{
                padding: '16px',
                backgroundColor: '#252526',
                borderBottom: '1px solid #3e3e42',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h3 style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#ffffff'
                }}>
                    📜 Versionshistorik
                </h3>
                <button
                    onClick={onClose}
                    style={{
                        padding: '6px 12px',
                        backgroundColor: 'transparent',
                        color: '#888',
                        border: '1px solid #555',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                    }}
                >
                    ✕
                </button>
            </div>
            
            {/* Navigation */}
            <div style={{
                padding: '12px 16px',
                backgroundColor: '#2a2a2a',
                borderBottom: '1px solid #3e3e42',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <button
                    onClick={() => onNavigate(-1)}
                    disabled={currentIndex <= 0}
                    style={{
                        padding: '6px 12px',
                        backgroundColor: currentIndex <= 0 ? '#555' : '#4CAF50',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: currentIndex <= 0 ? 'not-allowed' : 'pointer',
                        fontSize: '12px'
                    }}
                >
                    ← Tilbage
                </button>
                
                <span style={{ color: '#cccccc', fontSize: '13px' }}>
                    {currentIndex + 1} / {versions.length}
                </span>
                
                <button
                    onClick={() => onNavigate(1)}
                    disabled={currentIndex >= versions.length - 1}
                    style={{
                        padding: '6px 12px',
                        backgroundColor: currentIndex >= versions.length - 1 ? '#555' : '#4CAF50',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: currentIndex >= versions.length - 1 ? 'not-allowed' : 'pointer',
                        fontSize: '12px'
                    }}
                >
                    Frem →
                </button>
            </div>
            
            {/* Diff Mode Toggle */}
            {currentDiff && (
                <div style={{
                    padding: '8px 16px',
                    backgroundColor: '#252526',
                    borderBottom: '1px solid #3e3e42',
                    display: 'flex',
                    gap: '8px'
                }}>
                    <button
                        onClick={() => setDiffMode('unified')}
                        style={{
                            padding: '6px 12px',
                            backgroundColor: diffMode === 'unified' ? '#4CAF50' : '#3c3c3c',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                    >
                        Unified
                    </button>
                    <button
                        onClick={() => setDiffMode('split')}
                        style={{
                            padding: '6px 12px',
                            backgroundColor: diffMode === 'split' ? '#4CAF50' : '#3c3c3c',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                    >
                        Side-by-side
                    </button>
                </div>
            )}
            
            {/* Version Info */}
            {selectedVersion && (
                <div style={{
                    padding: '12px 16px',
                    backgroundColor: '#2a2a2a',
                    borderBottom: '1px solid #3e3e42',
                    fontSize: '13px',
                    color: '#cccccc'
                }}>
                    <div>📅 {formatTimestamp(selectedVersion.timestamp)}</div>
                    <div style={{ marginTop: '4px', color: '#888' }}>
                        Type: {selectedVersion.type === 'text' ? '📝 Tekst' : 
                               selectedVersion.type === 'code' ? '💻 Kode' : '🎨 Tegning'}
                        {selectedVersion.language && ` (${selectedVersion.language})`}
                    </div>
                </div>
            )}
            
            {/* Diff Content */}
            <div style={{
                flex: 1,
                overflow: 'auto',
                backgroundColor: '#1e1e1e'
            }}>
                {currentDiff ? (
                    diffMode === 'unified' ? 
                        renderUnifiedDiff(currentDiff) : 
                        renderSplitDiff(currentDiff)
                ) : (
                    <div style={{
                        padding: '20px',
                        textAlign: 'center',
                        color: '#888',
                        fontSize: '13px'
                    }}>
                        {versions.length === 0 ? 
                            'Ingen versioner gemt endnu' : 
                            'Første version - ingen ændringer at vise'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VersionHistory;
