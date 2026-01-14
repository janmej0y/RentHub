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

interface SearchFiltersProps {
  initialFilters: RoomFilter;
  onFilterChange: (filters: Partial<RoomFilter>) => void;
}

export function SearchFilters({ onFilterChange, initialFilters }: SearchFiltersProps) {
  const [location, setLocation] = useState(initialFilters.location);
  const [priceRange, setPriceRange] = useState(initialFilters.priceRange);
  const [propertyType, setPropertyType] = useState(initialFilters.propertyType);
  const [tenantPreference, setTenantPreference] = useState(initialFilters.tenantPreference);

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
  
  const handleTenantPreferenceChange = (type: typeof TenantPreferences[0]) => {
    const newPrefs = tenantPreference.includes(type)
      ? tenantPreference.filter(p => p !== type)
      : [...tenantPreference, type];
    setTenantPreference(newPrefs);
    onFilterChange({ tenantPreference: newPrefs });
  };

  const clearFilters = () => {
    setLocation('');
    setPriceRange([0, 50000]);
    setPropertyType([]);
    setTenantPreference([]);
    onFilterChange({ location: '', priceRange: [0, 50000], propertyType: [], tenantPreference: [] });
  };

  const hasActiveFilters = location || priceRange[0] !== 0 || priceRange[1] !== 50000 || propertyType.length > 0 || tenantPreference.length > 0;

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 rounded-lg border bg-card p-4 shadow-sm">
      <div className="relative w-full md:flex-1">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search by location (e.g., Bengaluru)"
          className="pl-10"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
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
                      <Label htmlFor={`prop-${type}`} className="font-normal">{type}</Label>
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
                      <Label htmlFor={`tenant-${pref}`} className="font-normal">{pref}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {hasActiveFilters && (
          <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear filters">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
