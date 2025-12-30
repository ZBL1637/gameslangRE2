import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PlayerProvider } from '@/context/PlayerContext';
import { Layout } from '@/components/Layout/Layout';
import SplashScreen from '@/components/SplashScreen/SplashScreen';

const TitlePage = lazy(() => import('@/pages/TitlePage/TitlePage'));
const TutorialVillage = lazy(() => import('@/pages/TutorialVillage/TutorialVillage'));
const WorldMap = lazy(() => import('@/pages/WorldMap/WorldMap'));
const ChapterPage = lazy(() => import('@/pages/ChapterPage/ChapterPage'));
const Dictionary = lazy(() => import('@/pages/Dictionary/Dictionary'));
const Achievements = lazy(() => import('@/pages/Achievements/Achievements'));
const Quests = lazy(() => import('@/pages/Quests/Quests'));
const Lab = lazy(() => import('@/pages/Lab/Lab'));
const Profile = lazy(() => import('@/pages/Profile/Profile'));
const OriginForest = lazy(() => import('@/pages/OriginForest/OriginForest'));
const BattlePlain = lazy(() => import('@/pages/BattlePlain/BattlePlain'));
const PlayerTown = lazy(() => import('@/pages/PlayerTown/PlayerTown'));
const DataMetropolis = lazy(() => import('@/pages/DataMetropolis/DataMetropolis'));
const TranslationTower = lazy(() => import('@/pages/TranslationTower/TranslationTower'));
const FinalChapter = lazy(() => import('@/pages/FinalChapter/FinalChapter'));

/**
 * 计算生产环境下的 base 重定向目标。
 * 用于在 `vite.config.ts` 配置了非根路径 `base` 时，避免用户访问根路径导致白屏。
 */
function getProdBaseRedirectTarget(pathname: string, baseUrl: string): string | null {
  if (!import.meta.env.PROD) return null;

  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  if (normalizedBaseUrl === '/') return null;

  const baseWithoutTrailingSlash = normalizedBaseUrl.replace(/\/$/, '');
  const isUnderBase = pathname === baseWithoutTrailingSlash || pathname.startsWith(normalizedBaseUrl);

  return isUnderBase ? null : normalizedBaseUrl;
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  const prodRedirectTarget = useMemo(
    () => getProdBaseRedirectTarget(window.location.pathname, import.meta.env.BASE_URL),
    []
  );

  useEffect(() => {
    if (prodRedirectTarget) window.location.replace(prodRedirectTarget);
  }, [prodRedirectTarget]);

  if (prodRedirectTarget) return null;

  return (
    <PlayerProvider>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <Router basename={import.meta.env.BASE_URL}>
        <Layout>
          <Suspense fallback={<div style={{ padding: 24 }}>Loading...</div>}>
            <Routes>
              <Route path="/" element={<TitlePage />} />
              <Route path="/tutorial" element={<TutorialVillage />} />
              <Route path="/world-map" element={<WorldMap />} />
              <Route path="/chapter/1" element={<OriginForest />} />
              <Route path="/chapter/2" element={<BattlePlain />} />
              <Route path="/chapter/3" element={<PlayerTown />} />
              <Route path="/chapter/4" element={<DataMetropolis />} />
              <Route path="/chapter/5" element={<TranslationTower />} />
              <Route path="/chapter/final" element={<FinalChapter />} />
              <Route path="/chapter/:id" element={<ChapterPage />} />
              <Route path="/dictionary" element={<Dictionary />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/quests" element={<Quests />} />
              <Route path="/lab" element={<Lab />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </PlayerProvider>
  )
}

export default App
