"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Play, Pause, RotateCcw, Save, Zap, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function TimersPage() {
  const [timers, setTimers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTimer, setNewTimer] = useState({ name: "", category: "Work" });
  const { toast } = useToast();

  const addRegularTimer = () => {
    if (!newTimer.name) return;
    const timer = {
      id: Date.now().toString(),
      name: newTimer.name,
      category: newTimer.category,
      type: "regular",
      seconds: 0,
      isRunning: false,
      lastTick: null,
    };
    setTimers([timer, ...timers]);
    setIsModalOpen(false);
    setNewTimer({ name: "", category: "Work" });
  };

  const addSportsTimer = () => {
    const timer = {
      id: Date.now().toString(),
      name: "Sports Timer",
      category: "Sports",
      type: "sports",
      ms: 0,
      isRunning: true,
      lastTick: Date.now(),
    };
    setTimers([timer, ...timers]);
    toast({ title: "Sports timer started" });
  };

  return (
    <div className="space-y-8 fade-in">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-headline italic tracking-tight">Tempo</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest mt-1">Live Sessions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={addSportsTimer} className="rounded-full h-12 w-12 border-accent/20 text-accent-foreground hover:bg-accent/10">
            <Zap className="w-5 h-5 fill-accent" />
          </Button>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full h-12 w-12 bg-primary text-primary-foreground shadow-lg">
                <Plus className="w-6 h-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="font-headline text-2xl">New Regular Timer</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Focus Session..." value={newTimer.name} onChange={(e) => setNewTimer({...newTimer, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={newTimer.category} onValueChange={(val) => setNewTimer({...newTimer, category: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Work">Work</SelectItem>
                      <SelectItem value="Fitness">Fitness</SelectItem>
                      <SelectItem value="Reading">Reading</SelectItem>
                      <SelectItem value="Personal">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={addRegularTimer} className="w-full bg-primary">Create Timer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <section className="space-y-4">
        {timers.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
            <Timer className="w-12 h-12 opacity-20 mb-4" />
            <p className="font-medium">No active timers</p>
            <p className="text-xs uppercase tracking-tighter">Start your first session above</p>
          </div>
        ) : (
          timers.map((timer) => (
            <TimerCard 
              key={timer.id} 
              timer={timer} 
              onDelete={() => setTimers(timers.filter(t => t.id !== timer.id))}
            />
          ))
        )}
      </section>
    </div>
  );
}

function TimerCard({ timer, onDelete }: { timer: any; onDelete: () => void }) {
  const [time, setTime] = useState(timer.type === 'regular' ? timer.seconds : timer.ms);
  const [isRunning, setIsRunning] = useState(timer.isRunning);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      const step = timer.type === 'regular' ? 1000 : 10;
      intervalRef.current = setInterval(() => {
        setTime((prev: number) => prev + (timer.type === 'regular' ? 1 : 10));
      }, step);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timer.type]);

  const formatTime = () => {
    if (timer.type === 'regular') {
      const h = Math.floor(time / 3600).toString().padStart(2, '0');
      const m = Math.floor((time % 3600) / 60).toString().padStart(2, '0');
      const s = (time % 60).toString().padStart(2, '0');
      return `${h}:${m}:${s}`;
    } else {
      const m = Math.floor(time / 60000).toString().padStart(2, '0');
      const s = Math.floor((time % 60000) / 1000).toString().padStart(2, '0');
      const ms = Math.floor((time % 1000) / 10).toString().padStart(2, '0');
      return `${m}:${s}.${ms}`;
    }
  };

  return (
    <Card className="border-border shadow-sm overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg">{timer.name}</h3>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground px-2 py-0.5 border border-border rounded-full">
              {timer.category}
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => setTime(0)} className="h-8 w-8">
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8 text-destructive hover:bg-destructive/10">
              <Save className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className={cn(
            "text-4xl font-code tabular-nums transition-colors duration-500",
            isRunning ? "text-primary" : "text-muted-foreground"
          )}>
            {formatTime()}
          </div>
          <Button 
            onClick={() => setIsRunning(!isRunning)}
            className={cn(
              "rounded-full h-14 w-14 shadow-md",
              isRunning ? "bg-white border border-primary text-primary hover:bg-primary/5" : "bg-primary text-primary-foreground"
            )}
          >
            {isRunning ? <Pause className="w-6 h-6 fill-primary" /> : <Play className="w-6 h-6 fill-current" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}