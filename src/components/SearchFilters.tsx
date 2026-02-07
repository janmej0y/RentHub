'use client';

import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { MapPin, IndianRupee, Building, Users, Filter, X } from 'lucide-react';
import type { RoomFilter } from '@/lib/roomService';
import { useState, useEffect } from 'react';
import { PropertyTypes, TenantPreferences } from '@/types/room';
import { formatCurrency } from '@/lib/utils';
import { Separator } from './ui/separator';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Amenities, FurnishingStatuses, SortBy } from '@/lib/roomService';

// ... (imports)

interface SearchFiltersProps {
  initialFilters: RoomFilter;
  onFilterChange: (filters: Partial<RoomFilter>) => void;
}

export function SearchFilters({
  onFilterChange,
  initialFilters,
}: SearchFiltersProps) {
  const [location, setLocation] = useState(initialFilters.location);
  const [priceRange, setPriceRange] = useState(initialFilters.priceRange);
  const [propertyType, setPropertyType] = useState(initialFilters.propertyType);
  const [tenantPreference, setTenantPreference] = useState(
    initialFilters.tenantPreference
  );
  const [amenities, setAmenities] = useState(initialFilters.amenities);
  const [furnishingStatus, setFurnishingStatus] = useState(
    initialFilters.furnishingStatus
  );
  const [sortBy, setSortBy] = useState(initialFilters.sortBy);

  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange({ location });
    }, 500);
    return () => clearTimeout(handler);
  }, [location, onFilterChange]);

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value as [number, number]);
  };

  const applyPriceFilter = () => {
    onFilterChange({ priceRange });
  };

  const handlePropertyTypeChange = (type: typeof PropertyTypes[0]) => {
    const newTypes = propertyType.includes(type)
      ? propertyType.filter(t => t !== type)
      : [...propertyType, type];
    setPropertyType(newTypes);
    onFilterChange({ propertyType: newTypes });
  };

  const handleTenantPreferenceChange = (
    type: typeof TenantPreferences[0]
  ) => {
    const newPrefs = tenantPreference.includes(type)
      ? tenantPreference.filter(p => p !== type)
      : [...tenantPreference, type];
    setTenantPreference(newPrefs);
    onFilterChange({ tenantPreference: newPrefs });
  };

  const handleAmenityChange = (amenity: typeof Amenities[0]) => {
    const newAmenities = amenities.includes(amenity)
      ? amenities.filter(a => a !== amenity)
      : [...amenities, amenity];
    setAmenities(newAmenities);
    onFilterChange({ amenities: newAmenities });
  };

  const handleFurnishingStatusChange = (
    status: typeof FurnishingStatuses[0]
  ) => {
    const newStatus = furnishingStatus.includes(status)
      ? furnishingStatus.filter(s => s !== status)
      : [...furnishingStatus, status];
    setFurnishingStatus(newStatus);
    onFilterChange({ furnishingStatus: newStatus });
  };

  const handleSortByChange = (value: SortBy) => {
    setSortBy(value);
    onFilterChange({ sortBy: value });
  };

  const clearFilters = () => {
    setLocation('');
    setPriceRange([0, 50000]);
    setPropertyType([]);
    setTenantPreference([]);
    setAmenities([]);
    setFurnishingStatus([]);
    setSortBy('date_desc');
    onFilterChange({
      location: '',
      priceRange: [0, 50000],
      propertyType: [],
      tenantPreference: [],
      amenities: [],
      furnishingStatus: [],
      sortBy: 'date_desc',
    });
  };

  const hasActiveFilters =
    location ||
    priceRange[0] !== 0 ||
    priceRange[1] !== 50000 ||
    propertyType.length > 0 ||
    tenantPreference.length > 0 ||
    amenities.length > 0 ||
    furnishingStatus.length > 0;

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 rounded-lg border bg-card p-4 shadow-sm">
      <div className="relative w-full md:flex-1">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search by location (e.g., Bengaluru)"
          className="pl-10"
          value={location}
          onChange={e => setLocation(e.target.value)}
        />
      </div>
      <div className="flex w-full md:w-auto items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start md:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-6">
              <div>
                <Label className="mb-4 flex items-center gap-2 text-sm font-medium">
                  <IndianRupee className="h-4 w-4" /> Price Range
                </Label>
                <Slider
                  min={0}
                  max={50000}
                  step={1000}
                  value={priceRange}
                  onValueChange={handlePriceChange}
                  onValueCommit={applyPriceFilter}
                />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>{formatCurrency(priceRange[0])}</span>
                  <span>{formatCurrency(priceRange[1])}+</span>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="mb-4 flex items-center gap-2 text-sm font-medium">
                  <Building className="h-4 w-4" /> Property Type
                </Label>
                <div className="space-y-2">
                  {PropertyTypes.map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`prop-${type}`}
                        checked={propertyType.includes(type)}
                        onCheckedChange={() => handlePropertyTypeChange(type)}
                      />
                      <Label
                        htmlFor={`prop-${type}`}
                        className="font-normal"
                      >
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <Label className="mb-4 flex items-center gap-2 text-sm font-medium">
                  <Users className="h-4 w-4" /> Tenant Preference
                </Label>
                <div className="space-y-2">
                  {TenantPreferences.map(pref => (
                    <div key={pref} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tenant-${pref}`}
                        checked={tenantPreference.includes(pref)}
                        onCheckedChange={() => handleTenantPreferenceChange(pref)}
                      />
                      <Label
                        htmlFor={`tenant-${pref}`}
                        className="font-normal"
                      >
                        {pref}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <Label className="mb-4 flex items-center gap-2 text-sm font-medium">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Amenities
                </Label>
                <div className="space-y-2">
                  {Amenities.map(amenity => (
                    <div
                      key={amenity}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`amenity-${amenity}`}
                        checked={amenities.includes(amenity)}
                        onCheckedChange={() => handleAmenityChange(amenity)}
                      />
                      <Label
                        htmlFor={`amenity-${amenity}`}
                        className="font-normal"
                      >
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <Label className="mb-4 flex items-center gap-2 text-sm font-medium">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                    <path d="M3 12h18v6" />
                    <path d="M12 12v6" />
                  </svg>
                  Furnishing
                </Label>
                <div className="space-y-2">
                  {FurnishingStatuses.map(status => (
                    <div
                      key={status}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`furnish-${status}`}
                        checked={furnishingStatus.includes(status)}
                        onCheckedChange={() =>
                          handleFurnishingStatusChange(status)
                        }
                      />
                      <Label
                        htmlFor={`furnish-${status}`}
                        className="font-normal"
                      >
                        {status}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Select onValueChange={handleSortByChange} value={sortBy}>
          <SelectTrigger className="w-full md:w-auto">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date_desc">Newest</SelectItem>
            <SelectItem value="rent_asc">Price: Low to High</SelectItem>
            <SelectItem value="rent_desc">Price: High to Low</SelectItem>
            <SelectItem value="rating_desc">Rating</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearFilters}
            title="Clear filters"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

