import { notFound } from "next/navigation";
import { getRestaurant, listNearby } from "@/lib/data/client";
import { RestaurantDetailView } from "@/components/restaurant/RestaurantDetailView";

export default async function RestaurantPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const restaurant = await getRestaurant(slug);
  if (!restaurant) notFound();

  const nearby = (await listNearby({ city: restaurant.cityName })).filter((r) => r.slug !== restaurant.slug).slice(0, 3);

  return <RestaurantDetailView restaurant={restaurant} nearby={nearby} />;
}
