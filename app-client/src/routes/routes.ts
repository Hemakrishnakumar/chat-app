
import { lazy } from 'react';
import type { LazyExoticComponent, ReactElement } from 'react';



export interface RouteConfig {
    path: string
    component: LazyExoticComponent<React.ComponentType<React.ReactElement>> | ReactElement
    isPrivate: boolean
    roles?: string[]
    deny?: (role: string) => boolean
    redirectTo?: string
    children?: RouteConfig[]
}

export const routes: RouteConfig[] = [
    {
        path: '/login',
        component: lazy(() => import('../pages/Login')),
        isPrivate: false,
    },
    {
        path: '/register',
        component: lazy(() => import('../pages/Register')),
        isPrivate: false,
    },   

    {
        path: '/',
        component: lazy(() => import('../components/AppLayout')),
        isPrivate: true,
        children: [
            {
                path: '/',
                component: lazy(() => import('../pages/Chats')),
                isPrivate: true,                
            },
            {
                path: 'meet',
                component: lazy(() => import('../pages/Meet')),
                isPrivate: true,                
            },
            {
                path: 'calendar',
                component: lazy(() => import('../pages/Calendar')),
                isPrivate: false,
            },
            {
                path: 'people',
                component: lazy(() => import('../pages/People')),
                isPrivate: false,
            },
        ],
    },
    {
        path: '/forbidden',
        component: lazy(() => import('../pages/Forbidden')),
        isPrivate: false,
    },
];
