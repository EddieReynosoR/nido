import { Outlet } from 'react-router';
import { Toaster } from 'sonner';

function App() {
  return (
    <>
      <main className="flex min-h-svh items-center justify-center bg-muted/30 p-4">
        <Outlet />
      </main>
      <Toaster />
    </>
  );
}

export default App;
