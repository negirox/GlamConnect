
'use client'

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ModelCard } from '@/components/model-card';
import { SavedList, addModelsToList, deleteList, removeModelFromList } from '@/lib/saved-list-actions';
import { Model } from '@/lib/mock-data';
import { getModelById } from '@/lib/data-actions';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CheckCircle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import Image from 'next/image';

interface ListManagementModalProps {
    list: SavedList;
    allModels: Model[];
    isOpen: boolean;
    onClose: () => void;
    onListUpdate: () => void;
}

export function ListManagementModal({ list, allModels, isOpen, onClose, onListUpdate }: ListManagementModalProps) {
    const [listModels, setListModels] = useState<Model[]>([]);
    const [isAddModelsView, setIsAddModelsView] = useState(false);
    const [selectedModelsForAdding, setSelectedModelsForAdding] = useState<string[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        if (list) {
            const fetchListModels = async () => {
                const modelPromises = list.modelIds.map(id => getModelById(id));
                const resolvedModels = (await Promise.all(modelPromises)).filter(Boolean) as Model[];
                setListModels(resolvedModels);
            };
            fetchListModels();
        }
    }, [list]);

    const handleToggleModelSelection = (modelId: string) => {
        setSelectedModelsForAdding(prev => 
            prev.includes(modelId) ? prev.filter(id => id !== modelId) : [...prev, modelId]
        );
    }
    
    const handleDeleteList = async () => {
        try {
            await deleteList(list.id);
            toast({ title: 'List Deleted', description: `The list "${list.name}" has been deleted.` });
            onListUpdate();
            onClose();
        } catch (error) {
             toast({ title: "Error", description: "Failed to delete list.", variant: "destructive" });
        }
    }

    const handleRemoveModelFromList = async (modelId: string) => {
        try {
            setListModels(prev => prev.filter(m => m.id !== modelId)); // Optimistic update
            await removeModelFromList(list.id, modelId);
            onListUpdate();
            toast({ title: "Model Removed" });
        } catch (error) {
            toast({ title: "Error removing model", variant: "destructive" });
            // Revert optimistic update on failure - re-fetch original models
            const modelPromises = list.modelIds.map(id => getModelById(id));
            const resolvedModels = (await Promise.all(modelPromises)).filter(Boolean) as Model[];
            setListModels(resolvedModels);
        }
    }

    const handleAddModelsToList = async () => {
        if (selectedModelsForAdding.length === 0) return;
        try {
            await addModelsToList(list.id, selectedModelsForAdding);
            
            const newModelPromises = selectedModelsForAdding
                .filter(id => !listModels.some(m => m.id === id))
                .map(id => getModelById(id));
            
            const newResolvedModels = (await Promise.all(newModelPromises)).filter(Boolean) as Model[];
            
            setListModels(prev => [...prev, ...newResolvedModels]);
            onListUpdate();

            toast({ title: "List Updated" });
            setIsAddModelsView(false);
            setSelectedModelsForAdding([]);
        } catch (error) {
             toast({ title: "Error updating list", variant: "destructive" });
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    {isAddModelsView ? (
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={() => setIsAddModelsView(false)}><ArrowLeft/></Button>
                            <div>
                                <DialogTitle>Add to "{list?.name}"</DialogTitle>
                                <DialogDescription>Select models to add to your list.</DialogDescription>
                            </div>
                        </div>
                    ) : (
                        <DialogTitle>Manage "{list?.name}"</DialogTitle>
                    )}
                </DialogHeader>
                <div className="flex-grow overflow-hidden">
                    <ScrollArea className="h-full pr-6">
                    {isAddModelsView ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {allModels.map(model => {
                                const isSelected = selectedModelsForAdding.includes(model.id);
                                const alreadyInList = list?.modelIds.includes(model.id);
                                return (
                                    <Card 
                                        key={model.id} 
                                        onClick={() => !alreadyInList && handleToggleModelSelection(model.id)}
                                        className={`cursor-pointer transition-all ${alreadyInList ? 'opacity-50 cursor-not-allowed' : ''} ${isSelected ? 'ring-2 ring-primary' : 'hover:ring-2 hover:ring-primary/50'}`}
                                    >
                                        <CardHeader className="p-0 relative">
                                            <Image src={model.profilePicture} alt={model.name} width={300} height={400} className="rounded-t-lg object-cover aspect-[3/4]" />
                                            {(isSelected || alreadyInList) && (
                                                <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                                                    <CheckCircle className="h-5 w-5"/>
                                                </div>
                                            )}
                                        </CardHeader>
                                        <CardContent className="p-3">
                                            <p className="font-semibold truncate">{model.name}</p>
                                            <p className="text-sm text-muted-foreground truncate">{model.location}</p>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    ) : (
                        listModels.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {listModels.map(model => (
                                    <div key={model.id} className="relative group">
                                        <ModelCard model={model} />
                                        <Button variant="destructive" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={() => handleRemoveModelFromList(model.id)}>
                                            <Trash2 className="h-4 w-4"/>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground pt-12">
                                <p>This list is empty. Add some models to get started!</p>
                            </div>
                        )
                    )}
                    </ScrollArea>
                </div>
                <DialogFooter className="mt-auto pt-4 border-t">
                    {isAddModelsView ? (
                        <>
                            <Button variant="ghost" onClick={() => setIsAddModelsView(false)}>Cancel</Button>
                            <Button onClick={handleAddModelsToList}>Add Selected Models</Button>
                        </>
                    ) : (
                        <>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="mr-auto">Delete List</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete your list "{list?.name}".
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteList}>Yes, delete list</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <Button variant="outline" onClick={() => { setSelectedModelsForAdding([]); setIsAddModelsView(true); }}>Add Models</Button>
                        <DialogClose asChild><Button>Done</Button></DialogClose>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
