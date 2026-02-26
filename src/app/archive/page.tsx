"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, FolderOpen, MoreHorizontal, ChevronDown, Trash2, Edit2, Share, Move, Plus } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useTempoStore, TimerRecord } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function ArchivePage() {
  const { records, folders, deleteRecord, updateRecord, setFolders } = useTempoStore();
  const [search, setSearch] = useState("");
  const [activeFolder, setActiveFolder] = useState<string>("All");
  const [isFolderMenuOpen, setIsFolderMenuOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<TimerRecord | null>(null);
  const [moveItem, setMoveItem] = useState<TimerRecord | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);

  const filteredItems = records.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                         item.category.toLowerCase().includes(search.toLowerCase());
    const matchesFolder = activeFolder === "All" || item.folder === activeFolder;
    return matchesSearch && matchesFolder;
  });

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) {
      updateRecord(editItem.id, { name: editItem.name, category: editItem.category });
      setEditItem(null);
    }
  };

  const handleMove = (folder: string) => {
    if (moveItem) {
      updateRecord(moveItem.id, { folder });
      setMoveItem(null);
    }
  };

  const addFolder = () => {
    if (newFolderName && !folders.includes(newFolderName)) {
      setFolders([...folders, newFolderName]);
      setNewFolderName("");
      setIsNewFolderModalOpen(false);
    }
  };

  const deleteFolder = (folder: string) => {
    if (folder === 'Unsorted' || folder === 'Goals') return;
    setFolders(folders.filter(f => f !== folder));
    records.forEach(r => {
      if (r.folder === folder) updateRecord(r.id, { folder: 'Unsorted' });
    });
  };

  const formatDuration = (record: TimerRecord) => {
    if (record.type === 'sports' && record.ms) {
      const m = Math.floor(record.ms / 60000).toString().padStart(2, '0');
      const s = Math.floor((record.ms % 60000) / 1000).toString().padStart(2, '0');
      const ms = Math.floor((record.ms % 1000) / 10).toString().padStart(2, '0');
      return `${m}:${s}.${ms}`;
    }
    const h = Math.floor(record.duration / 3600).toString().padStart(2, '0');
    const m = Math.floor((record.duration % 3600) / 60).toString().padStart(2, '0');
    const s = (record.duration % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="space-y-6 fade-in">
      <header className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-lg shadow-primary/10">
              <Image src="/icon.svg" alt="Tempo Logo" fill className="object-cover" />
            </div>
            <div>
              <h1 className="text-4xl tracking-tight font-extrabold">Archive</h1>
              <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">Recorded History</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-2xl bg-muted/30" onClick={() => setIsNewFolderModalOpen(true)}>
            <Plus className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search sessions..." 
              className="pl-12 h-14 bg-muted/20 border-none rounded-2xl font-medium" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <DropdownMenu open={isFolderMenuOpen} onOpenChange={setIsFolderMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-14 px-5 gap-2 border-border rounded-2xl font-bold">
                <FolderOpen className="w-4 h-4" />
                <span className="hidden sm:inline">{activeFolder === "All" ? "Folders" : activeFolder}</span>
                <ChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <DropdownMenuItem onClick={() => setActiveFolder("All")} className="font-bold">All Folders</DropdownMenuItem>
              {folders.map(f => (
                <DropdownMenuItem key={f} className="flex justify-between group font-medium" onClick={() => setActiveFolder(f)}>
                  {f}
                  {f !== 'Unsorted' && f !== 'Goals' && (
                    <Trash2 
                      className="w-3 h-3 opacity-0 group-hover:opacity-100 text-destructive" 
                      onClick={(e) => { e.stopPropagation(); deleteFolder(f); }}
                    />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="divide-y divide-border/50 bg-white rounded-[2rem] border border-border/50 shadow-sm overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground">
            <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-10" />
            <p className="font-bold uppercase tracking-widest text-[10px]">Empty Space</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div key={item.id} className="p-6 flex items-center justify-between hover:bg-muted/10 transition-colors group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-lg truncate">{item.name}</h4>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                    {item.folder}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium">
                  <span>{item.date}</span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span className="font-bold text-primary font-code">{formatDuration(item)}</span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span className="uppercase tracking-widest text-[9px] font-bold">{item.category}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44 rounded-xl">
                    <DropdownMenuItem className="gap-3 font-bold py-2" onClick={() => setEditItem(item)}>
                      <Edit2 className="w-4 h-4" /> Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-3 font-bold py-2" onClick={() => setMoveItem(item)}>
                      <Move className="w-4 h-4" /> Move Folder
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-3 font-bold py-2">
                      <Share className="w-4 h-4" /> Export Data
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="gap-3 text-destructive focus:text-destructive font-bold py-2"
                      onClick={() => setDeleteId(item.id)}
                    >
                      <Trash2 className="w-4 h-4" /> Delete Forever
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Edit Session</DialogTitle>
            <DialogDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
              Update the name or category of this archived session.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold tracking-wider">Session Name</Label>
              <Input value={editItem?.name || ""} onChange={(e) => setEditItem(prev => prev ? {...prev, name: e.target.value} : null)} className="h-12 bg-muted/30 border-none" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold tracking-wider">Category</Label>
              <Input value={editItem?.category || ""} onChange={(e) => setEditItem(prev => prev ? {...prev, category: e.target.value} : null)} className="h-12 bg-muted/30 border-none" />
            </div>
            <DialogFooter><Button type="submit" className="w-full h-12 rounded-2xl font-bold">Save Changes</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!moveItem} onOpenChange={() => setMoveItem(null)}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Relocate Folder</DialogTitle>
            <DialogDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
              Select a new collection to move this session into.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-6">
            {folders.map(f => (
              <Button key={f} variant="outline" className="justify-start h-14 rounded-xl font-bold hover:bg-primary hover:text-white transition-all" onClick={() => handleMove(f)}>{f}</Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isNewFolderModalOpen} onOpenChange={setIsNewFolderModalOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">New Collection</DialogTitle>
            <DialogDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
              Create a new folder to organize your timed sessions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <Input placeholder="Folder name..." value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} className="h-14 bg-muted/30 border-none text-lg font-bold" />
            <Button className="w-full h-12 rounded-2xl font-bold" onClick={addFolder}>Create Folder</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="font-medium">
              This action cannot be undone. This record will be permanently removed from your archive history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl font-bold">Keep Record</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl font-bold"
              onClick={() => { if (deleteId) deleteRecord(deleteId); setDeleteId(null); }}
            >
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}