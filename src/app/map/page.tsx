import { MapClientEntry } from "@/components/map/MapClientEntry";

export default async function MapPage({ searchParams }: { searchParams: Promise<{ slug?: string }> }) {
  const { slug } = await searchParams;
  return <MapClientEntry initialSlug={slug} />;
}
