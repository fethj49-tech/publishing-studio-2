import { lazy } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { FloatingAgentChat } from '@/components/blocks';
import { AuthGate } from '@/components/AuthGate';
import { GenesisSection } from '@/lib/genesis';
import { GenesisAuth } from '@/lib/genesis-auth';
import { GUIDE_AGENT_ID, GUIDE_PUBLIC_AGENT_ID } from '@/lib/open-press-config';

const HomePage = lazy(() => import('@/pages/HomePage'));
const StoryPage = lazy(() => import('@/pages/StoryPage'));
const StudioPage = lazy(() => import('@/pages/StudioPage'));

function PublicGuideChat() {
  const { pathname } = useLocation();
  return (
    <div hidden={pathname !== '/studio'}>
      <FloatingAgentChat
        agentId={GUIDE_AGENT_ID}
        publicAgentId={GUIDE_PUBLIC_AGENT_ID}
        title="Seven Feathers Publishing Guide"
        suggestions={['How can I publish a written work?', 'What rights checks should I make?', 'Which low-cost path fits my work?']}
        emptyDescription="Ask about publishing paths, permissions, and preparing your work for readers."
      />
    </div>
  );
}

export default function App() {
  document.title = 'Seven Feathers Publishing Studio';
  return (
    <GenesisAuth>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<GenesisSection name="Reading room"><HomePage /></GenesisSection>} />
          <Route path="/story/:slug" element={<GenesisSection name="Story"><StoryPage /></GenesisSection>} />
          <Route path="/studio" element={<GenesisSection name="Publishing studio"><AuthGate><StudioPage /></AuthGate></GenesisSection>} />
          <Route path="*" element={<GenesisSection name="Not found"><main className="mx-auto max-w-2xl px-6 py-20"><h1 className="font-serif text-3xl font-semibold">This page is not on the shelf.</h1><a className="mt-4 inline-flex min-h-11 items-center text-primary underline" href="/">Return to Seven Feathers</a></main></GenesisSection>} />
        </Routes>
        <PublicGuideChat />
      </BrowserRouter>
    </GenesisAuth>
  );
}
