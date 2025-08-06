
import Image from 'next/image';
import Link from 'next/link';
import type { Model } from '@/lib/mock-data';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, ArrowUpRight } from 'lucide-react';

interface ModelCardProps {
  model: Model;
}

export function ModelCard({ model }: ModelCardProps) {
  return (
    <Link href={`/profile/${model.id}`} className="group block">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <CardHeader className="p-0">
          <div className="relative h-96 w-full overflow-hidden">
            <Image
              src={model.profilePicture}
              alt={`Profile of ${model.name}`}
              data-ai-hint="fashion model"
              fill
              className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute top-4 right-4 bg-background/80 text-foreground p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-90 group-hover:scale-100">
                <ArrowUpRight className="h-5 w-5"/>
            </div>
             <div className="absolute bottom-0 left-0 p-4">
                <h3 className="text-2xl font-headline font-semibold text-white">{model.name}</h3>
                <div className="flex items-center text-white/90 mt-1">
                    <MapPin className="h-4 w-4 mr-1.5" />
                    <span>{model.location}</span>
                </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary">{model.experience}</Badge>
            <Badge variant="secondary">{model.availability}</Badge>
            <Badge variant="secondary">{model.height} cm</Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
