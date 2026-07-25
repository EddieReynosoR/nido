import { createBrowserRouter } from 'react-router';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import App from './App';

import { AuthProvider } from './context/AuthContext';
import RequireAuth from './components/RequireAuth';

export const router = createBrowserRouter([
  {
    Component: AuthProvider,
    children: [
      {
        Component: RequireAuth,
        children: [
          {
            Component: App,
            path: '/',
            children: [{ index: true, Component: HomePage }],
          },
        ],
      },
      { path: 'login', Component: LoginPage },
    ],
  },
]);
