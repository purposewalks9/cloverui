import createMDX from "@next/mdx";
import codeImport from "remark-code-import";
import rehypeShiki from "@shikijs/rehype";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

const nextConfig = {
  trailingSlash: false,
  outputFileTracingIncludes: {
    "/og": ["./app/fonts/Geist-*.ttf"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https" as const,
        hostname: "pbs.twimg.com",
      },
      {
        protocol: "https" as const,
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "motion",
      "@base-ui/react",
      "@icons-pack/react-simple-icons",
    ],
  },
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  redirects: async () => {
    return [
      {
        source: "/components/model-picker",
        destination: "/docs/model-switcher",
        permanent: true,
      },
      {
        source: "/docs/model-picker",
        destination: "/docs/model-switcher",
        permanent: true,
      },
      {
        source: "/components/model-menu",
        destination: "/docs/model-switcher",
        permanent: true,
      },
      {
        source: "/docs/model-menu",
        destination: "/docs/model-switcher",
        permanent: true,
      },
      {
        source: "/components/:slug",
        destination: "/docs/:slug",
        permanent: true,
      },
    ];
  },
  headers: async () => {
    return [
      {
        source: "/logos/:path*",
        headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
      },
    ];
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [[codeImport, { cache: false }], remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "wrap",
          properties: {
            className: ["subheading-anchor"],
            ariaLabel: "Link to section",
          },
        },
      ],
      [
        rehypeShiki,
        {
          themes: {
            light: "github-light",
            dark: "github-dark",
          },
          defaultColor: false,
        },
      ],
    ],
  },
});

export default withMDX(nextConfig);
