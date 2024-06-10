// src/routes/Router.jsx
import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';
import DashboardLayout from 'src/layouts/dashboard';
import PrivateRoute from './private_router';

export const IndexPage = lazy(() => import('src/pages/app'));
export const FridgePage = lazy(() => import('src/pages/fridge'));
export const UserPage = lazy(() => import('src/pages/user'));
export const LoginPage = lazy(() => import('src/pages/login'));
export const RegisterPage = lazy(() => import('src/pages/register'));
export const VerificationPage = lazy(() => import('src/pages/verification'));
export const FridgeProductsPage = lazy(() => import('src/pages/fridge-product'));
export const AssortmentPage = lazy(() => import('src/pages/assortment'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));

export default function Router() {
  const routes = useRoutes([
    {
      element: (
        <PrivateRoute>
          <DashboardLayout>
            <Suspense fallback={<div>Loading...</div>}>
              <Outlet />
            </Suspense>
          </DashboardLayout>
        </PrivateRoute>
      ),
      children: [
        { element: <IndexPage />, index: true },
        { path: 'user', element: <UserPage /> },
        { path: 'assortment', element: <AssortmentPage /> },
        { path: 'fridge', element: <FridgePage /> },
        { path: 'fridge-product', element: <FridgeProductsPage /> },
      ],
    },
    {
      path: 'login',
      element: <LoginPage />,
    },
    {
      path: 'register',
      element: <RegisterPage />,
    },
    {
      path: 'verification',
      element: <VerificationPage />,
    },
    {
      path: '404',
      element: <Page404 />,
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}
