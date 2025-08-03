import { getModelById } from '@/lib/data-service';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Ruler,
  Briefcase,
  CalendarDays,
  MapPin,
  Eye,
  MessageSquare,
} from 'lucide-react';

type ProfilePageProps = {
  params: { id: string };
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const model = await getModelById(params.id);

  if (!model) {
    notFound();
  }

  const attributes = [
    { icon: Ruler, label: 'Height', value: `${model.height} cm` },
    {
      icon: Ruler,
      label: 'Measurements',
      value: `${model.bust}-${model.waist}-${model.hips} cm`,
    },
    { icon: Eye, label: 'Eyes', value: model.eyeColor },
    { icon: Ruler, label: 'Hair', value: model.hairColor },
    { icon: Briefcase, label: 'Experience', value: model.experience },
    { icon: CalendarDays, label: 'Availability', value: model.availability },
  ];

  return (
    <div className="container mx-auto max-w-6xl px-4 md:px-6 py-12">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 flex flex-col items-center">
          <Card className="w-full sticky top-24">
            <CardHeader className="p-0">
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src={model.profilePicture}
                  alt={`Profile of ${model.name}`}
                  data-ai-hint="fashion model"
                  fill
                  className="object-cover rounded-t-lg"
                />
              </div>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <h1 className="text-3xl font-headline font-bold">{model.name}</h1>
              <div className="flex items-center justify-center text-muted-foreground mt-2">
                <MapPin className="h-4 w-4 mr-1.5" />
                <span>{model.location}</span>
              </div>
              <Button size="lg" className="w-full mt-6 bg-secondary hover:bg-accent">
                <MessageSquare className="mr-2 h-4 w-4" />
                Contact {model.name.split(' ')[0]}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="font-headline">About</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {attributes.map((attr) => (
                  <div key={attr.label} className="flex items-start">
                    <attr.icon className="h-5 w-5 text-muted-foreground mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">{attr.label}</p>
                      <p className="text-muted-foreground">{attr.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Separator className="my-8" />

          <div>
            <h2 className="text-3xl font-headline font-bold mb-6">Portfolio</h2>
            <div className="grid grid-cols-2 gap-4">
              {model.portfolioImages.map((src, index) => (
                <div key={index} className="relative aspect-[3/4] w-full group">
                  <Image
                    src={src}
                    alt={`Portfolio image ${index + 1} for ${model.name}`}
                    data-ai-hint="portfolio shot"
                    fill
                    className="object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
