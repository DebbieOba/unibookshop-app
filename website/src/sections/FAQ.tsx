import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './FAQ.css';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`faq-item ${isOpen ? 'open' : ''}`}>
      <button 
        className="faq-question" 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>{question}</span>
        {isOpen ? <ChevronUp size={20} className="faq-icon" /> : <ChevronDown size={20} className="faq-icon" />}
      </button>
      <div className="faq-answer">
        <p>{answer}</p>
      </div>
    </div>
  );
};

export const FAQ: React.FC = () => {
  const faqs = [
    {
      question: "What is this app?",
      answer: "A mobile bookstore platform for discovering, buying and managing books."
    },
    {
      question: "Who can use it?",
      answer: "Both customers looking for books and bookstore sellers who want to manage their operations."
    },
    {
      question: "Can any bookstore use the platform?",
      answer: "Yes. The platform is designed to support different bookstores rather than being permanently tied to one specific store."
    },
    {
      question: "Can bookstore sellers manage inventory?",
      answer: "Yes, sellers have full access to inventory management, tracking stock quantities and total book copies."
    },
    {
      question: "Can sellers track profit and loss?",
      answer: "Yes, the app includes a comprehensive financial dashboard to monitor revenue, expenses, profit, and loss."
    },
    {
      question: "Can customers buy books through the app?",
      answer: "Yes, customers can add books to their cart and complete purchases directly within the app."
    },
    {
      question: "How do I download the app?",
      answer: "You can scan the QR code at the top or bottom of this page, or click the Download App button to get the correct version for your device."
    }
  ];

  return (
    <section id="faq" className="faq-section bg-alt">
      <div className="container">
        <div className="section-header text-center mb-8">
          <h2>Frequently Asked Questions</h2>
        </div>
        
        <div className="faq-container">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
};
