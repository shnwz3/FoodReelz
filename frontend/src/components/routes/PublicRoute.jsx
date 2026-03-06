import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const PublicRoute = () => {
  const { isAuthenticated, role, foodPartner, loading } = useAuth();

  if (loading) return null; // Or a loading spinner

  if (isAuthenticated) {
    if (role === 'user') return <Navigate to="/home" replace />;
    if (role === 'partner') return <Navigate to={`/foodpartner/${foodPartner.foodPartnerId}`} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
