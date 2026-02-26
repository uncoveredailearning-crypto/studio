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
  getDay
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
  
  // Calculate padding for the calendar grid based on the first day of the month
  // We use weekStartsOn: 1 (Monday)
  const firstDayOfMonth = startOfMonth(currentMonthStart);
  const startDayPadding = (getDay(firstDayOfMonth) + 6) % 7;
  const paddingCells = Array.from({ length: startDayPadding });

  const getIntensity = (day: Date) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const totalHours = records.filter(r => r.date === dayStr).reduce((acc, r) => acc + r.duration, 0) / 3600;
    if (totalHours === 0) return 0;
    if (totalHours < 2) return 1;
    if (totalHours < 5) return 2;
    return 3;
  };

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
          <h1 className="text-4xl tracking-tight font-extrabold">Perspectives</h1>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">Analytical Trends</p>
        </div>
        <Button size="icon" className="rounded-2xl shadow-xl shadow-primary/20 h-14 w-14 bg-primary text-primary-foreground" onClick={() => setIsManualEntryOpen(true)}>
          <Plus className="w-8 h-8" />
        </Button>
      </header>

      <Card className="border-none shadow-none bg-muted/20 rounded-[2rem] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">Daily Breakdown</CardTitle>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
              {format(currentDailyDate, "EEEE, MMM d, yyyy")}
            </p>
          </div>
          <div className="flex gap-2">
             <Button variant="ghost" size="icon" className="h-10 w-10 bg-white rounded-full shadow-sm" onClick={() => setCurrentDailyDate(subDays(currentDailyDate, 1))}>
               <ChevronLeft className="w-5 h-5" />
             </Button>
             <Button variant="ghost" size="icon" className="h-10 w-10 bg-white rounded-full shadow-sm" onClick={() => setCurrentDailyDate(addDays(currentDailyDate, 1))}>
               <ChevronRight className="w-5 h-5" />
             </Button>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <div className="h-72 w-full mt-6">
            {dailyRecords.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-white/50 rounded-3xl border-2 border-dashed border-muted">
                <CalendarIcon className="w-10 h-10 opacity-20 mb-3" />
                <p className="text-[10px] font-bold uppercase tracking-widest">No Activity Logged</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyRecords} layout="vertical" margin={{ left: 0, right: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis 
                    type="number" 
                    axisLine={false} 
                    tickLine={false} 
                    fontSize={10} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontWeight: 700 }}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    hide 
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-4 border-none rounded-2xl shadow-2xl text-xs space-y-2">
                            <p className="font-bold text-primary text-base">{data.name}</p>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
                              <span className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">{data.category}</span>
                            </div>
                            <p className="font-bold font-code text-sm pt-2 text-foreground">{data.hours.toFixed(2)} hours tracked</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="hours" radius={[0, 10, 10, 0]} barSize={40}>
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

      <Card className="border-none shadow-none bg-muted/20 rounded-[2rem]">
        <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">Weekly Intensity</CardTitle>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
              Week of {format(currentWeekStart, "MMM d")}
            </p>
          </div>
          <div className="flex gap-2">
             <Button variant="ghost" size="icon" className="h-10 w-10 bg-white rounded-full shadow-sm" onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}><ChevronLeft className="w-5 h-5" /></Button>
             <Button variant="ghost" size="icon" className="h-10 w-10 bg-white rounded-full shadow-sm" onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}><ChevronRight className="w-5 h-5" /></Button>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <div className="h-64 w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  fontSize={10} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontWeight: 700 }} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 border-none rounded-xl shadow-xl text-xs">
                          <p className="font-bold font-code">{payload[0].value.toFixed(1)} hrs</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="hours" radius={[10, 10, 0, 0]}>
                  {weekData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={'hsl(var(--primary))'}
                      className={isSameDay(entry.fullDate, new Date()) ? "stroke-accent stroke-4" : ""}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-none bg-muted/20 rounded-[2rem]">
        <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
          <CardTitle className="text-2xl font-bold tracking-tight">Activity Calendar</CardTitle>
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {format(currentMonthStart, "MMMM yyyy")}
            </span>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-9 w-9 bg-white rounded-full shadow-sm" onClick={() => setCurrentMonthStart(subMonths(currentMonthStart, 1))}><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 bg-white rounded-full shadow-sm" onClick={() => setCurrentMonthStart(addMonths(currentMonthStart, 1))}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <div className="grid grid-cols-7 gap-1 mt-4">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <div key={i} className="text-[10px] text-center font-black text-muted-foreground/40 py-2">{d}</div>
            ))}
            
            {/* Empty padding cells for start of month */}
            {paddingCells.map((_, i) => (
              <div key={`padding-${i}`} className="aspect-square" />
            ))}

            {monthDays.map((day, idx) => {
              const intensity = getIntensity(day);
              const isToday = isSameDay(day, new Date());
              const dayNumber = format(day, "d");
              
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "w-full aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold transition-all duration-200 border border-transparent",
                    intensity === 0 && "bg-white/40 text-muted-foreground/50",
                    intensity === 1 && "bg-accent/20 text-accent-foreground",
                    intensity === 2 && "bg-accent/50 text-accent-foreground",
                    intensity === 3 && "bg-accent text-white",
                    isToday && "ring-2 ring-primary ring-offset-1 border-primary/20",
                    "hover:scale-110 active:scale-95 z-10"
                  )}
                  title={format(day, "MMM d")}
                >
                  {dayNumber}
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Resting</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={cn(
                  "w-3 h-3 rounded-sm",
                  i === 0 && "bg-white border border-border/20",
                  i === 1 && "bg-accent/20",
                  i === 2 && "bg-accent/50",
                  i === 3 && "bg-accent"
                )} />
              ))}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Peak</span>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
        <DialogContent className="sm:max-w-[450px] bg-white rounded-[2.5rem]">
          <DialogHeader>
            <DialogTitle className="text-3xl font-extrabold tracking-tight pt-4">
              {selectedDay && format(selectedDay, "MMMM d")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-6 max-h-[50vh] overflow-y-auto no-scrollbar">
            {dayDetailRecords.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <CalendarIcon className="w-12 h-12 mx-auto opacity-10" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Quiet Day</p>
              </div>
            ) : (
              dayDetailRecords.map(r => (
                <div key={r.id} className="flex justify-between items-center p-5 bg-muted/20 rounded-2xl">
                   <div>
                     <p className="text-base font-bold text-foreground">{r.name}</p>
                     <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{r.category}</p>
                   </div>
                   <div className="text-right">
                     <span className="font-bold font-code text-lg text-foreground">{(r.duration / 3600).toFixed(2)}h</span>
                   </div>
                </div>
              ))
            )}
            <div className="flex justify-between items-center p-8 mt-4 rounded-3xl bg-primary text-primary-foreground shadow-xl shadow-primary/30">
              <span className="text-sm font-bold uppercase tracking-widest">Total Focused Time</span>
              <span className="font-bold font-code text-3xl">{totalDayHours.toFixed(2)} hrs</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isManualEntryOpen} onOpenChange={setIsManualEntryOpen}>
        <DialogContent className="rounded-[2.5rem]">
          <DialogHeader><DialogTitle className="text-3xl font-extrabold tracking-tight pt-4">Retroactive Log</DialogTitle></DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest">Session Name</Label>
              <Input placeholder="Deep Work session..." value={manualEntry.name} onChange={(e) => setManualEntry({...manualEntry, name: e.target.value})} className="h-14 bg-muted/30 border-none font-bold text-lg" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest">Hours</Label>
                <Input type="number" min="0" value={manualEntry.hours} onChange={(e) => setManualEntry({...manualEntry, hours: Number(e.target.value)})} className="h-14 bg-muted/30 border-none font-bold text-lg" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest">Minutes</Label>
                <Input type="number" min="0" max="59" value={manualEntry.minutes} onChange={(e) => setManualEntry({...manualEntry, minutes: Number(e.target.value)})} className="h-14 bg-muted/30 border-none font-bold text-lg" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest">Log Date</Label>
              <Input type="date" value={manualEntry.date} onChange={(e) => setManualEntry({...manualEntry, date: e.target.value})} className="h-14 bg-muted/30 border-none font-bold" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest">Category</Label>
              <Input value={manualEntry.category} onChange={(e) => setManualEntry({...manualEntry, category: e.target.value})} className="h-14 bg-muted/30 border-none font-bold" />
            </div>
            <Button className="w-full h-16 bg-primary text-primary-foreground shadow-2xl shadow-primary/20 rounded-3xl font-bold text-xl mt-4" onClick={handleManualEntry}>Log Time</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
