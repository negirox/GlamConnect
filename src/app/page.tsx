
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ModelCard } from '@/components/model-card';
import { getModels } from '@/lib/data-actions';
import { ArrowRight } from 'lucide-react';

export default async function Home() {
  const models = await getModels();
  const featuredModels = models.slice(0, 6);

  return (
    <div className="flex flex-col items-center">
      <section className="w-full py-20 md:py-32 lg:py-40 bg-card">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-headline font-bold tracking-tighter mb-4">
            Where Creativity Connects.
          </h1>
          <p className="max-w-[700px] mx-auto text-lg md:text-xl text-muted-foreground mb-8">
            GlamConnect is the exclusive platform for brands to discover and collaborate with professional models. Find the perfect face for your next campaign.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-secondary hover:bg-accent">
              <Link href="/search">
                Find Models <ArrowRight className="ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/signup">Join as a Model</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-center mb-12">
            Featured Models
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredModels.map((model) => (
              <ModelCard key={model.id} model={model} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
