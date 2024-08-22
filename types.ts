export interface Inventories {
  id: number;
  category_id: number;
  location_id: number;
  name: string;
  description: string | null;
  image: string | null;
  created_at?: string;
}

export interface InventoriesMutation extends Inventories {
  id: number;
  name: string;
  category_id: number;
  category_name: string;
  location_id: number;
  location_name: string;
  created_at?: string;
}

export type InventoriesWithoutId = Omit<Inventories, 'id'>;

export interface Resources {
  id: number;
  name: string;
  description: string | null;
}

export type ResourcesWithoutId = Omit<Resources, 'id'>;