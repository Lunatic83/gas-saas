'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Log server errors for debugging; don't expose details to users
  if (error.digest) {
    console.error('Server error:', error.digest);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-muted/50 to-muted p-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>
            We&apos;re sorry — something unexpected happened. Please try again.
          </CardDescription>
        </CardHeader>
        <div className="flex justify-center gap-2 pb-4">
          <Button onClick={reset}>Try again</Button>
          <Link href="/">
            <Button variant="outline">Back to home</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
