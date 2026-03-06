import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const ProtectedRoute = ({ allowedRole = 'any' }) => {
  const { isAuthenticated, role, foodPartner, loading } = useAuth();

  if (loading) return null; // Or a loading spinner

  if (!isAuthenticated) return <Navigate to="/" replace />;
  
  if (allowedRole !== 'any' && allowedRole !== role) {
    if (role === 'partner') return <Navigate to={`/foodpartner/${foodPartner.foodPartnerId}`} replace />;
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
