import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { DownloadButton } from './ui/DownloadButton';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Screenshots', href: '#screenshots' },
    { name: 'For Customers', href: '#customers' },
    { name: 'For Sellers', href: '#sellers' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-container">
        <a href="#home" className="navbar-logo">
          <img src="/assets/BOOKDECK.png" alt="BOOKDECK Logo" className="logo-img" onError={(e) => {
            // Fallback if logo not found
            (e.target as HTMLImageElement).style.display = 'none';
            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
          }} />
          <span className="logo-text hidden">BOOKDECK</span>
        </a>

        {/* Desktop Nav */}
        <div className="navbar-links desktop-only">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="nav-link">
              {link.name}
            </a>
          ))}
        </div>

        <div className="navbar-actions desktop-only">
          <DownloadButton size="sm" />
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-btn mobile-only"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-inner">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              className="mobile-nav-link"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </a>
          ))}
          <div className="mobile-nav-actions">
            <DownloadButton fullWidth />
          </div>
        </div>
      </div>
    </nav>
  );
};
