import React from 'react';
import { DownloadButton } from '../components/ui/DownloadButton';
import { QRCodeDisplay } from '../components/ui/QRCodeDisplay';
import './CTA.css';

export const CTA: React.FC = () => {
  return (
    <section className="cta-section">
      <div className="container">
        <div className="cta-container">
          <div className="cta-content">
            <h2>Ready to Make Bookstore Management Simpler?</h2>
            <p>Download the app and discover a smarter way to buy and manage books.</p>
            <div className="cta-actions">
              <DownloadButton size="lg" />
            </div>
          </div>
          <div className="cta-visual desktop-only">
            <QRCodeDisplay size={140} className="cta-qr" />
          </div>
        </div>
      </div>
    </section>
  );
};
