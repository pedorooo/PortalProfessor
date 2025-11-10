import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { Toast } from "@/components/Toast";
import ProtectedLayout from "@/components/ProtectedLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardLayout from "@/pages/DashboardLayout";
import DashboardPage from "@/pages/DashboardPage";
import StudentsPage from "@/pages/StudentsPage";
import ClassesPage from "@/pages/ClassesPage";
import ClassDetailPage from "@/pages/ClassDetailPage";
import ClassEnrolledStudentsPage from "@/pages/ClassEnrolledStudentsPage";
import ClassLessonsPage from "@/pages/ClassLessonsPage";
import ClassEvaluationConfigPage from "@/pages/ClassEvaluationConfigPage";
import EvaluationCriteriaPage from "@/pages/EvaluationCriteriaPage";

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Toast />
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {}
            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="students" element={<StudentsPage />} />
                <Route path="classes" element={<ClassesPage />} />
                <Route path="classes/:classId" element={<ClassDetailPage />} />
                <Route
                  path="classes/:classId/students"
                  element={<ClassEnrolledStudentsPage />}
                />
                <Route
                  path="classes/:classId/lessons"
                  element={<ClassLessonsPage />}
                />
                <Route
                  path="classes/:classId/evaluation-config"
                  element={<ClassEvaluationConfigPage />}
                />
                <Route
                  path="evaluation-criteria"
                  element={<EvaluationCriteriaPage />}
                />
              </Route>
            </Route>

            {}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
