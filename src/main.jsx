import { createRoot } from "react-dom/client";
import "./index.scss";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import AuthPage from "./pages/AuthPage";
import MainPage from "./pages/MainPage";
import { useAuth } from "./hooks/useAuth";
import React from "react";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div>Завантаження...</div>;
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthPage />,
  },
  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <MainPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/home" replace />,
  },
]);

root.render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);
