
import React from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { Role } from './types';
import HomeView from './components/HomeView';
import AdminView from './components/AdminView';
import UserView from './components/UserView';
import { LogoIcon } from './components/icons/LogoIcon';

const App: React.FC = () => {
  const [view, setView] = useLocalStorage<Role>('app_view', 'home');

  const renderView = () => {
    switch (view) {
      case 'admin':
        return <AdminView setView={setView} />;
      case 'user':
        return <UserView setView={setView} />;
      case 'home':
      default:
        return <HomeView setView={setView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="bg-white shadow-md p-4 flex items-center justify-center">
        <LogoIcon className="h-10 w-10 text-blue-600 mr-3" />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-700 tracking-tight">
          Cincinnati Hotel AI Assistant
        </h1>
      </header>
      <main className="p-4 md:p-8">
        {renderView()}
      </main>
      <footer className="text-center p-4 text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Tauga AI Development. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
