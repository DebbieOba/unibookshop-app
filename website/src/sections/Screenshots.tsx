import React, { useState } from 'react';
import './Screenshots.css';

type Theme = 'dark' | 'light';
type Role = 'customer' | 'seller';

interface Screen {
  file: string;
  caption: string;
}

interface ScreenGroup {
  label: string;
  screens: Screen[];
}

type ScreenData = Record<Role, ScreenGroup>;

const SCREEN_DATA: Record<Theme, ScreenData> = {
  dark: {
    customer: {
      label: 'Customer',
      screens: [
        { file: 'Screenshot_20260824_162313_CURRICULA.jpg', caption: 'Home & Discover' },
        { file: 'Screenshot_20260824_162410_CURRICULA.jpg', caption: 'Book Store' },
        { file: 'Screenshot_20260824_162323_CURRICULA.jpg', caption: 'Syllabus Tracking' },
        { file: 'Screenshot_20260824_162343_CURRICULA.jpg', caption: 'Cart' },
        { file: 'Screenshot_20260824_162116_CURRICULA.jpg', caption: 'Sign Up' },
      ],
    },
    seller: {
      label: 'Seller / Admin',
      screens: [
        { file: 'Screenshot_20260824_161336_CURRICULA.jpg', caption: 'Admin Dashboard' },
        { file: 'Screenshot_20260824_161554_CURRICULA.jpg', caption: 'Books Catalogue' },
        { file: 'Screenshot_20260824_161640_CURRICULA.jpg', caption: 'Inventory' },
        { file: 'Screenshot_20260824_161729_CURRICULA.jpg', caption: 'Financial Dashboard' },
        { file: 'Screenshot_20260824_161627_CURRICULA.jpg', caption: 'Departments' },
      ],
    },
  },
  light: {
    customer: {
      label: 'Customer',
      screens: [
        { file: 'Screenshot_20260825_111319_CURRICULA.jpg', caption: 'Book Store' },
        { file: 'Screenshot_20260825_111346_CURRICULA.jpg', caption: 'Course Materials' },
        { file: 'Screenshot_20260825_111123_CURRICULA.jpg', caption: 'Home & Discover' },
        { file: 'Screenshot_20260825_111424_CURRICULA.jpg', caption: 'Favourites' },
        { file: 'Screenshot_20260825_111358_CURRICULA.jpg', caption: 'Orders' },
      ],
    },
    seller: {
      label: 'Seller / Admin',
      screens: [
        { file: 'Screenshot_20260825_110303_CURRICULA.jpg', caption: 'Admin Dashboard' },
        { file: 'Screenshot_20260825_110438_CURRICULA.jpg', caption: 'Books Catalogue' },
        { file: 'Screenshot_20260825_110504_CURRICULA.jpg', caption: 'Inventory' },
        { file: 'Screenshot_20260825_110413_CURRICULA.jpg', caption: 'Orders' },
        { file: 'Screenshot_20260825_110642_CURRICULA.jpg', caption: 'Sales Tracking' },
      ],
    },
  },
};

interface PhoneThumbnailProps {
  screen: Screen;
  active: boolean;
  onClick: () => void;
  index: number;
}

const PhoneThumbnail: React.FC<PhoneThumbnailProps> = ({ screen, active, onClick, index }) => (
  <div
    className={`phone-mockup ${active ? 'phone-mockup--active' : ''}`}
    style={{ '--delay': `${index * 0.08}s` } as React.CSSProperties}
    onClick={onClick}
    role="button"
    tabIndex={0}
    aria-label={`Preview: ${screen.caption}`}
    onKeyDown={(e) => e.key === 'Enter' && onClick()}
  >
    <div className="phone-shell">
      <div className="phone-notch" />
      <div className="phone-screen">
        <img src={`/images/${screen.file}`} alt={screen.caption} loading="lazy" />
      </div>
      <div className="phone-home-btn" />
    </div>
    <span className="phone-caption">{screen.caption}</span>
  </div>
);

