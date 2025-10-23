
import React from 'react';
import { Role } from '../types';
import { AdminIcon } from './icons/AdminIcon';
import { UserIcon } from './icons/UserIcon';

interface HomeViewProps {
  setView: (view: Role) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ setView }) => {
  return (
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">Welcome!</h2>
      <p className="text-lg text-gray-600 mb-8">Please select your role to continue.</p>
      <div className="grid md:grid-cols-2 gap-8">
        <button
          onClick={() => setView('admin')}
          className="group flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border-2 border-transparent hover:border-blue-500 transform hover:-translate-y-1"
        >
          <AdminIcon className="h-16 w-16 text-blue-500 mb-4 transition-transform duration-300 group-hover:scale-110" />
          <h3 className="text-xl font-bold text-gray-800">Admin</h3>
          <p className="text-gray-500 mt-2">Upload hotel information and view statistics.</p>
        </button>
        <button
          onClick={() => setView('user')}
          className="group flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border-2 border-transparent hover:border-green-500 transform hover:-translate-y-1"
        >
          <UserIcon className="h-16 w-16 text-green-500 mb-4 transition-transform duration-300 group-hover:scale-110" />
          <h3 className="text-xl font-bold text-gray-800">Regular User</h3>
          <p className="text-gray-500 mt-2">Chat with our AI assistant to ask questions.</p>
        </button>
      </div>
    </div>
  );
};

export default HomeView;
