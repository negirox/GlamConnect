
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getModelByEmail } from '@/lib/data-actions';
import type { Model } from '@/lib/mock-data';
import { User, Ruler, Star, ShieldCheck, MapPin, Edit, BadgeCheck, Weight, PersonStanding, Palette, Eye, Briefcase, CalendarDays, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { getSession } from '@/lib/auth-actions';
import { redirect } from 'next/navigation';

export default async function ProfileDashboardPage() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.email) {
    redirect('/login');
  }

  const model = await getModelByEmail(session.email);

  if (!model) {
    return (
      <div className="container mx-auto max-w-4xl px-4 md:px-6 py-12 text-center">
          <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Profile Not Found</AlertTitle>
              <AlertDescription>
                 Model data not found for this user. Please complete your profile, or if you just signed up, log out and log back in.
              </AlertDescription>
          </Alert>
          <Button asChild className="mt-4">
              <Link href="/account/profile/edit">Complete Profile</Link>
          </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 md:px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
        <div className="flex items-center">
          <div className="relative h-24 w-24 rounded-full mr-6">
            <Image
              src={model.profilePicture}
              alt={model.name}
              data-ai-hint="fashion model"
              fill
              className="rounded-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
                <h1 className="text-4xl font-headline font-bold">{model.name}</h1>
                <BadgeCheck className="h-7 w-7 text-blue-500" />
            </div>
            <div className="flex items-center text-muted-foreground mt-2">
                <MapPin className="h-4 w-4 mr-1.5" />
                <span>{model.location}</span>
            </div>
          </div>
        </div>
        <Button asChild size="lg">
          <Link href="/account/profile/edit">
            <Edit className="mr-2 h-4 w-4" />
            Manage Profile
          </Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center font-headline">
              <User className="mr-3" /> Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-semibold">Email</p>
              <p className="text-muted-foreground">{model.email}</p>
            </div>
            <div>
              <p className="font-semibold">Bio</p>
              <p className="text-muted-foreground">{model.bio || 'Not provided'}</p>
            </div>
             <div>
              <p className="font-semibold">Location Preferences</p>
              <p className="text-muted-foreground">{model.locationPrefs || 'Not provided'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Physical Attributes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center font-headline">
              <Ruler className="mr-3" /> Physical Attributes
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="flex items-start"><PersonStanding className="h-5 w-5 text-muted-foreground mt-0.5 mr-2 flex-shrink-0" /><div><p className="font-semibold">Height</p><p className="text-muted-foreground">{model.height} cm</p></div></div>
            <div className="flex items-start"><Weight className="h-5 w-5 text-muted-foreground mt-0.5 mr-2 flex-shrink-0" /><div><p className="font-semibold">Weight</p><p className="text-muted-foreground">{model.weight ? `${model.weight} kg` : 'N/A'}</p></div></div>
            <div className="flex items-start"><Ruler className="h-5 w-5 text-muted-foreground mt-0.5 mr-2 flex-shrink-0" /><div><p className="font-semibold">Measurements</p><p className="text-muted-foreground">{`${model.bust}-${model.waist}-${model.hips} cm`}</p></div></div>
            <div className="flex items-start"><Eye className="h-5 w-5 text-muted-foreground mt-0.5 mr-2 flex-shrink-0" /><div><p className="font-semibold">Eye Color</p><p className="text-muted-foreground">{model.eyeColor}</p></div></div>
            <div className="flex items-start"><Palette className="h-5 w-5 text-muted-foreground mt-0.5 mr-2 flex-shrink-0" /><div><p className="font-semibold">Hair Color</p><p className="text-muted-foreground">{model.hairColor}</p></div></div>
            <div className="flex items-start"><Tag className="h-5 w-5 text-muted-foreground mt-0.5 mr-2 flex-shrink-0" /><div><p className="font-semibold">Ethnicity</p><p className="text-muted-foreground">{model.ethnicity || 'N/A'}</p></div></div>
          </CardContent>
        </Card>
        
        {/* Professional Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center font-headline">
              <Star className="mr-3" /> Professional Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-semibold">Experience Level</p>
              <p className="text-muted-foreground">{model.experience}</p>
            </div>
            <div>
              <p className="font-semibold">Availability</p>
              <p className="text-muted-foreground">{model.availability}</p>
            </div>
             <div>
              <p className="font-semibold">Skills</p>
              <div className="flex flex-wrap gap-2 mt-1">
                  {model.skills && model.skills.length > 0 ? model.skills.map((skill, i) => (
                    <Badge key={i} variant="secondary">{skill.trim()}</Badge>
                  )) : <p className="text-sm text-muted-foreground">No skills listed.</p>}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Consent & Safety */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center font-headline">
              <ShieldCheck className="mr-3" /> Consent Settings
            </CardTitle>
            <CardDescription>Your consent for different shoot types.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>Bikini Shoots: <Badge variant={model.consentBikini ? "default" : "outline"}>{model.consentBikini ? 'Consented' : 'Not Consented'}</Badge></p>
            <p>Semi-Nude Shoots: <Badge variant={model.consentSemiNude ? "default" : "outline"}>{model.consentSemiNude ? 'Consented' : 'Not Consented'}</Badge></p>
            <p>Nude Shoots: <Badge variant={model.consentNude ? "default" : "outline"}>{model.consentNude ? 'Consented' : 'Not Consented'}</Badge></p>
          </CardContent>
        </Card>
      </div>

       <Separator className="my-8" />
       
        <div>
            <h2 className="text-3xl font-headline font-bold mb-6">Portfolio</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
  );
}
