import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const AdminRoute = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  return user && user.role === 'admin' ? <Outlet /> : <Navigate to="/login" replace />;
};
export default AdminRoute;