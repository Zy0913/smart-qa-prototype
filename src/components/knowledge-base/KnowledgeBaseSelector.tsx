
import { useState } from 'react';
import { Search, Building2, Users, User, ChevronUp, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { DetailedKnowledgeBase } from '@/types';
import { mockDetailedKnowledgeBases } from '@/data/kb-mock';

interface KnowledgeBaseSelectorProps {
    selectedBases: string[];
    onSelectionChange: (bases: string[]) => void;
}

export function KnowledgeBaseSelector({ selectedBases, onSelectionChange }: KnowledgeBaseSelectorProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        enterprise: true,
        department: true,
        personal: true,
    });

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const toggleBase = (baseId: string) => {
        if (selectedBases.includes(baseId)) {
            onSelectionChange(selectedBases.filter(id => id !== baseId));
        } else {
            onSelectionChange([...selectedBases, baseId]);
        }
    };

    const filterBases = (bases: DetailedKnowledgeBase[]) => {
        if (!searchTerm) return bases;
        return bases.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));
    };

    const enterpriseBases = filterBases(mockDetailedKnowledgeBases.filter(b => b.type === 'enterprise'));
    const departmentBases = filterBases(mockDetailedKnowledgeBases.filter(b => b.type === 'department'));
    const personalBases = filterBases(mockDetailedKnowledgeBases.filter(b => b.type === 'personal'));

    const sections = [
        { key: 'enterprise', label: '企业库', icon: Building2, bases: enterpriseBases, color: 'text-blue-500', bgColor: 'bg-blue-50/50' },
        { key: 'department', label: '部门库', icon: Users, bases: departmentBases, color: 'text-indigo-500', bgColor: 'bg-indigo-50/50' },
        { key: 'personal', label: '个人库', icon: User, bases: personalBases, color: 'text-orange-500', bgColor: 'bg-orange-50/50' },
    ];

    const allBaseIds = mockDetailedKnowledgeBases.map(b => b.id);
    const isAllSelected = allBaseIds.length > 0 && allBaseIds.every(id => selectedBases.includes(id));
    const isPartialSelected = selectedBases.length > 0 && !isAllSelected;

    const handleSelectAll = () => {
        if (isAllSelected) {
            onSelectionChange([]);
        } else {
            onSelectionChange(allBaseIds);
        }
    };

    const handleSelectSection = (sectionBases: DetailedKnowledgeBase[]) => {
        const sectionIds = sectionBases.map(b => b.id);
        const allSectionSelected = sectionIds.every(id => selectedBases.includes(id));

        if (allSectionSelected) {
            onSelectionChange(selectedBases.filter(id => !sectionIds.includes(id)));
        } else {
            const newSelection = [...new Set([...selectedBases, ...sectionIds])];
            onSelectionChange(newSelection);
        }
    };

    const isSectionAllSelected = (sectionBases: DetailedKnowledgeBase[]) => {
        if (sectionBases.length === 0) return false;
        return sectionBases.every(b => selectedBases.includes(b.id));
    };

    const isSectionPartialSelected = (sectionBases: DetailedKnowledgeBase[]) => {
        if (sectionBases.length === 0) return false;
        const selectedCount = sectionBases.filter(b => selectedBases.includes(b.id)).length;
        return selectedCount > 0 && selectedCount < sectionBases.length;
    };

    return (
        <div className="w-[280px] bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-slate-200/60 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[14px] font-bold text-slate-800">选择知识库</span>
                    <span className="text-[11px] text-slate-400 font-medium">共 {allBaseIds.length} 个</span>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="搜索知识库名称..."
                        className="h-9 pl-9 text-[13px] bg-slate-50 border-none rounded-xl placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-blue-500/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <label className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50/80 transition-colors border-b border-slate-100 group">
                <Checkbox
                    checked={isAllSelected}
                    // @ts-ignore
                    data-state={isPartialSelected ? 'indeterminate' : isAllSelected ? 'checked' : 'unchecked'}
                    onCheckedChange={handleSelectAll}
                    className="h-4 w-4 rounded-[4px] border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <span className="text-[13px] font-bold text-slate-700 flex-1">全部知识库</span>
            </label>

            <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                {sections.map((section) => {
                    const sectionAllSelected = isSectionAllSelected(section.bases);
                    const sectionPartialSelected = isSectionPartialSelected(section.bases);

                    return (
                        <div key={section.key} className="border-b border-slate-50 last:border-none">
                            <div className={cn("flex items-center gap-3 px-4 py-2.5", section.bgColor)}>
                                <Checkbox
                                    checked={sectionAllSelected}
                                    data-state={sectionPartialSelected ? 'indeterminate' : sectionAllSelected ? 'checked' : 'unchecked'}
                                    onCheckedChange={() => handleSelectSection(section.bases)}
                                    className="h-4 w-4 rounded-[4px] border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                />
                                <section.icon className={cn("h-4 w-4", section.color)} />
                                <span className="text-[12px] font-bold text-slate-600 flex-1">{section.label}</span>
                                <button
                                    onClick={() => toggleSection(section.key)}
                                    className="p-1 hover:bg-white/60 rounded-lg transition-colors"
                                >
                                    {expandedSections[section.key] ? (
                                        <ChevronUp className="h-4 w-4 text-slate-400" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4 text-slate-400" />
                                    )}
                                </button>
                            </div>
                            {expandedSections[section.key] && section.bases.length > 0 && (
                                <div className="py-1 bg-white">
                                    {section.bases.map((base) => (
                                        <label
                                            key={base.id}
                                            className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 cursor-pointer pl-11 transition-colors"
                                        >
                                            <Checkbox
                                                checked={selectedBases.includes(base.id)}
                                                onCheckedChange={() => toggleBase(base.id)}
                                                className="h-4 w-4 rounded-[4px] border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                            />
                                            <span className="text-[13px] text-slate-600 flex-1 truncate font-medium">{base.name}</span>
                                            <span className="text-[10px] text-slate-300 font-sans tabular-nums">{base.documentCount}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <span className="text-[12px] font-bold text-slate-500">
                    {selectedBases.length === 0 ? '检索全库' : `已选 ${selectedBases.length} 个`}
                </span>
                {selectedBases.length > 0 && (
                    <button
                        onClick={() => onSelectionChange([])}
                        className="text-[12px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                        清空选择
                    </button>
                )}
            </div>
        </div>
    );
}
