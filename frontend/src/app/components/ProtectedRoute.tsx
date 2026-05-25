import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function ProtectedRoute({ children, roles }: { children: JSX.Element; roles?: Array<"buyer" | "farmer" | "admin"> }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
