import { useState } from 'react';
import BarcodeScanner from '@/components/BarcodeScanner';

interface ScanStepProps {
    onScanSubmit: (ean: string) => void;
    onError: (message: string) => void;
}

export default function ScanStep({ onScanSubmit, onError }: ScanStepProps) {
    const [ean, setEan] = useState('');

    return (
        <div className="space-y-4">
            <BarcodeScanner onScan={onScanSubmit} onError={onError} />
            <p className="text-gray-400 text-center">Ou saisissez le code manuellement</p>
            <form onSubmit={(e) => { e.preventDefault(); onScanSubmit(ean); }} className="space-y-4">
                <input
                    type="text"
                    value={ean}
                    onChange={(e) => setEan(e.target.value)}
                    placeholder="Code EAN"
                    required
                    className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-white"
                />
                <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Rechercher
                </button>
            </form>
        </div>
    );
}