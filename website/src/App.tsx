import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Hero } from './sections/Hero';
import { Features } from './sections/Features';
import { HowItWorks } from './sections/HowItWorks';
import { Screenshots } from './sections/Screenshots';
import { DetailedSections } from './sections/DetailedSections';
import { FAQ } from './sections/FAQ';
import { CTA } from './sections/CTA';
import './App.css';

function App() {
  return (
    <div className="app-wrapper">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Screenshots />
        <DetailedSections />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

export default App;
