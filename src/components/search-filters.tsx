'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

interface SearchFiltersProps {
  onFilterChange: (filters: any) => void;
}

export function SearchFilters({ onFilterChange }: SearchFiltersProps) {
  const [height, setHeight] = useState([175]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const filters = Object.fromEntries(formData.entries());
    filters.height = height[0].toString();
    onFilterChange(filters);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <h2 className="text-xl font-headline font-semibold">Filters</h2>
      
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input id="location" name="location" placeholder="e.g., Paris, France" />
      </div>

      <Separator />

      <div className="space-y-4">
        <Label>Height: {height[0]} cm</Label>
        <Slider
          defaultValue={height}
          onValueChange={setHeight}
          max={200}
          min={150}
          step={1}
        />
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Experience</Label>
        <Select name="experience">
          <SelectTrigger>
            <SelectValue placeholder="Any Experience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="New Face">New Face</SelectItem>
            <SelectItem value="Experienced">Experienced</SelectItem>
            <SelectItem value="Expert">Expert</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />
      
      <div className="space-y-2">
        <Label>Availability</Label>
        <RadioGroup name="availability" defaultValue="any">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="any" id="r-any" />
            <Label htmlFor="r-any">Any</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Full-time" id="r-full-time" />
            <Label htmlFor="r-full-time">Full-time</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Part-time" id="r-part-time" />
            <Label htmlFor="r-part-time">Part-time</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="By Project" id="r-by-project" />
            <Label htmlFor="r-by-project">By Project</Label>
          </div>
        </RadioGroup>
      </div>
      
      <Button type="submit" className="w-full bg-secondary hover:bg-accent">
        Apply Filters
      </Button>
    </form>
  );
}
