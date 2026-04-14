import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BootSequence from './components/BootSequence';
import LandingPage from './components/LandingPage';

function App() {
  const [isBooted, setIsBooted] = useState(false);

  return (
    <Router>
      <div className="min-h-screen relative overflow-hidden bg-black">
        {/* CRT Effects */}
        <div className="crt-overlay" />
        <div className="vignette" />

        {!isBooted && (
          <BootSequence onComplete={() => setIsBooted(true)} />
        )}

        <div className={`transition-opacity duration-1000 ${isBooted ? 'opacity-100' : 'opacity-0'}`}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
