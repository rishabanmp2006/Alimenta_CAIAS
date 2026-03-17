import { useState, useRef, useEffect, useCallback } from 'react';

export default function BarcodeScanner({ onBarcodeDetected, onClose }) {
  const [error, setError] = useState('');
  const [statusText, setStatusText] = useState('Starting camera...');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);
  // FIX: Use a ref for the active flag instead of state.
  // State updates are async — when scanForBarcode() first runs, the old
  // `scanning` state value is still false (closure captures stale value),
  // so the loop exits immediately and never scans anything.
  const isActiveRef = useRef(false);

  const stopCamera = useCallback(() => {
    isActiveRef.current = false;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const scanForBarcode = useCallback(async () => {
    // Guard: stop if camera was closed
    if (!isActiveRef.current || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      try {
        // Prefer native BarcodeDetector (Chrome/Edge on Android)
        if ('BarcodeDetector' in window) {
          const barcodeDetector = new window.BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code']
          });
          const barcodes = await barcodeDetector.detect(canvas);
          if (barcodes.length > 0) {
            stopCamera();
            onBarcodeDetected(barcodes[0].rawValue);
            return;
          }
        } else if (window.ZXing) {
          // Fallback: ZXing (loaded via CDN in index.html)
          const codeReader = new window.ZXing.BrowserMultiFormatReader();
          try {
            const result = await codeReader.decodeFromCanvas(canvas);
            if (result) {
              stopCamera();
              onBarcodeDetected(result.text);
              return;
            }
          } catch {
            // No barcode in this frame — continue scanning
          }
        } else {
          // Neither API available — show helpful message
          setStatusText('Barcode scanning not supported in this browser. Try Chrome/Edge on Android.');
        }
      } catch (err) {
        console.error('Barcode detection error:', err);
      }
    }

    // Schedule next frame only if still active
    if (isActiveRef.current) {
      animationRef.current = requestAnimationFrame(scanForBarcode);
    }
  }, [stopCamera, onBarcodeDetected]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        // FIX: Set the ref to true BEFORE starting the scan loop,
        // so the loop doesn't exit on its very first iteration.
        isActiveRef.current = true;
        setStatusText('Position barcode within frame');
        scanForBarcode();
      }
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please enable camera permissions and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else {
        setError('Could not start camera: ' + err.message);
      }
      console.error('Camera error:', err);
    }
  }, [scanForBarcode]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between text-white">
          <h2 className="text-lg font-semibold">Scan Barcode</h2>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            aria-label="Close scanner"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Camera feed */}
      <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />

      {/* Scan overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative">
          <div className="w-64 h-48 border-4 border-white rounded-lg relative overflow-hidden">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-accent rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-accent rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-accent rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-accent rounded-br-lg"></div>
            {/* Scan line animation */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-accent animate-scan-line"></div>
          </div>
          <p className="text-white text-center mt-4 text-sm bg-black/50 px-4 py-2 rounded-full">
            {statusText}
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="absolute bottom-28 left-0 right-0 px-4">
          <div className="bg-red-500 text-white p-4 rounded-lg text-center text-sm">{error}</div>
        </div>
      )}

      {/* Hidden canvas used for frame capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Footer hint */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <div className="text-white text-center space-y-2">
          <p className="text-sm opacity-75">Hold steady and align the barcode</p>
          <p className="text-xs opacity-50">Works with UPC, EAN, Code 128, and more</p>
        </div>
      </div>
    </div>
  );
}
