import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Smartphone, Wifi, WifiOff, Copy, Check } from 'lucide-react';

interface QRCodeDisplayProps {
  qrCode: string;
  pairingCode?: string;
  isConnected: boolean;
  onRequestPairingCode?: () => void;
  phoneNumber?: string;
  status?: string;
  message?: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ 
  qrCode, 
  pairingCode, 
  isConnected, 
  onRequestPairingCode,
  phoneNumber = "",
  status = "disconnected",
  message = "Not connected"
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [inputPhoneNumber, setInputPhoneNumber] = useState(phoneNumber);
  const [isRequestingPairingCode, setIsRequestingPairingCode] = useState(false);
  const [pairingCodeError, setPairingCodeError] = useState<string | null>(null);

  useEffect(() => {
    if (canvasRef.current && qrCode) {
      QRCode.toCanvas(canvasRef.current, qrCode, {
        width: 180,
        margin: 1,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      }).catch(err => console.error('Error generating QR code:', err));
    }
  }, [qrCode]);

  const copyPairingCode = async () => {
    if (pairingCode) {
      try {
        await navigator.clipboard.writeText(pairingCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const requestPairingCode = async () => {
    if (!inputPhoneNumber.trim()) {
      setPairingCodeError("Phone number is required");
      return;
    }

    setIsRequestingPairingCode(true);
    setPairingCodeError(null);

    try {
      // Get user token from localStorage
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('User not authenticated');
      }

      // Request pairing code using the updated endpoint
      const response = await fetch('https://c4ba947d9455f026.ngrok.app/api/pairing-code', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: inputPhoneNumber.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to request pairing code';
        
        // Check if it's the specific pairing code availability error
        if (errorData.useQRCode && errorData.qrCode) {
          // If server suggests using QR code and provides one, show it
          throw new Error('Pairing code is temporarily unavailable. Please use the QR code method above to connect your WhatsApp account.');
        } else if (errorMessage.includes('temporarily unavailable') || errorMessage.includes('WhatsApp Web updates')) {
          throw new Error('Pairing code is temporarily unavailable. Please use the QR code method above to connect your WhatsApp account.');
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Call the parent's onRequestPairingCode if provided
      if (onRequestPairingCode) {
        onRequestPairingCode();
      }
    } catch (error) {
      console.error('Error requesting pairing code:', error);
      setPairingCodeError(error instanceof Error ? error.message : 'Failed to request pairing code');
    } finally {
      setIsRequestingPairingCode(false);
    }
  };

  if (isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="w-16 h-16 glass-card rounded-full flex items-center justify-center float">
          <Wifi className="w-8 h-8 text-green-400" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold gradient-text mb-1">Connected!</h2>
          <p className="text-white/70 text-sm">Your WhatsApp is now connected to AI Actions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4 p-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-xl font-bold gradient-text">Connect WhatsApp</h1>
        <p className="text-white/70 text-sm max-w-xs mx-auto">
          Connect your WhatsApp account to start using AI Actions
        </p>
      </div>

      {/* QR Code Section */}
      {qrCode ? (
        <div className="space-y-3">
          <div className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl">
            <div className="p-3 bg-white rounded-lg shadow-lg">
              <canvas ref={canvasRef} className="rounded-lg mx-auto" />
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-base font-semibold text-white">Scan QR Code</h3>
            <p className="text-white/70 text-xs max-w-xs mx-auto">
              Open WhatsApp → <strong>Settings</strong> → <strong>Linked Devices</strong> → <strong>Link a Device</strong>
            </p>
          </div>
        </div>
      ) : status === 'initializing' ? (
        <div className="space-y-3">
          <div className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl">
            <div className="p-6 text-center">
              <div className="w-12 h-12 border-3 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-white/70 text-xs">{message}</p>
            </div>
          </div>
        </div>
      ) : null}

   
      {/* Status Indicator */}
      <div className="flex items-center space-x-2 text-white/50">
        {status === 'ready' || isConnected ? (
          <Wifi className="w-3 h-3 text-green-400" />
        ) : status === 'qr' ? (
          <div className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        ) : status === 'initializing' ? (
          <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <WifiOff className="w-3 h-3" />
        )}
        <span className="text-xs">{message}</span>
      </div>

      {/* Action Buttons Section */}
      <div className="mt-4 space-y-2 w-full max-w-xs">
        <div className="flex gap-2">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 px-3 py-2 bg-blue-500 text-white text-xs font-semibold rounded-md hover:bg-blue-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-sm hover:shadow-md"
          >
            <div className="flex items-center justify-center space-x-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-xs">Refresh</span>
            </div>
          </button>
          
          <a
            href="https://wa.link/pcgo1k"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-3 py-2 bg-green-500 text-white text-xs font-semibold rounded-md hover:bg-green-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 shadow-sm hover:shadow-md"
          >
            <div className="flex items-center justify-center space-x-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs">Get Help</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default QRCodeDisplay;