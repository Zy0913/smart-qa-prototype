'use client';

import { useState, useRef, useEffect } from 'react';
import {
    Send,
    Loader2,
    Copy,
    BookOpen,
    ExternalLink,
    ChevronDown,
    ChevronUp,
    FileText,
    X,
    Plus,
    Trash2,
    Brain,
    Zap,
    Globe,
    Paperclip,
    MessageSquare,
    File,
    History,
    Sparkles,
    RotateCcw,
    HelpCircle,
    Bell,
    HardDrive,
    Eye,
    ThumbsUp,
    ThumbsDown,
    ArrowRight,
    Search
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Message, KnowledgeBase } from '@/types';
import { KnowledgeBaseSelector } from '@/components/knowledge-base/KnowledgeBaseSelector';

interface AIChatPanelProps {
    messages: Message[];
    inputValue: string;
    setInputValue: (val: string) => void;
    isLoading: boolean;
    onSendMessage: (query?: string) => void;
    thinkingMode: 'normal' | 'deep';
    setThinkingMode: (mode: 'normal' | 'deep') => void;
    searchSource: 'local' | 'internet';
    setSearchSource: (source: 'local' | 'internet') => void;
    selectedKnowledgeBases: string[];
    setSelectedKnowledgeBases: (bases: string[]) => void;
    uploadedFiles: any[];
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveFile: (id: string) => void;
    onPreviewCitation: (citation: any) => void;
    onDeleteHistory: (e: React.MouseEvent, id: string) => void;
    historyItems: any[];
    selectedHistory: string | null;
    onSelectHistory: (id: string) => void;
    onNewChat: () => void;
    searchStatus?: {
        isSearching: boolean;
        currentStep: string;
        searchedCount: number;
        matchedCount: number;
        progress?: number;
    };
    thinkingSteps?: string[];
    isSidebar?: boolean;
}

// --- Extracted Components ---

// 1. HistoryList Component
interface HistoryListProps {
    className?: string;
    showSearch?: boolean;
    showHeader?: boolean;
    onSelect?: () => void;
    historyItems: any[];
    selectedHistory: string | null;
    onSelectHistory: (id: string) => void;
    onDeleteHistory: (e: React.MouseEvent, id: string) => void;
    onNewChat: () => void;
}

