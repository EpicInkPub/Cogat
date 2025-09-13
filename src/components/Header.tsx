import { Link, useLocation } from "react-router-dom";
import { GraduationCap, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              CogAT Mastery
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Home
            </Link>
            <Link
              to="/packages"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/packages') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Test Packages
            </Link>
            <Link
              to="/bonuses"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/bonuses') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Free Bonuses
            </Link>
            <Button variant="default" asChild className="bg-gradient-primary hover:shadow-glow">
              <Link to="/packages">Get Started</Link>
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 space-y-3 border-t">
            <Link
              to="/"
              className={`block py-2 text-sm font-medium transition-colors hover:text-primary ${
                isActive('/') ? 'text-primary' : 'text-muted-foreground'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/packages"
              className={`block py-2 text-sm font-medium transition-colors hover:text-primary ${
                isActive('/packages') ? 'text-primary' : 'text-muted-foreground'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Test Packages
            </Link>
            <Link
              to="/bonuses"
              className={`block py-2 text-sm font-medium transition-colors hover:text-primary ${
                isActive('/bonuses') ? 'text-primary' : 'text-muted-foreground'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Free Bonuses
            </Link>
            <Button variant="default" asChild className="w-full bg-gradient-primary">
              <Link to="/packages" onClick={() => setMobileMenuOpen(false)}>
                Get Started
              </Link>
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
}