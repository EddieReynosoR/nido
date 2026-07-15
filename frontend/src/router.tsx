import { createBrowserRouter } from 'react-router';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import App from './App';

import { AuthProvider } from './context/AuthContext';

export const router = createBrowserRouter([
  {
    Component: AuthProvider,
    children: [
      {
        path: '/',
        Component: App,
        children: [{ index: true, Component: HomePage }],
      },
      { path: 'login', Component: LoginPage },
    ],
  },
]);
