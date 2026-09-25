import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { APP_DOWNLOAD_URL } from '../../config/constants';
import './QRCodeDisplay.css';

interface QRCodeDisplayProps {
  size?: number;
  className?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ size = 200, className }) => {
  return (
    <div className={`qr-code-wrapper ${className || ''}`}>
      <div className="qr-code-inner">
        <QRCodeSVG 
          value={APP_DOWNLOAD_URL} 
          size={size}
          level="H"
          includeMargin={true}
          fgColor="#151A24"
          bgColor="#FFFFFF"
        />
      </div>
      <p className="qr-code-text">Scan this QR code with your phone to download the app.</p>
    </div>
  );
};
