'use client';

import { useState, useEffect, useRef } from "react";
import { Plus, Play, Pause, RotateCcw, Save, Zap, Timer as TimerIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useTempoStore, ActiveTimer } from "@/lib/store";

export default function TimersPage() {
  const { addRecord, addCategory, categories, activeTimers, addActiveTimer, deleteActiveTimer, updateActiveTimer, isLoaded } = useTempoStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTimer, setNewTimer] = useState({ name: "", category: "Work" });
  const { toast } = useToast();

  if (!isLoaded) return null;

  const addRegularTimer = () => {
    if (!newTimer.name) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    addCategory(newTimer.category);
    addActiveTimer({
      name: newTimer.name,
      category: newTimer.category,
      type: "regular",
      accumulatedTime: 0,
      startTime: Date.now(),
      isRunning: true,
    });
    setIsModalOpen(false);
    setNewTimer({ name: "", category: "Work" });
  };

  const addSportsTimer = () => {
    addActiveTimer({
      name: "Sports Timer",
      category: "Sports",
      type: "sports",
      accumulatedTime: 0,
      startTime: Date.now(),
      isRunning: true,
    });
    toast({ title: "Sports timer started" });
  };

  const handleSave = (timer: ActiveTimer, currentMs: number) => {
    addRecord({
      name: timer.name,
      category: timer.category,
      duration: Math.floor(currentMs / 1000),
      ms: timer.type === 'sports' ? currentMs : undefined,
      date: new Date().toISOString().split('T')[0],
      folder: 'Unsorted',
      type: timer.type,
    });
    deleteActiveTimer(timer.id);
    toast({ title: "Session saved to Archive" });
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
                  <Input placeholder="Type category..." value={newTimer.category} onChange={(e) => setNewTimer({...newTimer, category: e.target.value})} />
                  <div className="flex flex-wrap gap-1 mt-2">
                    {categories.slice(0, 4).map(c => (
                      <button 
                        key={c.name} 
                        onClick={() => setNewTimer({...newTimer, category: c.name})}
                        className="text-[10px] uppercase px-2 py-1 bg-muted rounded hover:bg-muted/80 transition-colors"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
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
        {activeTimers.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
            <TimerIcon className="w-12 h-12 opacity-20 mb-4" />
            <p className="font-medium">No active timers</p>
            <p className="text-xs uppercase tracking-tighter">Start your first session above</p>
          </div>
        ) : (
          activeTimers.map((timer) => (
            <TimerCard 
              key={timer.id} 
              timer={timer} 
              onUpdate={(updates) => updateActiveTimer(timer.id, updates)}
              onSave={(currentMs) => handleSave(timer, currentMs)}
            />
          ))
        )}
      </section>
    </div>
  );
}

function TimerCard({ timer, onUpdate, onSave }: { timer: ActiveTimer; onUpdate: (updates: Partial<ActiveTimer>) => void; onSave: (ms: number) => void }) {
  const [displayMs, setDisplayMs] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const calculateCurrentMs = () => {
    let current = timer.accumulatedTime;
    if (timer.isRunning && timer.startTime) {
      current += (Date.now() - timer.startTime);
    }
    return current;
  };

  useEffect(() => {
    // Initial display update
    setDisplayMs(calculateCurrentMs());

    if (timer.isRunning) {
      const step = timer.type === 'regular' ? 1000 : 10;
      intervalRef.current = setInterval(() => {
        setDisplayMs(calculateCurrentMs());
      }, step);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timer.isRunning, timer.accumulatedTime, timer.startTime]);

  const toggleTimer = () => {
    if (timer.isRunning) {
      // Pause
      const newAccumulated = timer.accumulatedTime + (Date.now() - (timer.startTime || 0));
      onUpdate({ isRunning: false, accumulatedTime: newAccumulated, startTime: null });
    } else {
      // Resume
      onUpdate({ isRunning: true, startTime: Date.now() });
    }
  };

  const resetTimer = () => {
    onUpdate({ accumulatedTime: 0, startTime: timer.isRunning ? Date.now() : null });
    setDisplayMs(0);
  };

  const formatTime = () => {
    const totalS = Math.floor(displayMs / 1000);
    if (timer.type === 'regular') {
      const h = Math.floor(totalS / 3600).toString().padStart(2, '0');
      const m = Math.floor((totalS % 3600) / 60).toString().padStart(2, '0');
      const s = (totalS % 60).toString().padStart(2, '0');
      return `${h}:${m}:${s}`;
    } else {
      const m = Math.floor(displayMs / 60000).toString().padStart(2, '0');
      const s = Math.floor((displayMs % 60000) / 1000).toString().padStart(2, '0');
      const ms = Math.floor((displayMs % 1000) / 10).toString().padStart(2, '0');
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
            <Button variant="ghost" size="icon" onClick={resetTimer} className="h-8 w-8">
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onSave(calculateCurrentMs())} className="h-8 w-8 text-primary hover:bg-primary/10">
              <Save className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className={cn(
            "text-4xl font-code tabular-nums transition-colors duration-500",
            timer.isRunning ? "text-primary" : "text-muted-foreground"
          )}>
            {formatTime()}
          </div>
          <Button 
            onClick={toggleTimer}
            className={cn(
              "rounded-full h-14 w-14 shadow-md",
              timer.isRunning ? "bg-white border border-primary text-primary hover:bg-primary/5" : "bg-primary text-primary-foreground"
            )}
          >
            {timer.isRunning ? <Pause className="w-6 h-6 fill-primary" /> : <Play className="w-6 h-6 fill-current" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}