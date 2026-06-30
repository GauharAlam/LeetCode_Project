import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store.js"
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { ClerkProvider } from "@clerk/clerk-react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key in environment variables");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <ThemeProvider>
          <BrowserRouter>
            <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/login">
              <App />
            </ClerkProvider>
          </BrowserRouter>
        </ThemeProvider>
      </Provider>
    </ErrorBoundary>
  </StrictMode>
);
