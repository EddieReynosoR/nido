import { Outlet } from 'react-router';

function App() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 p-4">
      <Outlet />
    </main>
  );
}

export default App;
