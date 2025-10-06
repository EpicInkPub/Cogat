import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-muted border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="text-sm font-semibold">CogAT Test Prep Mastery</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/analytics" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Analytics
            </Link>
            <Link to="/data-export" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Data Export
            </Link>
          </div>
          <div className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} All rights reserved. Empowering young minds for success.
          </div>
        </div>
      </div>
    </footer>
  );
}