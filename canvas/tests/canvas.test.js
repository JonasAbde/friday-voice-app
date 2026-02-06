/**
 * CANVAS FEATURE - Test Suite
 * 
 * Comprehensive tests for Canvas components and functionality
 * 
 * Run: npm test
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CanvasView from '../components/CanvasView';
import TextEditor from '../components/TextEditor';
import CodeEditor from '../components/CodeEditor';
import DrawingCanvas from '../components/DrawingCanvas';
import { saveCanvasState, loadCanvasState, clearCanvasState } from '../services/canvasStorage';

// Mock WebSocket
class MockWebSocket {
    constructor() {
        this.readyState = 1; // OPEN
        this.listeners = {};
    }
    
    addEventListener(event, handler) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(handler);
    }
    
    removeEventListener(event, handler) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(h => h !== handler);
        }
    }
    
    send(data) {
        this.lastSent = JSON.parse(data);
    }
    
    simulateMessage(data) {
        const event = { data: JSON.stringify(data) };
        (this.listeners['message'] || []).forEach(h => h(event));
    }
}

// Mock IndexedDB
const mockIndexedDB = () => {
    const store = {};
    
    global.indexedDB = {
        open: () => ({
            onsuccess: null,
            onerror: null,
            onupgradeneeded: null,
            result: {
                transaction: () => ({
                    objectStore: () => ({
                        get: (key) => ({
                            onsuccess: null,
                            onerror: null,
                            result: store[key]
                        }),
                        put: (data) => {
                            store[data.id] = data;
                            return { onsuccess: null, onerror: null };
                        },
                        delete: (key) => {
                            delete store[key];
                            return { onsuccess: null, onerror: null };
                        }
                    })
                })
            }
        })
    };
};

describe('Canvas Feature Tests', () => {
    let mockWs;
    
    beforeEach(() => {
        mockWs = new MockWebSocket();
        mockIndexedDB();
        localStorage.clear();
    });
    
    afterEach(() => {
        jest.clearAllTimers();
    });
    
    describe('CanvasView Component', () => {
        test('renders without crashing', () => {
            render(<CanvasView websocket={mockWs} onClose={() => {}} />);
            expect(screen.getByText(/Tekst/i)).toBeInTheDocument();
        });
        
        test('switches between canvas types', () => {
            const { container } = render(
                <CanvasView websocket={mockWs} onClose={() => {}} />
            );
            
            const typeSelector = container.querySelector('select');
            fireEvent.change(typeSelector, { target: { value: 'code' } });
            
            expect(typeSelector.value).toBe('code');
        });
        
        test('sends WebSocket messages on content change', async () => {
            render(<CanvasView websocket={mockWs} onClose={() => {}} />);
            
            // Simulate content change
            const editor = screen.getByRole('textbox', { hidden: true });
            fireEvent.input(editor, { target: { value: 'Test content' } });
            
            await waitFor(() => {
                expect(mockWs.lastSent).toBeDefined();
                expect(mockWs.lastSent.type).toBe('canvasUpdate');
            });
        });
        
        test('opens version history', () => {
            const { container } = render(
                <CanvasView websocket={mockWs} onClose={() => {}} />
            );
            
            const historyButton = container.querySelector('[title="Versionshistorik"]');
            fireEvent.click(historyButton);
            
            expect(screen.getByText(/Versionshistorik/i)).toBeInTheDocument();
        });
        
        test('opens share dialog', () => {
            const { container } = render(
                <CanvasView websocket={mockWs} onClose={() => {}} />
            );
            
            const shareButton = container.querySelector('[title="Del"]');
            fireEvent.click(shareButton);
            
            expect(screen.getByText(/Del & Eksporter/i)).toBeInTheDocument();
        });
    });
    
    describe('TextEditor Component', () => {
        test('initializes Quill editor', () => {
            const mockOnChange = jest.fn();
            const { container } = render(
                <TextEditor content="" onChange={mockOnChange} />
            );
            
            const editor = container.querySelector('.ql-editor');
            expect(editor).toBeInTheDocument();
        });
        
        test('calls onChange when content changes', async () => {
            const mockOnChange = jest.fn();
            const { container } = render(
                <TextEditor content="" onChange={mockOnChange} />
            );
            
            const editor = container.querySelector('.ql-editor');
            fireEvent.input(editor, { target: { textContent: 'Hello' } });
            
            await waitFor(() => {
                expect(mockOnChange).toHaveBeenCalled();
            });
        });
    });
    
    describe('CodeEditor Component', () => {
        test('initializes Monaco editor', () => {
            const mockOnChange = jest.fn();
            const mockOnLangChange = jest.fn();
            
            const { container } = render(
                <CodeEditor
                    content=""
                    language="javascript"
                    onChange={mockOnChange}
                    onLanguageChange={mockOnLangChange}
                />
            );
            
            expect(container.querySelector('[data-mode-id="javascript"]')).toBeTruthy();
        });
        
        test('changes language', () => {
            const mockOnChange = jest.fn();
            const mockOnLangChange = jest.fn();
            
            const { container } = render(
                <CodeEditor
                    content=""
                    language="javascript"
                    onChange={mockOnChange}
                    onLanguageChange={mockOnLangChange}
                />
            );
            
            const langSelector = container.querySelector('select');
            fireEvent.change(langSelector, { target: { value: 'python' } });
            
            expect(mockOnLangChange).toHaveBeenCalledWith('python');
        });
        
        test('executes JavaScript code', async () => {
            const mockOnChange = jest.fn();
            const mockOnLangChange = jest.fn();
            
            const { container } = render(
                <CodeEditor
                    content="console.log('Hello');"
                    language="javascript"
                    onChange={mockOnChange}
                    onLanguageChange={mockOnLangChange}
                />
            );
            
            const runButton = screen.getByText(/Kør kode/i);
            fireEvent.click(runButton);
            
            await waitFor(() => {
                expect(container.textContent).toContain('Hello');
            });
        });
    });
    
    describe('DrawingCanvas Component', () => {
        test('initializes Fabric.js canvas', () => {
            const mockOnChange = jest.fn();
            const { container } = render(
                <DrawingCanvas content="" onChange={mockOnChange} />
            );
            
            const canvas = container.querySelector('canvas');
            expect(canvas).toBeInTheDocument();
        });
        
        test('switches drawing tools', () => {
            const mockOnChange = jest.fn();
            const { container } = render(
                <DrawingCanvas content="" onChange={mockOnChange} />
            );
            
            const penButton = screen.getByTitle(/Pen/i);
            fireEvent.click(penButton);
            
            expect(penButton).toHaveStyle({ backgroundColor: '#4CAF50' });
        });
        
        test('changes brush color', () => {
            const mockOnChange = jest.fn();
            const { container } = render(
                <DrawingCanvas content="" onChange={mockOnChange} />
            );
            
            const colorPicker = container.querySelector('input[type="color"]');
            fireEvent.change(colorPicker, { target: { value: '#ff0000' } });
            
            expect(colorPicker.value).toBe('#ff0000');
        });
    });
    
    describe('Canvas Storage Service', () => {
        test('saves state to storage', async () => {
            const state = {
                type: 'text',
                content: 'Test content',
                versions: []
            };
            
            await saveCanvasState(state);
            
            const loaded = await loadCanvasState();
            expect(loaded.content).toBe('Test content');
        });
        
        test('loads state from storage', async () => {
            const state = {
                type: 'code',
                content: 'console.log("test");',
                language: 'javascript',
                versions: []
            };
            
            await saveCanvasState(state);
            const loaded = await loadCanvasState();
            
            expect(loaded.type).toBe('code');
            expect(loaded.language).toBe('javascript');
        });
        
        test('clears state from storage', async () => {
            const state = {
                type: 'text',
                content: 'Test',
                versions: []
            };
            
            await saveCanvasState(state);
            await clearCanvasState();
            
            const loaded = await loadCanvasState();
            expect(loaded).toBeNull();
        });
    });
    
    describe('WebSocket Integration', () => {
        test('receives canvas updates from server', async () => {
            const { container } = render(
                <CanvasView websocket={mockWs} onClose={() => {}} />
            );
            
            mockWs.simulateMessage({
                type: 'canvasUpdate',
                content: 'Updated content',
                canvasType: 'text'
            });
            
            await waitFor(() => {
                const editor = container.querySelector('.ql-editor');
                expect(editor.textContent).toContain('Updated');
            });
        });
        
        test('sends canvas saves to server', async () => {
            render(<CanvasView websocket={mockWs} onClose={() => {}} />);
            
            // Trigger save (would normally be auto-save)
            mockWs.simulateMessage({
                type: 'canvasSave',
                version: {
                    id: 'v1',
                    timestamp: new Date().toISOString(),
                    content: 'Test'
                }
            });
            
            await waitFor(() => {
                expect(mockWs.lastSent).toBeDefined();
                expect(mockWs.lastSent.type).toBe('canvasSave');
            });
        });
    });
    
    describe('Voice Commands', () => {
        test('detects "gør kortere" command', async () => {
            render(<CanvasView websocket={mockWs} onClose={() => {}} />);
            
            mockWs.simulateMessage({
                type: 'voice_message',
                transcript: 'gør det kortere'
            });
            
            await waitFor(() => {
                expect(mockWs.lastSent).toBeDefined();
                expect(mockWs.lastSent.type).toBe('voice_message');
                expect(mockWs.lastSent.transcript).toContain('adjust-length');
            });
        });
        
        test('detects "tilføj emojis" command', async () => {
            render(<CanvasView websocket={mockWs} onClose={() => {}} />);
            
            mockWs.simulateMessage({
                type: 'voice_message',
                transcript: 'tilføj emojis'
            });
            
            await waitFor(() => {
                expect(mockWs.lastSent.transcript).toContain('add-emojis');
            });
        });
    });
    
    describe('Mobile Responsive', () => {
        test('detects mobile viewport', () => {
            global.innerWidth = 500; // Mobile width
            
            const { container } = render(
                <CanvasView websocket={mockWs} onClose={() => {}} />
            );
            
            const canvasView = container.querySelector('.canvas-view');
            expect(canvasView).toHaveStyle({ flexDirection: 'column' });
        });
        
        test('uses larger font on mobile', () => {
            global.innerWidth = 500;
            
            const mockOnChange = jest.fn();
            const { container } = render(
                <TextEditor content="" onChange={mockOnChange} />
            );
            
            const editor = container.querySelector('.ql-editor');
            const computedStyle = window.getComputedStyle(editor);
            
            expect(parseInt(computedStyle.fontSize)).toBeGreaterThanOrEqual(18);
        });
    });
});

/**
 * Run tests:
 * 
 * npm test
 * 
 * Coverage:
 * npm test -- --coverage
 * 
 * Watch mode:
 * npm test -- --watch
 */
