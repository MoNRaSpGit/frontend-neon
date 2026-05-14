import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { App } from "./app/App";
import { AppUpdateNotice } from "./shared/components/AppUpdateNotice";
import "./styles/toastify-overrides.css";

const queryClient = new QueryClient();
const Router = import.meta.env.MODE === "github-pages" ? HashRouter : BrowserRouter;

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    if (import.meta.env.PROD) {
      void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`);
      return;
    }

    // In dev, stale service workers break Vite HMR and can keep old update prompts on screen.
    void navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
      .then(() => caches.keys())
      .then((cacheKeys) => Promise.all(cacheKeys.map((cacheKey) => caches.delete(cacheKey))))
      .catch(() => {
        // Ignore cleanup failures in development; the page can still boot normally.
      });
  });
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router>
        <App />
        <AppUpdateNotice />
        <ToastContainer
          position="bottom-right"
          autoClose={false}
          hideProgressBar
          newestOnTop
          closeButton
          pauseOnFocusLoss={false}
          pauseOnHover
          draggable={false}
          theme="light"
        />
      </Router>
    </QueryClientProvider>
  </React.StrictMode>
);
