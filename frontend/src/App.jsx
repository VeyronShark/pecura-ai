import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Landing from './pages/Landing.jsx';
import Quiz from './pages/Quiz.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Products from './pages/Products.jsx';
import IngredientChecker from './pages/IngredientChecker.jsx';
import RoutineBuilder from './pages/RoutineBuilder.jsx';

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing page without layout */}
        <Route path="/" element={<Landing />} />
        
        {/* Pages with layout */}
        <Route path="/quiz" element={<Layout><Quiz /></Layout>} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/products" element={<Layout><Products /></Layout>} />
        <Route path="/ingredient-checker" element={<Layout><IngredientChecker /></Layout>} />
        <Route path="/routine-builder" element={<Layout><RoutineBuilder /></Layout>} />
        
        {/* Catch all route */}
        <Route path="*" element={<Landing />} />
      </Routes>
    </Router>
  );
}

export default App;
