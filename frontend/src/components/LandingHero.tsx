import { Link } from 'react-router';
import { Button } from './ui/button';

export default function LandingHero() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-16 pt-8 text-center sm:pt-12">
      <h1 className="mx-auto mt-6 max-w-3xl text-balance text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
        All Your Learning.{' '}
        <span className="text-muted-foreground dark:text-muted-foreground/60">
          One Single Place.
        </span>
      </h1>

      <p className="mx-auto mt-6 max-w-md text-pretty text-base leading-relaxed text-muted-foreground">
        Keep every note, resource, and study session organized in one place — so
        you can focus on learning, not searching.
      </p>

      <div className="mt-8">
        <Button
          size="lg"
          className="rounded-full px-7 text-base font-medium"
          asChild
        >
          <Link to="/signup">Sign up</Link>
        </Button>
      </div>
    </section>
  );
}
