import { useState, useRef, useEffect } from 'react';

export default function BarcodeScanner({ onBarcodeDetected, onClose }) {
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanning(true);
        scanForBarcode();
      }
    } catch (err) {
      setError('Camera access denied. Please enable camera permissions.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const scanForBarcode = async () => {
    if (!videoRef.current || !canvasRef.current || !scanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      try {
        if ('BarcodeDetector' in window) {
          const barcodeDetector = new window.BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39']
          });
          const barcodes = await barcodeDetector.detect(canvas);
          if (barcodes.length > 0) {
            stopCamera();
            onBarcodeDetected(barcodes[0].rawValue);
            return;
          }
        } else if (window.ZXing) {
          const codeReader = new window.ZXing.BrowserMultiFormatReader();
          try {
            const result = await codeReader.decodeFromCanvas(canvas);
            if (result) {
              stopCamera();
              onBarcodeDetected(result.text);
              return;
            }
          } catch (err) {
            // No barcode detected, continue
          }
        }
      } catch (err) {
        console.error('Barcode detection error:', err);
      }
    }

    animationRef.current = requestAnimationFrame(scanForBarcode);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between text-white">
          <h2 className="text-lg font-semibold">Scan Barcode</h2>
          <button
            onClick={() => { stopCamera(); onClose(); }}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative">
          <div className="w-64 h-48 border-4 border-white rounded-lg relative">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-accent rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-accent rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-accent rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-accent rounded-br-lg"></div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-accent animate-scan-line"></div>
          </div>
          <p className="text-white text-center mt-4 text-sm bg-black/50 px-4 py-2 rounded-full">
            {scanning ? 'Position barcode within frame' : 'Starting camera...'}
          </p>
        </div>
      </div>

      {error && (
        <div className="absolute bottom-20 left-0 right-0 px-4">
          <div className="bg-red-500 text-white p-4 rounded-lg text-center">{error}</div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <div className="text-white text-center space-y-2">
          <p className="text-sm opacity-75">Hold steady and align the barcode</p>
          <p className="text-xs opacity-50">Works with UPC, EAN, Code 128, and more</p>
        </div>
      </div>
    </div>
  );
}
