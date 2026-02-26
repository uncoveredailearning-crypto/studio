"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  CartesianGrid
} from "recharts";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  addWeeks, 
  subWeeks, 
  startOfWeek, 
  endOfWeek, 
  addMonths, 
  subMonths,
  addDays,
  subDays,
  parseISO
} from "date-fns";
import { cn } from "@/lib/utils";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from "lucide-react";
import { useTempoStore } from "@/lib/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function InsightsPage() {
  const { records, categories, addRecord } = useTempoStore();
  
  // Hydration safe dates
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());
  const [currentMonthStart, setCurrentMonthStart] = useState<Date>(new Date());
  const [currentDailyDate, setCurrentDailyDate] = useState<Date>(new Date());
  
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [manualEntry, setManualEntry] = useState({ 
    name: "", 
    hours: 0, 
    minutes: 0, 
    date: new Date().toISOString().split('T')[0], 
    category: "Work" 
  });

  useEffect(() => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
    setCurrentMonthStart(startOfMonth(new Date()));
    setCurrentDailyDate(new Date());
  }, []);

  // Weekly Logic
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

  // Monthly Heatmap Logic
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

  // Daily Detail Logic (New Chart)
  const dailyDateStr = format(currentDailyDate, "yyyy-MM-dd");
  const dailyRecords = records
    .filter(r => r.date === dailyDateStr)
    .map(r => ({
      name: r.name,
      hours: r.duration / 3600,
      category: r.category,
      color: categories.find(c => c.name === r.category)?.color || 'hsl(var(--primary))'
    }));

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
    <div className="space-y-8 fade-in pb-24">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-headline italic tracking-tight">Perspectives</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest mt-1">Analytical Trends</p>
        </div>
        <Button size="icon" className="rounded-full shadow-lg h-12 w-12" onClick={() => setIsManualEntryOpen(true)}>
          <Plus className="w-6 h-6" />
        </Button>
      </header>

      {/* Daily Distribution Chart (New Requested Section) */}
      <Card className="border-border shadow-sm bg-white overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="font-headline text-xl italic">Daily Distribution</CardTitle>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
              {format(currentDailyDate, "EEEE, MMM d, yyyy")}
            </p>
          </div>
          <div className="flex gap-1">
             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentDailyDate(subDays(currentDailyDate, 1))}>
               <ChevronLeft className="w-4 h-4" />
             </Button>
             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentDailyDate(addDays(currentDailyDate, 1))}>
               <ChevronRight className="w-4 h-4" />
             </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full mt-4">
            {dailyRecords.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                <CalendarIcon className="w-8 h-8 opacity-20 mb-2" />
                <p className="text-xs font-medium uppercase tracking-tighter">No sessions logged</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyRecords} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    type="number" 
                    axisLine={false} 
                    tickLine={false} 
                    fontSize={10} 
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    label={{ value: 'Hours', position: 'insideBottom', offset: -5, fontSize: 10 }}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    hide 
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.1)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border border-border rounded shadow-xl text-xs space-y-1">
                            <p className="font-bold text-primary">{data.name}</p>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
                              <span className="text-muted-foreground uppercase text-[9px] tracking-widest">{data.category}</span>
                            </div>
                            <p className="font-code text-sm pt-1">{data.hours.toFixed(2)} hours</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="hours" radius={[0, 4, 4, 0]} barSize={32}>
                    {dailyRecords.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Intensity Chart */}
      <Card className="border-border shadow-sm bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="font-headline text-xl italic">Weekly Intensity</CardTitle>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
              Week of {format(currentWeekStart, "MMM d")}
            </p>
          </div>
          <div className="flex gap-1">
             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}><ChevronLeft className="w-4 h-4" /></Button>
             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full mt-4">
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
                  cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2 border border-border rounded shadow-lg text-xs">
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
      <Card className="border-border shadow-sm bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="font-headline text-xl italic">Activity Heatmap</CardTitle>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {format(currentMonthStart, "MMMM yyyy")}
            </span>
            <div className="flex">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonthStart(subMonths(currentMonthStart, 1))}><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonthStart(addMonths(currentMonthStart, 1))}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1.5 mt-2">
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
                    "heatmap-cell rounded-sm w-full transition-all duration-300 hover:scale-110",
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
          <div className="flex items-center gap-2 mt-4">
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground">Less</span>
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={cn(
                "w-2.5 h-2.5 rounded-sm",
                i === 0 && "bg-muted/30",
                i === 1 && "bg-accent/20",
                i === 2 && "bg-accent/50",
                i === 3 && "bg-primary/80"
              )} />
            ))}
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground">More</span>
          </div>
        </CardContent>
      </Card>

      {/* Day Detail Popup */}
      <Dialog open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
        <DialogContent className="sm:max-w-[400px] bg-white">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl italic">
              {selectedDay && format(selectedDay, "MMMM d, yyyy")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[50vh] overflow-y-auto no-scrollbar">
            {dayDetailRecords.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <CalendarIcon className="w-8 h-8 mx-auto opacity-10" />
                <p className="text-sm text-muted-foreground">No records for this day.</p>
              </div>
            ) : (
              dayDetailRecords.map(r => (
                <div key={r.id} className="flex justify-between items-center pb-3 border-b border-border/50">
                   <div>
                     <p className="text-sm font-medium">{r.name}</p>
                     <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">{r.category}</p>
                   </div>
                   <div className="text-right">
                     <span className="font-code text-sm">{(r.duration / 3600).toFixed(2)}h</span>
                   </div>
                </div>
              ))
            )}
            <div className="flex justify-between items-center pt-4 font-bold border-t-2 border-primary/10">
              <span className="text-sm uppercase tracking-widest">Total Active Time</span>
              <span className="font-code text-xl text-primary">{totalDayHours.toFixed(2)} hrs</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual Entry Modal */}
      <Dialog open={isManualEntryOpen} onOpenChange={setIsManualEntryOpen}>
        <DialogContent className="bg-white">
          <DialogHeader><DialogTitle className="font-headline text-2xl italic">Retroactive Entry</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Session Name</Label>
              <Input placeholder="Deep Work session..." value={manualEntry.name} onChange={(e) => setManualEntry({...manualEntry, name: e.target.value})} className="h-12" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hours</Label>
                <Input type="number" min="0" value={manualEntry.hours} onChange={(e) => setManualEntry({...manualEntry, hours: Number(e.target.value)})} className="h-12" />
              </div>
              <div className="space-y-2">
                <Label>Minutes</Label>
                <Input type="number" min="0" max="59" value={manualEntry.minutes} onChange={(e) => setManualEntry({...manualEntry, minutes: Number(e.target.value)})} className="h-12" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={manualEntry.date} onChange={(e) => setManualEntry({...manualEntry, date: e.target.value})} className="h-12" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input value={manualEntry.category} onChange={(e) => setManualEntry({...manualEntry, category: e.target.value})} className="h-12" />
            </div>
            <Button className="w-full h-12 bg-primary text-primary-foreground shadow-lg mt-4" onClick={handleManualEntry}>Log Time</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
