import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedLayout from "@/components/ProtectedLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardLayout from "@/pages/DashboardLayout";
import DashboardPage from "@/pages/DashboardPage";
import StudentsPage from "@/pages/StudentsPage";
import ClassesPage from "@/pages/ClassesPage";
import EvaluationCriteriaPage from "@/pages/EvaluationCriteriaPage";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Rotas protegidas envolvidas pelo layout */}
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="classes" element={<ClassesPage />} />
              <Route
                path="evaluation-criteria"
                element={<EvaluationCriteriaPage />}
              />
            </Route>
          </Route>

          {/* Rota padrão */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
