import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
    FileText,
    FileSpreadsheet,
    Presentation,
    PieChart,
    TableProperties,
    FileCheck,
    Lightbulb,
    Workflow,
    PenTool,
    Layout
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface OnlineCreationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (fileData: { name: string; type: string; tags: string[]; description: string; template?: string }) => void;
}

const DOC_TYPES = [
    { id: 'multidimensional', name: '多维表格', icon: TableProperties, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'doc', name: '文档', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'sheet', name: '表格', icon: FileSpreadsheet, color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'slide', name: '幻灯片', icon: Presentation, color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: 'form', name: '问卷', icon: FileCheck, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { id: 'mindnote', name: '思维笔记', icon: Lightbulb, color: 'text-cyan-600', bg: 'bg-cyan-50' },
];

const DOC_APPS = [
    { id: 'whiteboard', name: '画板', icon: PenTool, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'mindmap', name: '思维导图', icon: Workflow, color: 'text-sky-600', bg: 'bg-sky-50' },
    { id: 'flowchart', name: '流程图', icon: Layout, color: 'text-indigo-600', bg: 'bg-indigo-50' },
];

const TEMPLATES = [
    { id: 't1', name: '任务管理', category: '效率', icon: FileCheck, users: '12万', image: 'bg-gradient-to-br from-blue-50 to-indigo-50' },
    { id: 't2', name: '项目甘特图', category: '项目', icon: FileSpreadsheet, users: '31.4万', image: 'bg-gradient-to-br from-green-50 to-emerald-50' },
    { id: 't3', name: '项目规划', category: '文档', icon: FileText, users: '14.2万', image: 'bg-gradient-to-br from-slate-50 to-gray-50' },
    { id: 't4', name: '项目复盘', category: '文档', icon: Presentation, users: '9.2万', image: 'bg-gradient-to-br from-orange-50 to-red-50' },
    { id: 't5', name: '项目例会', category: '会议', icon: FileText, users: '4万', image: 'bg-gradient-to-br from-pink-50 to-rose-50' },
    { id: 't6', name: '周报汇报', category: '办公', icon: FileText, users: '25万', image: 'bg-gradient-to-br from-purple-50 to-violet-50' },
];

export function OnlineCreationModal({ open, onOpenChange, onConfirm }: OnlineCreationModalProps) {
    const [name, setName] = useState('');
    const [tags, setTags] = useState('');
    const [description, setDescription] = useState('');
    const [selectedType, setSelectedType] = useState<string>('doc');
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('blank');

    const handleConfirm = () => {
        if (!name.trim()) return;

        onConfirm({
            name: name + (activeTab === 'blank' ? getExtension(selectedType) : ''), // Simple extension logic
            type: activeTab === 'blank' ? selectedType : 'template_doc',
            tags: tags.split(/[,，\s]+/).filter(Boolean),
            description,
            template: activeTab === 'template' ? selectedTemplate! : undefined
        });

        onOpenChange(false);
        resetForm();
    };

    const resetForm = () => {
        setName('');
        setTags('');
        setDescription('');
        setSelectedType('doc');
        setSelectedTemplate(null);
    };

    const getExtension = (type: string) => {
        switch (type) {
            case 'doc': return '.docx';
            case 'sheet': return '.xlsx';
            case 'slide': return '.pptx';
            default: return '';
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] h-[600px] flex flex-col p-0 gap-0 overflow-hidden rounded-xl">
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Sidebar / Tabs */}
                    <div className="w-[180px] bg-slate-50 border-r border-slate-200 p-4 shrink-0">
                        <h2 className="text-lg font-bold mb-6 text-slate-800">在线创作</h2>
                        <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
                            <TabsList className="flex flex-col h-auto bg-transparent gap-2 p-0 w-full">
                                <TabsTrigger
                                    value="blank"
                                    className="w-full justify-start px-3 py-2.5 h-auto text-slate-600 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-slate-200"
                                >
                                    新建空白
                                </TabsTrigger>
                                <TabsTrigger
                                    value="template"
                                    className="w-full justify-start px-3 py-2.5 h-auto text-slate-600 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-slate-200"
                                >
                                    从模板新建
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Right Content Area */}
                    <div className="flex-1 flex flex-col bg-white overflow-hidden">
                        {/* Spacer for top/close button area and visual separation */}
                        <div className="h-12 shrink-0 border-b border-transparent" />

                        <div className="flex-1 p-6 pt-0 overflow-y-auto custom-scrollbar">
                            <Tabs value={activeTab} className="w-full">
                                <TabsContent value="blank" className="mt-0 space-y-6">
                                    <div>
                                        <h3 className="text-sm font-medium text-slate-500 mb-3">基础文档</h3>
                                        <div className="grid grid-cols-4 gap-3">
                                            {DOC_TYPES.map(type => (
                                                <div
                                                    key={type.id}
                                                    onClick={() => setSelectedType(type.id)}
                                                    className={cn(
                                                        "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md",
                                                        selectedType === type.id
                                                            ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-200"
                                                            : "border-slate-200 bg-white hover:border-blue-200"
                                                    )}
                                                >
                                                    <div className={cn("p-2.5 rounded-lg", type.bg)}>
                                                        <type.icon className={cn("h-6 w-6", type.color)} />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-700">{type.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-slate-500 mb-3">文档应用</h3>
                                        <div className="grid grid-cols-4 gap-3">
                                            {DOC_APPS.map(type => (
                                                <div
                                                    key={type.id}
                                                    onClick={() => setSelectedType(type.id)}
                                                    className={cn(
                                                        "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md",
                                                        selectedType === type.id
                                                            ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-200"
                                                            : "border-slate-200 bg-white hover:border-blue-200"
                                                    )}
                                                >
                                                    <div className={cn("p-2.5 rounded-lg", type.bg)}>
                                                        <type.icon className={cn("h-6 w-6", type.color)} />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-700">{type.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="template" className="mt-0">
                                    <div className="grid grid-cols-3 gap-4">
                                        {TEMPLATES.map(tmpl => (
                                            <div
                                                key={tmpl.id}
                                                onClick={() => setSelectedTemplate(tmpl.id)}
                                                className={cn(
                                                    "group relative rounded-xl border overflow-hidden cursor-pointer transition-all hover:shadow-lg",
                                                    selectedTemplate === tmpl.id
                                                        ? "border-blue-500 ring-1 ring-blue-200"
                                                        : "border-slate-200"
                                                )}
                                            >
                                                <div className={cn("h-24 w-full", tmpl.image)}>
                                                    {/* Placeholder for template preview */}
                                                    <div className="w-full h-full flex items-center justify-center opacity-30 text-slate-400">
                                                        <Layout className="h-8 w-8" />
                                                    </div>
                                                </div>
                                                <div className="p-3">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h4 className="font-medium text-slate-800 text-sm truncate">{tmpl.name}</h4>
                                                        <tmpl.icon className="h-4 w-4 text-blue-500 shrink-0" />
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Badge variant="secondary" className="text-[10px] h-5 px-1 bg-slate-100 text-slate-500">{tmpl.category}</Badge>
                                                        <span className="text-[10px] text-slate-400">{tmpl.users}人已使用</span>
                                                    </div>
                                                </div>
                                                {/* Selection styling */}
                                                {selectedTemplate === tmpl.id && (
                                                    <div className="absolute inset-0 bg-blue-500/5 pointer-events-none" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>

                {/* Footer Input Area */}
                <div className="border-t border-slate-200 bg-slate-50 p-4 space-y-4 shrink-0 z-10">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-500">文件名称</Label>
                            <Input
                                placeholder="输入文件名称"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-white h-9"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-500">文件标签</Label>
                            <Input
                                placeholder="输入标签，用逗号分隔"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                className="bg-white h-9"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-500">文件备注</Label>
                        <Textarea
                            placeholder="请输入文件备注信息（可选）"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="bg-white min-h-[60px] resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)} className="h-9">取消</Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={!name.trim() || (activeTab === 'template' && !selectedTemplate)}
                            className="bg-blue-600 hover:bg-blue-700 h-9"
                        >
                            确定创建
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
