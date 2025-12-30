'use client';

import React, { useState, useRef } from 'react';
import { motion, Reorder } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Eye,
  FloppyDisk,
  Plus,
  Trash,
  TextT,
  Image,
  Square,
  Folder,
} from 'phosphor-react';

interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'button' | 'container';
  content?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
}

export default function StoreEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeName = searchParams.get('storeName') || 'My Store';
  const template = searchParams.get('template') || 'minimal';

  const canvasRef = useRef<HTMLDivElement>(null);
  const [elements, setElements] = useState<CanvasElement[]>([
    {
      id: '1',
      type: 'text',
      content: 'Welcome to ' + storeName,
      x: 50,
      y: 50,
      width: 500,
      height: 80,
      fontSize: 48,
    },
    {
      id: '2',
      type: 'text',
      content: 'Discover our amazing products',
      x: 50,
      y: 150,
      width: 400,
      height: 40,
      fontSize: 20,
    },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>('1');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const selectedElement = elements.find((el) => el.id === selectedId);

  const addElement = (type: CanvasElement['type']) => {
    const newElement: CanvasElement = {
      id: Date.now().toString(),
      type,
      content: type === 'text' ? 'New Text' : undefined,
      x: 50,
      y: elements.length * 100 + 50,
      width: 200,
      height: 60,
      fontSize: type === 'text' ? 16 : undefined,
    };
    setElements([...elements, newElement]);
    setSelectedId(newElement.id);
  };

  const updateElement = (id: string, updates: Partial<CanvasElement>) => {
    setElements(elements.map((el) => (el.id === id ? { ...el, ...updates } : el)));
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter((el) => el.id !== id));
    setSelectedId(null);
  };

  const handleSave = () => {
    console.log('Saving store:', {
      name: storeName,
      template,
      elements,
    });
    alert('Store saved! Redirecting to dashboard...');
    router.push('/dashboard/stores');
  };

  if (isPreviewMode) {
    return (
      <div className="min-h-screen bg-(--onyx-white)">
        {/* Preview Header */}
        <div className="border-b border-(--onyx-grey-lighter) sticky top-0 z-40">
          <div className="container-custom py-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-(--onyx-stone)">
              {storeName} - Preview
            </h2>
            <button
              onClick={() => setIsPreviewMode(false)}
              className="btn-secondary flex items-center gap-2"
            >
              <ArrowLeft size={18} weight="bold" />
              Back to Editor
            </button>
          </div>
        </div>

        {/* Preview Canvas */}
        <div className="container-custom py-12">
          <div
            className="bg-(--onyx-white) border border-(--onyx-grey-lighter) rounded-lg overflow-hidden"
            style={{ minHeight: '600px' }}
          >
            {elements.map((element) => (
              <div
                key={element.id}
                style={{
                  position: 'absolute',
                  left: `${element.x}px`,
                  top: `${element.y}px`,
                  width: `${element.width}px`,
                  height: `${element.height}px`,
                  backgroundColor: element.backgroundColor,
                  color: element.color || 'black',
                  fontSize: element.fontSize ? `${element.fontSize}px` : undefined,
                  padding: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px solid ${element.type === 'button' ? '#353935' : 'transparent'}`,
                  borderRadius: element.type === 'button' ? '8px' : '0px',
                }}
              >
                {element.content}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--onyx-white) flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-(--onyx-grey-lighter) sticky top-0 z-40 bg-(--onyx-white)"
      >
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-(--onyx-grey-lighter) rounded-lg transition-colors"
              >
                <ArrowLeft size={20} weight="bold" className="text-(--onyx-stone)" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-(--onyx-stone)">{storeName}</h1>
                <p className="text-xs text-(--onyx-grey)">Template: {template}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPreviewMode(true)}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <Eye size={18} weight="bold" />
                Preview
              </button>
              <button
                onClick={handleSave}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <FloppyDisk size={18} weight="bold" />
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 flex">
        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-64 border-r border-(--onyx-grey-lighter) p-6 overflow-y-auto bg-(--onyx-grey-lighter)/20"
        >
          <h3 className="text-lg font-semibold text-(--onyx-stone) mb-4">Add Elements</h3>
          <div className="space-y-3 mb-8">
            <button
              onClick={() => addElement('text')}
              className="w-full flex items-center gap-3 px-4 py-3 bg-(--onyx-white) border border-(--onyx-grey-lighter) rounded-lg hover:bg-(--onyx-grey-lighter) transition-colors text-left"
            >
              <TextT size={18} weight="bold" className="text-(--onyx-stone)" />
              <span className="text-sm font-medium">Add Text</span>
            </button>
            <button
              onClick={() => addElement('image')}
              className="w-full flex items-center gap-3 px-4 py-3 bg-(--onyx-white) border border-(--onyx-grey-lighter) rounded-lg hover:bg-(--onyx-grey-lighter) transition-colors text-left"
            >
              <Image size={18} weight="bold" className="text-(--onyx-stone)" />
              <span className="text-sm font-medium">Add Image</span>
            </button>
            <button
              onClick={() => addElement('button')}
              className="w-full flex items-center gap-3 px-4 py-3 bg-(--onyx-white) border border-(--onyx-grey-lighter) rounded-lg hover:bg-(--onyx-grey-lighter) transition-colors text-left"
            >
              <Square size={18} weight="bold" className="text-(--onyx-stone)" />
              <span className="text-sm font-medium">Add Button</span>
            </button>
            <button
              onClick={() => addElement('container')}
              className="w-full flex items-center gap-3 px-4 py-3 bg-(--onyx-white) border border-(--onyx-grey-lighter) rounded-lg hover:bg-(--onyx-grey-lighter) transition-colors text-left"
            >
              <Folder size={18} weight="bold" className="text-(--onyx-stone)" />
              <span className="text-sm font-medium">Add Container</span>
            </button>
          </div>

          {/* Element Properties */}
          {selectedElement && (
            <div className="bg-(--onyx-white) p-4 rounded-lg border border-(--onyx-grey-lighter)">
              <h4 className="font-semibold text-(--onyx-stone) mb-4">Properties</h4>
              <div className="space-y-4">
                {selectedElement.type === 'text' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-(--onyx-stone) mb-2">
                        Text
                      </label>
                      <input
                        type="text"
                        value={selectedElement.content || ''}
                        onChange={(e) =>
                          updateElement(selectedElement.id, { content: e.target.value })
                        }
                        className="input-field text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-(--onyx-stone) mb-2">
                        Font Size
                      </label>
                      <input
                        type="number"
                        value={selectedElement.fontSize || 16}
                        onChange={(e) =>
                          updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })
                        }
                        className="input-field text-sm"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-xs font-medium text-(--onyx-stone) mb-2">
                    Width
                  </label>
                  <input
                    type="number"
                    value={selectedElement.width}
                    onChange={(e) =>
                      updateElement(selectedElement.id, { width: parseInt(e.target.value) })
                    }
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-(--onyx-stone) mb-2">
                    Height
                  </label>
                  <input
                    type="number"
                    value={selectedElement.height}
                    onChange={(e) =>
                      updateElement(selectedElement.id, { height: parseInt(e.target.value) })
                    }
                    className="input-field text-sm"
                  />
                </div>
                <button
                  onClick={() => deleteElement(selectedElement.id)}
                  className="w-full btn-secondary text-xs flex items-center justify-center gap-2"
                >
                  <Trash size={16} weight="bold" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Canvas Area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 p-6 overflow-auto"
        >
          <div className="mx-auto max-w-6xl">
            <h3 className="text-lg font-semibold text-(--onyx-stone) mb-4">Canvas</h3>
            <div
              ref={canvasRef}
              className="relative bg-(--onyx-white) border-2 border-dashed border-(--onyx-grey-lighter) rounded-lg"
              style={{ minHeight: '800px' }}
            >
              {elements.map((element) => (
                <motion.div
                  key={element.id}
                  onClick={() => setSelectedId(element.id)}
                  className={`absolute cursor-move p-2 rounded transition-all ${
                    selectedId === element.id
                      ? 'ring-2 ring-(--onyx-stone) bg-(--onyx-grey-lighter)/20'
                      : 'hover:ring-1 hover:ring-(--onyx-grey-light)'
                  }`}
                  style={{
                    left: `${element.x}px`,
                    top: `${element.y}px`,
                    width: `${element.width}px`,
                    height: `${element.height}px`,
                    backgroundColor: element.backgroundColor,
                    color: element.color || 'black',
                    fontSize: element.fontSize ? `${element.fontSize}px` : undefined,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border:
                      element.type === 'button'
                        ? `2px solid var(--onyx-stone)`
                        : '2px solid transparent',
                    borderRadius: element.type === 'button' ? '8px' : '0px',
                  }}
                  draggable
                  onDragEnd={(e, info) => {
                    updateElement(element.id, {
                      x: element.x + info.offset.x,
                      y: element.y + info.offset.y,
                    });
                  }}
                >
                  {element.content || `[${element.type}]`}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
