import React from 'react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-dark text-white">
      <header className="border-b border-dark-light">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <a href="/" className="font-bold text-xl">TwitchEmotes.ai</a>
          </div>
          <nav>
            <ul className="flex space-x-6">
              <li><a href="/create" className="hover:text-primary transition">Create</a></li>
              <li><a href="/marketplace" className="hover:text-primary transition">Marketplace</a></li>
              <li><a href="/library" className="hover:text-primary transition">My Library</a></li>
            </ul>
          </nav>
        </div>
      </header>
      <main>
        {children}
      </main>
      <footer className="bg-dark border-t border-dark-light py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-muted">&copy; {new Date().getFullYear()} TwitchEmotes.ai - All rights reserved</span>
            </div>
            <div className="flex space-x-4">
              <a href="/terms" className="text-sm text-muted hover:text-white transition">Terms</a>
              <a href="/privacy" className="text-sm text-muted hover:text-white transition">Privacy</a>
              <a href="/contact" className="text-sm text-muted hover:text-white transition">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout; 