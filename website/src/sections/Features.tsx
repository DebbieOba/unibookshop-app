import React from 'react';
import { Search, Info, ShoppingCart, LayoutGrid, TrendingUp, Bell, BookOpen, Package } from 'lucide-react';
import './Features.css';

export const Features: React.FC = () => {
  const features = [
    {
      icon: <LayoutGrid />,
      title: 'Discover Books',
      description: 'Browse a wide range of books organized into categories and subcategories.',
    },
    {
      icon: <Search />,
      title: 'Search & Filter',
      description: 'Find books quickly without going shelf-to-shelf.',
    },
    {
      icon: <Info />,
      title: 'Detailed Information',
      description: 'View author, ISBN, publisher, edition, publication year, pages, and description.',
    },
    {
      icon: <ShoppingCart />,
      title: 'Easy Shopping',
      description: 'Add books to cart and complete purchases conveniently.',
    },
    {
      icon: <Package />,
      title: 'Inventory Management',
      description: 'Bookstore sellers can monitor books, quantities and available copies.',
    },
    {
      icon: <BookOpen />,
      title: 'Sales Management',
      description: 'Track orders, sales and successful transactions.',
    },
    {
      icon: <TrendingUp />,
      title: 'Financial Dashboard',
      description: 'Monitor revenue, cost of goods, expenses, gross profit, net profit and loss.',
    },
    {
      icon: <Bell />,
      title: 'Low Stock Alerts',
      description: 'Receive notifications when book stock falls below the low-stock threshold.',
    },
  ];

  return (
    <section id="features" className="features-section bg-alt">
      <div className="container">
        <div className="section-header text-center mb-8">
          <h2>Everything You Need in One Bookstore App</h2>
          <p>Powerful features designed for both book lovers and bookstore owners.</p>
        </div>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
