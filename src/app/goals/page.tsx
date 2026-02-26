"use client";

import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Sparkles, Plus, Trash2, Edit2, History, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useTempoStore, Goal, GoalPage } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function GoalsPage() {
  const { goalPages, setGoalPages, addRecord, isLoaded } = useTempoStore();
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [isNewGoalModalOpen, setIsNewGoalModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({ title: "", target: 0, period: "daily" });
  const { toast } = useToast();

  const activePage = goalPages[activePageIndex] || goalPages[0];

  if (!isLoaded || !activePage) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground animate-pulse">
        <p className="uppercase tracking-widest text-xs font-bold">Loading Aspirations...</p>
      </div>
    );
  }

  const addPage = () => {
    if (goalPages.length >= 5) return;
    const newPage: GoalPage = {
      id: crypto.randomUUID(),
      title: `Collection ${goalPages.length + 1}`,
      goals: []
    };
    setGoalPages([...goalPages, newPage]);
    setActivePageIndex(goalPages.length);
  };

  const deletePage = () => {
    if (goalPages.length <= 1) return;
    setGoalPages(goalPages.filter((_, i) => i !== activePageIndex));
    setActivePageIndex(0);
  };

  const addGoal = () => {
    if (!newGoal.title || !newGoal.target) return;
    const goal: Goal = {
      id: crypto.randomUUID(),
      title: newGoal.title,
      target: newGoal.target,
      period: newGoal.period as any,
      current: 0,
      category: "Goals"
    };
    const updatedPages = [...goalPages];
    updatedPages[activePageIndex].goals.push(goal);
    setGoalPages(updatedPages);
    setIsNewGoalModalOpen(false);
  };

  const handleSnapshot = () => {
    activePage.goals.forEach(goal => {
      addRecord({
        name: `Progress: ${goal.title}`,
        category: "Goals",
        duration: goal.current * 3600,
        date: new Date().toISOString().split('T')[0],
        folder: 'Goals',
        type: 'regular'
      });
    });
    toast({
      title: "Snapshot Captured",
      description: "Current goal progress logged to the Archive.",
    });
  };

  return (
    <div className="space-y-8 fade-in flex flex-col min-h-[calc(100vh-10rem)]">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl tracking-tight font-extrabold">Aspirations</h1>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">Goal Trajectory</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="rounded-2xl bg-muted/30" onClick={() => setIsHistoryModalOpen(true)}>
            <History className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-2xl bg-muted/30" onClick={addPage} disabled={goalPages.length >= 5}>
            <Plus className="w-5 h-5" />
          </Button>
          {goalPages.length > 1 && (
            <Button variant="ghost" size="icon" className="text-destructive rounded-2xl bg-destructive/5" onClick={deletePage}>
              <Trash2 className="w-5 h-5" />
            </Button>
          )}
        </div>
      </header>

      <div className="flex-1 flex flex-col justify-center items-center gap-10 relative px-4">
        <div className="w-full text-center space-y-2">
           <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Page {activePageIndex + 1} of {goalPages.length}</span>
           <h2 className="text-3xl font-bold tracking-tight">{activePage.title}</h2>
        </div>

        <div className="w-full space-y-4">
          {activePage.goals.length === 0 ? (
            <div className="p-16 text-center text-muted-foreground bg-muted/10 border-2 border-dashed border-muted rounded-[2rem]">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-10" />
              <p className="font-bold uppercase tracking-widest text-[10px]">Empty Collection</p>
            </div>
          ) : (
            activePage.goals.map(goal => (
              <Card key={goal.id} className="border-none shadow-none bg-muted/30 rounded-3xl">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">{goal.title}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-accent text-accent-foreground px-3 py-1 rounded-full">{goal.period}</span>
                  </div>
                  <Progress value={(goal.current / goal.target) * 100} className="h-2 bg-white" />
                  <div className="flex justify-between text-[11px] text-muted-foreground font-bold font-code uppercase">
                    <span>{goal.current}h / {goal.target}h Achieved</span>
                    <span className="text-primary">{Math.round((goal.current / goal.target) * 100)}%</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="flex gap-4">
          <Button 
            variant="outline" size="icon" 
            className="rounded-2xl h-14 w-14 border-border hover:bg-muted"
            onClick={() => setActivePageIndex(prev => (prev > 0 ? prev - 1 : goalPages.length - 1))}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button 
            className="rounded-2xl px-10 h-14 bg-primary text-primary-foreground shadow-xl shadow-primary/20 gap-3 font-bold text-lg"
            onClick={() => setIsNewGoalModalOpen(true)}
          >
            <Plus className="w-5 h-5" />
            Add Goal
          </Button>
          <Button 
            className="rounded-2xl px-10 h-14 bg-accent text-accent-foreground shadow-xl shadow-accent/20 gap-3 font-bold text-lg"
            onClick={handleSnapshot}
          >
            <Sparkles className="w-5 h-5" />
            Snapshot
          </Button>
          <Button 
            variant="outline" size="icon" 
            className="rounded-2xl h-14 w-14 border-border hover:bg-muted"
            onClick={() => setActivePageIndex(prev => (prev < goalPages.length - 1 ? prev + 1 : 0))}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </div>

      <Dialog open={isNewGoalModalOpen} onOpenChange={setIsNewGoalModalOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader><DialogTitle className="text-2xl font-bold">Define Goal</DialogTitle></DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold tracking-wider">Goal Title</Label>
              <Input placeholder="E.g. Yoga Practice" value={newGoal.title} onChange={(e) => setNewGoal({...newGoal, title: e.target.value})} className="h-12 bg-muted/30 border-none font-bold" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold tracking-wider">Target Hours</Label>
                <Input type="number" value={newGoal.target} onChange={(e) => setNewGoal({...newGoal, target: Number(e.target.value)})} className="h-12 bg-muted/30 border-none font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold tracking-wider">Timeframe</Label>
                <Select value={newGoal.period} onValueChange={(v) => setNewGoal({...newGoal, period: v as any})}>
                  <SelectTrigger className="h-12 bg-muted/30 border-none font-bold rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="daily" className="font-bold">Daily</SelectItem>
                    <SelectItem value="weekly" className="font-bold">Weekly</SelectItem>
                    <SelectItem value="monthly" className="font-bold">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full h-14 rounded-2xl bg-primary text-lg font-bold" onClick={addGoal}>Add to Collection</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto rounded-3xl">
          <DialogHeader><DialogTitle className="flex items-center gap-3 text-2xl font-bold"><Clock className="w-7 h-7 text-primary" /> Goal History</DialogTitle></DialogHeader>
          <div className="space-y-6 py-4">
            <p className="text-sm font-medium text-muted-foreground">Detailed logs are available in the Archive 'Goals' folder.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
