import Link from "next/link";
import { Github, Linkedin } from "lucide-react";

export function Footer() {
  const GITHUB_USERNAME = "md-anas-sabah";
  const LINKEDIN_PROFILE = "md-anas-sabah";
  const YOUR_NAME = "MD ANAS SABAH";

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 max-w-7xl flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by{" "}
            <Link
              href={`https://github.com/${GITHUB_USERNAME}`}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              {YOUR_NAME}
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href={`https://github.com/${GITHUB_USERNAME}`}
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </Link>
          <Link
            href={`https://linkedin.com/in/${LINKEDIN_PROFILE}`}
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Linkedin className="h-5 w-5" />
            <span className="sr-only">LinkedIn</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
