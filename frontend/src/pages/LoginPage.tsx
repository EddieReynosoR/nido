import LoginForm from '@/components/LoginForm';
import { Toaster } from 'sonner';

export default function LoginPage() {
  return (
    <>
      <main className="flex min-h-svh items-center justify-center bg-muted/30 p-4">
        <LoginForm />
      </main>
      <Toaster />
    </>
  );
}
