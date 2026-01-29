
import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Brain, Zap, Globe, HardDrive, BookOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { KnowledgeBaseSelector } from './KnowledgeBaseSelector';
import { toast } from 'sonner';

interface KBChatInputProps {
    onSendMessage: (query: string) => void;
    placeholder?: string;
    initialSelectedBases?: string[];
}

export function KBChatInput({ onSendMessage, placeholder, initialSelectedBases = [] }: KBChatInputProps) {
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [thinkingMode, setThinkingMode] = useState<'normal' | 'deep'>('normal');
    const [searchSource, setSearchSource] = useState<'local' | 'internet' | 'hybrid'>('local');
    const [selectedKnowledgeBases, setSelectedKnowledgeBases] = useState<string[]>(initialSelectedBases);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 同步外部传入的选中知识库
    useEffect(() => {
        setSelectedKnowledgeBases(initialSelectedBases);
    }, [initialSelectedBases]);

    const handleSend = () => {
        if (!inputValue.trim() || isLoading) return;
        onSendMessage(inputValue);
        setInputValue('');
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            toast.success(`已准备上传 ${files.length} 个文件`);
        }
    };

    return (
        <TooltipProvider>
            <div className="relative bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all focus-within:border-blue-300 focus-within:shadow-md">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    className="hidden"
                />

                <div className="flex flex-col">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder={placeholder || "请输入内容"}
                        className="h-24 px-4 pt-4 pb-12 text-sm border-0 focus-visible:ring-0 resize-none bg-transparent"
                    />

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            {/* 深度思考模式切换 */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => setThinkingMode(thinkingMode === 'normal' ? 'deep' : 'normal')}
                                        className={cn(
                                            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors text-sm",
                                            thinkingMode === 'deep'
                                                ? "bg-purple-100 text-purple-600"
                                                : "hover:bg-gray-100 text-gray-500"
                                        )}
                                    >
                                        {thinkingMode === 'deep' ? <Brain className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                                        <span>{thinkingMode === 'deep' ? '深度思考' : '快速回答'}</span>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {thinkingMode === 'deep' ? '切换为快速回答模式' : '切换为深度思考模式'}
                                </TooltipContent>
                            </Tooltip>

                            {/* 联网/本地检索切换 */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => {
                                            const nextSource = searchSource === 'local' ? 'internet' : 'local';
                                            setSearchSource(nextSource);
                                            const labels = { local: '仅本地知识库', internet: '联网检索模式' };
                                            toast.success(`已切换为 ${labels[nextSource]}`);
                                        }}
                                        className={cn(
                                            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors text-sm",
                                            searchSource === 'internet'
                                                ? "bg-green-100 text-green-600 border border-green-200"
                                                : "hover:bg-gray-100 text-gray-500 border border-transparent"
                                        )}
                                    >
                                        <Globe className={cn("h-4 w-4", searchSource === 'internet' ? "animate-pulse" : "opacity-50")} />
                                        <span>{searchSource === 'internet' ? '联网' : '本地'}</span>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {searchSource === 'local' ? '关闭联网，仅检索知识库' : '开启联网检索功能'}
                                </TooltipContent>
                            </Tooltip>

                            {/* 知识库选择器 */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button className={cn(
                                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors text-sm",
                                        selectedKnowledgeBases.length > 0 ? "bg-blue-50 text-blue-600 border border-blue-100" : "hover:bg-gray-100 text-gray-500"
                                    )}>
                                        <BookOpen className="h-4 w-4" />
                                        <span>知识库</span>
                                        {selectedKnowledgeBases.length > 0 && (
                                            <span className="ml-1 bg-blue-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                                                {selectedKnowledgeBases.length}
                                            </span>
                                        )}
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0 w-auto" align="start">
                                    <KnowledgeBaseSelector
                                        selectedBases={selectedKnowledgeBases}
                                        onSelectionChange={setSelectedKnowledgeBases}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="flex items-center gap-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                                    >
                                        <Paperclip className="h-5 w-5" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>上传附件</TooltipContent>
                            </Tooltip>

                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim() || isLoading}
                                className={cn(
                                    "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                                    inputValue.trim()
                                        ? "bg-blue-500 text-white shadow-sm hover:bg-blue-600 hover:scale-105"
                                        : "bg-blue-100 text-blue-300"
                                )}
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
