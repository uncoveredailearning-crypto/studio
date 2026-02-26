"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from "recharts";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const WEEK_DATA = [
  { day: "Mon", hours: 4.5, category: "Work" },
  { day: "Tue", hours: 6.2, category: "Work" },
  { day: "Wed", hours: 3.8, category: "Work" },
  { day: "Thu", hours: 7.1, category: "Work" },
  { day: "Fri", hours: 5.4, category: "Work" },
  { day: "Sat", hours: 2.5, category: "Personal" },
  { day: "Sun", hours: 1.2, category: "Personal" },
];

export default function InsightsPage() {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Heatmap helper: simulate activity intensity
  const getIntensity = (day: Date) => {
    const d = day.getDate();
    if (d % 7 === 0) return 0;
    if (d % 3 === 0) return 3;
    if (d % 2 === 0) return 2;
    return 1;
  };

  return (
    <div className="space-y-8 fade-in pb-12">
      <header>
        <h1 className="text-4xl font-headline italic tracking-tight">Perspectives</h1>
        <p className="text-muted-foreground text-sm uppercase tracking-widest mt-1">Analytical Trends</p>
      </header>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="font-headline text-xl italic">Weekly Intensity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEK_DATA}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  fontSize={10} 
                  tick={{ fill: 'hsl(var(--muted-foreground))' }} 
                />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid hsl(var(--border))', 
                    boxShadow: 'none',
                    fontFamily: 'Inter, sans-serif'
                  }}
                />
                <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                  {WEEK_DATA.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.category === 'Work' ? 'hsl(var(--primary))' : 'hsl(var(--accent))'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-headline text-xl italic">Activity Heatmap</CardTitle>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {format(today, "MMMM yyyy")}
          </span>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1.5">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <div key={i} className="text-[10px] text-center font-bold text-muted-foreground/50 py-1">
                {d}
              </div>
            ))}
            {days.map((day, idx) => {
              const intensity = getIntensity(day);
              const isToday = isSameDay(day, today);
              
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "heatmap-cell rounded-sm w-full",
                    intensity === 0 && "bg-muted/30",
                    intensity === 1 && "bg-accent/20",
                    intensity === 2 && "bg-accent/50",
                    intensity === 3 && "bg-primary/80",
                    isToday && "ring-2 ring-primary ring-offset-1"
                  )}
                  title={format(day, "MMM d")}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-end gap-3 mt-6">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Intensity</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-muted/30" />
              <div className="w-3 h-3 rounded-sm bg-accent/20" />
              <div className="w-3 h-3 rounded-sm bg-accent/50" />
              <div className="w-3 h-3 rounded-sm bg-primary/80" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl italic">
              {selectedDay && format(selectedDay, "MMMM d, yyyy")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-sm font-medium">Total Tracked</span>
              <span className="font-code text-lg">04:15:22</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Work Session</span>
                <span>03:00:00</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Stretching</span>
                <span>00:45:22</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Reading</span>
                <span>00:30:00</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}