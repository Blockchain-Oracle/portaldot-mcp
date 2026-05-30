import { FloatingNav } from "@/components/ui/floating-nav";
import { DocsNav } from "@/components/docs/docs-nav";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <FloatingNav />
      <div className="mx-auto flex max-w-6xl gap-10 px-4 pb-12 pt-28">
        <aside className="hidden w-52 shrink-0 lg:block">
          <DocsNav />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
