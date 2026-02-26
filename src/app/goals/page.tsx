
"use client";

import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Sparkles, Plus, Trash2, Edit2, History, Clock, MoreHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useTempoStore, Goal, GoalPage } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function GoalsPage() {
  const { goalPages, setGoalPages, addRecord, isLoaded } = useTempoStore();
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [isNewGoalModalOpen, setIsNewGoalModalOpen] = useState(false);
  const [isEditGoalModalOpen, setIsEditGoalModalOpen] = useState(false);
  const [isEditCollectionModalOpen, setIsEditCollectionModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({ title: "", target: 0, period: "daily" });
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [editingCollectionTitle, setEditingCollectionTitle] = useState("");
  
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

  const handleEditGoal = () => {
    if (!editingGoal) return;
    const updatedPages = [...goalPages];
    const goalIdx = updatedPages[activePageIndex].goals.findIndex(g => g.id === editingGoal.id);
    if (goalIdx > -1) {
      updatedPages[activePageIndex].goals[goalIdx] = editingGoal;
      setGoalPages(updatedPages);
      setIsEditGoalModalOpen(false);
      setEditingGoal(null);
    }
  };

  const deleteGoal = (goalId: string) => {
    const updatedPages = [...goalPages];
    updatedPages[activePageIndex].goals = updatedPages[activePageIndex].goals.filter(g => g.id !== goalId);
    setGoalPages(updatedPages);
    toast({ title: "Goal Removed" });
  };

  const updateCollectionTitle = () => {
    if (!editingCollectionTitle) return;
    const updatedPages = [...goalPages];
    updatedPages[activePageIndex].title = editingCollectionTitle;
    setGoalPages(updatedPages);
    setIsEditCollectionModalOpen(false);
  };

  const handleSnapshot = () => {
    if (activePage.goals.length === 0) return;
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
           <button 
            onClick={() => {
              setEditingCollectionTitle(activePage.title);
              setIsEditCollectionModalOpen(true);
            }}
            className="text-3xl font-bold tracking-tight block w-full hover:opacity-70 transition-opacity"
           >
            {activePage.title}
           </button>
        </div>

        <div className="w-full space-y-6">
          {activePage.goals.length === 0 ? (
            <div className="p-16 text-center text-muted-foreground bg-muted/10 border-2 border-dashed border-muted rounded-[2rem]">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-10" />
              <p className="font-bold uppercase tracking-widest text-[10px]">Empty Collection</p>
            </div>
          ) : (
            activePage.goals.map(goal => (
              <Card key={goal.id} className="border-none shadow-none bg-muted/20 rounded-[2.5rem] group relative">
                <CardContent className="p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-2xl">{goal.title}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-accent text-accent-foreground px-4 py-1.5 rounded-full">
                        {goal.period}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem className="font-bold gap-2" onClick={() => { setEditingGoal(goal); setIsEditGoalModalOpen(true); }}>
                            <Edit2 className="w-4 h-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="font-bold gap-2 text-destructive" onClick={() => deleteGoal(goal.id)}>
                            <Trash2 className="w-4 h-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <Progress value={(goal.current / goal.target) * 100} className="h-1.5 bg-white" />
                  <div className="flex justify-between items-center text-[10px] text-muted-foreground font-bold font-code uppercase tracking-wider">
                    <span>{goal.current}H / {goal.target}H ACHIEVED</span>
                    <span className="text-primary text-xs">{Math.round((goal.current / goal.target) * 100)}%</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="outline" size="icon" 
            className="rounded-[1.2rem] h-14 w-14 border-border bg-white shadow-sm hover:bg-muted"
            onClick={() => setActivePageIndex(prev => (prev > 0 ? prev - 1 : goalPages.length - 1))}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          
          <Button 
            className="rounded-2xl px-10 h-16 bg-primary text-primary-foreground shadow-xl shadow-primary/20 gap-3 font-bold text-lg"
            onClick={() => setIsNewGoalModalOpen(true)}
          >
            <Plus className="w-5 h-5" />
            Add Goal
          </Button>
          
          <Button 
            className="rounded-2xl px-10 h-16 bg-accent text-accent-foreground shadow-xl shadow-accent/20 gap-3 font-bold text-lg"
            onClick={handleSnapshot}
          >
            <Sparkles className="w-5 h-5" />
            Snapshot
          </Button>

          <Button 
            variant="outline" size="icon" 
            className="rounded-[1.2rem] h-14 w-14 border-border bg-white shadow-sm hover:bg-muted"
            onClick={() => setActivePageIndex(prev => (prev < goalPages.length - 1 ? prev + 1 : 0))}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </div>

      <Dialog open={isNewGoalModalOpen} onOpenChange={setIsNewGoalModalOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Define Goal</DialogTitle>
            <DialogDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
              Set a target for hours to track within a specific period.
            </DialogDescription>
          </DialogHeader>
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

      <Dialog open={isEditGoalModalOpen} onOpenChange={setIsEditGoalModalOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Edit Goal</DialogTitle>
            <DialogDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
              Modify your target or timeframe for this goal.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold tracking-wider">Goal Title</Label>
              <Input value={editingGoal?.title || ""} onChange={(e) => setEditingGoal(prev => prev ? {...prev, title: e.target.value} : null)} className="h-12 bg-muted/30 border-none font-bold" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold tracking-wider">Target Hours</Label>
                <Input type="number" value={editingGoal?.target || 0} onChange={(e) => setEditingGoal(prev => prev ? {...prev, target: Number(e.target.value)} : null)} className="h-12 bg-muted/30 border-none font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold tracking-wider">Timeframe</Label>
                <Select value={editingGoal?.period} onValueChange={(v) => setEditingGoal(prev => prev ? {...prev, period: v as any} : null)}>
                  <SelectTrigger className="h-12 bg-muted/30 border-none font-bold rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="daily" className="font-bold">Daily</SelectItem>
                    <SelectItem value="weekly" className="font-bold">Weekly</SelectItem>
                    <SelectItem value="monthly" className="font-bold">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full h-14 rounded-2xl bg-primary text-lg font-bold" onClick={handleEditGoal}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditCollectionModalOpen} onOpenChange={setIsEditCollectionModalOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Rename Collection</DialogTitle>
            <DialogDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
              Update the name of this goal collection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold tracking-wider">Collection Name</Label>
              <Input value={editingCollectionTitle} onChange={(e) => setEditingCollectionTitle(e.target.value)} className="h-14 bg-muted/30 border-none font-bold text-lg" />
            </div>
            <Button className="w-full h-14 rounded-2xl bg-primary text-lg font-bold" onClick={updateCollectionTitle}>Update Title</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold"><Clock className="w-7 h-7 text-primary" /> Goal History</DialogTitle>
            <DialogDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
              Review your past progress snapshots and achievements.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <p className="text-sm font-medium text-muted-foreground">Detailed logs are available in the Archive 'Goals' folder.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
