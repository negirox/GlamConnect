'use client';

import { useState } from 'react';
import { ModelCard } from '@/components/model-card';
import { SearchFilters } from '@/components/search-filters';
import { models as allModels, type Model } from '@/lib/mock-data';
import { Separator } from '@/components/ui/separator';

export default function SearchPage() {
  const [filteredModels, setFilteredModels] = useState<Model[]>(allModels);

  // Note: Filtering logic is mocked for demonstration.
  // In a real app, this would perform actual filtering based on the 'filters' object.
  const handleFilterChange = (filters: any) => {
    console.log('Applying filters:', filters);
    // Example of filtering logic:
    // let newFilteredModels = allModels;
    // if(filters.location) { ... }
    // setFilteredModels(newFilteredModels);
    
    // For now, just shuffling for visual feedback
    setFilteredModels([...allModels].sort(() => Math.random() - 0.5));
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        <aside className="w-full md:w-1/4 lg:w-1/5">
          <SearchFilters onFilterChange={handleFilterChange} />
        </aside>
        <main className="w-full md:w-3/4 lg:w-4/5">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-headline font-bold">
              Search Results
            </h1>
            <p className="text-muted-foreground">{filteredModels.length} models found</p>
          </div>
          <Separator className="mb-8" />
          {filteredModels.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredModels.map((model) => (
                <ModelCard key={model.id} model={model} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-96 bg-card rounded-lg">
                <p className="text-xl font-semibold">No models match your criteria.</p>
                <p className="text-muted-foreground mt-2">Try adjusting your search filters.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
