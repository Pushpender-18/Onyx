'use client';

import React from 'react';
import { CanvasElement } from '@/app/dashboard/templates';

interface TemplateCanvasProps {
  elements: CanvasElement[];
  scale?: number;
}

export const TemplateCanvas: React.FC<TemplateCanvasProps> = ({ elements, scale = 1 }) => {
  const renderElement = (element: CanvasElement) => {
    const baseStyle = {
      position: 'absolute' as const,
      left: `${element.x * scale}px`,
      top: `${element.y * scale}px`,
      width: `${element.width * scale}px`,
      height: `${element.height * scale}px`,
      boxSizing: 'border-box' as const,
      fontFamily: 'inherit',
    };

    const textStyle = {
      fontSize: element.fontSize ? `${element.fontSize * scale}px` : 'inherit',
      color: element.color || '#000',
      overflow: 'hidden' as const,
      whiteSpace: 'pre-wrap' as const,
      wordWrap: 'break-word' as const,
      display: 'flex' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      padding: `${4 * scale}px`,
      textAlign: 'center' as const,
    };

    const containerStyle = {
      backgroundColor: element.backgroundColor || 'transparent',
      border: `${1 * scale}px solid ${element.backgroundColor || '#ccc'}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '4px',
    };

    const buttonStyle = {
      ...containerStyle,
      backgroundColor: element.backgroundColor || '#007bff',
      color: element.color || '#fff',
      cursor: 'pointer',
      border: 'none',
      fontWeight: 'bold' as const,
      fontSize: element.fontSize ? `${element.fontSize * scale}px` : '14px',
      transition: 'background-color 0.2s',
    };

    const imageStyle = {
      ...containerStyle,
      fontSize: element.fontSize ? `${element.fontSize * scale}px` : '48px',
      backgroundColor: element.backgroundColor || '#f5f5f5',
      border: 'none',
    };

    switch (element.type) {
      case 'text':
        return (
          <div key={element.id} style={{ ...baseStyle, ...textStyle }}>
            {element.content}
          </div>
        );

      case 'container':
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              ...containerStyle,
              backgroundColor: element.backgroundColor || 'transparent',
              borderRadius: element.id?.includes('hero') ? '8px' : '4px',
            }}
          >
            {element.content && (
              <div style={{ ...textStyle, position: 'relative', fontSize: element.fontSize ? `${element.fontSize * scale}px` : 'inherit' }}>
                {element.content}
              </div>
            )}
          </div>
        );

      case 'button':
        return (
          <button
            key={element.id}
            style={{
              ...baseStyle,
              ...buttonStyle,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            {element.content}
          </button>
        );

      case 'image':
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              ...imageStyle,
            }}
          >
            {element.content}
          </div>
        );

      default:
        return null;
    }
  };

  // Calculate canvas dimensions from elements
  const maxX = Math.max(...elements.map(e => (e.x + e.width) * scale), 1000 * scale);
  const maxY = Math.max(...elements.map(e => (e.y + e.height) * scale), 600 * scale);

  return (
    <div
      style={{
        position: 'relative',
        width: `${maxX}px`,
        height: `${maxY}px`,
        margin: '0 auto',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      {elements.map(renderElement)}
    </div>
  );
};
