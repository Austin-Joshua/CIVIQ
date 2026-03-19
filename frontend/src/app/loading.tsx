export default function AppLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        Loading CIVIQ...
      </div>
    </div>
  );
}

