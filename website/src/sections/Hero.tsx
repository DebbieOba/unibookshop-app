import React from 'react';
import { DownloadButton } from '../components/ui/DownloadButton';
import { QRCodeDisplay } from '../components/ui/QRCodeDisplay';
import { ArrowRight } from 'lucide-react';
import './Hero.css';

export const Hero: React.FC = () => {
  return (
    <section id="home" className="hero-section">
      <div className="container hero-container">
        <div className="hero-content animate-fade-in">
          <div className="hero-badge">
            <span className="badge-text">Now Available for iOS & Android</span>
          </div>
          <h1 className="hero-title">
            Your Books. Your Store. <span className="text-gradient">One Smarter Platform.</span>
          </h1>
          <p className="hero-subtitle">
            Discover books, shop with ease, and manage your bookstore from one simple platform built for readers and sellers.
          </p>
          <div className="hero-actions">
            <DownloadButton size="lg" />
            <a href="#how-it-works" className="btn btn-outline btn-lg explore-btn">
              Explore How It Works <ArrowRight size={20} />
            </a>
          </div>
        </div>
        <div className="hero-visual animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="qr-container-hero">
            <h3>Get the App in Seconds</h3>
            <QRCodeDisplay size={180} />
          </div>
        </div>
      </div>
    </section>
  );
};
