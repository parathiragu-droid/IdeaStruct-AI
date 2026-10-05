import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '../utils/themeContext';
import HomePage from '../pages/HomePage';
import ProjectListPage from '../pages/ProjectListPage';
import ProjectNewPage from '../pages/ProjectNewPage';
import ProjectDetailPage from '../pages/ProjectDetailPage';
import HealthCheckPage from '../pages/HealthCheckPage';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectListPage />} />
          <Route path="/projects/new" element={<ProjectNewPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/health" element={<HealthCheckPage />} />
          <Route path="/system-status" element={<Navigate to="/health" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
