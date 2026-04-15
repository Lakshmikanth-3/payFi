"use client";

import Link from "next/link";
import { ExternalLink, MessageCircle, Code } from "lucide-react";

interface FooterLink {
  name: string;
  href: string;
  external?: boolean;
}

const footerLinks: Record<string, FooterLink[]> = {
  Product: [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Protocol", href: "#protocol" },
    { name: "Programs", href: "/programs" },
  ],
  Developers: [
    { name: "Documentation", href: "#" },
    { name: "API Reference", href: "#" },
    { name: "FlowScript Guide", href: "#" },
    { name: "Status", href: "#" },
  ],
  Network: [
    { name: "HashKey Testnet", href: "https://testnet.hsk.xyz", external: true },
    { name: "Explorer", href: "https://testnet-explorer.hsk.xyz", external: true },
    { name: "Chain ID 133", href: "#" },
    { name: "HSP Engine", href: "#" },
  ],
  Legal: [
    { name: "Privacy", href: "#" },
    { name: "Terms", href: "#" },
    { name: "Security", href: "#" },
  ],
};

export function FooterSection() {
  return (
    <footer className="relative border-t" style={{ borderColor: "oklch(0.25 0.02 260)" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-16">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
            {/* Brand Column */}
            <div className="col-span-2">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center bg-primary/10">
                  <img 
                    src="/logo.png" 
                    alt="PayFi" 
                    className="w-7 h-7 object-cover rounded-lg"
                  />
                </div>
                <span
                  className="font-semibold text-lg tracking-tight"
                  style={{ color: "oklch(0.96 0.005 240)" }}
                >
                  PayFi
                </span>
              </Link>

              <p
                className="text-sm leading-relaxed mb-6"
                style={{ color: "oklch(0.55 0.03 240)" }}
              >
                The world&apos;s first Natural Language Payment Programming Protocol on HashKey Chain.
              </p>

              {/* Social Links */}
              <div className="flex gap-3">
                <a
                  href="#"
                  className="transition-colors hover:text-foreground"
                  style={{ color: "oklch(0.55 0.03 240)" }}
                  aria-label="Twitter"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="transition-colors hover:text-foreground"
                  style={{ color: "oklch(0.55 0.03 240)" }}
                  aria-label="GitHub"
                >
                  <Code className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Link Columns */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title} className="col-span-1">
                <h3
                  className="text-sm font-medium mb-4"
                  style={{ color: "oklch(0.96 0.005 240)" }}
                >
                  {title}
                </h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.name}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm flex items-center gap-1 transition-colors hover:text-foreground"
                          style={{ color: "oklch(0.55 0.03 240)" }}
                        >
                          {link.name}
                          <ExternalLink size={11} />
                        </a>
                      ) : (
                        <a
                          href={link.href}
                          className="text-sm transition-colors hover:text-foreground"
                          style={{ color: "oklch(0.55 0.03 240)" }}
                        >
                          {link.name}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="py-6 border-t flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderColor: "oklch(0.25 0.02 260)" }}
        >
          <p className="text-sm font-mono" style={{ color: "oklch(0.55 0.03 240)" }}>
            © {new Date().getFullYear()} PayFi Protocol. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-sm" style={{ color: "oklch(0.55 0.03 240)" }}>
            <span className="flex items-center gap-2 font-mono">
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "oklch(0.85 0.2 130)" }}
              />
              HashKey Testnet Active
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
