export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-muted/50 to-muted p-4">
      {children}
    </div>
  );
}
