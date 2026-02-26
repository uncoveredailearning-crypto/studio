'use client';

import { useState, useEffect, useRef } from "react";
import { Plus, Play, Pause, RotateCcw, Save, Zap, Timer as TimerIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
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
          <h1 className="text-4xl tracking-tight font-extrabold">Tempo</h1>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">Live Sessions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={addSportsTimer} className="rounded-2xl h-12 w-12 border-accent/20 text-accent hover:bg-accent/10">
            <Zap className="w-5 h-5 fill-accent" />
          </Button>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl h-12 w-12 bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <Plus className="w-6 h-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">New Session</DialogTitle>
                <DialogDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                  Configure your new tracking session details below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs uppercase font-bold tracking-wider">Session Name</Label>
                  <Input id="name" placeholder="Focus Session..." value={newTimer.name} onChange={(e) => setNewTimer({...newTimer, name: e.target.value})} className="h-12 bg-muted/30 border-none focus-visible:ring-primary" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-xs uppercase font-bold tracking-wider">Category</Label>
                  <Input placeholder="Type category..." value={newTimer.category} onChange={(e) => setNewTimer({...newTimer, category: e.target.value})} className="h-12 bg-muted/30 border-none focus-visible:ring-primary" />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {categories.slice(0, 4).map(c => (
                      <button 
                        key={c.name} 
                        onClick={() => setNewTimer({...newTimer, category: c.name})}
                        className="text-[10px] font-bold uppercase px-3 py-1.5 bg-muted rounded-full hover:bg-muted-foreground hover:text-white transition-all"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={addRegularTimer} className="w-full h-12 rounded-2xl bg-primary text-lg font-bold">Start Timer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <section className="space-y-4">
        {activeTimers.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground bg-muted/20 border-2 border-dashed border-muted rounded-3xl">
            <TimerIcon className="w-12 h-12 opacity-20 mb-4" />
            <p className="font-bold">No active timers</p>
            <p className="text-[10px] uppercase tracking-tighter font-bold">Start your first session above</p>
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
      const newAccumulated = timer.accumulatedTime + (Date.now() - (timer.startTime || 0));
      onUpdate({ isRunning: false, accumulatedTime: newAccumulated, startTime: null });
    } else {
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
    <Card className="border-none bg-muted/30 shadow-none rounded-[2rem] overflow-hidden group">
      <CardContent className="p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="font-bold text-xl">{timer.name}</h3>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-white px-3 py-1 rounded-full border">
              {timer.category}
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={resetTimer} className="h-10 w-10 hover:bg-white rounded-full">
              <RotateCcw className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onSave(calculateCurrentMs())} className="h-10 w-10 text-primary hover:bg-primary/10 rounded-full">
              <Save className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className={cn(
            "text-5xl font-bold tabular-nums tracking-tighter transition-colors duration-500",
            timer.isRunning ? "text-primary" : "text-muted-foreground"
          )}>
            {formatTime()}
          </div>
          <Button 
            onClick={toggleTimer}
            className={cn(
              "rounded-full h-16 w-16 shadow-xl",
              timer.isRunning ? "bg-white border-2 border-primary text-primary hover:bg-primary/5" : "bg-primary text-primary-foreground"
            )}
          >
            {timer.isRunning ? <Pause className="w-8 h-8 fill-primary" /> : <Play className="w-8 h-8 fill-current" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}