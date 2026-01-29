
import { useState } from 'react';
import { DetailedKnowledgeBase, KBFile, BrandSelectionItem, ProductQuoteItem, RndQuoteItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { FilePreview } from './FilePreview';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    ArrowLeft,
    ChevronRight,
    Home,
    Upload,
    FolderPlus,
    FilePlus,
    Folder,
    FileText,
    FileSpreadsheet,
    File,
    Eye,
    Download,
    Search,
    LayoutGrid,
    List as ListIcon,
    Lock,
    Pencil,
    Trash2,
    DraftingCompass,
    Move,
    LayoutTemplate,
    PenTool,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { MoveModal } from './MoveModal';
import { EditItemModal } from './EditItemModal';
import { CreateByTemplateModal } from './CreateByTemplateModal';
import { OnlineCreationModal } from './OnlineCreationModal';
import { FolderOperationModal } from './FolderOperationModal';

interface LibraryDetailProps {
    library: DetailedKnowledgeBase;
    allLibraries: DetailedKnowledgeBase[];
    onBack: () => void;
    onUploadFile: () => void;
    onUploadFolder: () => void;
    onPreviewFile: (file: any) => void;
    previewFile: any | null;
}

// Helper for file icons
const getFileIcon = (type: string) => {
    switch (type) {
        case 'folder': return <Folder className="h-5 w-5 text-blue-500 fill-blue-50" />;
        case 'word': return <FileText className="h-5 w-5 text-blue-600" />;
        case 'excel': return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
        case 'ppt': return <File className="h-5 w-5 text-orange-600" />; // Lucide doesn't have ppt specific
        case 'pdf': return <FileText className="h-5 w-5 text-red-600" />;
        case 'image': return <File className="h-5 w-5 text-purple-600" />;
        case 'cad': return <DraftingCompass className="h-5 w-5 text-cyan-600" />;
        default: return <File className="h-5 w-5 text-gray-400" />;
    }
};

export function LibraryDetail({ library, allLibraries, onBack, onUploadFile, onUploadFolder, onPreviewFile, previewFile }: LibraryDetailProps) {
    const [searchTerm, setSearchTerm] = useState('');
    // 模拟新建文件夹的临时状态
    const [tempFolders, setTempFolders] = useState<KBFile[]>([]);

    // 移动文件相关状态
    const [movingFile, setMovingFile] = useState<KBFile | null>(null);
    const [showMoveModal, setShowMoveModal] = useState(false);

    // 编辑数据项相关状态
    const [editingItem, setEditingItem] = useState<any>(null);
    const [showEditItemModal, setShowEditItemModal] = useState(false);
    const [editType, setEditType] = useState<'brand' | 'quote-equipment' | 'quote-rnd'>('brand');

    // 模板新建相关状态
    const [showTemplateModal, setShowTemplateModal] = useState(false);

    // 在线创作相关状态
    // 在线创作相关状态
    const [showOnlineCreationModal, setShowOnlineCreationModal] = useState(false);

    // 文件夹操作相关状态
    const [folderModalState, setFolderModalState] = useState<{
        open: boolean;
        type: 'create' | 'rename';
        targetFile?: KBFile;
    }>({ open: false, type: 'create' });

    // 本地重命名状态 (用于演示目的，覆盖原始数据)
    const [renamedItems, setRenamedItems] = useState<Record<string, string>>({});

    // 状态追踪当前在哪个文件夹里
    const [folderStack, setFolderStack] = useState<KBFile[]>([]);

    // 视图模式与标签过滤
    const [viewMode, setViewMode] = useState<'folder' | 'tag'>('folder');
    const [selectedTag, setSelectedTag] = useState<string>('全部');

    // 递归获取所有非文件夹文件
    const getAllFiles = (files: KBFile[]): KBFile[] => {
        let result: KBFile[] = [];
        files.forEach(file => {
            if (file.type !== 'folder') {
                result.push(file);
            }
            if (file.children && file.children.length > 0) {
                result = [...result, ...getAllFiles(file.children)];
            }
        });
        return result;
    };

    const allFilesFlattened = getAllFiles(library.files || []);
    const uniqueTags = Array.from(new Set(allFilesFlattened.flatMap(f => f.tags || [])));

    // 标签颜色生成器
    const getTagColor = (tag: string, isActive: boolean) => {
        if (tag === '全部') {
            return isActive
                ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                : "bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600";
        }

        const themes = [
            { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100", active: "bg-blue-600 text-white border-blue-600" },
            { bg: "bg-green-50", text: "text-green-600", border: "border-green-100", active: "bg-green-600 text-white border-green-600" },
            { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100", active: "bg-purple-600 text-white border-purple-600" },
            { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-100", active: "bg-orange-600 text-white border-orange-600" },
            { bg: "bg-cyan-50", text: "text-cyan-600", border: "border-cyan-100", active: "bg-cyan-600 text-white border-cyan-600" },
            { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-100", active: "bg-rose-600 text-white border-rose-600" },
        ];

        const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const theme = themes[hash % themes.length];

        return isActive
            ? `${theme.active} shadow-sm`
            : `${theme.bg} ${theme.text} ${theme.border} hover:scale-105 transition-transform`;
    };

    const currentFiles = folderStack.length > 0
        ? (folderStack[folderStack.length - 1].children || [])
        : (library.files || []);

    const handleFolderClick = (file: KBFile) => {
        if (file.type === 'folder') {
            setFolderStack(prev => [...prev, file]);
        }
    };

    const handleBackToParent = (index: number) => {
        if (index === -1) {
            setFolderStack([]); // 回到根目录
        } else {
            setFolderStack(prev => prev.slice(0, index + 1));
        }
    };


    const handleCreateFolder = () => {
        setFolderModalState({ open: true, type: 'create' });
    };

    const handleRenameFolder = (file: KBFile) => {
        setFolderModalState({ open: true, type: 'rename', targetFile: file });
    };

    const handleFolderOperationConfirm = (name: string) => {
        if (folderModalState.type === 'create') {
            const newFolder: KBFile = {
                id: `new-${Date.now()}`,
                name: name,
                type: 'folder',
                updatedAt: new Date().toISOString().split('T')[0],
                views: 0,
                downloads: 0,
                children: [],
                parentId: folderStack.length > 0 ? folderStack[folderStack.length - 1].id : undefined
            };
            setTempFolders(prev => [...prev, newFolder]);
            toast.success('已创建新文件夹');
        } else if (folderModalState.type === 'rename' && folderModalState.targetFile) {
            // Update temp folders if it exists there
            setTempFolders(prev => prev.map(f => f.id === folderModalState.targetFile!.id ? { ...f, name } : f));

            // Update local rename map for persistent items
            setRenamedItems(prev => ({
                ...prev,
                [folderModalState.targetFile!.id]: name
            }));

            toast.success('文件夹已重命名');
        }
    };

    const handleUploadFolder = () => {
        onUploadFolder();
    };

    const handleMoveClick = (file: KBFile) => {
        setMovingFile(file);
        setShowMoveModal(true);
    };

    const handleMoveConfirm = (targetLibId: string, targetFolderId?: string) => {
        const targetLib = allLibraries.find(l => l.id === targetLibId);
        const folderName = targetFolderId ? '文件夹' : '根目录';
        toast.success(`文件 "${movingFile?.name}" 已移动到 "${targetLib?.name}" 的 ${folderName}`);
        setShowMoveModal(false);
    };

    const handleTemplateCreate = (projectName: string, templateType: string) => {
        const templates = templateType === '项目阶段模板'
            ? ['0.POC测试阶段', '1.项目建议书', '2.可研阶段', '3.招投标&合同', '4.初步设计', '5.初期验收', '6.施工建设', '7.终验移交', '8.变更及结算', 'A.政策相关资料', 'B.项目宣传推介']
            : ['01_技术方案', '02_设计图纸', '03_合同协议', '04_会议纪要', '05_交付成果', '06_财务报表', '07_沟通记录', '08_申报资料'];

        const newProject: KBFile = {
            id: `project-${Date.now()}`,
            name: projectName,
            type: 'folder',
            updatedAt: new Date().toISOString().split('T')[0],
            views: 0,
            downloads: 0,
            children: templates.map((name, i) => ({
                id: `sub-${Date.now()}-${i}`,
                name,
                type: 'folder',
                updatedAt: new Date().toISOString().split('T')[0],
                views: 0,
                downloads: 0,
                children: []
            }))
        };

        toast.success(`项目 "${projectName}" 已按 "${templateType}" 初始化完成`);
        setTempFolders(prev => [newProject, ...prev]);
    };

    const handleOnlineCreate = (fileData: { name: string; type: string; tags: string[]; description: string; template?: string }) => {
        const newFile: KBFile = {
            id: `online-${Date.now()}`,
            name: fileData.name,
            type: fileData.type.includes('doc') ? 'word' :
                fileData.type.includes('sheet') ? 'excel' :
                    fileData.type.includes('slide') ? 'ppt' : 'pdf', // Mapping back to standard types for icon consistency
            size: '0 KB',
            updatedAt: new Date().toISOString().split('T')[0],
            views: 0,
            downloads: 0,
            tags: fileData.tags,
            description: fileData.description,
            isLocked: false,
        };

        // Use tempFolders strictly for rendering at the top. Since it's typed as KBFile[], it fits.
        setTempFolders(prev => [newFile, ...prev]);
        toast.success(`"${fileData.name}" 创建成功`);
    };

    const handleEditItem = (item: any, type: 'brand' | 'quote-equipment' | 'quote-rnd') => {
        setEditingItem(item);
        setEditType(type);
        setShowEditItemModal(true);
    };

    const handleEditConfirm = (updatedItem: any) => {
        toast.success(`条目 "${updatedItem.name || updatedItem.functionName}" 已更新`);
        // 这里如果是真实应用会更新 allLibraries 状态或发送 API
    };

    const handleDeleteItem = (item: any) => {
        toast(`确定要删除此条目吗？`, {
            action: {
                label: '删除',
                onClick: () => toast.success('已删除条目')
            }
        });
    };

    const handleDeleteFile = (file: KBFile) => {
        toast(`确定要删除文件 "${file.name}" 吗？`, {
            action: {
                label: '删除',
                onClick: () => {
                    toast.success('已删除文件');
                    // In real app, call API and update state
                }
            }
        });
    };

    // Mock Parse Status helper
    const getParseStatus = (file: KBFile) => {
        if (file.type === 'folder') return null;

        // Special logic for Standard Drawing Library
        if (library.name === '标准图纸库') {
            return 'unparsable';
        }

        // Mock logic using hash of ID/Name to be deterministic
        const hash = file.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        // Adjusted probability for demo: mostly success, some processing, few unparsable
        const statuses = ['success', 'success', 'success', 'processing', 'unparsable'];
        return statuses[hash % statuses.length];
    };


    // --- Renderers for Different View Types ---

    const renderFileList = () => {
        const currentParentId = folderStack.length > 0 ? folderStack[folderStack.length - 1].id : undefined;
        // Filter temp folders that belong to current view
        const relevantTempFolders = tempFolders.filter(tf => tf.parentId === currentParentId);

        // Combine relevant temp folders with persistent current files
        const displayFiles = [...relevantTempFolders, ...currentFiles];

        return (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                {/* Breadcrumbs / Tag Navigation */}
                {viewMode === 'folder' ? (
                    <div className="flex items-center gap-1 px-4 py-2 bg-slate-50 border-b border-transparent text-xs text-slate-500">
                        <button
                            onClick={() => handleBackToParent(-1)}
                            className={cn("hover:text-blue-600 transition-colors flex items-center gap-1", folderStack.length === 0 ? "text-blue-600 font-bold" : "")}
                        >
                            <Home className="h-3 w-3" /> 全部文件
                        </button>
                        {folderStack.map((folder, i) => (
                            <div key={folder.id} className="flex items-center gap-1">
                                <ChevronRight className="h-3 w-3 text-slate-300" />
                                <button
                                    onClick={() => handleBackToParent(i)}
                                    className={cn("hover:text-blue-600 transition-colors", i === folderStack.length - 1 ? "text-blue-600 font-bold" : "")}
                                >
                                    {folder.name}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-200 flex items-start gap-3">
                        <div className="flex items-center gap-1.5 mt-1.5 shrink-0">
                            <PenTool className="h-3.5 w-3.5 text-blue-500" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">分类检索</span>
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                            <Badge
                                variant="outline"
                                className={cn(
                                    "cursor-pointer h-7 px-4 text-xs font-medium transition-all duration-200 border",
                                    getTagColor('全部', selectedTag === '全部')
                                )}
                                onClick={() => setSelectedTag('全部')}
                            >
                                全部
                            </Badge>
                            {uniqueTags.map(tag => (
                                <Badge
                                    key={tag}
                                    variant="outline"
                                    className={cn(
                                        "cursor-pointer h-7 px-4 text-xs font-medium transition-all duration-200 border",
                                        getTagColor(tag, selectedTag === tag)
                                    )}
                                    onClick={() => setSelectedTag(tag)}
                                >
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="w-[25%]">名称</TableHead>
                            <TableHead className="w-[15%]">标签</TableHead>
                            <TableHead className="w-[8%]">大小</TableHead>
                            <TableHead className="w-[10%]">类型</TableHead>
                            <TableHead className="w-[10%]">解析状态</TableHead>
                            <TableHead className="w-[10%]">浏览/下载</TableHead>
                            <TableHead className="w-[12%]">更新时间</TableHead>
                            <TableHead className="w-[10%] text-right pr-[140px]">操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(() => {
                            let files = viewMode === 'folder' ? displayFiles : allFilesFlattened;

                            // Apply tag filter
                            if (viewMode === 'tag' && selectedTag !== '全部') {
                                files = files.filter(f => f.tags?.includes(selectedTag));
                            }

                            // Apply search filter
                            if (searchTerm) {
                                files = files.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
                            }

                            return files.sort((a, b) => {
                                // 1. 文件夹优先 (only meaningful in folder mode)
                                if (viewMode === 'folder') {
                                    if (a.type === 'folder' && b.type !== 'folder') return -1;
                                    if (a.type !== 'folder' && b.type === 'folder') return 1;
                                }
                                // 2. 时间倒序 (最新在前)
                                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
                            });
                        })()
                            .map((file) => {
                                const isTemp = tempFolders.some(tf => tf.id === file.id);
                                // Apply rename override if exists
                                const displayName = renamedItems[file.id] || file.name;

                                return (
                                    <TableRow key={file.id} className={cn("hover:bg-slate-50", isTemp ? "bg-blue-50/10" : "")}>
                                        <TableCell>
                                            <div
                                                className={cn("flex items-center gap-3 cursor-pointer", file.type === 'folder' ? "group" : "hover:text-blue-600")}
                                                onClick={() => {
                                                    if (file.type === 'folder') {
                                                        handleFolderClick(file);
                                                    } else {
                                                        onPreviewFile(file);
                                                    }
                                                }}
                                            >
                                                <div className="relative">
                                                    {getFileIcon(file.type)}
                                                    {file.isLocked && (
                                                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                                                            <Lock className="h-2.5 w-2.5 text-amber-500" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={cn(
                                                        "font-medium truncate max-w-[200px] flex items-center gap-2 transition-colors",
                                                        file.type === 'folder' ? "text-slate-700 group-hover:text-blue-600" : "text-slate-600"
                                                    )}>
                                                        {displayName}
                                                        {file.isLocked && <Badge variant="outline" className="text-[10px] h-4 px-1 text-amber-600 bg-amber-50 border-amber-200">涉密</Badge>}
                                                    </span>
                                                    {isTemp ? (
                                                        <span className="text-[10px] text-blue-500">刚刚创建</span>
                                                    ) : (
                                                        file.description && (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <span className="text-[10px] text-slate-400 truncate max-w-[200px] cursor-help">{file.description}</span>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="bottom" align="start" className="max-w-xs break-all bg-white text-slate-800 border-slate-200 shadow-xl p-3">
                                                                    <div className="space-y-1">
                                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">文件说明</div>
                                                                        <div className="text-xs leading-relaxed">{file.description}</div>
                                                                    </div>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="flex flex-wrap gap-1 max-h-[40px] overflow-hidden relative pr-4 group/tags cursor-help">
                                                            {file.tags && file.tags.length > 0 ? (
                                                                <>
                                                                    {file.tags.map((tag, idx) => (
                                                                        <Badge
                                                                            key={idx}
                                                                            variant="secondary"
                                                                            className="text-[10px] px-1.5 py-0 h-4 bg-slate-100 text-slate-500 border-slate-200 font-normal"
                                                                        >
                                                                            {tag}
                                                                        </Badge>
                                                                    ))}
                                                                    {file.tags.length > 4 && (
                                                                        <span className="text-[10px] text-slate-400 absolute bottom-0 right-0 bg-white/80 px-0.5 ml-1">...</span>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <span className="text-slate-300 text-[10px]">-</span>
                                                            )}
                                                        </div>
                                                    </TooltipTrigger>
                                                    {file.tags && file.tags.length > 0 && (
                                                        <TooltipContent className="max-w-[200px] p-2 bg-white border-slate-200 shadow-lg">
                                                            <div className="flex flex-wrap gap-1">
                                                                {file.tags.map((tag, idx) => (
                                                                    <Badge key={idx} variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-blue-50 text-blue-600 border-blue-100">
                                                                        {tag}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </TooltipContent>
                                                    )}
                                                </Tooltip>
                                            </TooltipProvider>
                                        </TableCell>
                                        <TableCell className="text-slate-500 text-sm whitespace-nowrap">{file.size || '-'}</TableCell>
                                        <TableCell className="text-slate-500 text-sm capitalize">{file.type}</TableCell>
                                        <TableCell>
                                            {(() => {
                                                const status = getParseStatus(file);
                                                if (!status) return null;
                                                if (status === 'success') return <Badge variant="secondary" className="bg-green-50 text-green-600 border-green-200">解析完成</Badge>;
                                                if (status === 'processing') return <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-200">解析中</Badge>;
                                                if (status === 'unparsable') return <Badge variant="secondary" className="bg-gray-100 text-gray-500 border-gray-200">不可解析</Badge>;
                                                if (status === 'failed') return <Badge variant="secondary" className="bg-red-50 text-red-600 border-red-200">解析失败</Badge>;
                                            })()}
                                        </TableCell>
                                        <TableCell className="text-slate-500 text-sm">{file.views} / {file.downloads}</TableCell>
                                        <TableCell className="text-slate-500 text-sm">{file.updatedAt}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2 text-slate-400">
                                                <TooltipProvider>
                                                    {(file.type !== 'folder' && file.type !== 'cad') && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 hover:text-blue-600"
                                                                    onClick={() => onPreviewFile(file)}
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>预览</TooltipContent>
                                                        </Tooltip>
                                                    )}

                                                    {file.type === 'folder' && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 hover:text-blue-600"
                                                                    onClick={() => handleRenameFolder(file)}
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>重命名</TooltipContent>
                                                        </Tooltip>
                                                    )}

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 hover:text-blue-600"
                                                                onClick={() => handleMoveClick(file)}
                                                            >
                                                                <Move className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>移动</TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 hover:text-blue-600"
                                                                onClick={() => toast.success('开始下载文件...')}
                                                            >
                                                                <Download className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>下载</TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 hover:text-red-600"
                                                                onClick={() => handleDeleteFile(file)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>删除</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        }
                    </TableBody>
                </Table>
            </div>
        );
    };

    const renderBrandGrid = () => (
        <div className="grid grid-cols-4 gap-4">
            {library.brandItems?.map(item => (
                <Card key={item.id} className="group overflow-hidden hover:shadow-lg transition-all border-slate-200 relative">
                    <div className="h-32 bg-slate-100 flex items-center justify-center relative overflow-hidden">
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => (e.currentTarget.src = 'https://placehold.co/400x300?text=No+Image')} />
                        <Badge className={cn("absolute top-2 left-2 z-10", item.status === 'active' ? 'bg-green-500' : 'bg-slate-500')}>
                            {item.status === 'active' ? '在售' : '停产'}
                        </Badge>

                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
                            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={() => handleEditItem(item, 'brand')}>
                                <Pencil className="h-3.5 w-3.5 text-slate-700" />
                            </Button>
                            <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full" onClick={() => handleDeleteItem(item)}>
                                <Trash2 className="h-3.5 w-3.5 text-white" />
                            </Button>
                        </div>
                    </div>
                    <CardContent className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-slate-800 truncate flex-1">{item.name}</h3>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">型号: {item.model}</p>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">当前售价</span>
                                <span className="text-sm font-bold text-red-600">{item.price}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">成本参考</span>
                                <span className="text-xs text-slate-400 line-through">{item.cost}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    const renderQuoteList = () => (
        <Tabs defaultValue="equipment" className="w-full">
            <TabsList>
                <TabsTrigger value="equipment">设备报价</TabsTrigger>
                <TabsTrigger value="rnd">研发报价</TabsTrigger>
            </TabsList>
            <TabsContent value="equipment">
                <div className="bg-white rounded-lg border border-slate-200 mt-2">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>物料号</TableHead>
                                <TableHead>设备名称</TableHead>
                                <TableHead>区域</TableHead>
                                <TableHead>价格</TableHead>
                                <TableHead>报价时间</TableHead>
                                <TableHead className="text-right">操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {library.quoteItems?.equipment.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.materialNo}</TableCell>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{item.region}</TableCell>
                                    <TableCell className="text-red-600 font-semibold">{item.price}</TableCell>
                                    <TableCell className="text-slate-500 text-sm">{item.quoteTime}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => handleEditItem(item, 'quote-equipment')}>
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => handleDeleteItem(item)}>
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </TabsContent>
            <TabsContent value="rnd">
                <div className="bg-white rounded-lg border border-slate-200 mt-2">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>功能名称</TableHead>
                                <TableHead>系统名称</TableHead>
                                <TableHead>单价</TableHead>
                                <TableHead>人/月</TableHead>
                                <TableHead>总价</TableHead>
                                <TableHead>报价时间</TableHead>
                                <TableHead className="text-right">操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {library.quoteItems?.rnd.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.functionName}</TableCell>
                                    <TableCell>{item.systemName}</TableCell>
                                    <TableCell>{item.unitPrice}</TableCell>
                                    <TableCell>{item.manMonth}</TableCell>
                                    <TableCell className="text-red-600 font-semibold">{item.totalPrice}</TableCell>
                                    <TableCell className="text-slate-500 text-sm">{item.quoteTime}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => handleEditItem(item, 'quote-rnd')}>
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => handleDeleteItem(item)}>
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </TabsContent>
        </Tabs>
    );

    return (
        <div className="flex flex-col h-full bg-[#f5f7fa]">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-slate-100 rounded-full">
                        <ArrowLeft className="h-5 w-5 text-slate-600" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                            <Folder className="h-5 w-5 fill-current" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-800 leading-tight">{library.name}</h1>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                <span>{library.documentCount} 文件</span>
                                <span className="w-px h-3 bg-slate-300" />
                                <span>{library.members.length} 成员</span>
                                <span className="w-px h-3 bg-slate-300" />
                                <span className="max-w-[300px] truncate" title={library.description}>{library.description}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="p-4 pb-2 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2" onClick={onUploadFile}>
                        <Upload className="h-4 w-4" /> 上传文件
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={handleUploadFolder}>
                        <FolderPlus className="h-4 w-4" /> 上传文件夹
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={handleCreateFolder}>
                        <FilePlus className="h-4 w-4" /> 新建文件夹
                    </Button>
                    {!['品牌选型库', '产品报价库', '政策文件库', '产品资料库', '标准图纸库'].includes(library.name) && (
                        <Button variant="outline" className="gap-2 border-dashed border-blue-300 text-blue-600 bg-blue-50/50 hover:bg-blue-50" onClick={() => setShowOnlineCreationModal(true)}>
                            <PenTool className="h-4 w-4" /> 在线创作
                        </Button>
                    )}
                    {(library.name.includes('项目') || library.name.includes('工程')) && (
                        <Button variant="outline" className="gap-2 border-blue-200 text-blue-600 hover:bg-blue-50" onClick={() => setShowTemplateModal(true)}>
                            <LayoutTemplate className="h-4 w-4" /> 选择模板新建
                        </Button>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-slate-100 p-1 rounded-lg mr-2">
                        <Button
                            variant={viewMode === 'folder' ? "secondary" : "ghost"}
                            size="sm"
                            className={cn("h-7 px-2.5 gap-1.5 text-xs font-medium", viewMode === 'folder' ? "bg-white shadow-sm text-blue-600" : "text-slate-500")}
                            onClick={() => setViewMode('folder')}
                        >
                            <LayoutGrid className="h-3.5 w-3.5" />
                            文件夹
                        </Button>
                        <Button
                            variant={viewMode === 'tag' ? "secondary" : "ghost"}
                            size="sm"
                            className={cn("h-7 px-2.5 gap-1.5 text-xs font-medium", viewMode === 'tag' ? "bg-white shadow-sm text-blue-600" : "text-slate-500")}
                            onClick={() => setViewMode('tag')}
                        >
                            <PenTool className="h-3.5 w-3.5" />
                            标签
                        </Button>
                    </div>

                    <div className="relative w-64">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="搜索库内文件..." className="pl-9 h-9 bg-white" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {previewFile ? (
                <div className="flex-1 overflow-hidden p-4 pt-2 flex flex-col">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full overflow-hidden">
                        <FilePreview
                            title={previewFile.name}
                            content={previewFile.content || "暂无内容"}
                            onClose={() => onPreviewFile(null)}
                        />
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto p-4 pt-2 custom-scrollbar">
                    {library.viewType === 'brand-card' && renderBrandGrid()}
                    {library.viewType === 'quote-table' && renderQuoteList()}
                    {(!library.viewType || library.viewType === 'list') && renderFileList()}
                </div>
            )}

            {movingFile && (
                <MoveModal
                    open={showMoveModal}
                    onOpenChange={setShowMoveModal}
                    fileName={movingFile.name}
                    libraries={allLibraries}
                    onConfirm={handleMoveConfirm}
                />
            )}

            <EditItemModal
                open={showEditItemModal}
                onOpenChange={setShowEditItemModal}
                item={editingItem}
                type={editType}
                onConfirm={handleEditConfirm}
            />

            <CreateByTemplateModal
                open={showTemplateModal}
                onOpenChange={setShowTemplateModal}
                onConfirm={handleTemplateCreate}
            />

            <OnlineCreationModal
                open={showOnlineCreationModal}
                onOpenChange={setShowOnlineCreationModal}
                onConfirm={handleOnlineCreate}
            />

            <FolderOperationModal
                open={folderModalState.open}
                onOpenChange={(open) => setFolderModalState(prev => ({ ...prev, open }))}
                type={folderModalState.type}
                initialName={folderModalState.targetFile?.name}
                onConfirm={handleFolderOperationConfirm}
            />
        </div>
    );
}

