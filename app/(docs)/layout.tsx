import { GitHubStars } from "@/components/seed/github-stars";
import { AppSidebar } from "@/components/stem/app-sidebar";
import { SiteHeader } from "@/components/stem/site-header";
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
    <div className="bg-sidebar min-h-screen">
      <SidebarProvider>
        <AppSidebar docSchema={docSchema} />
        <SidebarInset className="bg-sidebar min-w-0">
          <SiteHeader docSchema={docSchema} githubStars={<GitHubStars />} />
          {children}
        </SidebarInset>
        {toc}
      </SidebarProvider>
    </div>
  );
}
