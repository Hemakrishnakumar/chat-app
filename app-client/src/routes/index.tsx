import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { routes } from './routes';
import type { RouteConfig } from './routes';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';



const Spinner = () => <div>Loading...</div>;

const renderRoute = (route: RouteConfig) => {
    const { path, component: Component, isPrivate, roles, deny, redirectTo, children } = route;

    const wrappedElement = isPrivate ? (
        <PrivateRoute roles={roles} deny={deny} redirectTo={redirectTo}>
            <Component />
        </PrivateRoute>
    ) : (
        <PublicRoute>
            <Component />
        </PublicRoute>
    );

    return (
        <Route key={path} path={path} element={wrappedElement}>
            {children?.map((child) => renderRoute(child))}
        </Route>
    );
};

const AppRouter = () => {
    return (
        <BrowserRouter>
            <Suspense fallback={<Spinner />}>
                <Routes>
                    {routes.map((route) => renderRoute(route))}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
};

export default AppRouter;
