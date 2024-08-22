export interface Inventories {
  id: number;
  category_id: number;
  location_id: number;
  name: string;
  description: string | null;
  image: string | null;
}

export type InventoriesWithoutId = Omit<Inventories, 'id'>;

export interface Resources {
  id: number;
  name: string;
  description: string | null;
}

export type ResourcesWithoutId = Omit<Resources, 'id'>;