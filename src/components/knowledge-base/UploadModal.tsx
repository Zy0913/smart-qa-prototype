
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { X, Upload, FileText, CheckCircle, Brain, Target } from 'lucide-react';
import { ChevronDown, Plus, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { mockKnowledgeBases } from '@/data/mock';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface FileItem {
    id: string;
    file: File;
    progress: number;
    tags: string[];
    notes: string;
    status: 'uploading' | 'completed';
}

interface UploadModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isAI?: boolean; // 是否是AI智能上传
    isFolder?: boolean; // 是否是上传文件夹
    targetLibraryName?: string; // 目标库名称 (如果已知)
    onConfirm: () => void;
}

const TAG_TAXONOMY = {
    '生命周期': ['项目启动', '项目规划', '项目执行', '监控与控制', '项目收尾'],
    '文档类型': ['需求文档', '设计文档', '计划书', '汇报材料', '会议纪要', '合同协议'],
    '优先级': ['P0-紧急', 'P1-高优', 'P2-普通'],
    '所属部门': ['项目办', '产品部', '研发部', '测试部', '市场部']
};

export function UploadModal({ open, onOpenChange, isAI = false, isFolder = false, targetLibraryName = '', onConfirm }: UploadModalProps) {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [selectedLibrary, setSelectedLibrary] = useState<string>('kb-enterprise-3'); // 默认品牌选型库
    const [selectedFolder, setSelectedFolder] = useState<string>('root');
    const [selectedCategory, setSelectedCategory] = useState<string>('生命周期');
    const [tagPopoverOpen, setTagPopoverOpen] = useState<string | null>(null); // Store fileId needing tag selection

    // Reset state when opening
    useEffect(() => {
        if (open) {
            setFiles([]);
            setAiAnalysis(null);
        }
    }, [open]);

    // Simulate upload progress for all files
    useEffect(() => {
        const activeFiles = files.filter(f => f.progress < 100);
        if (activeFiles.length > 0) {
            const timer = setInterval(() => {
                setFiles(prev => prev.map(f => {
                    if (f.progress < 100) {
                        const newProgress = Math.min(f.progress + Math.floor(Math.random() * 15) + 5, 100);
                        return {
                            ...f,
                            progress: newProgress,
                            status: newProgress === 100 ? 'completed' : 'uploading'
                        };
                    }
                    return f;
                }));
            }, 500);
            return () => clearInterval(timer);
        }

        // AI Analysis Simulation (only for the first file if multiple)
        if (files.length > 0 && files.every(f => f.progress === 100) && isAI && !aiAnalysis) {
            setTimeout(() => {
                setAiAnalysis(`根据对您上传的 ${files.length} 个文件进行内容语义分析，内容涉及大量**服务器硬件参数**与**选型对比**，建议上传至 **品牌选型库**。`);
            }, 800);
        }
    }, [files, isAI, aiAnalysis]);

    const addFiles = (selectedFiles: File[]) => {
        if (files.length + selectedFiles.length > 10) {
            toast.error('单次最多支持上传 10 个文件');
            return;
        }

        const newFileItems: FileItem[] = selectedFiles.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            progress: 0,
            tags: [],
            notes: '',
            status: 'uploading'
        }));

        setFiles(prev => [...prev, ...newFileItems]);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        addFiles(selectedFiles);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const droppedFiles = Array.from(e.dataTransfer.files);
        addFiles(droppedFiles);
    };

    const handleRemoveFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleUpdateFile = (id: string, updates: Partial<FileItem>) => {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const handleAddTag = (fileId: string, tag: string) => {
        if (!tag.trim()) return;
        const file = files.find(f => f.id === fileId);
        if (file && !file.tags.includes(tag)) {
            handleUpdateFile(fileId, { tags: [...file.tags, tag.trim()] });
        }
    };

    const handleRemoveTag = (e: React.MouseEvent, fileId: string, tagToRemove: string) => {
        e.preventDefault();
        e.stopPropagation();
        const file = files.find(f => f.id === fileId);
        if (file) {
            handleUpdateFile(fileId, { tags: file.tags.filter(t => t !== tagToRemove) });
        }
    };

    // Mock folder hierarchy for selection
    const mockFolderTree = [
        { id: 'root', name: '根目录', depth: 0 },
        { id: 'f1', name: '2026报价', depth: 1 },
        { id: 'f1-1', name: 'Q1季度', depth: 2 },
        { id: 'f1-2', name: 'Q2季度', depth: 2 },
        { id: 'f2', name: '历史归档', depth: 1 },
        { id: 'f2-1', name: '2025项目', depth: 2 },
        { id: 'f2-1-1', name: 'A区项目', depth: 3 },
        { id: 'f3', name: '临时文件', depth: 1 },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden max-h-[90vh] flex flex-col border-none shadow-2xl rounded-2xl">
                <DialogHeader className="px-6 py-4 border-b border-gray-100 flex flex-row items-center justify-between space-y-0 sticky top-0 bg-white z-10">
                    <DialogTitle className="text-xl font-bold text-gray-800">
                        {isAI ? 'AI 智能文件上传' : isFolder ? '上传文件夹' : '上传文件'}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                    {/* File Drop Zone */}
                    {files.length < 10 && (
                        <div
                            className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-blue-50/30 hover:border-blue-200 transition-all cursor-pointer group"
                            onClick={() => document.getElementById('file-upload-input')?.click()}
                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onDrop={handleDrop}
                        >
                            <input
                                id="file-upload-input"
                                type="file"
                                multiple
                                {...(isFolder ? { webkitdirectory: "", directory: "" } : {})}
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Upload className="h-7 w-7" />
                            </div>
                            <p className="text-base font-semibold text-gray-800">
                                点击或拖拽{isFolder ? '文件夹' : '文件'}到此处上传
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                                {isFolder ? '支持最多 5 层的文件夹' : '支持 Word, Excel, PPT, PDF, 图片等格式 (最多 10 个)'}
                            </p>
                        </div>
                    )}

                    {/* File List */}
                    <div className="space-y-4">
                        {files.map((fileItem) => (
                            <div key={fileItem.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                                {/* File Header with Progress */}
                                <div className="p-4 bg-gray-50/50 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-2 max-w-[70%]">
                                                <span className="text-sm font-bold text-gray-800 truncate">{fileItem.file.name}</span>
                                                <Badge variant="secondary" className="text-[10px] h-4 px-1 bg-gray-200 text-gray-600">
                                                    {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {fileItem.status === 'completed' ? (
                                                    <span className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                                                        <CheckCircle className="h-3 w-3" /> 已完成
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-blue-600">{fileItem.progress}%</span>
                                                )}
                                                <button
                                                    onClick={() => handleRemoveFile(fileItem.id)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <Progress value={fileItem.progress} className="h-1.5 bg-gray-200" />
                                    </div>
                                </div>

                                {/* Metadata Area */}
                                <div className="p-4 space-y-4 border-t border-gray-50">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">文件标签</Label>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-gray-100 bg-white shadow-inner-sm">
                                            {fileItem.tags.map(tag => (
                                                <Badge key={tag} variant="secondary" className="gap-1 pl-2 pr-1 h-6 bg-blue-50 text-blue-600 border-blue-100 font-medium whitespace-nowrap">
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleRemoveTag(e, fileItem.id, tag)}
                                                        className="hover:text-red-500 transition-colors p-0.5 -mr-1"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}

                                            <Popover open={tagPopoverOpen === fileItem.id} onOpenChange={(open) => setTagPopoverOpen(open ? fileItem.id : null)}>
                                                <PopoverTrigger asChild>
                                                    <div className="flex-1 min-w-[100px] h-6 flex items-center">
                                                        <input
                                                            className="w-full text-xs outline-none bg-transparent placeholder:text-gray-400"
                                                            placeholder={fileItem.tags.length === 0 ? "选择或输入标签..." : "输入..."}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    handleAddTag(fileItem.id, (e.target as HTMLInputElement).value);
                                                                    (e.target as HTMLInputElement).value = '';
                                                                }
                                                            }}
                                                            // Prevent popover from opening when just typing (optional, but good UX to allow clicking to open)
                                                            onClick={() => setTagPopoverOpen(fileItem.id)}
                                                        />
                                                    </div>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[400px] p-0" align="start">
                                                    <div className="flex h-[240px]">
                                                        {/* Left: Categories */}
                                                        <div className="w-[100px] bg-slate-50 border-r border-gray-100 flex flex-col">
                                                            {Object.keys(TAG_TAXONOMY).map(category => (
                                                                <button
                                                                    key={category}
                                                                    onClick={() => setSelectedCategory(category)}
                                                                    className={cn(
                                                                        "px-3 py-2.5 text-xs text-left font-medium transition-colors hover:bg-white hover:text-blue-600",
                                                                        selectedCategory === category ? "bg-white text-blue-600 shadow-[inset_2px_0_0_0_#2563eb]" : "text-slate-600"
                                                                    )}
                                                                >
                                                                    {category}
                                                                </button>
                                                            ))}
                                                        </div>

                                                        {/* Right: Tags */}
                                                        <ScrollArea className="flex-1 p-3">
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {TAG_TAXONOMY[selectedCategory as keyof typeof TAG_TAXONOMY].map(tag => {
                                                                    const isSelected = fileItem.tags.includes(tag);
                                                                    return (
                                                                        <button
                                                                            key={tag}
                                                                            onClick={() => handleAddTag(fileItem.id, tag)}
                                                                            disabled={isSelected}
                                                                            className={cn(
                                                                                "px-2 py-1.5 rounded-md text-xs text-left transition-all border",
                                                                                isSelected
                                                                                    ? "bg-blue-50 text-blue-400 border-transparent cursor-default"
                                                                                    : "bg-white text-slate-700 border-gray-100 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50/50 hover:shadow-sm"
                                                                            )}
                                                                        >
                                                                            <div className="flex items-center justify-between">
                                                                                <span>{tag}</span>
                                                                                {isSelected && <CheckCircle className="h-3 w-3" />}
                                                                            </div>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </ScrollArea>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">文件说明</Label>
                                        <Textarea
                                            placeholder="输入关于此文件的详细说明..."
                                            className="min-h-[60px] resize-none text-xs rounded-xl border-gray-100 focus:ring-blue-100"
                                            value={fileItem.notes}
                                            onChange={(e) => handleUpdateFile(fileItem.id, { notes: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* AI Conclusion Area */}
                    {isAI && aiAnalysis && files.length > 0 && (
                        <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 shadow-sm">
                                    <Brain className="h-6 w-6" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold text-purple-900">AI 智能归类建议</h4>
                                    <p className="text-sm text-purple-700 leading-relaxed">
                                        {aiAnalysis.split('**').map((part, i) =>
                                            i % 2 === 1 ? <strong key={i} className="font-bold text-purple-950 underline decoration-purple-300 underline-offset-4">{part}</strong> : part
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex flex-row items-center justify-between sm:justify-between sticky bottom-0 z-10">
                    <div className="flex items-center gap-4">
                        {isAI && aiAnalysis && files.length > 0 ? (
                            <div className="flex items-center gap-2 text-xs text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                                <Target className="h-3.5 w-3.5 text-blue-500" />
                                <span className="shrink-0">存储目标库:</span>

                                <div className="relative flex items-center group">
                                    <select
                                        value={selectedLibrary}
                                        onChange={(e) => setSelectedLibrary(e.target.value)}
                                        className="h-6 text-xs bg-transparent font-bold text-gray-900 border-none focus:ring-0 cursor-pointer appearance-none pr-4 pl-1 hover:bg-gray-50 rounded transition-colors"
                                    >
                                        {mockKnowledgeBases.map(kb => (
                                            <option key={kb.id} value={kb.id}>{kb.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                                </div>

                                <span className="text-gray-300">/</span>

                                <div className="relative flex items-center group">
                                    <select
                                        value={selectedFolder}
                                        onChange={(e) => setSelectedFolder(e.target.value)}
                                        className="h-6 text-xs bg-transparent font-bold text-gray-900 border-none focus:ring-0 cursor-pointer appearance-none pr-4 pl-1 hover:bg-gray-50 rounded transition-colors"
                                    >
                                        {mockFolderTree.map(folder => (
                                            <option key={folder.id} value={folder.id}>
                                                {'\u00A0'.repeat(folder.depth * 2)}{folder.depth > 0 ? '└ ' : ''}{folder.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        ) : (
                            <div className="text-[10px] text-gray-400 font-medium bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
                                已选择 <span className="text-blue-500 font-bold">{files.length}</span> / 10 个文件
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="text-gray-500 hover:bg-gray-200"
                        >
                            取消
                        </Button>
                        <Button
                            onClick={onConfirm}
                            disabled={files.length === 0 || files.some(f => f.progress < 100)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 rounded-xl shadow-lg shadow-blue-100 disabled:opacity-50 transition-all"
                        >
                            {isAI ? '确认归档' : '确认上传'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

