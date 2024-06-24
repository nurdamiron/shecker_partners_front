// src/routes/Router.jsx
import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';
import DashboardLayout from 'src/layouts/dashboard';
import PrivateRoute from './private_router';

export const IndexPage = lazy(() => import('src/pages/app'));
export const FridgePage = lazy(() => import('src/pages/fridge'));
export const FridgeDetailPage = lazy(() => import('src/pages/fridge-detail'));
export const UserPage = lazy(() => import('src/pages/user'));
export const LoginPage = lazy(() => import('src/pages/login'));
export const RegisterPage = lazy(() => import('src/pages/register'));
export const VerificationPage = lazy(() => import('src/pages/verification'));
export const AssortmentPage = lazy(() => import('src/pages/assortment'));
export const ProductPage = lazy(() => import('src/pages/product'));
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
        { path: 'product', element: <ProductPage /> },
        { path: 'fridge', element: <FridgePage /> },
        { path: 'fridge-detail/:id', element: <FridgeDetailPage /> }, 
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
