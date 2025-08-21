import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:pl-80">
      <div className="container flex h-16 items-center pl-16 lg:pl-4">
        <div className="flex flex-1 items-center justify-between space-x-2">
          <div className="w-full flex-1">
            {/* Page content will determine the header content */}
          </div>
          <nav className="flex items-center">
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
