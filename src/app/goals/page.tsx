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
  const { goalPages, setGoalPages, addRecord } = useTempoStore();
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [isNewGoalModalOpen, setIsNewGoalModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({ title: "", target: 0, period: "daily" });
  const { toast } = useToast();

  const activePage = goalPages[activePageIndex] || goalPages[0];

  const addPage = () => {
    if (goalPages.length >= 5) return;
    const newPage: GoalPage = {
      id: Date.now().toString(),
      title: `Page ${goalPages.length + 1}`,
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
      id: Date.now().toString(),
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
        name: `Progress Snapshot: ${goal.title}`,
        category: "Goals",
        duration: goal.current * 3600,
        date: new Date().toISOString().split('T')[0],
        folder: 'Goals',
        type: 'regular'
      });
    });
    toast({
      title: "Snapshot Saved",
      description: "Current goal progress logged to the Goals folder in Archive.",
    });
  };

  return (
    <div className="space-y-8 fade-in flex flex-col min-h-[calc(100vh-10rem)]">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-headline italic tracking-tight">Aspirations</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest mt-1">Goal Trajectory</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => setIsHistoryModalOpen(true)}>
            <History className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={addPage} disabled={goalPages.length >= 5}>
            <Plus className="w-5 h-5" />
          </Button>
          {goalPages.length > 1 && (
            <Button variant="ghost" size="icon" className="text-destructive" onClick={deletePage}>
              <Trash2 className="w-5 h-5" />
            </Button>
          )}
        </div>
      </header>

      <div className="flex-1 flex flex-col justify-center items-center gap-12 relative px-4">
        <div className="w-full text-center space-y-2">
           <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Page {activePageIndex + 1} of {goalPages.length}</span>
           <h2 className="text-3xl font-headline italic">{activePage.title}</h2>
        </div>

        <div className="w-full space-y-6">
          {activePage.goals.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
              No goals on this page.
            </div>
          ) : (
            activePage.goals.map(goal => (
              <Card key={goal.id} className="border-none shadow-none bg-muted/20">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{goal.title}</h3>
                    <span className="text-[10px] uppercase tracking-widest bg-white px-2 py-0.5 rounded border">{goal.period}</span>
                  </div>
                  <Progress value={(goal.current / goal.target) * 100} className="h-1" />
                  <div className="flex justify-between text-xs text-muted-foreground font-code">
                    <span>{goal.current}h / {goal.target}h</span>
                    <span>{Math.round((goal.current / goal.target) * 100)}%</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="flex gap-4">
          <Button 
            variant="outline" size="icon" 
            className="rounded-full h-12 w-12 border-border"
            onClick={() => setActivePageIndex(prev => (prev > 0 ? prev - 1 : goalPages.length - 1))}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button 
            className="rounded-full px-8 h-12 bg-primary text-primary-foreground shadow-lg gap-2"
            onClick={() => setIsNewGoalModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add Goal
          </Button>
          <Button 
            className="rounded-full px-8 h-12 bg-accent text-accent-foreground shadow-lg gap-2"
            onClick={handleSnapshot}
          >
            <Sparkles className="w-4 h-4" />
            Snapshot
          </Button>
          <Button 
            variant="outline" size="icon" 
            className="rounded-full h-12 w-12 border-border"
            onClick={() => setActivePageIndex(prev => (prev < goalPages.length - 1 ? prev + 1 : 0))}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* New Goal Modal */}
      <Dialog open={isNewGoalModalOpen} onOpenChange={setIsNewGoalModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Goal</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Goal Name</Label>
              <Input placeholder="E.g. Yoga Practice" value={newGoal.title} onChange={(e) => setNewGoal({...newGoal, title: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target Hours</Label>
                <Input type="number" value={newGoal.target} onChange={(e) => setNewGoal({...newGoal, target: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>Period</Label>
                <Select value={newGoal.period} onValueChange={(v) => setNewGoal({...newGoal, period: v as any})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full" onClick={addGoal}>Add to {activePage.title}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* History Modal */}
      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Clock className="w-5 h-5" /> Snapshot History</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-xs text-muted-foreground italic">Check the Archive 'Goals' folder for the full record list.</p>
            {/* Logic to show history would go here, fetching from Archive filtered by folder 'Goals' */}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
