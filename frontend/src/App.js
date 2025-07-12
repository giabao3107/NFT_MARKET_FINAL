import React from 'react';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Web3Provider } from './contexts/Web3Context';
import { NFTProvider } from './contexts/NFTContext';
import { ToastProvider } from './components/common/Toast';

import theme from './theme';

// Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import Create from './pages/Create';
import Creator from './pages/Creator';
import Profile from './pages/Profile';
import NFTDetail from './pages/NFTDetail';
import Help from './pages/help/Help';
import Settings from './pages/settings/Settings';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <QueryClientProvider client={queryClient}>
        <Web3Provider>
          <NFTProvider>
            <ToastProvider>
              <Router>
                <ErrorBoundary>
                  <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                    <Header />
                    <main style={{ flex: 1 }}>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/marketplace" element={<Marketplace />} />
                        <Route path="/create" element={<Create />} />
                        <Route path="/creator" element={<Creator />} />
                        <Route path="/profile/:address?" element={<Profile />} />
                        <Route path="/profile/:address/favorites" element={<Profile />} />
                        <Route path="/profile/:address/created" element={<Profile />} />
                        <Route path="/profile/:address/collections" element={<Profile />} />
                        <Route path="/profile/:address/activity" element={<Profile />} />
                        <Route path="/nft/:id" element={<NFTDetail />} />
                        <Route path="/help" element={<Help />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="*" element={<div>404 - Page Not Found</div>} />
                      </Routes>
                    </main>
                    <Footer />
                  </div>

                </ErrorBoundary>
              </Router>
            </ToastProvider>
          </NFTProvider>
        </Web3Provider>
      </QueryClientProvider>
    </ChakraProvider>
  );
}

export default App;