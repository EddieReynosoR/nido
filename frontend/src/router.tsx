import { createBrowserRouter } from 'react-router';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import App from './App';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    children: [
      { index: true, Component: HomePage },
      { path: 'login', Component: LoginPage },
    ],
  },
]);
