
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    X,
    Download,
    Printer,
    Share2,
    FileText,
    ChevronLeft,
    Search,
    Type,
    Layout,
    Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface FilePreviewProps {
    title: string;
    content: string;
    onClose: () => void;
    type?: 'word' | 'pdf' | 'other';
}

export function FilePreview({ title, content, onClose, type = 'word' }: FilePreviewProps) {
    // Simple markdown parser for demo purposes
    const renderContent = (text: string) => {
        return text.split('\n').map((line, index) => {
            if (line.startsWith('# ')) {
                return <h1 key={index} className="text-3xl font-bold text-slate-900 mb-6 mt-8 border-b pb-2">{line.replace('# ', '')}</h1>;
            }
            if (line.startsWith('## ')) {
                return <h2 key={index} className="text-xl font-bold text-slate-800 mb-4 mt-6">{line.replace('## ', '')}</h2>;
            }
            if (line.startsWith('### ')) {
                return <h3 key={index} className="text-lg font-bold text-slate-800 mb-3 mt-4">{line.replace('### ', '')}</h3>;
            }
            if (line.trim() === '') {
                return <div key={index} className="h-4"></div>;
            }
            return <p key={index} className="text-slate-700 leading-relaxed mb-2 text-justify indent-8">{line}</p>;
        });
    };

    return (
        <div className="flex flex-col h-full bg-[#f3f4f6]">
            {/* Top Toolbar (Word-like) */}
            <div className="bg-[#2b579a] text-white flex items-center justify-between px-4 h-12 shadow-sm shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10 -ml-2"
                        onClick={onClose}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        <span className="font-medium truncate max-w-md">{title}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-8 w-8">
                        <Search className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-8 w-8">
                        <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-8 w-8">
                        <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-8 w-8">
                        <Printer className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10 h-8 w-8"
                        onClick={onClose}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Secondary Toolbar */}
            <div className="bg-[#f3f4f6] border-b border-gray-300 px-4 py-2 flex items-center gap-1 shrink-0">
                <div className="bg-white rounded-md border border-gray-300 flex items-center p-1 gap-1 shadow-sm">
                    <Button variant="ghost" size="sm" className="h-7 text-xs px-2 hover:bg-gray-100 text-gray-700">开始</Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs px-2 hover:bg-gray-100 text-gray-700">插入</Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs px-2 hover:bg-gray-100 text-gray-700">布局</Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs px-2 hover:bg-gray-100 text-gray-700">引用</Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs px-2 hover:bg-gray-100 text-gray-700">审阅</Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs px-2 hover:bg-gray-100 text-gray-700">视图</Button>
                </div>
                <Separator orientation="vertical" className="h-6 mx-2" />
                <div className="flex items-center gap-1 text-gray-600">
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Type className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Layout className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7"><ImageIcon className="h-4 w-4" /></Button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#e3e5e8] min-h-0">
                <div className="flex justify-center py-8 min-h-full w-full">
                    {/* A4 Paper Simulation: 210mm x 297mm approx ratio 1:1.414 */}
                    <div className="bg-white shadow-2xl w-[800px] min-h-[1130px] p-[60px] mx-auto box-border text-slate-800 h-fit">
                        {renderContent(content)}

                        {/* Footer Mock */}
                        <div className="mt-20 pt-10 border-t border-gray-200 flex justify-between text-xs text-gray-400">
                            <span>PreFlow AI 内部资料</span>
                            <span>第 1 页</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Bar */}
            <div className="bg-[#2b579a] text-white/90 text-xs px-4 h-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <span>第 1 页，共 1 页</span>
                    <span>1,245 字</span>
                    <span>中文(中国)</span>
                </div>
                <div className="flex items-center gap-4">
                    <span>专注模式</span>
                    <span>100%</span>
                </div>
            </div>
        </div>
    );
}
