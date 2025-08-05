
'use client';

import { useState, useEffect } from 'react';
import { ModelCard } from '@/components/model-card';
import { SearchFilters } from '@/components/search-filters';
import { Model } from '@/lib/mock-data';
import { Separator } from '@/components/ui/separator';
import { getModels } from '@/lib/data-actions';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Filter } from 'lucide-react';

export default function SearchPage() {
  const [allModels, setAllModels] = useState<Model[]>([]);
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    async function loadModels() {
      setLoading(true);
      const models = await getModels();
      setAllModels(models);
      setFilteredModels(models);
      setLoading(false);
    }
    loadModels();
  }, []);

  const handleFilterChange = (filters: any) => {
    let newFilteredModels = [...allModels];

    if (filters.location) {
        newFilteredModels = newFilteredModels.filter(model => 
            model.location && model.location.toLowerCase().includes(filters.location.toLowerCase().trim())
        );
    }
    if (filters.height) {
        newFilteredModels = newFilteredModels.filter(model => model.height >= parseInt(filters.height, 10));
    }
    if (filters.experience && filters.experience !== 'Any') {
        newFilteredModels = newFilteredModels.filter(model => model.experience === filters.experience);
    }
    if (filters.availability && filters.availability !== 'any') {
        newFilteredModels = newFilteredModels.filter(model => model.availability === filters.availability);
    }
    
    setFilteredModels(newFilteredModels);
  };

  const SearchFiltersDesktop = () => (
    <aside className="w-full md:w-1/4 lg:w-1/5 md:sticky top-24 h-full">
        <SearchFilters onFilterChange={handleFilterChange} />
    </aside>
  );

  const SearchFiltersMobile = () => (
     <Accordion type="single" collapsible className="w-full mb-6">
        <AccordionItem value="filters">
            <AccordionTrigger>
                <h2 className="text-xl font-headline font-semibold flex items-center">
                    <Filter className="mr-2" /> Show Filters
                </h2>
            </AccordionTrigger>
            <AccordionContent>
                 <SearchFilters onFilterChange={handleFilterChange} />
            </AccordionContent>
        </AccordionItem>
    </Accordion>
  );

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        {isMobile ? <SearchFiltersMobile /> : <SearchFiltersDesktop />}
        <main className="w-full md:w-3/4 lg:w-4/5">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-headline font-bold">
              Search Results
            </h1>
            {!loading && <p className="text-muted-foreground">{filteredModels.length} models found</p>}
          </div>
          <Separator className="mb-8" />
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-[500px] w-full" />)}
            </div>
          ) : filteredModels.length > 0 ? (
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
