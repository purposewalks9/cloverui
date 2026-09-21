import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getDocSchema } from "@/lib/doc";

export default async function ComponentsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const docSchema = await getDocSchema();

  return (
    <SidebarProvider>
      <AppSidebar docSchema={docSchema} />
      <SidebarInset>
        <SiteHeader docSchema={docSchema} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
