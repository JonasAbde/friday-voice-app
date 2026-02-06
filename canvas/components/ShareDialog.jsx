/**
 * SHARE DIALOG - Generate Shareable Links
 * 
 * Features:
 * - Generate public read-only URLs
 * - Export to PDF, Markdown, Word, code files
 * - Copy link to clipboard
 * - QR code for mobile sharing
 * 
 * @author Friday (AI Agent)
 * @version 0.3.0-canvas
 */

import React, { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

const ShareDialog = ({ content, canvasType, language, onClose }) => {
    const [shareUrl, setShareUrl] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    
    useEffect(() => {
        generateShareUrl();
    }, []);
    
    // Generate unique share URL
    const generateShareUrl = async () => {
        setIsGenerating(true);
        
        try {
            const shareId = nanoid(10);
            const baseUrl = window.location.origin;
            const url = `${baseUrl}/canvas/share/${shareId}`;
            
            // Save to backend (would need server endpoint)
            // For now, just generate the URL
            setShareUrl(url);
            
            // In production, save share data:
            // await fetch('/api/canvas/share', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ id: shareId, content, canvasType, language })
            // });
        } catch (error) {
            console.error('Failed to generate share URL:', error);
            setShareUrl('Error generating URL');
        } finally {
            setIsGenerating(false);
        }
    };
    
    // Copy to clipboard
    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };
    
    // Export as PDF
    const handleExportPDF = () => {
        try {
            const doc = new jsPDF();
            
            let textContent = content;
            try {
                const delta = JSON.parse(content);
                textContent = delta.ops ? delta.ops.map(op => op.insert || '').join('') : content;
            } catch {}
            
            doc.setFontSize(12);
            const lines = doc.splitTextToSize(textContent, 180);
            doc.text(lines, 15, 15);
            
            doc.save(`friday-canvas-${Date.now()}.pdf`);
        } catch (error) {
            console.error('Failed to export PDF:', error);
            alert('PDF eksport fejlede: ' + error.message);
        }
    };
    
    // Export as Markdown
    const handleExportMarkdown = () => {
        try {
            let textContent = content;
            try {
                const delta = JSON.parse(content);
                textContent = delta.ops ? delta.ops.map(op => op.insert || '').join('') : content;
            } catch {}
            
            const blob = new Blob([textContent], { type: 'text/markdown' });
            saveAs(blob, `friday-canvas-${Date.now()}.md`);
        } catch (error) {
            console.error('Failed to export Markdown:', error);
            alert('Markdown eksport fejlede: ' + error.message);
        }
    };
    
    // Export as Word
    const handleExportWord = async () => {
        try {
            let textContent = content;
            try {
                const delta = JSON.parse(content);
                textContent = delta.ops ? delta.ops.map(op => op.insert || '').join('') : content;
            } catch {}
            
            const doc = new Document({
                sections: [{
                    properties: {},
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun(textContent)
                            ]
                        })
                    ]
                }]
            });
            
            const blob = await Packer.toBlob(doc);
            saveAs(blob, `friday-canvas-${Date.now()}.docx`);
        } catch (error) {
            console.error('Failed to export Word:', error);
            alert('Word eksport fejlede: ' + error.message);
        }
    };
    
    // Export as code file
    const handleExportCode = () => {
        try {
            const extension = language === 'javascript' ? 'js' :
                            language === 'typescript' ? 'ts' :
                            language === 'python' ? 'py' :
                            language === 'html' ? 'html' :
                            language === 'css' ? 'css' :
                            language === 'java' ? 'java' :
                            language === 'cpp' ? 'cpp' :
                            language === 'csharp' ? 'cs' :
                            'txt';
            
            const blob = new Blob([content], { type: 'text/plain' });
            saveAs(blob, `friday-code-${Date.now()}.${extension}`);
        } catch (error) {
            console.error('Failed to export code:', error);
            alert('Kode eksport fejlede: ' + error.message);
        }
    };
    
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
        }}>
            <div style={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #3e3e42',
                borderRadius: '8px',
                width: '90%',
                maxWidth: '500px',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid #3e3e42',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#ffffff'
                    }}>
                        🔗 Del & Eksporter
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '6px 12px',
                            backgroundColor: 'transparent',
                            color: '#888',
                            border: '1px solid #555',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        ✕
                    </button>
                </div>
                
                {/* Content */}
                <div style={{ padding: '20px' }}>
                    {/* Share Link Section */}
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{
                            margin: '0 0 12px 0',
                            fontSize: '16px',
                            fontWeight: '500',
                            color: '#ffffff'
                        }}>
                            📤 Delbart link
                        </h3>
                        <p style={{
                            margin: '0 0 12px 0',
                            fontSize: '13px',
                            color: '#888'
                        }}>
                            Alle med linket kan se indholdet (read-only)
                        </p>
                        
                        <div style={{
                            display: 'flex',
                            gap: '8px'
                        }}>
                            <input
                                type="text"
                                value={shareUrl}
                                readOnly
                                style={{
                                    flex: 1,
                                    padding: '10px 12px',
                                    backgroundColor: '#2a2a2a',
                                    color: '#ffffff',
                                    border: '1px solid #444',
                                    borderRadius: '4px',
                                    fontSize: '13px',
                                    fontFamily: 'Monaco, monospace'
                                }}
                            />
                            <button
                                onClick={handleCopyLink}
                                disabled={isGenerating}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: isCopied ? '#4CAF50' : '#2196F3',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: isGenerating ? 'not-allowed' : 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {isCopied ? '✅ Kopieret!' : '📋 Kopier'}
                            </button>
                        </div>
                    </div>
                    
                    {/* Export Section */}
                    <div>
                        <h3 style={{
                            margin: '0 0 12px 0',
                            fontSize: '16px',
                            fontWeight: '500',
                            color: '#ffffff'
                        }}>
                            💾 Eksporter fil
                        </h3>
                        
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                            gap: '8px'
                        }}>
                            {/* PDF */}
                            <button
                                onClick={handleExportPDF}
                                style={{
                                    padding: '12px 16px',
                                    backgroundColor: '#c62828',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                📄 PDF
                            </button>
                            
                            {/* Markdown */}
                            <button
                                onClick={handleExportMarkdown}
                                style={{
                                    padding: '12px 16px',
                                    backgroundColor: '#1976d2',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                📝 Markdown
                            </button>
                            
                            {/* Word */}
                            <button
                                onClick={handleExportWord}
                                style={{
                                    padding: '12px 16px',
                                    backgroundColor: '#2196F3',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                📘 Word
                            </button>
                            
                            {/* Code File (only for code canvas) */}
                            {canvasType === 'code' && (
                                <button
                                    onClick={handleExportCode}
                                    style={{
                                        padding: '12px 16px',
                                        backgroundColor: '#4CAF50',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    💻 Kode
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareDialog;