const HistoryList = ({
    className,
    showSearch = true,
    showHeader = false,
    onSelect,
    historyItems,
    selectedHistory,
    onSelectHistory,
    onDeleteHistory,
    onNewChat
}: HistoryListProps) => {
    const [historySearch, setHistorySearch] = useState('');

    const filteredHistoryGroups = historyItems.map(group => ({
        ...group,
        items: group.items.filter((item: any) =>
            item.title.toLowerCase().includes(historySearch.toLowerCase())
        )
    })).filter(group => group.items.length > 0);

    return (
        <div className={cn("flex flex-col h-full bg-white flex-shrink-0", className)}>
            {showHeader && (
                <div className="h-14 border-b border-slate-100 px-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <History className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-bold text-slate-700">历史记录</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={onNewChat}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>新对话</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            )}

            <div className="p-4 space-y-4">
                {!showHeader && (
                    <Button
                        onClick={onNewChat}
                        className="w-full justify-start gap-2 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl shadow-sm border h-10 px-4 transition-all active:scale-95"
                        variant="outline"
                    >
                        <Plus className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-sm">新对话</span>
                    </Button>
                )}

                {showSearch && (
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                            placeholder="搜索对话记录..."
                            className="pl-9 bg-slate-50/50 border-transparent rounded-xl h-10 text-[13px] focus-visible:ring-blue-500/20 focus-visible:bg-white focus-visible:border-blue-200 transition-all font-sans"
                            value={historySearch}
                            onChange={(e) => setHistorySearch(e.target.value)}
                        />
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-6">
                {filteredHistoryGroups.length > 0 ? (
                    filteredHistoryGroups.map((group) => (
                        <div key={group.date} className="mb-6">
                            <div className="px-4 py-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">{group.date}</div>
                            <div className="space-y-1">
                                {group.items.map((item: any) => (
                                    <div
                                        key={item.id}
                                        className={cn(
                                            "group flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] transition-all cursor-pointer relative",
                                            selectedHistory === item.id
                                                ? "bg-blue-50/40 text-blue-600 font-semibold"
                                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        )}
                                        onClick={() => {
                                            onSelectHistory(item.id);
                                            onSelect?.();
                                        }}
                                    >
                                        <MessageSquare className={cn("h-4 w-4 flex-shrink-0 opacity-70", selectedHistory === item.id ? "text-blue-500" : "text-slate-400")} />
                                        <span className="truncate flex-1">{item.title}</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteHistory(e, item.id);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                        {selectedHistory === item.id && (
                                            <div className="absolute left-1.5 w-1 h-5 bg-blue-500 rounded-full" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                        <History className="h-10 w-10 mb-3 opacity-20" />
                        <span className="text-xs font-medium">暂无对话记录</span>
                    </div>
                )}
            </div>
        </div>
    );
};

// 2. MessageContent Component (Enhanced Markdown)
const MessageContent = ({ content, citations, onPreviewCitation }: { content: string, citations?: any[], onPreviewCitation: (c: any) => void }) => {
    const parseBold = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-bold text-indigo-600">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    const lines = content.split('\n');
    return (
        <div className="prose prose-sm max-w-none space-y-1 text-slate-700 leading-7">
            {lines.map((line, lineIdx) => {
                if (!line.trim() && lineIdx !== lines.length - 1) return <br key={lineIdx} />;

                const parts = line.split(/(\[\d+\])/g);
                return (
                    <p key={lineIdx} className="leading-relaxed">
                        {parts.map((part, i) => {
                            const match = part.match(/\[(\d+)\]/);
                            if (match) {
                                const index = parseInt(match[1]);
                                const citation = citations?.[index - 1];
                                return (
                                    <TooltipProvider key={i}>
                                        <Tooltip delayDuration={300}>
                                            <TooltipTrigger asChild>
                                                <sup
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (citation) onPreviewCitation(citation);
                                                    }}
                                                    className="inline-flex items-center gap-0.5 min-w-[20px] h-4 px-1 mx-0.5 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-md hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all cursor-pointer select-none align-baseline relative -top-[2px]"
                                                >
                                                    <span>{index}</span>
                                                </sup>
                                            </TooltipTrigger>
                                            <TooltipContent className="p-3 border border-slate-200 shadow-xl bg-white/95 backdrop-blur-sm z-[100] max-w-[280px]">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[12px] font-bold text-slate-800 line-clamp-2">{citation?.title || '未知文件'}</span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="outline" className="text-[9px] h-4 px-1 bg-slate-50 text-slate-500 border-slate-200">PDF</Badge>
                                                        <span className="text-[10px] text-slate-400">点击预览全文</span>
                                                    </div>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                );
                            }
                            return parseBold(part);
                        })}
                    </p>
                );
            })}
        </div>
    );
};

// 3. ChatContent Component (Core UI)
interface ChatContentProps {
    messages: Message[];
    inputValue: string;
    setInputValue: (val: string) => void;
    isLoading: boolean;
    onSendMessage: (query?: string) => void;
    thinkingMode: 'normal' | 'deep';
    setThinkingMode: (mode: 'normal' | 'deep') => void;
    searchSource: 'local' | 'internet';
    setSearchSource: (source: 'local' | 'internet') => void;
    selectedKnowledgeBases: string[];
    setSelectedKnowledgeBases: (bases: string[]) => void;
    uploadedFiles: any[];
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveFile: (id: string) => void;
    onPreviewCitation: (citation: any) => void;
    searchStatus?: any;
    thinkingSteps?: string[];
    isSidebar?: boolean;
    showThinkingSteps: boolean;
    setShowThinkingSteps: (show: boolean) => void;
}

const ChatContent = ({
    messages,
    inputValue,
    setInputValue,
    isLoading,
    onSendMessage,
    thinkingMode,
    setThinkingMode,
    searchSource,
    setSearchSource,
    selectedKnowledgeBases,
    setSelectedKnowledgeBases,
    uploadedFiles,
    onFileUpload,
    onRemoveFile,
    onPreviewCitation,
    searchStatus,
    thinkingSteps,
    isSidebar,
    showThinkingSteps,
    setShowThinkingSteps
}: ChatContentProps) => {
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll when messages change or loading state changes
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading, searchStatus]);

    return (
        <div className="flex flex-col h-full bg-slate-50/30 relative">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto w-full p-6 space-y-8">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[60vh]">
                            <h2 className={cn(
                                "font-bold text-slate-800 flex items-center gap-2",
                                isSidebar ? "text-[16px] leading-snug mb-6" : "text-xl mb-8"
                            )}>
                                我是你的<span className="text-blue-600 relative inline-block">智能助手<span className="absolute -bottom-1 left-0 w-full h-1 bg-blue-100 -z-10 rounded-full"></span></span>，你可以向我提问
                            </h2>

                            {/* Centered Large Input Box */}
                            <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-1.5 focus-within:border-blue-300/50 focus-within:shadow-[0_8px_30px_rgba(59,130,246,0.1)] transition-all mb-12 transform hover:scale-[1.01] duration-300">
                                <textarea
                                    ref={inputRef}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            onSendMessage();
                                        }
                                    }}
                                    placeholder="请输入您的问题..."
                                    className="w-full h-14 bg-transparent border-none focus:ring-0 outline-none px-4 py-3 text-[15px] text-slate-700 placeholder:text-slate-400 resize-none font-sans"
                                />

                                <div className="flex items-center justify-between px-2 pb-1.5">
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={cn(
                                                "h-8 gap-1.5 text-[11px] rounded-full transition-all border",
                                                thinkingMode === 'deep'
                                                    ? "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100"
                                                    : "text-slate-500 border-transparent hover:bg-slate-100 hover:text-slate-700"
                                            )}
                                            onClick={() => setThinkingMode(thinkingMode === 'normal' ? 'deep' : 'normal')}
                                        >
                                            {thinkingMode === 'normal' ? (
                                                <><Zap className="h-3.5 w-3.5 text-orange-500" /> 快速回答</>
                                            ) : (
                                                <><Brain className="h-3.5 w-3.5" /> 深度思考</>
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={cn(
                                                "h-8 gap-1.5 text-[11px] rounded-full transition-all border",
                                                searchSource === 'internet'
                                                    ? "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100"
                                                    : "text-slate-500 border-transparent hover:bg-slate-100 hover:text-slate-700"
                                            )}
                                            onClick={() => setSearchSource(searchSource === 'local' ? 'internet' : 'local')}
                                        >
                                            {searchSource === 'local' ? (
                                                <><HardDrive className="h-3.5 w-3.5" /> 本地</>
                                            ) : (
                                                <><Globe className="h-3.5 w-3.5" /> 联网</>
                                            )}
                                        </Button>

                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={cn("h-8 gap-1.5 text-[11px] rounded-full transition-colors border", selectedKnowledgeBases.length > 0 ? "bg-blue-100 text-blue-700 border-blue-200" : "text-slate-500 border-transparent hover:bg-slate-100 hover:text-slate-700")}
                                                >
                                                    <BookOpen className="h-3.5 w-3.5" />
                                                    知识库 {selectedKnowledgeBases.length > 0 && `(${selectedKnowledgeBases.length})`}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 border-none shadow-2xl" align="start">
                                                <KnowledgeBaseSelector
                                                    selectedBases={selectedKnowledgeBases}
                                                    onSelectionChange={setSelectedKnowledgeBases}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all" onClick={() => fileInputRef.current?.click()}>
                                            <Paperclip className="h-5 w-5" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            className={cn(
                                                "h-9 w-9 rounded-full transition-all duration-300 ml-1 shadow-sm",
                                                inputValue.trim()
                                                    ? "bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700 transform hover:scale-105"
                                                    : "bg-slate-100 text-slate-300"
                                            )}
                                            onClick={() => onSendMessage()}
                                            disabled={!inputValue.trim() || isLoading}
                                        >
                                            <ArrowRight className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Suggested Questions */}
                            {!isSidebar && (
                                <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="flex items-center gap-2 mb-4 px-1">
                                        <span className="text-[13px] text-slate-500 font-medium tracking-wide">你可以这样问</span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        {[
                                            'XX项目的招标要求有哪些？',
                                            '我们的核心产品和竞品有什么区别？',
                                            '帮我找一下去年类似项目的中标方案作为参考'
                                        ].map((q, i) => (
                                            <button
                                                key={i}
                                                className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-300 hover:shadow-md hover:shadow-blue-50/50 transition-all text-left"
                                                onClick={() => setInputValue(q)}
                                            >
                                                <span className="text-sm text-slate-700 group-hover:text-blue-700 transition-colors">{q}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        messages.map((message, index) => (
                            <div key={message.id} className={cn(
                                "flex w-full animate-in fade-in slide-in-from-bottom-3 duration-500",
                                message.role === 'user' ? "justify-end" : "justify-start"
                            )}>
                                <div className={cn(
                                    "flex gap-4 max-w-[90%] xl:max-w-[85%]",
                                    message.role === 'user' ? "flex-row-reverse" : "flex-row"
                                )}>
                                    <Avatar className={cn(
                                        "h-10 w-10 border-2 flex-shrink-0 shadow-sm",
                                        message.role === 'user' ? "border-indigo-100 bg-indigo-50" : "border-white bg-blue-50"
                                    )}>
                                        <AvatarImage src="" />
                                        <AvatarFallback className={cn(
                                            "font-bold text-xs",
                                            message.role === 'user' ? 'text-indigo-600' : 'text-blue-600'
                                        )}>
                                            {message.role === 'user' ? 'ME' : <Sparkles className="h-5 w-5" />}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex flex-col gap-2 min-w-0 flex-1">
                                        <div className={cn(
                                            "px-6 py-5 rounded-[24px] text-[15px] leading-relaxed shadow-sm",
                                            message.role === 'user'
                                                ? "bg-[#4f46e5] text-white rounded-tr-none shadow-indigo-100/50"
                                                : "bg-white text-slate-800 border border-slate-100 rounded-tl-none shadow-slate-100/50"
                                        )}>
                                            {message.role === 'user' ? (
                                                <div className="whitespace-pre-wrap font-sans">{message.content}</div>
                                            ) : (
                                                <>
                                                    <MessageContent content={message.content} citations={message.citations} onPreviewCitation={onPreviewCitation} />

                                                    {/* Citation Cards (Restored & Styled) */}
                                                    {message.citations && message.citations.length > 0 && (
                                                        <div className="mt-8 pt-6 border-t border-slate-100">
                                                            <div className="flex items-center gap-2 mb-4">
                                                                <BookOpen className="h-4 w-4 text-slate-400" />
                                                                <span className="text-sm font-medium text-slate-500">引用来源 ({message.citations.length})</span>
                                                            </div>
                                                            <div className="grid grid-cols-1 gap-3">
                                                                {message.citations.map((citation, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className="flex items-start justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                                                                        onClick={() => onPreviewCitation(citation)}
                                                                    >
                                                                        <div className="flex-1 min-w-0 mr-4">
                                                                            <div className="flex items-center gap-2 mb-1.5">
                                                                                <span className="text-[14px] font-bold text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                                                                                    {citation.title.includes('.') ? citation.title : `${citation.title}.${idx % 2 === 0 ? 'pdf' : 'docx'}`}
                                                                                </span>
                                                                                <Badge variant="secondary" className={cn(
                                                                                    "rounded-md px-1.5 py-0 h-5 text-[10px] font-normal border",
                                                                                    idx % 2 === 0
                                                                                        ? "bg-blue-50 text-blue-600 border-blue-100"
                                                                                        : "bg-orange-50 text-orange-600 border-orange-100"
                                                                                )}>
                                                                                    {idx % 2 === 0 ? '企业库' : '个人库'}
                                                                                </Badge>
                                                                            </div>
                                                                            <div className="text-[12px] text-slate-400 mb-2">
                                                                                {idx % 2 === 0 ? '政策法规库' : '区域项目资料库'} · 第 {5 + idx * 3} 页
                                                                            </div>
                                                                            <div className="text-[13px] text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100/50">
                                                                                {citation.excerpt || '本项目采用公开招标方式，投标人须满足相关法规规定，具备独立法人资格。系统需支持多场景应用，日均处理量预计较大，需确保系统稳定运行...'}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex-shrink-0 mt-1">
                                                                            <Eye className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        {message.role === 'assistant' && (
                                            <div className="flex items-center gap-3 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <div className="flex items-center gap-0.5 bg-white border border-slate-100 rounded-full p-0.5 shadow-sm">
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full">
                                                        <ThumbsUp className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <div className="w-px h-3 bg-slate-200" />
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full">
                                                        <ThumbsDown className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                                <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-[11px] text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full">
                                                    <Copy className="h-3 w-3" /> 复制
                                                </Button>
                                                <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-[11px] text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full">
                                                    <RotateCcw className="h-3 w-3" /> 重试
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {/* Scanning Progress & Thinking Steps */}
                    {isLoading && searchStatus?.isSearching && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pl-14">
                            <div className="max-w-2xl bg-white border border-blue-100 rounded-2xl shadow-lg shadow-blue-100/20 overflow-hidden">
                                <div className="p-4 bg-gradient-to-r from-blue-50/50 to-white border-b border-blue-50">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center animate-pulse text-blue-600">
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-700 text-sm flex items-center gap-2">
                                                    {searchStatus.currentStep}
                                                </div>
                                                <div className="text-[11px] text-slate-400 mt-0.5">
                                                    已检索 <span className="font-medium text-slate-600">{searchStatus.searchedCount}</span> 个节点 · 命中 <span className="font-medium text-slate-600">{searchStatus.matchedCount}</span> 条数据
                                                </div>
                                            </div>
                                        </div>
                                        <Badge className="bg-blue-600 text-white shadow-md shadow-blue-200 scale-90">Deep Search</Badge>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
                                            style={{ width: `${searchStatus.progress}%` }}
                                        />
                                    </div>
                                </div>

                                {thinkingMode === 'deep' && thinkingSteps && thinkingSteps.length > 0 && (
                                    <div className="bg-slate-50/50 p-3">
                                        <div
                                            className="flex items-center justify-between px-2 py-1.5 cursor-pointer hover:bg-slate-100 rounded-lg transition-colors"
                                            onClick={() => setShowThinkingSteps(!showThinkingSteps)}
                                        >
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                                <Brain className="h-3.5 w-3.5 text-indigo-500" />
                                                <span>思维链分析 ({thinkingSteps.length})</span>
                                            </div>
                                            {showThinkingSteps ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
                                        </div>

                                        {showThinkingSteps && (
                                            <div className="mt-2 space-y-1 px-2 pb-2">
                                                {thinkingSteps.map((step, i) => (
                                                    <div key={i} className="flex items-start gap-2.5 text-[11px] text-slate-500 animate-in slide-in-from-left-2 fade-in duration-300">
                                                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                                                        <span className="leading-relaxed">{step}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} className="h-4" />
                </div>
            </div>

            {/* Sticky Input Bar (only shown when messages present) */}
            {messages.length > 0 && (
                <div className="p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-10 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
                    <div className="max-w-4xl mx-auto w-full">
                        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm hover:shadow-md transition-all p-2 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-400/50">
                            <div className="flex items-center gap-2 px-2 pb-2 border-b border-slate-50 mb-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setThinkingMode(thinkingMode === 'normal' ? 'deep' : 'normal')}
                                    className={cn(
                                        "h-7 text-[10px] gap-1.5 rounded-full border transition-all",
                                        thinkingMode === 'deep'
                                            ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                                            : "bg-slate-50 text-slate-500 border-slate-100"
                                    )}
                                >
                                    <Brain className="h-3 w-3" />
                                    {thinkingMode === 'deep' ? '深度思考' : '快速回答'}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSearchSource(searchSource === 'local' ? 'internet' : 'local')}
                                    className={cn(
                                        "h-7 text-[10px] gap-1.5 rounded-full border transition-all",
                                        searchSource === 'internet'
                                            ? "bg-blue-50 text-blue-600 border-blue-100"
                                            : "bg-slate-50 text-slate-500 border-slate-100"
                                    )}
                                >
                                    <Globe className="h-3 w-3" />
                                    {searchSource === 'internet' ? '联网搜索' : '本地检索'}
                                </Button>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={cn("h-7 gap-1.5 text-[10px] rounded-full transition-colors border", selectedKnowledgeBases.length > 0 ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-slate-50 text-slate-500 border-slate-100")}
                                        >
                                            <BookOpen className="h-3 w-3" />
                                            知识库 {selectedKnowledgeBases.length > 0 && `(${selectedKnowledgeBases.length})`}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 border-none shadow-2xl" align="start">
                                        <KnowledgeBaseSelector
                                            selectedBases={selectedKnowledgeBases}
                                            onSelectionChange={setSelectedKnowledgeBases}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="flex items-end gap-2 pl-2">
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:bg-slate-100 rounded-full" onClick={() => fileInputRef.current?.click()}>
                                    <Paperclip className="h-5 w-5" />
                                </Button>
                                <textarea
                                    ref={inputRef}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            onSendMessage();
                                        }
                                    }}
                                    placeholder="输入消息，Shift+Enter 换行..."
                                    className="flex-1 max-h-[120px] py-2.5 bg-transparent border-none focus:ring-0 outline-none text-sm text-slate-700 resize-none placeholder:text-slate-400"
                                    rows={1}
                                />
                                <Button
                                    size="icon"
                                    className={cn(
                                        "h-9 w-9 rounded-full shadow-md transition-all shrink-0 mb-1 mr-1",
                                        inputValue.trim() ? "bg-blue-600 hover:bg-blue-700 hover:scale-105" : "bg-slate-200 text-slate-400"
                                    )}
                                    onClick={() => onSendMessage()}
                                    disabled={!inputValue.trim() || isLoading}
                                >
                                    <ArrowRight className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <input type="file" ref={fileInputRef} onChange={onFileUpload} multiple className="hidden" />
        </div>
    );
};

// --- Main AIChatPanel Component ---
export function AIChatPanel(props: AIChatPanelProps) {
    const [showHistory, setShowHistory] = useState(false);
    const [showThinkingSteps, setShowThinkingSteps] = useState(true);

    return (
        <>
            {props.isSidebar ? (
                <div className="flex flex-col h-full bg-white relative overflow-hidden">
                    {/* Sidebar Header */}
                    <div className="flex items-center justify-between px-4 h-14 border-b border-slate-100 flex-shrink-0 bg-white shadow-sm z-10 transition-all">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="gap-2 text-blue-600 hover:bg-blue-50 font-bold px-3 transition-all active:scale-95" onClick={props.onNewChat}>
                                <Plus className="h-4 w-4" />
                                新对话
                            </Button>
                        </div>
                        <div className="flex items-center gap-1">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={cn(
                                                "h-9 w-9 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-xl",
                                                showHistory && "text-blue-600 bg-blue-50 shadow-inner"
                                            )}
                                            onClick={() => setShowHistory(!showHistory)}
                                        >
                                            <History className="h-5 w-5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" align="end">对话历史</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-xl">
                                            <Bell className="h-5 w-5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" align="end">通知中心</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>

                    <div className="flex-1 min-h-0 overflow-hidden relative">
                        {showHistory ? (
                            <div className="absolute inset-0 z-20 animate-in slide-in-from-top-4 duration-300 bg-white">
                                <HistoryList
                                    {...props}
                                    showSearch={true}
                                    onSelect={() => setShowHistory(false)}
                                />
                            </div>
                        ) : (
                            <ChatContent
                                {...props}
                                showThinkingSteps={showThinkingSteps}
                                setShowThinkingSteps={setShowThinkingSteps}
                            />
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex h-full bg-white overflow-hidden animate-in fade-in duration-700">
                    {/* 1. Left Sidebar */}
                    <HistoryList
                        {...props}
                        className="w-[280px] border-r border-slate-100 flex-shrink-0 bg-slate-50/50"
                        showHeader={true}
                    />

                    {/* 2. Main Chat Area */}
                    <div className="flex-1 flex flex-col min-w-0 h-full relative border-l border-slate-100">
                        <header className="flex items-center justify-end px-6 h-14 border-b border-slate-100/60 bg-white/80 backdrop-blur-md z-10 shrink-0">
                            <div className="flex items-center gap-1.5">
                                <TooltipProvider>
                                    {[
                                        { icon: HelpCircle, label: '帮助指南' },
                                        { icon: Bell, label: '系统通知' }
                                    ].map((nav, i) => (
                                        <Tooltip key={i}>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                                    <nav.icon className="h-5 w-5" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom">{nav.label}</TooltipContent>
                                        </Tooltip>
                                    ))}
                                </TooltipProvider>
                            </div>
                        </header>

                        <div className="flex-1 overflow-hidden">
                            <ChatContent
                                {...props}
                                showThinkingSteps={showThinkingSteps}
                                setShowThinkingSteps={setShowThinkingSteps}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
