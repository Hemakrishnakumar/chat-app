import { useAuthContext } from '@/context/authContext';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';



interface PrivateRouteProps {
    children: ReactNode
    roles?: string[]
    deny?: (role: string) => boolean
    redirectTo?: string
}

const PrivateRoute = ({ children, roles, deny, redirectTo = '/home' }: PrivateRouteProps) => {
    const { isAuthenticated, user, loading } = useAuthContext();
    const location = useLocation();

    if (loading) return null;

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (roles && user?.role && !roles.includes(user.role)) {
        return <Navigate to="/forbidden" replace />;
    }

    if (deny && user?.role && roles && deny(user.role)) {
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
};

export default PrivateRoute;
