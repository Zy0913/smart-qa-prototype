import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Tag, X } from 'lucide-react';
import { KBFile } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FileMetadataModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    file: KBFile | null;
    initialTags: string[];
    initialDescription: string;
    suggestedTags?: string[];
    onConfirm: (payload: { tags: string[]; description: string }) => void | Promise<void>;
}

const MAX_TAG_COUNT = 5;
const MAX_TAG_LENGTH = 10;
const MAX_DESCRIPTION_LENGTH = 300;
const DEFAULT_SUGGESTED_TAGS = [
    '售前方案',
    '技术规范',
    '投标资料',
    '项目归档',
    '风险提示',
    '标准模板',
    '品牌选型',
    '成本测算',
    '客户需求',
    '版本更新',
];

const normalizeTags = (tags: string[]) =>
    Array.from(
        new Set(
            tags
                .map(tag => tag.trim())
                .filter(Boolean)
                .map(tag => tag.slice(0, MAX_TAG_LENGTH))
        )
    ).slice(0, MAX_TAG_COUNT);

export function FileMetadataModal({
    open,
    onOpenChange,
    file,
    initialTags,
    initialDescription,
    suggestedTags = DEFAULT_SUGGESTED_TAGS,
    onConfirm,
}: FileMetadataModalProps) {
    const [tags, setTags] = useState<string[]>(() => normalizeTags(initialTags));
    const [tagInput, setTagInput] = useState('');
    const [description, setDescription] = useState(initialDescription || '');
    const [isSaving, setIsSaving] = useState(false);

    const hasChanges = useMemo(() => {
        const normalizedInitialTags = normalizeTags(initialTags);
        const currentTags = normalizeTags(tags);
        const sameTagCount = normalizedInitialTags.length === currentTags.length;
        const sameTags = sameTagCount && normalizedInitialTags.every((tag, idx) => tag === currentTags[idx]);
        return !(sameTags && (initialDescription || '').trim() === description.trim());
    }, [initialTags, initialDescription, tags, description]);

    const addTag = (rawValue: string) => {
        const normalized = rawValue.trim();
        if (!normalized || tags.includes(normalized)) return;
        if (normalized.length > MAX_TAG_LENGTH) {
            toast.error(`单个标签最多 ${MAX_TAG_LENGTH} 个字符`);
            return;
        }
        if (tags.length >= MAX_TAG_COUNT) {
            toast.error(`每个文件最多 ${MAX_TAG_COUNT} 个标签`);
            return;
        }
        setTags(prev => [...prev, normalized]);
    };

    const removeTag = (tagToRemove: string) => {
        setTags(prev => prev.filter(tag => tag !== tagToRemove));
    };

    const handleTagInputConfirm = () => {
        addTag(tagInput);
        setTagInput('');
    };

    const handleSubmit = async () => {
        if (!file || isSaving) return;
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        await onConfirm({
            tags: normalizeTags(tags),
            description: description.trim().slice(0, MAX_DESCRIPTION_LENGTH),
        });
        setIsSaving(false);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[560px] rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
                <DialogHeader className="px-6 py-5 border-b border-slate-100">
                    <DialogTitle className="text-lg font-bold text-slate-800">
                        编辑文件标签与说明
                    </DialogTitle>
                    <p className="text-xs text-slate-500 truncate mt-1" title={file?.name}>
                        {file?.name}
                    </p>
                </DialogHeader>

                <div className="px-6 py-5 space-y-5">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">文件标签</Label>
                        <div className="rounded-xl border border-slate-200 bg-white p-3 min-h-[88px]">
                            <div className="flex flex-wrap gap-1.5 mb-2">
                                {tags.length > 0 ? (
                                    tags.map(tag => (
                                        <Badge
                                            key={tag}
                                            variant="secondary"
                                            className="h-6 gap-1 pl-2 pr-1 bg-blue-50 text-blue-600 border-blue-100"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="rounded p-0.5 hover:text-red-500 transition-colors"
                                                aria-label={`移除标签 ${tag}`}
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-xs text-slate-400">暂无标签，建议补充 2-4 个标签用于检索。</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Input
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ',') {
                                            e.preventDefault();
                                            handleTagInputConfirm();
                                        }
                                    }}
                                    placeholder={tags.length >= MAX_TAG_COUNT ? `已达上限 ${MAX_TAG_COUNT} 个标签` : '输入标签后回车'}
                                    disabled={tags.length >= MAX_TAG_COUNT}
                                    className="h-8 text-xs border-slate-200"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-3 text-xs border-slate-200"
                                    onClick={handleTagInputConfirm}
                                    disabled={!tagInput.trim() || tags.length >= MAX_TAG_COUNT}
                                >
                                    添加
                                </Button>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-1.5">
                                {suggestedTags.map(tag => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => addTag(tag)}
                                        disabled={tags.includes(tag) || tags.length >= MAX_TAG_COUNT}
                                        className={cn(
                                            'h-6 px-2 rounded-md border text-[11px] transition-colors',
                                            tags.includes(tag)
                                                ? 'bg-blue-50 text-blue-400 border-blue-100'
                                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600'
                                        )}
                                    >
                                        <span className="inline-flex items-center gap-1">
                                            <Tag className="h-3 w-3" />
                                            {tag}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <p className="text-[11px] text-slate-400">标签数量 {tags.length}/{MAX_TAG_COUNT}，单个标签最多 {MAX_TAG_LENGTH} 字符</p>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">文件说明</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESCRIPTION_LENGTH))}
                            placeholder="例如：适用于机场安防项目的设备选型建议，含成本对比与风险提示。"
                            className="min-h-[108px] text-sm resize-none rounded-xl border-slate-200"
                        />
                        <div className="text-right text-[11px] text-slate-400">
                            {description.length}/{MAX_DESCRIPTION_LENGTH}
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl border-slate-200 text-slate-600"
                        disabled={isSaving}
                    >
                        取消
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="min-w-[108px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={!hasChanges || isSaving || !file}
                    >
                        {isSaving ? (
                            <span className="inline-flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                保存中
                            </span>
                        ) : (
                            '保存修改'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
