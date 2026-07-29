import LandingHero from '@/components/LandingHero';
import LandingNavbar from '@/components/LandingNavbar';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <LandingNavbar />
      <LandingHero />
    </main>
  );
}
