import Link from "next/link";
import { PanelLeft, Briefcase } from "lucide-react";

import { Button } from "./ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SIDEBAR_LINKS } from "@/lib/constants";
import SidebarToggle from "./SidebarToggle";
import { AgentChatTrigger } from "./AgentChatTrigger";
import { ThemeToggle } from "./ThemeToggle";

async function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <nav className="grid gap-6 text-lg font-medium">
            <SheetClose asChild>
              <Link
                href="/dashboard"
                className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
              >
                <Briefcase className="h-5 w-5 transition-all group-hover:scale-110" />
                <span className="sr-only">CareerSync</span>
              </Link>
            </SheetClose>
            {SIDEBAR_LINKS.map((item) => {
              // Only show dev-only items in development mode
              if (item.devOnly && process.env.NODE_ENV !== "development") {
                return null;
              }
              return (
                <SheetClose asChild key={item.label}>
                  <Link
                    href={item.route}
                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </SheetClose>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
      <SidebarToggle />
      <div className="flex items-center gap-2">
        <h1 className="font-semibold text-base tracking-tight">
          CareerSync<span className="hidden sm:inline text-muted-foreground font-normal"> · Career Platform</span>
        </h1>
      </div>
      <div className="relative ml-auto flex items-center gap-2">
        <ThemeToggle />
        <AgentChatTrigger />
      </div>
    </header>
  );
}

export default Header;
