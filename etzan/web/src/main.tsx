import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { LanguageProvider } from "./lib/i18n";
import "./theme/theme.css";

// BrowserRouter, not HashRouter: routes behind a "#" fragment collapse to a
// single indexable URL, so the three tools could never rank on their own. The
// basename comes from Vite's base (set from the repo name at build time), and
// GitHub Pages serves 404.html — a copy of index.html — for deep links.
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);
