import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PageLayout } from '../components/common/PageLayout';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { PracticeSetupPage } from '../pages/PracticeSetupPage';
import { PracticeSessionPage } from '../pages/PracticeSessionPage';
import { SessionSummaryPage } from '../pages/SessionSummaryPage';
import { PlaceholderPage } from '../pages/PlaceholderPage';
import { StatisticsPage } from '../pages/StatisticsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PageLayout />}>
          <Route index element={<HomePage />} />
          <Route path="practice/setup" element={<PracticeSetupPage />} />
          <Route path="practice/session" element={<PracticeSessionPage />} />
          <Route path="practice/summary" element={<SessionSummaryPage />} />
          <Route path="statistics" element={<StatisticsPage />} />
          <Route path="settings" element={<PlaceholderPage title="Settings" description="Your preferences will be available here in a later phase." />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
