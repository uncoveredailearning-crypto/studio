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
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addWeeks, subWeeks, startOfWeek, endOfWeek, addMonths, subMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useTempoStore } from "@/lib/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function InsightsPage() {
  const { records, categories, addRecord } = useTempoStore();
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [currentMonthStart, setCurrentMonthStart] = useState(startOfMonth(new Date()));
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [manualEntry, setManualEntry] = useState({ name: "", hours: 0, minutes: 0, date: new Date().toISOString().split('T')[0], category: "Work" });

  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: currentWeekStart, end: weekEnd });

  const weekData = weekDays.map(day => {
    const dayStr = format(day, "yyyy-MM-dd");
    const dayRecords = records.filter(r => r.date === dayStr);
    const totalHours = dayRecords.reduce((acc, r) => acc + (r.duration / 3600), 0);
    return {
      day: format(day, "EEE"),
      hours: totalHours,
      fullDate: day
    };
  });

  const monthEnd = endOfMonth(currentMonthStart);
  const monthDays = eachDayOfInterval({ start: currentMonthStart, end: monthEnd });

  const getIntensity = (day: Date) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const totalHours = records.filter(r => r.date === dayStr).reduce((acc, r) => acc + r.duration, 0) / 3600;
    if (totalHours === 0) return 0;
    if (totalHours < 2) return 1;
    if (totalHours < 5) return 2;
    return 3;
  };

  const handleManualEntry = () => {
    if (!manualEntry.name) return;
    const duration = (manualEntry.hours * 3600) + (manualEntry.minutes * 60);
    addRecord({
      name: manualEntry.name,
      category: manualEntry.category,
      duration,
      date: manualEntry.date,
      folder: 'Unsorted',
      type: 'regular'
    });
    setIsManualEntryOpen(false);
  };

  const dayDetailRecords = selectedDay ? records.filter(r => r.date === format(selectedDay, "yyyy-MM-dd")) : [];
  const totalDayHours = dayDetailRecords.reduce((acc, r) => acc + r.duration, 0) / 3600;

  return (
    <div className="space-y-8 fade-in pb-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-headline italic tracking-tight">Perspectives</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest mt-1">Analytical Trends</p>
        </div>
        <Button size="icon" className="rounded-full shadow-lg" onClick={() => setIsManualEntryOpen(true)}>
          <Plus className="w-5 h-5" />
        </Button>
      </header>

      {/* Weekly Chart */}
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-headline text-xl italic">Weekly Intensity</CardTitle>
          <div className="flex gap-1">
             <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}><ChevronLeft className="w-4 h-4" /></Button>
             <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  fontSize={10} 
                  tick={{ fill: 'hsl(var(--muted-foreground))' }} 
                />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2 border border-border rounded shadow-sm text-xs">
                          <p className="font-medium">{payload[0].value.toFixed(1)} hrs</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                  {weekData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={'hsl(var(--primary))'}
                      className={isSameDay(entry.fullDate, new Date()) ? "stroke-emerald-500 stroke-2" : ""}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Heatmap */}
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-headline text-xl italic">Activity Heatmap</CardTitle>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {format(currentMonthStart, "MMMM yyyy")}
            </span>
            <div className="flex">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentMonthStart(subMonths(currentMonthStart, 1))}><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentMonthStart(addMonths(currentMonthStart, 1))}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1.5">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <div key={i} className="text-[10px] text-center font-bold text-muted-foreground/50 py-1">{d}</div>
            ))}
            {monthDays.map((day, idx) => {
              const intensity = getIntensity(day);
              const isToday = isSameDay(day, new Date());
              
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
                    isToday && "ring-1 ring-black ring-offset-1"
                  )}
                  title={format(day, "MMM d")}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Day Detail Popup */}
      <Dialog open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl italic">
              {selectedDay && format(selectedDay, "MMMM d, yyyy")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[50vh] overflow-y-auto no-scrollbar">
            {dayDetailRecords.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No records for this day.</p>
            ) : (
              dayDetailRecords.map(r => (
                <div key={r.id} className="flex justify-between items-center pb-2 border-b">
                   <div>
                     <p className="text-sm font-medium">{r.name}</p>
                     <p className="text-[10px] uppercase text-muted-foreground">{r.category}</p>
                   </div>
                   <span className="font-code">{(r.duration / 3600).toFixed(2)}h</span>
                </div>
              ))
            )}
            <div className="flex justify-between items-center pt-4 font-bold border-t-2">
              <span>Total Tracked</span>
              <span className="font-code text-lg">{totalDayHours.toFixed(2)} hrs</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual Entry Modal */}
      <Dialog open={isManualEntryOpen} onOpenChange={setIsManualEntryOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Retroactive Entry</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Session Name</Label>
              <Input placeholder="Deep Work session..." value={manualEntry.name} onChange={(e) => setManualEntry({...manualEntry, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hours</Label>
                <Input type="number" value={manualEntry.hours} onChange={(e) => setManualEntry({...manualEntry, hours: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>Minutes</Label>
                <Input type="number" value={manualEntry.minutes} onChange={(e) => setManualEntry({...manualEntry, minutes: Number(e.target.value)})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={manualEntry.date} onChange={(e) => setManualEntry({...manualEntry, date: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input value={manualEntry.category} onChange={(e) => setManualEntry({...manualEntry, category: e.target.value})} />
            </div>
            <Button className="w-full" onClick={handleManualEntry}>Log Time</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
