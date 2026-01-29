
import { DetailedKnowledgeBase } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Library, MoreHorizontal, Users, Edit, Trash2, Clock, FileCheck, FileWarning, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils'; // Keep using the project's utility

interface LibraryCardProps {
    library: DetailedKnowledgeBase;
    onClick: () => void;
    onEdit: (e: React.MouseEvent) => void;
    onDelete: (e: React.MouseEvent) => void;
    onMembers: (e: React.MouseEvent) => void;
    onShare: (e: React.MouseEvent) => void;
}

export function LibraryCard({ library, onClick, onEdit, onDelete, onMembers, onShare }: LibraryCardProps) {
    const isSystem = library.badge === 'system';

    return (
        <Card
            className="cursor-pointer hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-300 border-slate-100/80 group transform hover:-translate-y-1 rounded-[24px]"
            onClick={onClick}
        >
            <CardHeader className="pt-4 px-5 pb-0 space-y-0">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 max-w-[85%]">
                        <CardTitle className="text-[14px] font-bold truncate text-slate-800" title={library.name}>
                            {library.name}
                        </CardTitle>
                        {library.badge && (
                            <Badge variant="secondary" className={cn(
                                "text-[9px] px-1.5 h-4 font-bold border-none",
                                isSystem ? "bg-slate-100 text-slate-500" : "bg-orange-50 text-orange-500"
                            )}>
                                {isSystem ? '系统库' : '自定义库'}
                            </Badge>
                        )}
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" className="h-6 w-6 p-0 hover:bg-slate-50 rounded-full -mr-2">
                                <MoreHorizontal className="h-3.5 w-3.5 text-slate-300" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-slate-100 shadow-xl">
                            {!isSystem && <DropdownMenuItem onClick={onEdit} className="rounded-lg gap-2 text-xs font-medium"><Edit className="h-3.5 w-3.5" /> 编辑</DropdownMenuItem>}
                            {!isSystem && <DropdownMenuItem onClick={onDelete} className="text-red-500 focus:text-red-500 rounded-lg gap-2 text-xs font-medium"><Trash2 className="h-3.5 w-3.5" /> 删除</DropdownMenuItem>}
                            <DropdownMenuItem onClick={onMembers} className="rounded-lg gap-2 text-xs font-medium"><Users className="h-3.5 w-3.5" /> 成员</DropdownMenuItem>
                            {!isSystem && <DropdownMenuItem onClick={onShare} className="rounded-lg gap-2 text-xs font-medium text-blue-600 focus:text-blue-600"><Share2 className="h-3.5 w-3.5" /> 分享</DropdownMenuItem>}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="pt-4 px-5 pb-4">
                <div className="flex flex-col items-center mb-4">
                    <div className={cn(
                        "w-14 h-14 rounded-[20px] flex items-center justify-center transition-all duration-300 group-hover:scale-105",
                        isSystem ? "bg-blue-50/80 text-blue-500" : "bg-orange-50/80 text-orange-500"
                    )}>
                        <Library className="h-7 w-7 fill-current opacity-70" />
                    </div>
                </div>

                <div className="text-center px-1 mb-4">
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed h-[32px] overflow-hidden">
                        {library.description}
                    </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-50">
                    <div className="flex items-center justify-between text-[11px] font-medium">
                        <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
                            <FileCheck className="h-3 w-3 text-green-500" />
                            <span>解析 {library.parsedCount}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-300 text-[10px]">
                            <FileWarning className="h-3 w-3 text-orange-400" />
                            <span>未解析 {library.unparsedCount}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-200">
                        <Clock className="h-2.5 w-2.5" />
                        <span>{library.lastUpdated} 更新</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
