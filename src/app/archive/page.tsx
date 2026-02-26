"use client";

import { useState } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
    // Move records out of deleted folder
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
          <div>
            <h1 className="text-4xl font-headline italic tracking-tight">Archive</h1>
            <p className="text-muted-foreground text-sm uppercase tracking-widest mt-1">Recorded History</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsNewFolderModalOpen(true)}>
            <Plus className="w-5 h-5" />
          </Button>
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
          <DropdownMenu open={isFolderMenuOpen} onOpenChange={setIsFolderMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-12 px-4 gap-2 border-border">
                <FolderOpen className="w-4 h-4" />
                <span className="hidden sm:inline">{activeFolder === "All" ? "Folders" : activeFolder}</span>
                <ChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setActiveFolder("All")}>All Folders</DropdownMenuItem>
              {folders.map(f => (
                <DropdownMenuItem key={f} className="flex justify-between group" onClick={() => setActiveFolder(f)}>
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

      <div className="divide-y divide-border bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No records found in {activeFolder}
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
                  <span className="font-code">{formatDuration(item)}</span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span className="uppercase tracking-widest text-[9px]">{item.category}</span>
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
                    <DropdownMenuItem className="gap-2" onClick={() => setEditItem(item)}>
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2" onClick={() => setMoveItem(item)}>
                      <Move className="w-3.5 h-3.5" /> Move
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

      {/* Edit Modal */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Session</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={editItem?.name || ""} onChange={(e) => setEditItem(prev => prev ? {...prev, name: e.target.value} : null)} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input value={editItem?.category || ""} onChange={(e) => setEditItem(prev => prev ? {...prev, category: e.target.value} : null)} />
            </div>
            <DialogFooter><Button type="submit" className="w-full">Save Changes</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Move Modal */}
      <Dialog open={!!moveItem} onOpenChange={() => setMoveItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Move to Folder</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-2 py-4">
            {folders.map(f => (
              <Button key={f} variant="outline" className="justify-start" onClick={() => handleMove(f)}>{f}</Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* New Folder Modal */}
      <Dialog open={isNewFolderModalOpen} onOpenChange={setIsNewFolderModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New Folder</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Input placeholder="Folder name..." value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} />
            <Button className="w-full" onClick={addFolder}>Create Folder</Button>
          </div>
        </DialogContent>
      </Dialog>

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
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
