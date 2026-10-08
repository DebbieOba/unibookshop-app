import React from 'react';
import { ShoppingCart, Package, TrendingUp, Bell, LayoutGrid } from 'lucide-react';
import './Features.css';

interface FeatureTile {
  icon: React.ReactNode;
  title: string;
  blurb: string;
  image: string;
  area: string;
}

const features: FeatureTile[] = [
  {
    icon: <LayoutGrid size={20} />,
    title: 'Browse & Shop',
    blurb: 'Thousands of titles, one tap away.',
    image: 'Screenshot_20260824_162410_CURRICULA.jpg',
    area: 'browse',
  },
  {
    icon: <ShoppingCart size={20} />,
    title: 'Fast Checkout',
    blurb: 'Cart to order in seconds.',
    image: 'Screenshot_20260824_162343_CURRICULA.jpg',
    area: 'cart',
  },
  {
    icon: <Package size={20} />,
    title: 'Live Inventory',
    blurb: 'Always know what’s in stock.',
    image: 'Screenshot_20260824_161640_CURRICULA.jpg',
    area: 'inventory',
  },
  {
    icon: <TrendingUp size={20} />,
    title: 'Financial Insights',
    blurb: 'Revenue, profit and loss at a glance.',
    image: 'Screenshot_20260824_161729_CURRICULA.jpg',
    area: 'financial',
  },
  {
    icon: <Bell size={20} />,
    title: 'Instant Alerts',
    blurb: 'Never miss a low-stock warning.',
    image: 'Screenshot_20260824_162650_CURRICULA.jpg',
    area: 'alerts',
  },
  {
    icon: <LayoutGrid size={20} />,
    title: 'Admin Control',
    blurb: 'Run your whole store from one screen.',
    image: 'Screenshot_20260824_161336_CURRICULA.jpg',
    area: 'admin',
  },
];

export const Features: React.FC = () => {
  return (
    <section id="features" className="features-section bg-alt">
      <div className="container">
        <div className="section-header text-center mb-8">
          <h2>Built for Readers & Sellers</h2>
          <p>One app, every bookstore essential.</p>
        </div>

        <div className="bento-grid">
          {features.map((f) => (
            <div key={f.area} className={`bento-tile bento-${f.area}`}>
              <img src={`/images/${f.image}`} alt={f.title} loading="lazy" />
              <div className="bento-overlay" />
              <div className="bento-content">
                <span className="bento-icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.blurb}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
