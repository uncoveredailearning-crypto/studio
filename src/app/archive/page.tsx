"use client";

import { useState } from "react";
import { Search, FolderOpen, MoreHorizontal, ChevronDown, Trash2, Edit2, Share } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const MOCK_ARCHIVE = [
  { id: '1', name: 'Design Concept', category: 'Work', duration: '02:15:00', date: '2024-05-20', folder: 'Project A' },
  { id: '2', name: 'Morning Run', category: 'Fitness', duration: '00:45:22', date: '2024-05-19', folder: 'Health' },
  { id: '3', name: 'UI Review', category: 'Work', duration: '01:10:05', date: '2024-05-19', folder: 'Project A' },
  { id: '4', name: 'Meditation', category: 'Personal', duration: '00:20:00', date: '2024-05-18', folder: 'Daily' },
];

export default function ArchivePage() {
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredItems = MOCK_ARCHIVE.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 fade-in">
      <header className="space-y-4">
        <div>
          <h1 className="text-4xl font-headline italic tracking-tight">Archive</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest mt-1">Recorded History</p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search sessions..." 
              className="pl-10 h-12 bg-white" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-12 px-4 gap-2 border-border">
            <FolderOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Folders</span>
            <ChevronDown className="w-3 h-3 opacity-50" />
          </Button>
        </div>
      </header>

      <div className="divide-y divide-border bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No records found
          </div>
        ) : (
          filteredItems.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="font-medium truncate">{item.name}</h4>
                  <span className="text-[9px] uppercase tracking-tighter text-muted-foreground px-1.5 py-0 border border-border rounded">
                    {item.folder}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{item.date}</span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span className="font-code">{item.duration}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem className="gap-2">
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <Share className="w-3.5 h-3.5" /> Export
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="gap-2 text-destructive focus:text-destructive"
                      onClick={() => setDeleteId(item.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This record will be permanently removed from your archive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}