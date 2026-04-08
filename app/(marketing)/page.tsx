import { Zap, Shield, BarChart3 } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description:
      'Built on Next.js 16 with Turbopack for optimal performance and developer experience.',
  },
  {
    icon: Shield,
    title: 'Secure by Default',
    description:
      'Row-level security, RBAC, and encrypted data at rest ensure your data stays protected.',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description:
      'Track usage, monitor performance, and make data-driven decisions with built-in dashboards.',
  },
];

export default function MarketingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-background to-muted/30 px-4 py-24 text-center">
        <Badge variant="secondary" className="mb-2">
          Now in Beta
        </Badge>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          The modern platform for <span className="text-primary">growth-focused</span> teams
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Ship faster with battle-tested infrastructure, beautiful UI components, and
          production-ready integrations. Start building today.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="/auth/login">
            <Button size="lg">Get started</Button>
          </Link>
          <Link href="#features">
            <Button variant="outline" size="lg">
              Learn more
            </Button>
          </Link>
        </div>
      </section>

      <Separator />

      {/* Features Section */}
      <section id="features" className="flex flex-col gap-8 bg-muted/30 px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need</h2>
          <p className="mt-4 text-muted-foreground">
            Powerful features to help you ship production-ready software faster.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="text-center">
              <CardHeader>
                <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
                  <feature.icon className="size-6 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="flex flex-col items-center justify-center gap-6 bg-background px-4 py-24 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to get started?</h2>
        <p className="max-w-xl text-muted-foreground">
          Join thousands of teams already building on our platform. No credit card required.
        </p>
        <Link href="/auth/login">
          <Button size="lg">Start free</Button>
        </Link>
      </section>
    </div>
  );
}
