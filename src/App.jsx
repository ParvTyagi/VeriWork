import { Navigate, Route, Routes } from "react-router-dom";

import { ThemeProvider } from "./components/ThemeContext";
import { VeriWorkProvider } from "./components/VeriWorkContext";
import AdminPage from "./pages/AdminPage";
import EmployerPage from "./pages/EmployerPage";
import LandingPage from "./pages/LandingPage";
import NotFoundPage from "./pages/NotFoundPage";
import RecruiterPage from "./pages/RecruiterPage";
import VeriWorkLayout from "./pages/VeriWorkLayout";
import WorkerPage from "./pages/WorkerPage";

export default function App() {
  return (
    <ThemeProvider>
      <VeriWorkProvider>
        <Routes>
          <Route element={<VeriWorkLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/employer" element={<EmployerPage />} />
            <Route path="/worker" element={<WorkerPage />} />
            <Route path="/recruiter" element={<RecruiterPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </VeriWorkProvider>
    </ThemeProvider>
  );
}
