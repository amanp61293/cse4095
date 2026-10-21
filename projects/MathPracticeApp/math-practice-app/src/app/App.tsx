import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PageLayout } from '../components/common/PageLayout';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { PracticeSetupPage } from '../pages/PracticeSetupPage';
import { PracticeSessionPage } from '../pages/PracticeSessionPage';
import { PlaceholderPage } from '../pages/PlaceholderPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PageLayout />}>
          <Route index element={<HomePage />} />
          <Route path="practice/setup" element={<PracticeSetupPage />} />
          <Route path="practice/session" element={<PracticeSessionPage />} />
          <Route
            path="practice/summary"
            element={
              <PlaceholderPage
                title="Session Summary"
                description="Your practice results will appear here in a later phase."
              />
            }
          />
          <Route
            path="statistics"
            element={
              <PlaceholderPage
                title="Your Statistics"
                description="Performance tracking will appear here after we add practice sessions."
              />
            }
          />
          <Route
            path="settings"
            element={
              <PlaceholderPage
                title="Settings"
                description="Your preferences will be available here in a later phase."
              />
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
