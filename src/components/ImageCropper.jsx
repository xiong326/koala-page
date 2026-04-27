import { useState, useRef, useCallback, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { t } from '../i18n/translations';

const CROP_SIZE = 300;
const ZOOM_FACTOR = 1.15;
const WHEEL_FACTOR = 1.08;

export default function ImageCropper({ file, onCrop, onCancel }) {
  const { language } = useLanguage();
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const fitZoomRef = useRef(1);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const fitZoom = CROP_SIZE / Math.min(img.width, img.height);
      fitZoomRef.current = fitZoom;
      setZoom(fitZoom);
      setOffset({
        x: (CROP_SIZE - img.width * fitZoom) / 2,
        y: (CROP_SIZE - img.height * fitZoom) / 2,
      });
      setImgLoaded(true);
    };
    img.src = URL.createObjectURL(file);
    return () => URL.revokeObjectURL(img.src);
  }, [file]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CROP_SIZE, CROP_SIZE);
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(0, 0, CROP_SIZE, CROP_SIZE);
    ctx.drawImage(img, offset.x, offset.y, img.width * zoom, img.height * zoom);
  }, [zoom, offset]);

  useEffect(() => {
    if (imgLoaded) draw();
  }, [imgLoaded, draw]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setDragging(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragStart.current = {
      x: clientX - rect.left,
      y: clientY - rect.top,
      ox: offset.x,
      oy: offset.y,
    };
  };

  const handleMouseMove = useCallback((e) => {
    if (!dragging) return;
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = (clientX - rect.left) - dragStart.current.x;
    const dy = (clientY - rect.top) - dragStart.current.y;
    setOffset({
      x: dragStart.current.ox + dx,
      y: dragStart.current.oy + dy,
    });
  }, [dragging]);

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleMouseMove);
        window.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [dragging, handleMouseMove, handleMouseUp]);

  const applyZoomMultiply = (factor, cx = CROP_SIZE / 2, cy = CROP_SIZE / 2) => {
    setZoom(prev => {
      const minZoom = fitZoomRef.current * 0.5;
      const maxZoom = fitZoomRef.current * 20;
      const next = Math.max(minZoom, Math.min(maxZoom, prev * factor));
      const ratio = next / prev;
      setOffset(o => ({
        x: cx - (cx - o.x) * ratio,
        y: cy - (cy - o.y) * ratio,
      }));
      return next;
    });
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const factor = e.deltaY > 0 ? 1 / WHEEL_FACTOR : WHEEL_FACTOR;
    applyZoomMultiply(factor, mx, my);
  };

  const handleReset = () => {
    const img = imgRef.current;
    if (!img) return;
    const fitZoom = fitZoomRef.current;
    setZoom(fitZoom);
    setOffset({
      x: (CROP_SIZE - img.width * fitZoom) / 2,
      y: (CROP_SIZE - img.height * fitZoom) / 2,
    });
  };

  const handleSliderChange = (e) => {
    const sliderVal = parseFloat(e.target.value);
    const fitZoom = fitZoomRef.current;
    const next = fitZoom * Math.pow(2, sliderVal);
    const ratio = next / zoom;
    setOffset(o => ({
      x: CROP_SIZE / 2 - (CROP_SIZE / 2 - o.x) * ratio,
      y: CROP_SIZE / 2 - (CROP_SIZE / 2 - o.y) * ratio,
    }));
    setZoom(next);
  };

  const sliderValue = Math.log2(zoom / fitZoomRef.current);

  const handleCrop = () => {
    const img = imgRef.current;
    if (!img) return;

    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = CROP_SIZE;
    outputCanvas.height = CROP_SIZE;
    const ctx = outputCanvas.getContext('2d');
    ctx.drawImage(img, offset.x, offset.y, img.width * zoom, img.height * zoom);

    outputCanvas.toBlob((blob) => {
      onCrop(blob);
    }, 'image/webp', 0.90);
  };

  if (!imgLoaded) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">{t('cropInstruction', language)}</p>

      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={CROP_SIZE}
          height={CROP_SIZE}
          className="border-2 border-dashed border-gray-300 rounded-lg cursor-grab active:cursor-grabbing touch-none"
          style={{ width: CROP_SIZE, height: CROP_SIZE }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          onWheel={handleWheel}
        />
      </div>

      {/* Zoom controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => applyZoomMultiply(1 / ZOOM_FACTOR)}
          className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 text-lg font-bold"
        >
          -
        </button>
        <input
          type="range"
          min={-1}
          max={4}
          step={0.01}
          value={sliderValue}
          onChange={handleSliderChange}
          className="w-32 accent-blue-500"
        />
        <button
          type="button"
          onClick={() => applyZoomMultiply(ZOOM_FACTOR)}
          className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 text-lg font-bold"
        >
          +
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-2 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 text-xs"
        >
          {t('cropReset', language)}
        </button>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
        >
          {t('cancel', language)}
        </button>
        <button
          type="button"
          onClick={handleCrop}
          className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          {t('cropConfirm', language)}
        </button>
      </div>
    </div>
  );
}
