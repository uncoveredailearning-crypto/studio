'use client';

import { useState, useEffect } from 'react';

export type Category = {
  name: string;
  color: string;
};

export type ActiveTimer = {
  id: string;
  name: string;
  category: string;
  type: 'regular' | 'sports';
  accumulatedTime: number; // in ms
  startTime: number | null; // timestamp when started
  isRunning: boolean;
};

export type TimerRecord = {
  id: string;
  name: string;
  category: string;
  duration: number; // in seconds
  ms?: number; // for sports timers
  date: string;
  folder: string;
  type: 'regular' | 'sports';
};

export type Goal = {
  id: string;
  title: string;
  category: string;
  current: number;
  target: number;
  period: 'daily' | 'weekly' | 'monthly';
};

export type GoalPage = {
  id: string;
  title: string;
  goals: Goal[];
};

export const DEFAULT_CATEGORIES: Category[] = [
  { name: 'Deep Work', color: 'hsl(var(--primary))' },
  { name: 'Learning', color: 'hsl(210, 100%, 50%)' },
  { name: 'Creative', color: 'hsl(280, 100%, 60%)' },
  { name: 'Meetings', color: 'hsl(0, 100%, 60%)' },
  { name: 'Health', color: 'hsl(150, 100%, 40%)' },
  { name: 'Personal', color: 'hsl(var(--accent))' },
];

export function useTempoStore() {
  const [records, setRecords] = useState<TimerRecord[]>([]);
  const [activeTimers, setActiveTimers] = useState<ActiveTimer[]>([]);
  const [goalPages, setGoalPages] = useState<GoalPage[]>([]);
  const [folders, setFolders] = useState<string[]>(['Unsorted', 'Work', 'Personal', 'Health']);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedRecords = localStorage.getItem('tempo_records');
    const savedActiveTimers = localStorage.getItem('tempo_active_timers');
    const savedGoalPages = localStorage.getItem('tempo_goal_pages');
    const savedFolders = localStorage.getItem('tempo_folders');
    const savedCategories = localStorage.getItem('tempo_categories');

    if (savedRecords) setRecords(JSON.parse(savedRecords));
    if (savedActiveTimers) setActiveTimers(JSON.parse(savedActiveTimers));
    if (savedGoalPages) {
      setGoalPages(JSON.parse(savedGoalPages));
    } else {
      setGoalPages([{ id: 'default', title: 'Main Aspirations', goals: [] }]);
    }
    if (savedFolders) {
      const parsedFolders = JSON.parse(savedFolders);
      if (!parsedFolders.includes('Goals')) setFolders([...parsedFolders, 'Goals']);
      else setFolders(parsedFolders);
    } else {
      setFolders(['Unsorted', 'Work', 'Personal', 'Health', 'Goals']);
    }
    if (savedCategories) setCategories(JSON.parse(savedCategories));
    
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('tempo_records', JSON.stringify(records));
      localStorage.setItem('tempo_active_timers', JSON.stringify(activeTimers));
      localStorage.setItem('tempo_goal_pages', JSON.stringify(goalPages));
      localStorage.setItem('tempo_folders', JSON.stringify(folders));
      localStorage.setItem('tempo_categories', JSON.stringify(categories));
    }
  }, [records, activeTimers, goalPages, folders, categories, isLoaded]);

  const addRecord = (record: Omit<TimerRecord, 'id'>) => {
    const newRecord = { ...record, id: crypto.randomUUID() };
    setRecords(prev => [newRecord, ...prev]);

    // Update goal progress if category matches
    const hoursToAdd = record.duration / 3600;
    setGoalPages(prevPages => prevPages.map(page => ({
      ...page,
      goals: page.goals.map(goal => {
        if (goal.category === record.category || goal.title === record.category) {
          return { ...goal, current: Number((goal.current + hoursToAdd).toFixed(2)) };
        }
        return goal;
      })
    })));
  };

  const deleteRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const updateRecord = (id: string, updates: Partial<TimerRecord>) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const addActiveTimer = (timer: Omit<ActiveTimer, 'id'>) => {
    const newTimer = { ...timer, id: crypto.randomUUID() };
    setActiveTimers(prev => [newTimer, ...prev]);
  };

  const deleteActiveTimer = (id: string) => {
    setActiveTimers(prev => prev.filter(t => t.id !== id));
  };

  const updateActiveTimer = (id: string, updates: Partial<ActiveTimer>) => {
    setActiveTimers(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const addCategory = (name: string) => {
    if (categories.find(c => c.name.toLowerCase() === name.toLowerCase())) return;
    const hue = Math.floor(Math.random() * 360);
    const newCat = { name, color: `hsl(${hue}, 70%, 60%)` };
    setCategories(prev => [...prev, newCat]);
  };

  return {
    records,
    activeTimers,
    goalPages,
    folders,
    categories,
    addRecord,
    deleteRecord,
    updateRecord,
    addActiveTimer,
    deleteActiveTimer,
    updateActiveTimer,
    setGoalPages,
    setFolders,
    addCategory,
    isLoaded
  };
}