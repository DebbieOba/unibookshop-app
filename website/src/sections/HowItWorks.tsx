import React from 'react';
import './HowItWorks.css';

export const HowItWorks: React.FC = () => {
  const customerSteps = [
    { num: '01', title: 'Discover', desc: 'Search or browse the bookstore catalogue.' },
    { num: '02', title: 'Choose', desc: 'Open a book and view its complete information.' },
    { num: '03', title: 'Add to Cart', desc: 'Select the books you want.' },
    { num: '04', title: 'Purchase', desc: 'Complete your order and track it from the app.' },
  ];

  const sellerSteps = [
    { num: '01', title: 'Create Your Bookstore', desc: 'Set up your bookstore information.' },
    { num: '02', title: 'Add Your Books', desc: 'Add books with detailed information and stock quantities.' },
    { num: '03', title: 'Manage Your Store', desc: 'Monitor inventory, orders and sales.' },
    { num: '04', title: 'Understand Your Business', desc: 'Use the financial dashboard to track revenue, expenses and profit/loss.' },
  ];

  return (
    <section id="how-it-works" className="hiw-section">
      <div className="container">
        <div className="section-header text-center mb-8">
          <h2>How It Works</h2>
        </div>
        
        <div className="hiw-grid">
          <div className="hiw-column">
            <h3 className="hiw-column-title">For Customers</h3>
            <div className="hiw-steps">
              {customerSteps.map((step, idx) => (
                <div key={idx} className="hiw-step">
                  <div className="step-num">{step.num}</div>
                  <div className="step-content">
                    <h4>{step.title}</h4>
                    <p>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="hiw-column">
            <h3 className="hiw-column-title">For Bookstore Sellers</h3>
            <div className="hiw-steps">
              {sellerSteps.map((step, idx) => (
                <div key={idx} className="hiw-step">
                  <div className="step-num seller-num">{step.num}</div>
                  <div className="step-content">
                    <h4>{step.title}</h4>
                    <p>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
