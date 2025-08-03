import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Search, Send } from "lucide-react";

const conversations = [
    { name: 'Glamour Magazine', lastMessage: 'Sounds great, let\'s proceed.', time: '10:42 AM', avatar: 'https://placehold.co/100x100', active: true },
    { name: 'Vogue Italia', lastMessage: 'Can you send over your latest polas?', time: '9:15 AM', avatar: 'https://placehold.co/100x100' },
    { name: 'StreetStyle Co.', lastMessage: 'Yes, the fitting is tomorrow at 2 PM.', time: 'Yesterday', avatar: 'https://placehold.co/100x100' },
    { name: 'Elegance Watches', lastMessage: 'We loved your submission!', time: '3d ago', avatar: 'https://placehold.co/100x100' },
];

const messages = [
    { from: 'other', text: 'Hi Anastasia, we loved your portfolio. We think you\'d be a perfect fit for our upcoming Fall campaign.' },
    { from: 'me', text: 'Thank you! I\'m very interested. Could you tell me more about it?' },
    { from: 'other', text: 'It\'s a 3-day shoot in the south of France. We can send over the mood board and details.' },
    { from: 'me', text: 'That sounds amazing! Please do.' },
    { from: 'other', text: 'Sounds great, let\'s proceed.' },
]

export default function MessagesPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 h-[calc(100vh-4rem)] py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 h-full">
        <div className="md:col-span-1 lg:col-span-1 h-full flex flex-col">
            <h1 className="text-2xl font-headline font-bold mb-4 px-4">Conversations</h1>
            <div className="px-4 mb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search messages" className="pl-9" />
                </div>
            </div>
            <ScrollArea className="flex-1">
                <div className="space-y-1 pr-4">
                {conversations.map((convo, i) => (
                    <div key={i} className={cn("flex items-center gap-3 p-2 rounded-lg cursor-pointer", convo.active ? 'bg-secondary' : 'hover:bg-primary')}>
                        <Avatar>
                            <AvatarImage src={convo.avatar} data-ai-hint="logo company" />
                            <AvatarFallback>{convo.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 truncate">
                            <p className="font-semibold">{convo.name}</p>
                            <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{convo.time}</span>
                    </div>
                ))}
                </div>
            </ScrollArea>
        </div>

        <div className="md:col-span-2 lg:col-span-3 h-full flex flex-col bg-card rounded-lg border">
            <div className="p-4 border-b flex items-center gap-4">
                 <Avatar>
                    <AvatarImage src="https://placehold.co/100x100" data-ai-hint="company logo"/>
                    <AvatarFallback>G</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-lg font-bold font-headline">Glamour Magazine</h2>
                    <p className="text-sm text-muted-foreground">Online</p>
                </div>
            </div>
            <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                {messages.map((msg, i) => (
                    <div key={i} className={cn("flex items-end gap-2", msg.from === 'me' ? 'justify-end' : 'justify-start')}>
                        {msg.from === 'other' && <Avatar className="h-8 w-8"><AvatarImage src="https://placehold.co/100x100" /></Avatar>}
                        <div className={cn("max-w-xs md:max-w-md p-3 rounded-2xl", msg.from === 'me' ? 'bg-secondary rounded-br-none' : 'bg-primary rounded-bl-none')}>
                            <p>{msg.text}</p>
                        </div>
                    </div>
                ))}
                </div>
            </ScrollArea>
            <div className="p-4 border-t mt-auto">
                <div className="relative">
                    <Input placeholder="Type your message..." className="pr-12 h-12" />
                    <Button size="icon" className="absolute right-2 top-1/2 -translate-y-1/2" variant="ghost">
                        <Send className="h-5 w-5"/>
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
