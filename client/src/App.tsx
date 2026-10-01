import {
  lazy,
  Suspense
} from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Navbar from "./components/Navbar";
import "./App.css";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Jobs = lazy(() => import("./pages/Jobs"));
const Applicants = lazy(() => import("./pages/Applicants"));
const Profile = lazy(() => import("./pages/Profile"));

function ProtectedRoute({
  children
}: {
  children: React.ReactNode;
}) {
  const token = localStorage.getItem("token");

  return token ? children : <Navigate to="/login" replace />;
}

function LoadingScreen() {
  return (
    <main className="page">
      <div className="empty-state">
        <h3>Loading SmartHire...</h3>
        <p>Please wait.</p>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <Dashboard />
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <Jobs />
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="/applicants"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <Applicants />
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <Profile />
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
