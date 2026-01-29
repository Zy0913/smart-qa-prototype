import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DetailedKnowledgeBase, KBFile } from '@/types';
import { Library, Folder, ChevronRight, Check, Search, User, Building2, Users, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

interface MoveModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    fileName: string;
    libraries: DetailedKnowledgeBase[];
    onConfirm: (targetLibId: string, targetFolderId?: string) => void;
}

export function MoveModal({ open, onOpenChange, fileName, libraries, onConfirm }: MoveModalProps) {
    const [selectedLibId, setSelectedLibId] = useState<string | null>(null);
    const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedGroups, setExpandedGroups] = useState<string[]>(['personal', 'department', 'enterprise']);

    const selectedLib = libraries.find(l => l.id === selectedLibId);

    // 获取选中库中的文件夹
    const folders = selectedLib?.files?.filter(f => f.type === 'folder') || [];

    const handleConfirm = () => {
        if (selectedLibId) {
            onConfirm(selectedLibId, selectedFolderId);
            onOpenChange(false);
        }
    };

    const filteredLibraries = libraries.filter(lib =>
        lib.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleGroup = (group: string) => {
        setExpandedGroups(prev =>
            prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
        );
    };

    const groups = [
        { id: 'personal', name: '个人库', icon: <User className="h-3.5 w-3.5" />, type: 'personal' },
        { id: 'department', name: '部门库', icon: <Users className="h-3.5 w-3.5" />, type: 'department' },
        { id: 'enterprise', name: '企业库', icon: <Building2 className="h-3.5 w-3.5" />, type: 'enterprise' },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl flex flex-col h-[600px] max-h-[90vh]">
                <DialogHeader className="px-6 py-5 border-b border-gray-100 bg-white shrink-0">
                    <DialogTitle className="text-xl font-bold text-gray-800">移动文件</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
                    {/* Source File Info */}
                    <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-100/50 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
                            <Library className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-0.5">正在移动</p>
                            <p className="text-base font-bold text-gray-900 truncate">{fileName}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 h-[340px]">
                        {/* Library Selection */}
                        <div className="flex flex-col gap-3">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                                <span className="w-1 h-3 bg-blue-500 rounded-full"></span>
                                选择目标库
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="快速搜索..."
                                    className="pl-9 h-10 text-sm bg-gray-50 border-gray-100 focus-visible:ring-2 focus-visible:ring-blue-100 rounded-xl"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <ScrollArea className="flex-1 rounded-xl border border-gray-100 bg-white shadow-sm">
                                <div className="p-1.5 space-y-1">
                                    {groups.map(group => {
                                        const groupLibs = filteredLibraries.filter(lib => lib.type === group.type);
                                        if (groupLibs.length === 0 && searchTerm) return null;
                                        const isExpanded = expandedGroups.includes(group.id);

                                        return (
                                            <div key={group.id} className="space-y-1">
                                                <button
                                                    onClick={() => toggleGroup(group.id)}
                                                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-gray-50 group text-xs font-bold text-gray-400 transition-colors"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                                        <span className="flex items-center gap-1.5 uppercase tracking-tighter">
                                                            {group.icon}
                                                            {group.name}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-full text-gray-500 group-hover:bg-gray-200">
                                                        {groupLibs.length}
                                                    </span>
                                                </button>

                                                {isExpanded && (
                                                    <div className="space-y-0.5 pl-3">
                                                        {groupLibs.map(lib => (
                                                            <button
                                                                key={lib.id}
                                                                onClick={() => {
                                                                    setSelectedLibId(lib.id);
                                                                    setSelectedFolderId(undefined);
                                                                }}
                                                                className={cn(
                                                                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all",
                                                                    selectedLibId === lib.id
                                                                        ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-100"
                                                                        : "text-gray-600 hover:bg-gray-50"
                                                                )}
                                                            >
                                                                <span className="truncate">{lib.name}</span>
                                                                {selectedLibId === lib.id && <ChevronRight className="h-3 w-3 opacity-70" />}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Folder Selection */}
                        <div className="flex flex-col gap-3">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                                <span className="w-1 h-3 bg-slate-300 rounded-full"></span>
                                选择文件夹 (可选)
                            </label>
                            <ScrollArea className="flex-1 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden text-xs">
                                {!selectedLibId ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50/30">
                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-3">
                                            <Library className="h-6 w-6 text-gray-200" />
                                        </div>
                                        <p className="text-gray-400 font-medium">请在左侧先选择<br />目标知识库</p>
                                    </div>
                                ) : (
                                    <div className="p-1.5 space-y-1">
                                        <button
                                            onClick={() => setSelectedFolderId(undefined)}
                                            className={cn(
                                                "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left",
                                                selectedFolderId === undefined
                                                    ? "bg-blue-50 text-blue-600 font-bold border border-blue-100/50"
                                                    : "text-gray-600 hover:bg-gray-50 border border-transparent"
                                            )}
                                        >
                                            <div className="flex items-center gap-2 truncate">
                                                <Folder className="h-4 w-4 shrink-0 opacity-60" />
                                                <span className="truncate">根目录</span>
                                            </div>
                                            {selectedFolderId === undefined && <Check className="h-4 w-4" />}
                                        </button>

                                        {folders.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center text-center p-6 py-12">
                                                <Folder className="h-10 w-10 text-gray-50 mb-3" />
                                                <p className="text-[10px] text-gray-300">该库下子文件夹为空</p>
                                            </div>
                                        ) : (
                                            folders.map(folder => (
                                                <button
                                                    key={folder.id}
                                                    onClick={() => setSelectedFolderId(folder.id)}
                                                    className={cn(
                                                        "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left border border-transparent",
                                                        selectedFolderId === folder.id
                                                            ? "bg-blue-50 text-blue-600 font-bold border-blue-100/50"
                                                            : "text-gray-600 hover:bg-gray-50"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-2 truncate">
                                                        <Folder className="h-4 w-4 shrink-0 opacity-60" />
                                                        <span className="truncate">{folder.name}</span>
                                                    </div>
                                                    {selectedFolderId === folder.id && <Check className="h-4 w-4" />}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-6 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50 h-10 px-6 rounded-xl font-medium transition-all"
                    >
                        取消
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!selectedLibId}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 px-8 rounded-xl shadow-lg shadow-blue-100 disabled:opacity-50 transition-all"
                    >
                        确认移动
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
