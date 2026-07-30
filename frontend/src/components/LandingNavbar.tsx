import { BookText } from 'lucide-react';
import { Button } from './ui/button';
import { Link } from 'react-router';
import ThemeToogle from './ThemeToogle';

export default function LandingNavbar() {
  return (
    <header className="w-full">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <BookText className="h-6 w-6 text-foreground" aria-hidden="true" />
          <span className="text-lg font-semibold tracking-tight">Nido</span>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login">Login</Link>
          <Button className="rounded-full px-5 font-medium" asChild>
            <Link to="/signup">Sign up</Link>
          </Button>
          <ThemeToogle />
        </div>
      </nav>
    </header>
  );
}
