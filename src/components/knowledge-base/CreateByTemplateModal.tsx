import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Folder, ChevronRight, LayoutTemplate, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateByTemplateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (projectName: string, templateType: string) => void;
}

const PHASE_TEMPLATES = [
    '0.POC测试阶段',
    '1.项目建议书',
    '2.可研阶段',
    '3.招投标&合同',
    '4.初步设计',
    '5.初期验收',
    '6.施工建设',
    '7.终验移交',
    '8.变更及结算',
    'A.政策相关资料',
    'B.项目宣传推介'
];

const TYPE_TEMPLATES = [
    '01_技术方案',
    '02_设计图纸',
    '03_合同协议',
    '04_会议纪要',
    '05_交付成果',
    '06_财务报表',
    '07_沟通记录',
    '08_申报资料'
];

export function CreateByTemplateModal({ open, onOpenChange, onConfirm }: CreateByTemplateModalProps) {
    const [projectName, setProjectName] = useState('');
    const [activeTab, setActiveTab] = useState<'phase' | 'type'>('phase');

    const handleConfirm = () => {
        if (!projectName.trim()) return;
        onConfirm(projectName, activeTab === 'phase' ? '项目阶段模板' : '资料类型模板');
        setProjectName('');
        onOpenChange(false);
    };

    const currentTemplate = activeTab === 'phase' ? PHASE_TEMPLATES : TYPE_TEMPLATES;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
                <div className="bg-linear-to-br from-blue-600 to-indigo-700 p-6 text-white text-center sm:text-left">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center justify-center sm:justify-start gap-2">
                            <LayoutTemplate className="h-6 w-6" /> 选择模板创建项目
                        </DialogTitle>
                        <DialogDescription className="text-blue-100 text-sm mt-1">
                            通过预设模板快速生成标准的项目资料结构
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="px-6 py-4 space-y-6">
                    {/* Project Name Input */}
                    <div className="space-y-2">
                        <Label htmlFor="projectName" className="text-sm font-medium text-slate-700">
                            项目简称/名称 <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                id="projectName"
                                placeholder="输入项目简称，例如：XX智慧楼宇建设项目"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                className="pl-10 h-11 border-slate-200 focus-visible:ring-blue-500 rounded-xl"
                            />
                        </div>
                    </div>

                    {/* Template Selection Tabs */}
                    <Tabs defaultValue="phase" className="w-full" onValueChange={(v) => setActiveTab(v as any)}>
                        <TabsList className="grid w-full grid-cols-2 p-1 bg-slate-100 rounded-xl h-11">
                            <TabsTrigger value="phase" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">项目阶段模板</TabsTrigger>
                            <TabsTrigger value="type" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">资料类型模板</TabsTrigger>
                        </TabsList>

                        <div className="mt-4">
                            <Label className="text-sm font-medium text-slate-700 mb-2 block">
                                目录预览 (将自动生成以下文件夹)
                            </Label>
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 h-[240px] overflow-y-auto custom-scrollbar">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-slate-800 font-semibold mb-3">
                                        <Folder className="h-4 w-4 text-amber-500 fill-amber-100" />
                                        <span>{projectName || '项目目录名'}</span>
                                    </div>
                                    {currentTemplate.map((folder, index) => (
                                        <div key={index} className="flex items-center gap-2 pl-6 group transition-all duration-200 hover:translate-x-1">
                                            <div className="h-4 w-0.5 bg-slate-200 absolute left-8"></div>
                                            <Folder className="h-4 w-4 text-amber-400/80" />
                                            <span className="text-sm text-slate-600 group-hover:text-blue-600">{folder}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Tabs>
                </div>

                <DialogFooter className="px-6 py-4 bg-slate-50 gap-3 border-t border-slate-100">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="h-11 rounded-xl px-6 border-slate-200 text-slate-600 hover:bg-white"
                    >
                        取消
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!projectName.trim()}
                        className="h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-100 px-8 disabled:opacity-50 disabled:shadow-none"
                    >
                        确定创建
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
