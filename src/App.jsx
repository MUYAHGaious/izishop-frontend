import React, { useEffect } from "react";
import Routes from "./Routes";
import { ToastManager } from "./components/ui/Toast";

function App() {
  // Initialize theme on app load
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      document.documentElement.setAttribute('data-theme', settings.theme || 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  return (
    <>
      <Routes />
      <ToastManager />
    </>
  );
}

export default App;
