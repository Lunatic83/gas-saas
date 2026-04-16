import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop: left panel */}
      <div className="hidden flex-1 bg-gradient-to-br from-blue-500 to-purple-600 md:block">
        <div className="flex h-full items-center justify-center text-white text-4xl font-bold">
          Brand
        </div>
      </div>

      {/* Right panel: sign-in form */}
      <div className="flex min-h-screen w-full flex-1 items-center justify-center p-6 md:w-auto md:flex-none md:p-8">
        <Card className="w-full max-w-sm shadow-md">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">Email form coming soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
