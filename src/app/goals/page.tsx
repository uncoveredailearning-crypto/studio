"use client";

import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const GOALS = [
  { id: 1, title: "Deep Work", current: 24, target: 40, color: "hsl(var(--primary))", unit: "hrs" },
  { id: 2, title: "Yoga & Stretching", current: 5, target: 10, color: "hsl(var(--accent))", unit: "sessions" },
  { id: 3, title: "French Learning", current: 12, target: 20, color: "hsl(var(--primary))", unit: "hrs" },
  { id: 4, title: "Reading Time", current: 8, target: 15, color: "hsl(var(--accent))", unit: "hrs" },
  { id: 5, title: "Outdoor Walking", current: 3, target: 5, color: "hsl(var(--primary))", unit: "hrs" },
];

export default function GoalsPage() {
  const [activeGoal, setActiveGoal] = useState(0);
  const { toast } = useToast();
  const goal = GOALS[activeGoal];
  const progress = (goal.current / goal.target) * 100;

  const handleSnapshot = () => {
    toast({
      title: "Snapshot Saved",
      description: "Current progress logged to archive.",
    });
  };

  return (
    <div className="space-y-12 fade-in flex flex-col min-h-[calc(100vh-10rem)]">
      <header>
        <h1 className="text-4xl font-headline italic tracking-tight">Aspirations</h1>
        <p className="text-muted-foreground text-sm uppercase tracking-widest mt-1">Goal Trajectory</p>
      </header>

      <div className="flex-1 flex flex-col justify-center items-center gap-12 relative px-8">
        <div className="w-full relative">
          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0 space-y-8 text-center">
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Goal {activeGoal + 1} of 5</span>
                <h2 className="text-5xl font-headline italic">{goal.title}</h2>
              </div>

              <div className="relative pt-8 px-4">
                <div className="flex justify-between items-end mb-4">
                  <div className="text-left">
                    <span className="block text-4xl font-code tabular-nums">{goal.current}</span>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Actual {goal.unit}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-4xl font-code tabular-nums text-muted-foreground">{goal.target}</span>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Target {goal.unit}</span>
                  </div>
                </div>
                <Progress value={progress} className="h-1 bg-muted" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4">
          <Button 
            variant="outline" size="icon" 
            className="rounded-full h-12 w-12 border-border"
            onClick={() => setActiveGoal(prev => (prev > 0 ? prev - 1 : GOALS.length - 1))}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button 
            className="rounded-full px-8 h-12 bg-primary text-primary-foreground shadow-lg gap-2"
            onClick={handleSnapshot}
          >
            <Sparkles className="w-4 h-4" />
            Save Snapshot
          </Button>
          <Button 
            variant="outline" size="icon" 
            className="rounded-full h-12 w-12 border-border"
            onClick={() => setActiveGoal(prev => (prev < GOALS.length - 1 ? prev + 1 : 0))}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </div>
      
      <div className="flex justify-center gap-1.5 pb-8">
        {GOALS.map((_, idx) => (
          <div 
            key={idx} 
            className={cn(
              "h-1 transition-all duration-300 rounded-full",
              idx === activeGoal ? "w-8 bg-primary" : "w-2 bg-border"
            )}
          />
        ))}
      </div>
    </div>
  );
}