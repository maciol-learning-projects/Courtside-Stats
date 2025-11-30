
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VisualizationPage from './pages/VisualizationPage';
import Home from './pages/Home';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/visualizations" element={<VisualizationPage />} />
          {/* Add more routes as needed */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;