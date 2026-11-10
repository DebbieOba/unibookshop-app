import React from 'react';
import { Button } from './Button';
import { ANDROID_APK_DOWNLOAD_URL, APP_VERSION } from '../../config/constants';
import { Smartphone } from 'lucide-react';

interface DownloadButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({ 
  className, 
  variant = 'primary', 
  size = 'md',
  fullWidth
}) => {
  return (
    <a 
      href={ANDROID_APK_DOWNLOAD_URL} 
      download="BOOKDECK-v1.0.0.apk"
      rel="noopener noreferrer" 
      style={{ textDecoration: 'none', width: fullWidth ? '100%' : 'auto' }}
    >
      <Button 
        variant={variant} 
        size={size} 
        className={className}
        fullWidth={fullWidth}
        leftIcon={<Smartphone size={size === 'sm' ? 16 : 20} />}
      >
        Download Android App ({APP_VERSION})
      </Button>
    </a>
  );
};
