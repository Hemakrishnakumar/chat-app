import { useAuthContext } from '@/context/authContext';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';



interface PublicRouteProps {
    children: ReactNode
}

const PublicRoute = ({ children }: PublicRouteProps) => {
    const { isAuthenticated } = useAuthContext();

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default PublicRoute;
