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
          <div className="relative h-96 w-full">
            <Image
              src={model.profilePicture}
              alt={`Profile of ${model.name}`}
              data-ai-hint="fashion model"
              fill
              className="object-cover"
            />
            <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ArrowUpRight className="h-5 w-5"/>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="text-xl font-headline font-semibold">{model.name}</h3>
          <div className="flex items-center text-muted-foreground mt-1">
            <MapPin className="h-4 w-4 mr-1.5" />
            <span>{model.location}</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline">{model.experience}</Badge>
            <Badge variant="outline">{model.availability}</Badge>
            <Badge variant="outline">{model.height} cm</Badge>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
