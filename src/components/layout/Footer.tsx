
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose md:text-left text-muted-foreground">
            &copy; {new Date().getFullYear()} Dom Script Automator. Todos os direitos reservados.
          </p>
        </div>
        <nav className="flex gap-4">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            Termos
          </Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            Privacidade
          </Link>
          <a 
            href="https://github.com/your-repo/dom-script-forge" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
