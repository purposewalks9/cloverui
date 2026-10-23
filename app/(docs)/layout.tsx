import { AppSidebar } from "@/components/layout/app-sidebar";
import { DocsHeader } from "@/components/layout/docs-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getDocSchema } from "@/lib/doc";

export default async function DocsLayout({
  children,
  toc,
}: Readonly<{
  children: React.ReactNode;
  toc: React.ReactNode;
}>) {
  const docSchema = await getDocSchema();

  return (
    <div className="bg-sidebar rich-strokes min-h-screen">
      <SidebarProvider>
        <AppSidebar docSchema={docSchema} />
        <SidebarInset className="bg-sidebar min-w-0">
          <DocsHeader docSchema={docSchema} />
          {children}
        </SidebarInset>
        {toc}
      </SidebarProvider>
    </div>
  );
}
