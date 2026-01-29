
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Upload,
    Camera,
    Folder,
    Palette,
    GraduationCap,
    Bot,
    Gamepad2,
    Mic,
    Book,
    Coffee,
    Briefcase,
    FileText,
    Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditLibraryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: 'create' | 'edit';
    initialData?: { name: string; description: string; avatarUrl?: string };
    onConfirm: () => void;
}

const PRESET_AVATARS = [
    { id: 'folder', icon: Folder, color: 'bg-blue-50 text-blue-500' },
    { id: 'palette', icon: Palette, color: 'bg-purple-50 text-purple-500' },
    { id: 'book', icon: Book, color: 'bg-green-50 text-green-500' },
    { id: 'cap', icon: GraduationCap, color: 'bg-indigo-50 text-indigo-500' },
    { id: 'robot', icon: Bot, color: 'bg-cyan-50 text-cyan-500' },
    { id: 'case', icon: Briefcase, color: 'bg-amber-50 text-amber-500' },
    { id: 'coffee', icon: Coffee, color: 'bg-orange-50 text-orange-500' },
    { id: 'mic', icon: Mic, color: 'bg-pink-50 text-pink-500' },
    { id: 'file', icon: FileText, color: 'bg-slate-50 text-slate-500' },
    { id: 'game', icon: Gamepad2, color: 'bg-blue-50 text-indigo-400' },
];

export function EditLibraryModal({ open, onOpenChange, mode, initialData, onConfirm }: EditLibraryModalProps) {
    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(initialData?.avatarUrl || 'folder');

    const handleUploadClick = () => {
        // In a real app, this would open a file picker
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e: any) => {
            const file = e.target.files[0];
            if (file) {
                const url = URL.createObjectURL(file);
                setSelectedAvatar(url);
            }
        };
        input.click();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? '新建知识库' : '编辑知识库'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    {/* 1. 知识库名称 */}
                    <div className="space-y-2">
                        <Label className="text-slate-700 font-semibold">知识库名称 <span className="text-red-500">*</span></Label>
                        <Input
                            defaultValue={initialData?.name}
                            placeholder="请输入知识库名称"
                            className="h-11 border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* 2. 知识库介绍 */}
                    <div className="space-y-2">
                        <Label className="text-slate-700 font-semibold">知识库介绍</Label>
                        <Textarea
                            defaultValue={initialData?.description}
                            placeholder="请输入知识库简介，描述该库的主要用途和内容范围..."
                            className="resize-none h-24 border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* 3. 知识库头像 */}
                    <div className="space-y-3">
                        <Label className="text-slate-700 font-semibold">选择头像 <span className="text-red-500">*</span></Label>
                        <div className="grid grid-cols-6 gap-3 pt-2">
                            {/* 上传按钮 */}
                            <button
                                onClick={handleUploadClick}
                                className={cn(
                                    "w-12 h-12 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all group relative",
                                    selectedAvatar?.startsWith('blob') && "border-blue-500 border-solid"
                                )}
                            >
                                {selectedAvatar?.startsWith('blob') ? (
                                    <img src={selectedAvatar} className="w-full h-full rounded-full object-cover" alt="uploaded" />
                                ) : (
                                    <Camera className="h-5 w-5 text-slate-400 group-hover:text-blue-500" />
                                )}
                                {selectedAvatar?.startsWith('blob') && (
                                    <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-0.5">
                                        <Check className="h-3 w-3" />
                                    </div>
                                )}
                            </button>

                            {/* 预设头像 */}
                            {PRESET_AVATARS.map((preset) => (
                                <button
                                    key={preset.id}
                                    onClick={() => setSelectedAvatar(preset.id)}
                                    className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center transition-all relative group",
                                        preset.color,
                                        selectedAvatar === preset.id ? "ring-2 ring-blue-500 ring-offset-2 scale-110 shadow-sm" : "hover:scale-105"
                                    )}
                                >
                                    <preset.icon className="h-6 w-6" />
                                    {selectedAvatar === preset.id && (
                                        <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-0.5 shadow-sm">
                                            <Check className="h-3 w-3" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <DialogFooter className="pt-2">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-500">取消</Button>
                    <Button onClick={onConfirm} className="bg-blue-600 hover:bg-blue-700 px-8 rounded-lg shadow-md shadow-blue-100">
                        确认{mode === 'create' ? '创建' : '保存'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

