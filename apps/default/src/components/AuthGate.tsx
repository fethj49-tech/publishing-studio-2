import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from 'react-oidc-context';

export function AuthGate({ children }: { children: ReactNode }) {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <p className="text-sm text-muted-foreground" role="status">
          Preparing your secure workspace...
        </p>
      </main>
    );
  }

  if (auth.error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <section className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <h1 className="font-serif text-2xl font-semibold">Sign-in needs another try</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            We could not finish connecting your account. Please try again.
          </p>
          <Button className="mt-6 min-h-11" onClick={() => void auth.signinRedirect()}>
            Try sign-in again
          </Button>
        </section>
      </main>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <section className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Seven Feathers Publishing Studio
          </p>
          <h1 className="mt-4 font-serif text-3xl font-semibold">Your publishing desk</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Sign in to enter the workspace. New visitors can choose Create one on the secure sign-in page.
          </p>
          <Button className="mt-7 min-h-11 w-full" onClick={() => void auth.signinRedirect()}>
            Sign in or create an account
          </Button>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
