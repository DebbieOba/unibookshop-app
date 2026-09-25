import React from 'react';
import { Button } from './Button';
import { APP_DOWNLOAD_URL, ANDROID_DOWNLOAD_URL, IOS_DOWNLOAD_URL } from '../../config/constants';
import { Download, Apple, Smartphone } from 'lucide-react';

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
  const getDownloadInfo = () => {
    // Basic OS detection for frontend
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

    if (/android/i.test(userAgent)) {
      return { url: ANDROID_DOWNLOAD_URL, label: 'Get it on Android', icon: <Smartphone size={size === 'sm' ? 16 : 20} /> };
    }

    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      return { url: IOS_DOWNLOAD_URL, label: 'Download on App Store', icon: <Apple size={size === 'sm' ? 16 : 20} /> };
    }

    return { url: APP_DOWNLOAD_URL, label: 'Download App', icon: <Download size={size === 'sm' ? 16 : 20} /> };
  };

  const { url, label, icon } = getDownloadInfo();

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', width: fullWidth ? '100%' : 'auto' }}>
      <Button 
        variant={variant} 
        size={size} 
        className={className}
        fullWidth={fullWidth}
        leftIcon={icon}
      >
        {label}
      </Button>
    </a>
  );
};
