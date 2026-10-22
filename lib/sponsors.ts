import { siteConfig } from "@/lib/config";

export const SPONSORS_TAG = "sponsors";

export const sponsorLogin = new URL(siteConfig.links.sponsor).pathname
  .split("/")
  .filter(Boolean)[1];

export interface Sponsor {
  login: string;
  name: string;
  avatarUrl: string;
  url: string;
  monthly: number;
  tier: string | null;
}

export interface SponsorTier {
  id: string;
  name: string;
  monthly: number;
  description: string;
  oneTime: boolean;
}

export interface SponsorData {
  connected: boolean;
  sponsors: Sponsor[];
  tiers: SponsorTier[];
}

type Entity = { login: string; name: string | null; avatarUrl: string; url: string } | null;

interface SponsorsQueryResult {
  data?: {
    user: {
      sponsorsListing: {
        tiers: {
          nodes: {
            id: string;
            name: string;
            monthlyPriceInDollars: number;
            description: string;
            isOneTime: boolean;
            isCustomAmount: boolean;
          }[];
        };
      } | null;
      sponsorshipsAsMaintainer: {
        nodes: {
          privacyLevel: "PUBLIC" | "PRIVATE";
          sponsorEntity: Entity;
          tier: { name: string; monthlyPriceInDollars: number } | null;
        }[];
      };
    } | null;
  };
}

const query = `query ($login: String!) {
  user: repositoryOwner(login: $login) {
    ... on Sponsorable {
      sponsorsListing {
        tiers(first: 20) {
          nodes { id name monthlyPriceInDollars description isOneTime isCustomAmount }
        }
      }
      sponsorshipsAsMaintainer(first: 100, activeOnly: true) {
        nodes {
          privacyLevel
          sponsorEntity {
            ... on User { login name avatarUrl url }
            ... on Organization { login name avatarUrl url }
          }
          tier { name monthlyPriceInDollars }
        }
      }
    }
  }
}`;

export async function getSponsors(): Promise<SponsorData> {
  const token = process.env.GITHUB_SPONSORS_TOKEN;
  if (!token || !sponsorLogin) return { connected: false, sponsors: [], tiers: [] };

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { login: sponsorLogin } }),
      next: { revalidate: 3600, tags: [SPONSORS_TAG] },
    });
    if (!res.ok) return { connected: false, sponsors: [], tiers: [] };
    const { data } = (await res.json()) as SponsorsQueryResult;
    const user = data?.user;
    if (!user?.sponsorshipsAsMaintainer) return { connected: false, sponsors: [], tiers: [] };

    const tiers = (user.sponsorsListing?.tiers.nodes ?? [])
      .filter((tier) => !tier.isCustomAmount)
      .map((tier) => ({
        id: tier.id,
        name: tier.name,
        monthly: tier.monthlyPriceInDollars,
        description: tier.description,
        oneTime: tier.isOneTime,
      }))
      .sort((a, b) => Number(a.oneTime) - Number(b.oneTime) || a.monthly - b.monthly);

    const sponsors = user.sponsorshipsAsMaintainer.nodes
      .filter((node) => node.privacyLevel === "PUBLIC" && node.sponsorEntity)
      .map((node) => {
        const entity = node.sponsorEntity!;
        return {
          login: entity.login,
          name: entity.name || entity.login,
          avatarUrl: entity.avatarUrl,
          url: entity.url,
          monthly: node.tier?.monthlyPriceInDollars ?? 0,
          tier: node.tier?.name ?? null,
        };
      })
      .sort((a, b) => b.monthly - a.monthly);

    return { connected: true, sponsors, tiers };
  } catch {
    return { connected: false, sponsors: [], tiers: [] };
  }
}
