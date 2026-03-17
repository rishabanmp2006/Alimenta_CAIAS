import { useState, useRef } from 'react';

export default function ImageScanner({ onProductDetected }) {
  const [scanning, setScanning] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (file) => {
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    setScanning(true);

    try {
      // Convert image to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Try to extract text using Claude's vision capability
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 300,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: file.type,
                  data: base64
                }
              },
              {
                type: 'text',
                text: 'Analyze this food product image. Extract: 1) Product name, 2) Brand name, 3) Barcode number (if visible). Return ONLY the extracted information in this exact format: "Product: [name] | Brand: [brand] | Barcode: [number]" If any field is not visible, write "Not visible".'
              }
            ]
          }]
        })
      });

      const data = await response.json();
      
      if (data.content && data.content[0] && data.content[0].text) {
        const text = data.content[0].text;
        
        // Parse the response
        const productMatch = text.match(/Product:\s*([^|]+)/i);
        const brandMatch = text.match(/Brand:\s*([^|]+)/i);
        const barcodeMatch = text.match(/Barcode:\s*([^|]+)/i);

        const productName = productMatch ? productMatch[1].trim() : null;
        const brandName = brandMatch ? brandMatch[1].trim() : null;
        const barcode = barcodeMatch ? barcodeMatch[1].trim() : null;

        // Determine what we found
        let searchQuery = null;
        let searchType = 'text';

        if (barcode && !barcode.toLowerCase().includes('not visible') && barcode.match(/^\d{8,13}$/)) {
          searchQuery = barcode;
          searchType = 'barcode';
        } else if (productName && !productName.toLowerCase().includes('not visible')) {
          searchQuery = brandName && !brandName.toLowerCase().includes('not visible') 
            ? `${brandName} ${productName}` 
            : productName;
        }

        if (searchQuery) {
          onProductDetected({
            type: searchType,
            query: searchQuery,
            productName: productName !== 'Not visible' ? productName : null,
            brand: brandName !== 'Not visible' ? brandName : null,
            barcode: barcode !== 'Not visible' ? barcode : null
          });
        } else {
          throw new Error('Could not detect product information from image');
        }
      }
    } catch (error) {
      console.error('Image scan error:', error);
      alert('Could not scan the image. Try:\n1. Take a clearer photo\n2. Ensure product name/barcode is visible\n3. Try manual search instead');
    } finally {
      setScanning(false);
      setTimeout(() => setPreview(null), 2000);
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0])}
        className="hidden"
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={scanning}
        className="w-full card card-interactive p-4 flex items-center gap-3 text-left disabled:opacity-50"
      >
        <div className="w-12 h-12 rounded-xl bg-accent-light flex items-center justify-center text-2xl shrink-0">
          📸
        </div>
        <div className="flex-1">
          <p className="text-[14px] font-semibold text-text-primary">
            {scanning ? 'Scanning image...' : 'Scan Product Image'}
          </p>
          <p className="text-[12px] text-text-tertiary">
            Take a photo or upload product image
          </p>
        </div>
        <span className="text-text-tertiary text-[14px]">→</span>
      </button>

      {/* Preview */}
      {preview && (
        <div className="mt-3 animate-fade-in">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-32 object-contain rounded-xl bg-surface-secondary"
          />
        </div>
      )}
    </div>
  );
}
