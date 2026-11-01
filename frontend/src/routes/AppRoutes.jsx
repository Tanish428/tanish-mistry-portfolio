import { Routes, Route } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import HomePage from '../pages/public/HomePage.jsx';
import ProjectDetailPage from '../pages/public/ProjectDetailPage.jsx';
import NotFoundPage from '../pages/public/NotFoundPage.jsx';
import LoginPage from '../pages/admin/LoginPage.jsx';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage.jsx';
import ProfileManager from '../pages/admin/ProfileManager.jsx';
import ProjectManager from '../pages/admin/ProjectManager.jsx';
import SkillCategoryManager from '../pages/admin/SkillCategoryManager.jsx';
import SkillManager from '../pages/admin/SkillManager.jsx';
import ExperienceManager from '../pages/admin/ExperienceManager.jsx';
import EducationManager from '../pages/admin/EducationManager.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Portfolio Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects/:slug" element={<ProjectDetailPage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Protected Admin CMS Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="profile" element={<ProfileManager />} />
          <Route path="projects" element={<ProjectManager />} />
          <Route path="skill-categories" element={<SkillCategoryManager />} />
          <Route path="skills" element={<SkillManager />} />
          <Route path="experience" element={<ExperienceManager />} />
          <Route path="education" element={<EducationManager />} />
          <Route path="*" element={<AdminDashboardPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
