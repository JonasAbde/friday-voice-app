/**
 * TEXT EDITOR - Rich Text Editor with Quill.js
 * 
 * Features:
 * - Rich text editing (bold, italic, lists, etc.)
 * - Inline suggestions via comment bubbles
 * - Direct editing with auto-save
 * - Mobile-optimized touch controls
 * - Danish UI
 * 
 * @author Friday (AI Agent)
 * @version 0.3.0-canvas
 */

import React, { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const TextEditor = ({ content, onChange }) => {
    const editorRef = useRef(null);
    const quillRef = useRef(null);
    const [selection, setSelection] = useState(null);
    const [showCommentBubble, setShowCommentBubble] = useState(false);
    const [bubblePosition, setBubblePosition] = useState({ top: 0, left: 0 });
    const [comment, setComment] = useState('');
    
    // Initialize Quill editor
    useEffect(() => {
        if (!editorRef.current || quillRef.current) return;
        
        const quill = new Quill(editorRef.current, {
            theme: 'snow',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'color': [] }, { 'background': [] }],
                    ['link'],
                    ['clean']
                ]
            },
            placeholder: 'Begynd at skrive...'
        });
        
        quillRef.current = quill;
        
        // Set initial content
        if (content) {
            try {
                const delta = JSON.parse(content);
                quill.setContents(delta);
            } catch {
                quill.setText(content);
            }
        }
        
        // Handle text changes
        quill.on('text-change', () => {
            const delta = quill.getContents();
            onChange(JSON.stringify(delta));
        });
        
        // Handle selection for comment bubbles
        quill.on('selection-change', (range) => {
            if (range && range.length > 0) {
                setSelection(range);
                const bounds = quill.getBounds(range.index, range.length);
                setBubblePosition({
                    top: bounds.top + bounds.height + 10,
                    left: bounds.left
                });
            } else {
                setShowCommentBubble(false);
            }
        });
        
        return () => {
            if (quillRef.current) {
                quillRef.current = null;
            }
        };
    }, []);
    
    // Update content when prop changes
    useEffect(() => {
        if (!quillRef.current || !content) return;
        
        const currentContent = JSON.stringify(quillRef.current.getContents());
        if (currentContent !== content) {
            try {
                const delta = JSON.parse(content);
                quillRef.current.setContents(delta, 'silent');
            } catch {
                quillRef.current.setText(content, 'silent');
            }
        }
    }, [content]);
    
    // Add inline comment
    const handleAddComment = () => {
        if (!quillRef.current || !selection || !comment) return;
        
        // Highlight selected text
        quillRef.current.formatText(selection.index, selection.length, {
            'background': '#fff59d',
            'comment': comment
        });
        
        setComment('');
        setShowCommentBubble(false);
    };
    
    return (
        <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#2a2a2a',
            position: 'relative'
        }}>
            {/* Editor Container */}
            <div 
                ref={editorRef}
                style={{
                    flex: 1,
                    backgroundColor: '#2a2a2a',
                    color: '#ffffff',
                    fontSize: '16px',
                    lineHeight: '1.6',
                    padding: '20px'
                }}
            />
            
            {/* Comment Bubble */}
            {selection && (
                <button
                    onClick={() => setShowCommentBubble(true)}
                    style={{
                        position: 'absolute',
                        top: bubblePosition.top,
                        left: bubblePosition.left,
                        padding: '6px 12px',
                        backgroundColor: '#4CAF50',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '16px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        zIndex: 100
                    }}
                >
                    💬 Tilføj kommentar
                </button>
            )}
            
            {/* Comment Input Dialog */}
            {showCommentBubble && (
                <div style={{
                    position: 'absolute',
                    top: bubblePosition.top + 40,
                    left: bubblePosition.left,
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #444',
                    borderRadius: '8px',
                    padding: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    zIndex: 101,
                    minWidth: '250px'
                }}>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Skriv din kommentar..."
                        style={{
                            width: '100%',
                            minHeight: '60px',
                            padding: '8px',
                            backgroundColor: '#2a2a2a',
                            color: '#ffffff',
                            border: '1px solid #444',
                            borderRadius: '4px',
                            resize: 'vertical',
                            fontFamily: 'inherit',
                            fontSize: '14px'
                        }}
                        autoFocus
                    />
                    <div style={{
                        display: 'flex',
                        gap: '8px',
                        marginTop: '8px'
                    }}>
                        <button
                            onClick={handleAddComment}
                            style={{
                                flex: 1,
                                padding: '6px 12px',
                                backgroundColor: '#4CAF50',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Gem
                        </button>
                        <button
                            onClick={() => {
                                setShowCommentBubble(false);
                                setComment('');
                            }}
                            style={{
                                flex: 1,
                                padding: '6px 12px',
                                backgroundColor: '#666',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Annuller
                        </button>
                    </div>
                </div>
            )}
            
            {/* Custom Styles for Dark Theme */}
            <style>{`
                .ql-toolbar {
                    background-color: #1a1a1a !important;
                    border-color: #444 !important;
                }
                .ql-container {
                    background-color: #2a2a2a !important;
                    border-color: #444 !important;
                    color: #ffffff !important;
                }
                .ql-editor {
                    color: #ffffff !important;
                    font-size: 16px;
                    line-height: 1.6;
                }
                .ql-editor.ql-blank::before {
                    color: #888 !important;
                }
                .ql-stroke {
                    stroke: #ffffff !important;
                }
                .ql-fill {
                    fill: #ffffff !important;
                }
                .ql-picker-label {
                    color: #ffffff !important;
                }
                .ql-picker-options {
                    background-color: #2a2a2a !important;
                    border-color: #444 !important;
                }
                .ql-picker-item {
                    color: #ffffff !important;
                }
                .ql-picker-item:hover {
                    background-color: #444 !important;
                }
                
                /* Mobile optimizations */
                @media (max-width: 768px) {
                    .ql-toolbar {
                        padding: 8px 4px !important;
                    }
                    .ql-editor {
                        font-size: 18px !important;
                        padding: 16px !important;
                    }
                    .ql-toolbar button {
                        width: 32px !important;
                        height: 32px !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default TextEditor;
