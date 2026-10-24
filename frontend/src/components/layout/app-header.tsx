import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export function AppHeader() {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <header className="sticky top-0 z-50 flex h-12 shrink-0 items-center border-b bg-background/80 px-4 backdrop-blur-md">
      <SidebarTrigger className="-ml-1" />
    </header>
  );
}
