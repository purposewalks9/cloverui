import { AppleMusicCard } from "@/registry/clover-ui/apple-music-card";

export function Demo() {
  return (
    <AppleMusicCard
      urls={[
        "https://music.apple.com/us/song/blinding-lights/1499378607",
        "https://music.apple.com/us/song/levitating/1538003843",
        "https://music.apple.com/us/song/as-it-was/1615585008",
      ]}
    />
  );
}
