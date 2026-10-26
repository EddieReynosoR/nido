import { createBrowserRouter } from 'react-router';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import App from './App';

import { AuthProvider } from './context/AuthContext';
import { SpaceProvider } from './context/SpaceContext';
import RequireAuth from './components/RequireAuth';
import LandingPage from './pages/LandingPage';
import EmptyState from './pages/EmptyState';
import TopicNotePage from './pages/TopicNotePage';
import NotePage from './pages/NotePage';

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
                children: [
                  {
                    Component: HomePage,
                    children: [
                      { index: true, Component: EmptyState },
                      { path: 'topics/:topicId', Component: TopicNotePage },
                      { path: 'notes/:noteId', Component: NotePage },
                    ],
                  },
                ],
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
