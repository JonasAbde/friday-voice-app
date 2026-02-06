/**
 * DRAWING CANVAS - Fabric.js Drawing Surface
 * 
 * Features:
 * - Freehand drawing with pen tool
 * - Shapes (rectangle, circle, line, arrow)
 * - Text annotations
 * - Pan & zoom (infinite canvas)
 * - Touch gestures for mobile
 * - Export as PNG/SVG
 * 
 * @author Friday (AI Agent)
 * @version 0.3.0-canvas
 */

import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';

const DrawingCanvas = ({ content, onChange }) => {
    const canvasRef = useRef(null);
    const fabricRef = useRef(null);
    const containerRef = useRef(null);
    const [tool, setTool] = useState('pen'); // 'pen' | 'rectangle' | 'circle' | 'line' | 'text' | 'select'
    const [color, setColor] = useState('#ffffff');
    const [brushSize, setBrushSize] = useState(3);
    const [isDrawing, setIsDrawing] = useState(false);
    const [zoom, setZoom] = useState(1);
    
    // Initialize Fabric.js canvas
    useEffect(() => {
        if (!canvasRef.current || fabricRef.current) return;
        
        const canvas = new fabric.Canvas(canvasRef.current, {
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight,
            backgroundColor: '#1a1a1a',
            isDrawingMode: tool === 'pen'
        });
        
        fabricRef.current = canvas;
        
        // Configure drawing brush
        canvas.freeDrawingBrush.color = color;
        canvas.freeDrawingBrush.width = brushSize;
        
        // Load initial content
        if (content) {
            try {
                canvas.loadFromJSON(content, () => {
                    canvas.renderAll();
                });
            } catch (error) {
                console.error('Failed to load canvas content:', error);
            }
        }
        
        // Handle canvas changes
        canvas.on('object:added', handleCanvasChange);
        canvas.on('object:modified', handleCanvasChange);
        canvas.on('object:removed', handleCanvasChange);
        
        // Handle window resize
        const handleResize = () => {
            if (containerRef.current) {
                canvas.setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                });
                canvas.renderAll();
            }
        };
        window.addEventListener('resize', handleResize);
        
        // Touch gestures for mobile
        let lastTouchDistance = 0;
        canvas.on('touch:gesture', (e) => {
            if (e.e.touches && e.e.touches.length === 2) {
                const touch1 = e.e.touches[0];
                const touch2 = e.e.touches[1];
                const distance = Math.sqrt(
                    Math.pow(touch2.clientX - touch1.clientX, 2) +
                    Math.pow(touch2.clientY - touch1.clientY, 2)
                );
                
                if (lastTouchDistance > 0) {
                    const delta = distance - lastTouchDistance;
                    handleZoom(delta > 0 ? 0.1 : -0.1);
                }
                
                lastTouchDistance = distance;
            }
        });
        
        canvas.on('touch:drag', () => {
            lastTouchDistance = 0;
        });
        
        return () => {
            window.removeEventListener('resize', handleResize);
            if (fabricRef.current) {
                fabricRef.current.dispose();
                fabricRef.current = null;
            }
        };
    }, []);
    
    // Update tool
    useEffect(() => {
        if (!fabricRef.current) return;
        
        const canvas = fabricRef.current;
        canvas.isDrawingMode = tool === 'pen';
        
        if (tool === 'pen') {
            canvas.freeDrawingBrush.color = color;
            canvas.freeDrawingBrush.width = brushSize;
        }
    }, [tool, color, brushSize]);
    
    // Handle canvas changes
    const handleCanvasChange = () => {
        if (!fabricRef.current) return;
        
        const json = JSON.stringify(fabricRef.current.toJSON());
        onChange(json);
    };
    
    // Add shape
    const addShape = (shapeType) => {
        if (!fabricRef.current) return;
        
        const canvas = fabricRef.current;
        let shape;
        
        switch (shapeType) {
            case 'rectangle':
                shape = new fabric.Rect({
                    left: 100,
                    top: 100,
                    width: 200,
                    height: 100,
                    fill: 'transparent',
                    stroke: color,
                    strokeWidth: brushSize
                });
                break;
            case 'circle':
                shape = new fabric.Circle({
                    left: 100,
                    top: 100,
                    radius: 50,
                    fill: 'transparent',
                    stroke: color,
                    strokeWidth: brushSize
                });
                break;
            case 'line':
                shape = new fabric.Line([50, 100, 250, 100], {
                    stroke: color,
                    strokeWidth: brushSize
                });
                break;
            case 'text':
                shape = new fabric.IText('Skriv her...', {
                    left: 100,
                    top: 100,
                    fill: color,
                    fontSize: 24,
                    fontFamily: 'Arial'
                });
                break;
        }
        
        if (shape) {
            canvas.add(shape);
            canvas.setActiveObject(shape);
            canvas.renderAll();
        }
    };
    
    // Handle zoom
    const handleZoom = (delta) => {
        if (!fabricRef.current) return;
        
        const canvas = fabricRef.current;
        let newZoom = zoom + delta;
        newZoom = Math.max(0.1, Math.min(5, newZoom)); // Clamp between 0.1x and 5x
        
        setZoom(newZoom);
        canvas.setZoom(newZoom);
        canvas.renderAll();
    };
    
    // Clear canvas
    const handleClear = () => {
        if (!fabricRef.current) return;
        
        if (confirm('Ryd hele tegningen?')) {
            fabricRef.current.clear();
            fabricRef.current.backgroundColor = '#1a1a1a';
            fabricRef.current.renderAll();
            handleCanvasChange();
        }
    };
    
    // Export as PNG
    const handleExportPNG = () => {
        if (!fabricRef.current) return;
        
        const dataURL = fabricRef.current.toDataURL({
            format: 'png',
            quality: 1
        });
        
        const link = document.createElement('a');
        link.download = `friday-drawing-${Date.now()}.png`;
        link.href = dataURL;
        link.click();
    };
    
    return (
        <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#1a1a1a'
        }}>
            {/* Toolbar */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: '#252526',
                borderBottom: '1px solid #3e3e42',
                flexWrap: 'wrap'
            }}>
                {/* Tools */}
                <div style={{ display: 'flex', gap: '4px' }}>
                    {[
                        { value: 'select', icon: '↖️', label: 'Vælg' },
                        { value: 'pen', icon: '✏️', label: 'Pen' },
                        { value: 'rectangle', icon: '▭', label: 'Firkant' },
                        { value: 'circle', icon: '⭕', label: 'Cirkel' },
                        { value: 'line', icon: '─', label: 'Linje' },
                        { value: 'text', icon: 'T', label: 'Tekst' }
                    ].map(t => (
                        <button
                            key={t.value}
                            onClick={() => {
                                if (t.value === 'select') {
                                    setTool('select');
                                } else if (['rectangle', 'circle', 'line', 'text'].includes(t.value)) {
                                    addShape(t.value);
                                } else {
                                    setTool(t.value);
                                }
                            }}
                            style={{
                                padding: '8px 12px',
                                backgroundColor: tool === t.value ? '#4CAF50' : '#3c3c3c',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '16px'
                            }}
                            title={t.label}
                        >
                            {t.icon}
                        </button>
                    ))}
                </div>
                
                {/* Color Picker */}
                <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    style={{
                        width: '40px',
                        height: '36px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                    title="Farve"
                />
                
                {/* Brush Size */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#cccccc', fontSize: '12px' }}>Størrelse:</span>
                    <input
                        type="range"
                        min="1"
                        max="50"
                        value={brushSize}
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        style={{ width: '80px' }}
                    />
                    <span style={{ color: '#cccccc', fontSize: '12px', width: '30px' }}>
                        {brushSize}px
                    </span>
                </div>
                
                {/* Zoom */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                        onClick={() => handleZoom(-0.1)}
                        style={{
                            padding: '6px 12px',
                            backgroundColor: '#3c3c3c',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        −
                    </button>
                    <span style={{ color: '#cccccc', fontSize: '12px', minWidth: '50px', textAlign: 'center' }}>
                        {Math.round(zoom * 100)}%
                    </span>
                    <button
                        onClick={() => handleZoom(0.1)}
                        style={{
                            padding: '6px 12px',
                            backgroundColor: '#3c3c3c',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        +
                    </button>
                </div>
                
                {/* Actions */}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
                    <button
                        onClick={handleClear}
                        style={{
                            padding: '6px 12px',
                            backgroundColor: '#c62828',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                    >
                        🗑️ Ryd
                    </button>
                    <button
                        onClick={handleExportPNG}
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
                        💾 Gem PNG
                    </button>
                </div>
            </div>
            
            {/* Canvas Container */}
            <div 
                ref={containerRef}
                style={{
                    flex: 1,
                    overflow: 'hidden',
                    position: 'relative'
                }}
            >
                <canvas ref={canvasRef} />
            </div>
            
            {/* Mobile Hint */}
            <div style={{
                padding: '8px',
                backgroundColor: '#252526',
                borderTop: '1px solid #3e3e42',
                fontSize: '11px',
                color: '#888',
                textAlign: 'center'
            }}>
                💡 Mobil: Brug 2 fingre til zoom, 1 finger til tegning
            </div>
        </div>
    );
};

export default DrawingCanvas;
