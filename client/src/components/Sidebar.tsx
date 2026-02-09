import { Link, useLocation } from "wouter";
import { ScanFace, UserPlus, ShieldAlert, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Live Recognition", icon: ScanFace },
    { href: "/enroll", label: "Identity Enrollment", icon: UserPlus },
    { href: "/database", label: "Subject Database", icon: Cpu },
  ];

  return (
    <div className="w-20 md:w-64 border-r border-border bg-card/50 backdrop-blur-xl flex flex-col h-screen fixed left-0 top-0 z-50">
      <div className="p-6 border-b border-border flex items-center gap-3">
        <ShieldAlert className="w-8 h-8 text-primary animate-pulse" />
        <span className="hidden md:block font-display font-bold text-xl text-primary tracking-widest">
          SENTINEL
        </span>
      </div>

      <nav className="flex-1 py-8 flex flex-col gap-2 px-3">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-md cursor-pointer transition-all duration-200 group border border-transparent",
                location === item.href
                  ? "bg-primary/10 text-primary border-primary/50 shadow-[0_0_10px_rgba(0,255,255,0.1)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <item.icon className={cn("w-5 h-5", location === item.href && "text-primary")} />
              <span className="hidden md:block font-mono text-sm tracking-wide uppercase">
                {item.label}
              </span>
              
              {location === item.href && (
                <span className="ml-auto hidden md:block w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_5px_cyan]" />
              )}
            </div>
          </Link>
        ))}
      </nav>

      <div className="p-6 border-t border-border">
        <div className="hidden md:block text-xs font-mono text-muted-foreground">
          <p>SYSTEM STATUS: <span className="text-green-500">ONLINE</span></p>
          <p className="mt-1">V.2.0.45-BETA</p>
        </div>
      </div>
    </div>
  );
}
