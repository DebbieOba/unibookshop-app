import React from 'react';
import { DownloadButton } from '../components/ui/DownloadButton';
import './DetailedSections.css';

export const DetailedSections: React.FC = () => {
  return (
    <>
      {/* For Customers */}
      <section id="customers" className="detailed-section">
        <div className="container">
          <div className="detailed-grid">
            <div className="detailed-content">
              <h2>A Better Way to Find Your Next Book</h2>
              <p className="detailed-subtitle">
                BOOKDECK gives you a premium shopping experience to discover and purchase books from multiple sellers.
              </p>
              <ul className="feature-list">
                <li>Browse curated categories and subcategories</li>
                <li>Search books and filter results easily</li>
                <li>View detailed book information including preview pages</li>
                <li>Check real-time book availability and stock</li>
                <li>Add to cart and checkout securely</li>
                <li>View complete order history</li>
                <li>Receive timely order notifications</li>
              </ul>
              <div className="detailed-action">
                <DownloadButton size="lg" />
              </div>
            </div>
            <div className="detailed-visual">
              <div className="mockup-frame">
                <img
                  src="/images/Screenshot_20260824_162313_CURRICULA.jpg"
                  alt="BOOKDECK customer home and discover screen"
                  className="mockup-screenshot"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Sellers */}
      <section id="sellers" className="detailed-section bg-alt">
        <div className="container">
          <div className="detailed-grid reverse-mobile">
            <div className="detailed-visual">
              <div className="mockup-frame admin-frame">
                <img
                  src="/images/Screenshot_20260824_161336_CURRICULA.jpg"
                  alt="BOOKDECK seller admin dashboard screen"
                  className="mockup-screenshot"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="detailed-content">
              <h2>Run Your Bookstore Smarter</h2>
              <p className="detailed-subtitle">
                Manage your operations, inventory, and sales from one unified platform.
              </p>
              <ul className="feature-list">
                <li><strong>Catalogue Management:</strong> Add and update books easily.</li>
                <li><strong>Inventory Management:</strong> Track stock quantities and total book copies.</li>
                <li><strong>Order Management:</strong> Monitor incoming and completed orders.</li>
                <li><strong>Sales Tracking:</strong> See sales activity and revenue in real-time.</li>
                <li><strong>Financial Dashboard:</strong> Track Revenue, COGS, Gross Profit, Expenses, and Net Profit.</li>
                <li><strong>Low Stock Alerts:</strong> Know exactly when books need restocking.</li>
                <li><strong>Business Insights:</strong> Understand your best-selling and most profitable books.</li>
              </ul>
              <div className="detailed-action">
                <DownloadButton size="lg" variant="secondary" />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Visual Previews */}
      <section className="detailed-section">
        <div className="container">
          <div className="section-header text-center mb-8">
            <h2>Know How Your Bookstore Is Performing</h2>
            <p>A powerful Financial Dashboard designed to give you clarity on your business.</p>
          </div>
          <div className="dashboard-preview-wrapper">
            <div className="dashboard-preview-frame">
              <img
                src="/images/Screenshot_20260824_161729_CURRICULA.jpg"
                alt="BOOKDECK financial dashboard showing revenue, expenses, profit and best sellers"
                className="dashboard-preview-img"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
