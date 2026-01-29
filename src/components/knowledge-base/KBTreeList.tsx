
import React, { useState } from 'react';
import { DetailedKnowledgeBase, KBFile } from '@/types';
import {
    ChevronRight,
    ChevronDown,
    Folder,
    FileText,
    FileSpreadsheet,
    File,
    MoreVertical,
    Eye,
    Download,
    Pencil,
    Move,
    Trash2,
    DraftingCompass,
    Library
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface KBTreeListProps {
    libraries: DetailedKnowledgeBase[];
    onEnterLibrary: (id: string) => void;
    compact?: boolean;
    onSelectFile?: (file: KBFile) => void;
    selectedFileId?: string | null;
}

// 辅助函数：根据类型获取图标
const getFileIcon = (type: string) => {
    switch (type) {
        case 'folder': return <Folder className="h-4 w-4 text-blue-500 fill-blue-50" />;
        case 'word': return <FileText className="h-4 w-4 text-blue-600" />;
        case 'excel': return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
        case 'ppt': return <File className="h-4 w-4 text-orange-600" />;
        case 'pdf': return <FileText className="h-4 w-4 text-red-600" />;
        case 'image': return <File className="h-4 w-4 text-purple-600" />;
        case 'cad': return <DraftingCompass className="h-4 w-4 text-cyan-600" />;
        default: return <File className="h-4 w-4 text-gray-400" />;
    }
};

const TreeItem = ({
    item,
    level,
    isLibrary = false,
    onToggle,
    isExpanded,
    onEnterLibrary,
    compact,
    onSelectFile,
    selectedFileId
}: {
    item: any;
    level: number;
    isLibrary?: boolean;
    onToggle?: () => void;
    isExpanded?: boolean;
    onEnterLibrary?: (id: string) => void;
    compact?: boolean;
    onSelectFile?: (file: KBFile) => void;
    selectedFileId?: string | null;
}) => {
    const isFolder = isLibrary || item.type === 'folder';
    const hasChildren = isLibrary ? (item.files && item.files.length > 0) : (item.children && item.children.length > 0);
    const isSelected = selectedFileId === item.id;

    const handleAction = (action: string) => {
        toast.info(`正在执行: ${action} - ${item.name}`);
        if (action === '预览' && item.type !== 'folder' && onSelectFile) {
            onSelectFile(item);
        }
    };

    return (
        <div className="group">
            <div
                className={cn(
                    "flex items-center py-2 px-4 hover:bg-slate-50 transition-colors cursor-pointer border-b border-transparent",
                    isLibrary && "bg-slate-50/30"
                )}
                style={{ paddingLeft: '12px' }}
                onClick={() => {
                    if (isLibrary) {
                        onToggle?.();
                    } else if (isFolder) {
                        onToggle?.();
                    } else {
                        // File click
                        onSelectFile?.(item);
                    }
                }}
            >
                {/* 展开/收起箭头 */}
                <div className="w-5 h-5 flex items-center justify-center mr-1 text-slate-400">
                    {hasChildren ? (
                        isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                    ) : null}
                </div>

                {/* 图标 */}
                <div className="mr-3">
                    {isLibrary ? (
                        <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-600">
                            <Library className="h-4 w-4 fill-current" />
                        </div>
                    ) : (
                        getFileIcon(item.type)
                    )}
                </div>

                {/* 内容 */}
                <div className="flex-1 flex items-center justify-between min-w-0 mr-4">
                    <div className="flex flex-col min-w-0">
                        <span className={cn(
                            "text-sm font-medium truncate",
                            isLibrary ? "text-slate-900" : "text-slate-700",
                            compact ? "max-w-[180px]" : ""
                        )} title={compact ? item.name : undefined}>
                            {item.name}
                        </span>
                        {!isFolder && item.description && !compact && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="text-xs text-slate-400 truncate cursor-help">{item.description}</span>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" align="start" className="max-w-xs break-all bg-white text-slate-800 border-slate-200 shadow-xl p-3">
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">文件说明</div>
                                        <div className="text-xs leading-relaxed">{item.description}</div>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>

                    <div className="flex items-center gap-8 flex-shrink-0">
                        {!isFolder && !compact && (
                            <span className="text-xs text-slate-400 w-32 text-right">
                                {item.updatedAt}
                            </span>
                        )}

                        {/* 操作按钮 */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-32">
                                    {isLibrary ? (
                                        <DropdownMenuItem onClick={() => onEnterLibrary?.(item.id)}>
                                            <Eye className="mr-2 h-4 w-4" /> 进入库
                                        </DropdownMenuItem>
                                    ) : (
                                        <>
                                            {item.type !== 'folder' && (
                                                <DropdownMenuItem onClick={() => handleAction('预览')}>
                                                    <Eye className="mr-2 h-4 w-4" /> 预览
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem onClick={() => handleAction('下载')}>
                                                <Download className="mr-2 h-4 w-4" /> 下载
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleAction('重命名')}>
                                                <Pencil className="mr-2 h-4 w-4" /> 重命名
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleAction('移动')}>
                                                <Move className="mr-2 h-4 w-4" /> 移动
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600" onClick={() => handleAction('删除')}>
                                                <Trash2 className="mr-2 h-4 w-4" /> 删除
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>

            {/* 子节点递归 */}
            {isExpanded && (
                <div className="border-l border-slate-100 ml-[23px]">
                    {isLibrary ? (
                        item.files?.map((file: KBFile) => (
                            <TreeNode key={file.id} node={file} level={1} compact={compact} onSelectFile={onSelectFile} selectedFileId={selectedFileId} />
                        ))
                    ) : (
                        item.children?.map((child: KBFile) => (
                            <TreeNode key={child.id} node={child} level={level + 1} compact={compact} onSelectFile={onSelectFile} selectedFileId={selectedFileId} />
                        ))
                    )}
                    {(isLibrary && (!item.files || item.files.length === 0)) || (!isLibrary && isFolder && (!item.children || item.children.length === 0)) ? (
                        <div
                            className={cn("py-2 text-xs text-slate-400 italic", compact ? "pl-1" : "pl-3")}
                        >
                            暂无内容
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
};

const TreeNode = ({ node, level, compact, onSelectFile, selectedFileId }: {
    node: KBFile;
    level: number;
    compact?: boolean;
    onSelectFile?: (file: KBFile) => void;
    selectedFileId?: string | null;
}) => {
    const [expanded, setExpanded] = useState(true);
    return (
        <TreeItem
            item={node}
            level={level}
            isExpanded={expanded}
            onToggle={() => setExpanded(!expanded)}
            compact={compact}
            onSelectFile={onSelectFile}
            selectedFileId={selectedFileId}
        />
    );
};

export function KBTreeList({ libraries, onEnterLibrary, compact = false, onSelectFile, selectedFileId }: KBTreeListProps) {
    const [expandedLibIds, setExpandedLibIds] = useState<Set<string>>(new Set(libraries.map(l => l.id)));

    const toggleLib = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        const next = new Set(expandedLibIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedLibIds(next);
    };

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className={cn("min-w-[800px]", compact && "min-w-0 w-full")}>
                {/* Header Row - Hide in compact mode */}
                {!compact && (
                    <div className="flex items-center py-3 px-4 bg-slate-50/50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <div className="flex-1 pl-8">名称</div>
                        <div className="flex items-center gap-8 flex-shrink-0">
                            <div className="text-right pr-6 whitespace-nowrap">更新时间 / 操作</div>
                        </div>
                    </div>
                )}

                {libraries.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 italic">
                        暂无知识库
                    </div>
                ) : (
                    libraries.map(lib => (
                        <TreeItem
                            key={lib.id}
                            item={lib}
                            level={0}
                            isLibrary={true}
                            isExpanded={expandedLibIds.has(lib.id)}
                            onToggle={() => toggleLib(lib.id)}
                            onEnterLibrary={onEnterLibrary}
                            compact={compact}
                            onSelectFile={onSelectFile}
                            selectedFileId={selectedFileId}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
