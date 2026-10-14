import React, { useState } from 'react';
import { Settings as SettingsIcon, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Settings = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
        aria-label="Settings"
      >
        <SettingsIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-20">
            <div className="py-1">
              <button
                onClick={() => {
                  toggleTheme();
                  setIsOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isDarkMode ? (
                  <>
                    <Sun className="w-4 h-4 mr-2" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 mr-2" />
                    Dark Mode
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Settings; 