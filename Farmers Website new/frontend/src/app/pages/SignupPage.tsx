import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function SignupPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to apply page since direct signup is disabled
    navigate("/apply", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to application page...</p>
      </div>
    </div>
  );
}
