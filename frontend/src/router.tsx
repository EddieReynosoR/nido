import { createBrowserRouter } from 'react-router';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import App from './App';

import { AuthProvider } from './context/AuthContext';
import { SpaceProvider } from './context/SpaceContext';
import RequireAuth from './components/RequireAuth';
import LandingPage from './pages/LandingPage';

export const router = createBrowserRouter([
  {
    Component: AuthProvider,
    children: [
      {
        Component: RequireAuth,
        children: [
          {
            Component: SpaceProvider,
            children: [
              {
                Component: App,
                path: '/',
                children: [{ index: true, Component: HomePage }],
              },
            ],
          },
        ],
      },
      { path: 'login', Component: LoginPage },
      { path: 'home', Component: LandingPage },
    ],
  },
]);
