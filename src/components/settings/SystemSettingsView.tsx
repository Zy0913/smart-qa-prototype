import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
    ArrowLeft,
    Bell,
    ChevronRight,
    Database,
    Loader2,
    Plus,
    Settings,
    ShieldAlert,
    ShieldCheck,
    Tags,
    Trash2,
    Users
} from 'lucide-react';
import { toast } from 'sonner';
import { SystemTagTaxonomy, flattenSystemTags } from '@/data/system-tags';

interface SystemSettingsViewProps {
    isAdmin: boolean;
    taxonomy: SystemTagTaxonomy;
    onTaxonomyChange: (next: SystemTagTaxonomy) => void;
}

const MAX_TAG_LENGTH = 10;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
type SettingsModule = 'home' | 'system-tags';

export function SystemSettingsView({ isAdmin, taxonomy, onTaxonomyChange }: SystemSettingsViewProps) {
    const [activeModule, setActiveModule] = useState<SettingsModule>('home');
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newTagInputs, setNewTagInputs] = useState<Record<string, string>>({});
    const [savingAction, setSavingAction] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    const categoryEntries = Object.entries(taxonomy);
    const activeCategory = (selectedCategory && taxonomy[selectedCategory]) ? selectedCategory : (categoryEntries[0]?.[0] || '');
    const totalTagCount = useMemo(() => flattenSystemTags(taxonomy).length, [taxonomy]);
    const selectedCategoryTags = activeCategory ? (taxonomy[activeCategory] || []) : [];

    const runWithSave = async (actionKey: string, updater: (current: SystemTagTaxonomy) => SystemTagTaxonomy, successMsg: string) => {
        if (savingAction) return;
        setSavingAction(actionKey);
        await sleep(500);
        onTaxonomyChange(updater(taxonomy));
        setSavingAction(null);
        toast.success(successMsg);
    };

    const handleAddCategory = async () => {
        const category = newCategoryName.trim();
        if (!category) return;
        if (taxonomy[category]) {
            toast.error('分类名称已存在');
            return;
        }
        await runWithSave(
            `add-category-${category}`,
            (current) => ({ ...current, [category]: [] }),
            `已新增系统标签分类「${category}」`
        );
        setNewCategoryName('');
    };

    const handleDeleteCategory = async (category: string) => {
        await runWithSave(
            `delete-category-${category}`,
            (current) => {
                const next = { ...current };
                delete next[category];
                return next;
            },
            `已删除分类「${category}」`
        );
        if (selectedCategory === category) {
            const next = categoryEntries.find(([name]) => name !== category)?.[0] || '';
            setSelectedCategory(next);
        }
    };

    const handleAddTag = async (category: string) => {
        const tagValue = (newTagInputs[category] || '').trim();
        if (!tagValue) return;
        if (tagValue.length > MAX_TAG_LENGTH) {
            toast.error(`单个标签最多 ${MAX_TAG_LENGTH} 个字符`);
            return;
        }
        if ((taxonomy[category] || []).includes(tagValue)) {
            toast.error('该标签已存在');
            return;
        }
        await runWithSave(
            `add-tag-${category}-${tagValue}`,
            (current) => ({
                ...current,
                [category]: [...(current[category] || []), tagValue],
            }),
            `已在「${category}」中新增标签「${tagValue}」`
        );
        setNewTagInputs(prev => ({ ...prev, [category]: '' }));
    };

    const handleDeleteTag = async (category: string, tagValue: string) => {
        await runWithSave(
            `delete-tag-${category}-${tagValue}`,
            (current) => ({
                ...current,
                [category]: (current[category] || []).filter(tag => tag !== tagValue),
            }),
            `已删除标签「${tagValue}」`
        );
    };

    const handleOpenModule = (module: SettingsModule) => {
        if (module === 'system-tags' && !isAdmin) {
            toast.error('系统标签维护仅对管理员开放');
            return;
        }
        setActiveModule(module);
    };

    const renderSettingsHome = () => (
        <div className="max-w-6xl mx-auto space-y-6">
            <Card className="border-slate-200 rounded-xl shadow-sm">
                <CardContent className="p-6 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-slate-800 font-semibold">
                            <Settings className="h-4 w-4 text-blue-600" />
                            系统设置
                        </div>
                        <p className="text-xs text-slate-500 mt-1">管理平台级能力配置，包含系统标签、通知策略、权限规则等。</p>
                    </div>
                    <Badge className={cn(
                        'border',
                        isAdmin
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                    )}>
                        {isAdmin ? (
                            <>
                                <ShieldCheck className="h-3 w-3 mr-1" />
                                管理员
                            </>
                        ) : (
                            <>
                                <ShieldAlert className="h-3 w-3 mr-1" />
                                普通成员
                            </>
                        )}
                    </Badge>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Card
                    className={cn(
                        'rounded-xl border-slate-200 shadow-sm transition-all',
                        isAdmin ? 'hover:shadow-md cursor-pointer hover:border-blue-300' : 'opacity-85'
                    )}
                    onClick={() => handleOpenModule('system-tags')}
                >
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                                    <Tags className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-slate-800">系统标签维护</div>
                                    <p className="text-xs text-slate-500 mt-0.5">维护标签分类与系统标签词库</p>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                            <Badge variant="outline" className="text-[11px]">{categoryEntries.length} 个分类</Badge>
                            <Badge variant="outline" className="text-[11px]">{totalTagCount} 个标签</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-xl border-slate-200 shadow-sm opacity-70">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
                                    <Users className="h-4 w-4 text-violet-600" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-slate-800">角色权限模板</div>
                                    <p className="text-xs text-slate-500 mt-0.5">岗位权限与审批流模板配置</p>
                                </div>
                            </div>
                            <Badge variant="outline" className="text-[11px]">规划中</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-xl border-slate-200 shadow-sm opacity-70">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                                    <Bell className="h-4 w-4 text-amber-600" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-slate-800">通知策略</div>
                                    <p className="text-xs text-slate-500 mt-0.5">消息触发规则与通知渠道</p>
                                </div>
                            </div>
                            <Badge variant="outline" className="text-[11px]">规划中</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-xl border-slate-200 shadow-sm opacity-70">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                                    <Database className="h-4 w-4 text-emerald-600" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-slate-800">系统字典</div>
                                    <p className="text-xs text-slate-500 mt-0.5">统一术语、字段与枚举管理</p>
                                </div>
                            </div>
                            <Badge variant="outline" className="text-[11px]">规划中</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    const renderTagSettings = () => (
        <div className="max-w-6xl mx-auto space-y-6">
            <Card className="border-slate-200 rounded-xl shadow-sm">
                <CardContent className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-slate-200"
                            onClick={() => setActiveModule('home')}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <div className="text-sm font-semibold text-slate-800">系统设置 / 系统标签维护</div>
                            <p className="text-xs text-slate-500 mt-0.5">系统标签会同步到上传与文件元数据编辑。</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[11px]">{categoryEntries.length} 个分类</Badge>
                        <Badge variant="outline" className="text-[11px]">{totalTagCount} 个标签</Badge>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <Card className="lg:col-span-4 border-slate-200 rounded-xl shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-slate-800">标签分类</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Input
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="新增分类，例如：行业领域"
                                className="h-9"
                            />
                            <Button
                                onClick={handleAddCategory}
                                disabled={!newCategoryName.trim() || !!savingAction}
                                className="h-9 px-3 bg-blue-600 hover:bg-blue-700"
                            >
                                {savingAction?.startsWith('add-category-') ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            </Button>
                        </div>

                        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                            {categoryEntries.length === 0 ? (
                                <div className="text-xs text-slate-400 rounded-lg border border-dashed border-slate-300 p-4 text-center">暂无分类</div>
                            ) : (
                                categoryEntries.map(([category, tags]) => (
                                    <div
                                        key={category}
                                        className={cn(
                                            'rounded-lg border p-3 transition-colors',
                                            activeCategory === category
                                                ? 'border-blue-300 bg-blue-50/50'
                                                : 'border-slate-200 bg-white hover:border-slate-300'
                                        )}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <button
                                                className="text-left min-w-0 flex-1"
                                                onClick={() => setSelectedCategory(category)}
                                            >
                                                <div className="text-sm font-medium text-slate-800 truncate">{category}</div>
                                                <div className="text-[11px] text-slate-500 mt-0.5">{tags.length} 个标签</div>
                                            </button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-600"
                                                onClick={() => handleDeleteCategory(category)}
                                                disabled={!!savingAction}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-8 border-slate-200 rounded-xl shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-slate-800">
                            {activeCategory ? `标签明细 · ${activeCategory}` : '标签明细'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {activeCategory ? (
                            <>
                                <div className="flex flex-wrap gap-2 min-h-[44px]">
                                    {selectedCategoryTags.length > 0 ? (
                                        selectedCategoryTags.map(tag => (
                                            <Badge key={`${activeCategory}-${tag}`} variant="secondary" className="h-7 pl-2.5 pr-1 gap-1 border border-slate-200 bg-slate-100 text-slate-700">
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteTag(activeCategory, tag)}
                                                    className="rounded p-0.5 hover:text-red-600 transition-colors"
                                                    disabled={!!savingAction}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-xs text-slate-400">该分类下暂无标签</span>
                                    )}
                                </div>

                                <div className="rounded-lg border border-slate-200 p-3 bg-slate-50/60">
                                    <label className="text-xs text-slate-500 font-medium">新增标签（最多10字符）</label>
                                    <div className="mt-2 flex items-center gap-2">
                                        <Input
                                            value={newTagInputs[activeCategory] || ''}
                                            onChange={(e) => setNewTagInputs(prev => ({ ...prev, [activeCategory]: e.target.value }))}
                                            placeholder="输入新标签"
                                            className="h-9 bg-white"
                                        />
                                        <Button
                                            onClick={() => handleAddTag(activeCategory)}
                                            disabled={!(newTagInputs[activeCategory] || '').trim() || !!savingAction}
                                            className="h-9 px-4 bg-blue-600 hover:bg-blue-700"
                                        >
                                            {savingAction?.startsWith(`add-tag-${activeCategory}-`) ? <Loader2 className="h-4 w-4 animate-spin" /> : '新增'}
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-sm text-slate-500 rounded-lg border border-dashed border-slate-300 p-8 text-center">
                                请先创建分类，再维护标签。
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    return (
        <div className="h-full bg-[#f8fafc] p-6 overflow-y-auto">
            {activeModule === 'home' ? renderSettingsHome() : renderTagSettings()}
        </div>
    );
}
