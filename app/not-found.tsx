import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { Block404 } from "@/registry/clover-ui/404-block";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-svh items-center justify-center">
      <Block404
        description={
          <>
            Sorry, the page you were looking for doesn&apos;t exist. Try going to{" "}
            <Link href="/">
              <strong>{siteConfig.name}</strong>
            </Link>
            , or follow us on{" "}
            <a href={siteConfig.links.x} target="_blank" rel="noopener noreferrer">
              <strong>X</strong>
            </a>{" "}
            or{" "}
            <a href={siteConfig.links.github} target="_blank" rel="noopener noreferrer">
              <strong>GitHub</strong>
            </a>
            .
          </>
        }
      />
    </main>
  );
}
