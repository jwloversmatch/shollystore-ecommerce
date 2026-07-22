import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { RootState } from "../store";

const ProtectedRoute = () => {
  const { user } = useSelector((s: RootState) => s.auth);
  const location = useLocation();

  if (!user) {
    // Remember where the user was trying to go
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;