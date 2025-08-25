'use client';

import { useState } from 'react';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';

interface BarcodeScannerProps {
  onScan: (ean: string) => void;
  onError: (error: string) => void;
}

export default function BarcodeScanner({ onScan, onError }: BarcodeScannerProps) {
  const [data, setData] = useState('');

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-600">
        <BarcodeScannerComponent
          onUpdate={(err, result) => {
            if (result) {
              const scannedData = result.getText();
              setData(scannedData);
              onScan(scannedData);
            }
          }}
          onError={(err) => {
            console.error(err);
            onError('Erreur de la caméra.');
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-3/4 h-1 border-b-2 border-green-500 animate-pulse"></div>
        </div>
      </div>
      <p className="text-gray-300 text-sm">Veuillez placer le code-barres devant la caméra.</p>
      {data && <p className="text-sm text-green-400">Code scanné : {data}</p>}
    </div>
  );
}