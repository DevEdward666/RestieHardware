export interface SearchInventoryModel {
  page: number;
  offset: number;
  limit: number;
  searchTerm: string;
  category?: string;
  brand?: string;
  filter?: string;
}
