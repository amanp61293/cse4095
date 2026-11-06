import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import SurveyEditorPage from './pages/SurveyEditorPage'
import StudentSurveyPage from './pages/StudentSurveyPage'
import PresentSurveyPage from './pages/PresentSurveyPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/s/:slug" element={<StudentSurveyPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/surveys/new" element={<SurveyEditorPage />} />
        <Route path="/surveys/:id/edit" element={<SurveyEditorPage />} />
        <Route path="/surveys/:id/present" element={<PresentSurveyPage />} />
      </Route>
      <Route path="*" element={<main className="p-8">Page not found.</main>} />
    </Routes>
  )
}