export const Screenshots: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [activeRole, setActiveRole] = useState<Role>('customer');
  const [activeIndex, setActiveIndex] = useState(0);

  const currentGroup = SCREEN_DATA[theme][activeRole];
  const activeScreen = currentGroup.screens[activeIndex];

  const handleRoleChange = (role: Role) => {
    setActiveRole(role);
    setActiveIndex(0);
  };

  const handleThemeChange = (t: Theme) => {
    setTheme(t);
    setActiveIndex(0);
  };

  return (
    <section id="screenshots" className="screenshots-section">
      <div className="container">
        {/* Header */}
        <div className="section-header text-center mb-8">
          <h2>See It in Action</h2>
          <p>A polished experience in both dark and light mode — explore every screen.</p>
        </div>

        {/* Controls */}
        <div className="screenshots-controls">
          {/* Role tabs */}
          <div className="role-tabs" role="tablist" aria-label="View by role">
            <button
              id="tab-customer"
              role="tab"
              aria-selected={activeRole === 'customer'}
              className={`role-tab ${activeRole === 'customer' ? 'role-tab--active' : ''}`}
              onClick={() => handleRoleChange('customer')}
            >
              👤 Customer
            </button>
            <button
              id="tab-seller"
              role="tab"
              aria-selected={activeRole === 'seller'}
              className={`role-tab ${activeRole === 'seller' ? 'role-tab--active' : ''}`}
              onClick={() => handleRoleChange('seller')}
            >
              🏪 Seller / Admin
            </button>
          </div>

          {/* Theme toggle */}
          <div className="theme-toggle" role="group" aria-label="Color theme">
            <button
              id="theme-dark"
              className={`theme-btn ${theme === 'dark' ? 'theme-btn--active' : ''}`}
              onClick={() => handleThemeChange('dark')}
            >
              🌙 Dark
            </button>
            <button
              id="theme-light"
              className={`theme-btn ${theme === 'light' ? 'theme-btn--active' : ''}`}
              onClick={() => handleThemeChange('light')}
            >
              ☀️ Light
            </button>
          </div>
        </div>

        {/* Main Showcase */}
        <div className="screenshots-showcase">
          {/* Featured large phone */}
          <div className="featured-phone-wrapper">
            <div className={`featured-phone featured-phone--${theme}`}>
              <div className="featured-phone__shell">
                <div className="featured-phone__bar" />
                <div className="featured-phone__screen">
                  <img
                    key={activeScreen.file}
                    src={`/images/${activeScreen.file}`}
                    alt={activeScreen.caption}
                    className="featured-phone__img"
                  />
                </div>
                <div className="featured-phone__home" />
              </div>
            </div>
            <div className="featured-caption">
              <span className="featured-caption__badge">{currentGroup.label}</span>
              <strong className="featured-caption__title">{activeScreen.caption}</strong>
            </div>
          </div>

          {/* Thumbnail strip */}
          <div className="thumbnail-strip">
            <p className="thumbnail-strip__label">Tap a screen to preview</p>
            <div className="thumbnail-grid">
              {currentGroup.screens.map((screen, i) => (
                <PhoneThumbnail
                  key={screen.file}
                  screen={screen}
                  active={activeIndex === i}
                  onClick={() => setActiveIndex(i)}
                  index={i}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Onboarding Banner */}
        <div className="onboarding-banner">
          <div className="onboarding-banner__text">
            <h3>Beautiful onboarding experience</h3>
            <p>Get up and running in seconds with a clean, guided setup flow.</p>
          </div>
          <div className="onboarding-screens">
            {(['onboarding2.jpg', 'onboarding3.jpg', 'onboarding1.jpg'] as const).map((f, i) => (
              <div
                className="onboarding-phone"
                key={f}
                style={{ '--i': i } as React.CSSProperties}
              >
                <img src={`/images/${f}`} alt={`Onboarding step ${i + 1}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
