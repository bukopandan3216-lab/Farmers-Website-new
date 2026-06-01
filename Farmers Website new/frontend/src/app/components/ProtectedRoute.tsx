import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function ProtectedRoute({ children, roles }: { children: JSX.Element; roles?: Array<string> }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.some((role) => role.toUpperCase() === user.role)) return <Navigate to="/" replace />;
  return children;
}
