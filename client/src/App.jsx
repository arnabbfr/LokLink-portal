import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CitizenPortal from './pages/CitizenPortal';
import AuthorityPortal from './pages/AuthorityPortal';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<CitizenPortal />} />
          <Route path="/authority" element={<AuthorityPortal />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
