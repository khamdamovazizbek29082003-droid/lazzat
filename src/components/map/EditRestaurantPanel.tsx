"use client";

import { useT } from "@/components/providers/LocaleProvider";
import { RestaurantEditForm } from "@/components/shared/RestaurantEditForm";
import type { AdminRestaurant } from "@/lib/data/types";
import { Panel } from "./Panel";

export function EditRestaurantPanel({
  restaurant,
  onClose,
  onSaved,
  onDeleted,
}: {
  restaurant: AdminRestaurant;
  onClose: () => void;
  onSaved: (r: AdminRestaurant) => void;
  onDeleted: () => void;
}) {
  const t = useT();
  return (
    <Panel title={t("edit_restaurant_title")} subtitle={restaurant.names.uz} onClose={onClose} side="right">
      <RestaurantEditForm restaurant={restaurant} onSaved={onSaved} onDeleted={onDeleted} />
    </Panel>
  );
}
