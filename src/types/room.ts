export type PropertyType = '1 BHK' | '2 BHK' | '1 Bed' | '2 Bed' | '3 Bed';
export const PropertyTypes: PropertyType[] = ['1 BHK', '2 BHK', '1 Bed', '2 Bed', '3 Bed'];


export type TenantPreference = 'Bachelor' | 'Family' | 'Girls' | 'Working';
export const TenantPreferences: TenantPreference[] = ['Bachelor', 'Family', 'Girls', 'Working'];


export interface Room {
  id: string;
  title: string;
  location: string;
  rent: number;
  propertyType: PropertyType;
  tenantPreference: TenantPreference;
  ownerContact: string;
  ownerId: string;
  images: { url: string; id: string }[];
  createdAt: Date;
}
