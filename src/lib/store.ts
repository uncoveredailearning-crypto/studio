'use client';

import { useState, useEffect } from 'react';

export type Category = {
  name: string;
  color: string;
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
  const [goalPages, setGoalPages] = useState<GoalPage[]>([]);
  const [folders, setFolders] = useState<string[]>(['Unsorted', 'Work', 'Personal', 'Health']);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedRecords = localStorage.getItem('tempo_records');
    const savedGoalPages = localStorage.getItem('tempo_goal_pages');
    const savedFolders = localStorage.getItem('tempo_folders');
    const savedCategories = localStorage.getItem('tempo_categories');

    if (savedRecords) setRecords(JSON.parse(savedRecords));
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
      localStorage.setItem('tempo_goal_pages', JSON.stringify(goalPages));
      localStorage.setItem('tempo_folders', JSON.stringify(folders));
      localStorage.setItem('tempo_categories', JSON.stringify(categories));
    }
  }, [records, goalPages, folders, categories, isLoaded]);

  const addRecord = (record: Omit<TimerRecord, 'id'>) => {
    const newRecord = { ...record, id: crypto.randomUUID() };
    setRecords(prev => [newRecord, ...prev]);
  };

  const deleteRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const updateRecord = (id: string, updates: Partial<TimerRecord>) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const addCategory = (name: string) => {
    if (categories.find(c => c.name.toLowerCase() === name.toLowerCase())) return;
    const hue = Math.floor(Math.random() * 360);
    const newCat = { name, color: `hsl(${hue}, 70%, 60%)` };
    setCategories(prev => [...prev, newCat]);
  };

  return {
    records,
    goalPages,
    folders,
    categories,
    addRecord,
    deleteRecord,
    updateRecord,
    setGoalPages,
    setFolders,
    addCategory,
    isLoaded
  };
}
