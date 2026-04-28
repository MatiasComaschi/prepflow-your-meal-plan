import { Link } from "@tanstack/react-router";
import { Flame, CalendarDays } from "lucide-react";

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/80 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md items-center justify-around px-6 py-3">
        <NavItem to="/" icon={<Flame className="h-5 w-5" />} label="Discover" exact />
        <NavItem to="/planner" icon={<CalendarDays className="h-5 w-5" />} label="Planner" />
      </div>
    </nav>
  );
}

function NavItem({
  to,
  icon,
  label,
  exact,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  exact?: boolean;
}) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: !!exact }}
      className="group flex flex-col items-center gap-1 px-4 py-1 text-muted-foreground data-[status=active]:text-primary"
    >
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </Link>
  );
}
