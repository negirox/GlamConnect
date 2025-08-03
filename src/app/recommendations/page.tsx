'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  getModelRecommendations,
  type ModelRecommendationsOutput,
} from '@/ai/flows/model-recommendations';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import { ModelCard } from '@/components/model-card';
import { getModels } from '@/lib/data-service';
import { Model } from '@/lib/mock-data';

const recommendationSchema = z.object({
  projectDetails: z
    .string()
    .min(50, 'Please provide more details about your project (min. 50 characters).')
    .max(1000),
  brandHistory: z
    .string()
    .min(50, 'Please provide more details about your brand history (min. 50 characters).')
    .max(1000),
});

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] =
    useState<ModelRecommendationsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [allModels, setAllModels] = useState<Model[]>([]);

  useEffect(() => {
    async function loadModels() {
      const models = await getModels();
      setAllModels(models);
    }
    loadModels();
  }, []);

  const form = useForm<z.infer<typeof recommendationSchema>>({
    resolver: zodResolver(recommendationSchema),
    defaultValues: {
      projectDetails: '',
      brandHistory: '',
    },
  });

  async function onSubmit(values: z.infer<typeof recommendationSchema>) {
    setIsLoading(true);
    setRecommendations(null);
    try {
      const result = await getModelRecommendations(values);
      setRecommendations(result);
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      // You could use a toast notification here to show the error
    } finally {
      setIsLoading(false);
    }
  }

  const recommendedModelData = recommendations
    ? allModels.filter((model) => recommendations.recommendedModels.includes(model.name))
    : [];

  return (
    <div className="container mx-auto max-w-4xl px-4 md:px-6 py-12">
      <div className="text-center mb-12">
        <Sparkles className="mx-auto h-12 w-12 text-secondary" />
        <h1 className="text-4xl md:text-5xl font-headline font-bold mt-4">
          AI Model Recommendations
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Let our AI find the perfect models for your brand based on your unique
          needs.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Describe Your Project</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="projectDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Project Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your campaign, the aesthetic, target audience, and what you're looking for in a model."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The more detail, the better the recommendations.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="brandHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Brand History</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your brand. What were your most successful campaigns? What kind of models have you worked with in the past?"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This helps the AI understand your brand's style.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} size="lg" className="w-full">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Get Recommendations
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center mt-12">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-secondary" />
            <p className="mt-4 text-muted-foreground">Our AI is curating your recommendations...</p>
        </div>
      )}

      {recommendations && (
        <div className="mt-12">
          <h2 className="text-3xl font-headline font-bold text-center mb-8">
            Your Recommended Models
          </h2>
          <Card className="bg-primary/50 mb-8">
            <CardHeader>
              <CardTitle className="font-headline">Reasoning</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{recommendations.reasoning}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommendedModelData.length > 0 ? (
                recommendedModelData.map(model => <ModelCard key={model.id} model={model} />)
            ) : (
                <p className="col-span-full text-center text-muted-foreground">Could not find profiles for recommended models. The AI recommended: {recommendations.recommendedModels.join(', ')}.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
