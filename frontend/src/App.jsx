import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext.jsx';
import Layout from './components/Layout.jsx';
import Landing from './pages/Landing.jsx';
import Quiz from './pages/Quiz.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Products from './pages/Products.jsx';
import IngredientChecker from './pages/IngredientChecker.jsx';
import RoutineBuilder from './pages/RoutineBuilder.jsx';
import Capstone from './pages/Capstone.jsx';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/products" element={<Layout><Products /></Layout>} />
          <Route path="/ingredient-checker" element={<Layout><IngredientChecker /></Layout>} />
          <Route path="/routine-builder" element={<Layout><RoutineBuilder /></Layout>} />
          <Route path="/capstone" element={<Layout><Capstone /></Layout>} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
