'use client';

import { GitHubIcon, GoogleIcon, SignInForm, authLocalization } from 'better-auth-ui';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';

export default function SignInPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop: left panel with hero image */}
      <div className="hidden flex-1 md:block">
        <Image
          src="/images/sign-in-hero.jpg"
          alt="Abstract geometric background"
          fill
          className="object-cover"
        />
      </div>

      {/* Right panel: sign-in form */}
      <div className="flex min-h-screen w-full flex-1 items-center justify-center p-6 md:w-auto md:flex-none md:p-8">
        <div className="w-full max-w-sm">
          <Card className="shadow-md">
            <CardContent className="flex flex-col gap-6 p-6">
              <SignInForm
                localization={authLocalization}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
                redirectTo="/dashboard"
              />

              {/* OAuth divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or continue with</span>
                </div>
              </div>

              {/* OAuth buttons */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
                  onClick={() => {
                    const url = new URL('/api/auth/sign-in/social', window.location.origin);
                    url.searchParams.set('provider', 'google');
                    window.location.href = url.toString();
                  }}
                >
                  <GoogleIcon className="size-4" />
                  Google
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
                  onClick={() => {
                    const url = new URL('/api/auth/sign-in/social', window.location.origin);
                    url.searchParams.set('provider', 'github');
                    window.location.href = url.toString();
                  }}
                >
                  <GitHubIcon className="size-4" />
                  GitHub
                </button>
              </div>

              {/* Footer links */}
              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/sign-up" className="underline underline-offset-4">
                  Sign up
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
