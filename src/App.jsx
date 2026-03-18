import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProfileProvider, useUserProfile } from './contexts/UserProfileContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ResultPage from './pages/ResultPage';
import ComparePage from './pages/ComparePage';
import HistoryPage from './pages/HistoryPage';
import OnboardingScreen from './components/OnboardingScreen';

function AppRoutes() {
  const { showOnboarding } = useUserProfile();
  if (showOnboarding) return <OnboardingScreen />;
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <UserProfileProvider>
        <AppRoutes />
      </UserProfileProvider>
    </ThemeProvider>
  );
}
