import React from 'react';
import './Footer.css';
import { DownloadButton } from './ui/DownloadButton';

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-brand">
          <div className="footer-logo-wrap">
            <img src="/assets/BOOKDECK.png" alt="BOOKDECK Logo" className="footer-logo" onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}/>
            <span className="logo-text hidden">BOOKDECK</span>
          </div>
          <p className="footer-description">
            A smarter way to discover, buy, and manage books. Built for both customers and bookstore sellers.
          </p>
        </div>

        <div className="footer-links">
          <div className="footer-column">
            <h4>Quick Links</h4>
            <a href="#home">Home</a>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
          </div>
          <div className="footer-column">
            <h4>Solutions</h4>
            <a href="#customers">For Customers</a>
            <a href="#sellers">For Sellers</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="footer-column">
            <h4>Get the App</h4>
            <DownloadButton size="sm" variant="outline" className="footer-download-btn" />
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} BOOKDECK. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
