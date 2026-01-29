import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DetailedKnowledgeBase } from '@/types';
import { Folder, X, Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ShareModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    library: DetailedKnowledgeBase | null;
    onShareUpdate: (libraryId: string, isShared: boolean) => void;
}

export function ShareModal({ open, onOpenChange, library, onShareUpdate }: ShareModalProps) {
    const [isPublic, setIsPublic] = useState(true);
    const [canViewDetails, setCanViewDetails] = useState(false);
    const [validity, setValidity] = useState('7');
    const [isSuccess, setIsSuccess] = useState(false);

    // 同步库状态
    useEffect(() => {
        if (open && library) {
            setIsPublic(library.isShared || false);
            if (!library.isShared) {
                setCanViewDetails(false);
            }
        }
    }, [open, library]);

    if (!library) return null;

    const shareLink = `https://zhicehui.ai/share/kb-${library.id.slice(0, 8)}`;

    const handleConfirm = () => {
        onShareUpdate(library.id, isPublic);
        if (isPublic) {
            setIsSuccess(true);
        } else {
            onOpenChange(false);
            toast.success('已取消该知识库的共享状态');
        }
    };

    const handlePublicChange = (checked: boolean) => {
        setIsPublic(checked);
        if (!checked) {
            setCanViewDetails(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(shareLink);
        toast.success('链接已复制到剪贴板');
        onOpenChange(false);
        // 重置状态
        setTimeout(() => setIsSuccess(false), 300);
    };

    const handleClose = () => {
        onOpenChange(false);
        setTimeout(() => setIsSuccess(false), 300);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                {!isSuccess ? (
                    <>
                        <DialogHeader className="px-6 py-4 border-b border-gray-100 flex flex-row items-center justify-between space-y-0">
                            <DialogTitle className="text-lg font-bold text-gray-800">分享知识库</DialogTitle>
                        </DialogHeader>

                        <div className="p-6 space-y-6">
                            {/* Library Info Card */}
                            <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm">
                                    <Folder className="h-8 w-8 fill-current" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 text-lg">{library.name}</h3>
                                    <p className="text-sm text-gray-400 mt-1">创建人：157****5542</p>
                                </div>
                            </div>

                            {/* Options */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label className="text-base font-semibold text-gray-700">将知识库转为公开：</Label>
                                        <p className="text-sm text-gray-400">转为公开后，用户直接通过链接加入知识库</p>
                                    </div>
                                    <Switch
                                        checked={isPublic}
                                        onCheckedChange={handlePublicChange}
                                        className="data-[state=checked]:bg-blue-500"
                                    />
                                </div>

                                <div className={cn("flex items-center justify-between transition-opacity", !isPublic && "opacity-40")}>
                                    <div className="space-y-1">
                                        <Label className="text-base font-semibold text-gray-700">成员可查看文件详情：</Label>
                                        <p className="text-sm text-gray-400">
                                            {canViewDetails
                                                ? "关闭后，所有普通权限成员仅可查看文件的介绍"
                                                : "打开后，所有普通权限成员可查看完整文件内容"}
                                        </p>
                                    </div>
                                    <Switch
                                        checked={canViewDetails}
                                        onCheckedChange={setCanViewDetails}
                                        disabled={!isPublic}
                                        className="data-[state=checked]:bg-blue-500"
                                    />
                                </div>

                                <div className={cn("space-y-3 transition-opacity", !isPublic && "opacity-40")}>
                                    <Label className="text-base font-semibold text-gray-700">分享链接有效期：</Label>
                                    <RadioGroup
                                        value={validity}
                                        onValueChange={setValidity}
                                        disabled={!isPublic}
                                        className="flex items-center gap-6"
                                    >
                                        {[
                                            { label: '7天', value: '7' },
                                            { label: '15天', value: '15' },
                                            { label: '30天', value: '30' },
                                            { label: '90天', value: '90' },
                                        ].map((option) => (
                                            <div key={option.value} className="flex items-center space-x-2">
                                                <RadioGroupItem value={option.value} id={`v-${option.value}`} className="border-gray-300 text-blue-500" />
                                                <Label htmlFor={`v-${option.value}`} className="text-sm text-gray-600 font-medium cursor-pointer">
                                                    {option.label}
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 sm:justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                className="px-8 rounded-lg border-gray-200 text-gray-600 hover:bg-gray-100 font-medium"
                            >
                                取消
                            </Button>
                            <Button
                                onClick={handleConfirm}
                                className="px-8 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium shadow-md shadow-blue-200"
                            >
                                确定
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <div className="p-8 flex flex-col items-center text-center space-y-6">
                        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-500 mb-2">
                            <Check className="h-8 w-8" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-gray-900">分享链接已生成</h3>
                            <p className="text-sm text-gray-500">复制下方链接发送给好友，即可加入知识库</p>
                        </div>

                        <div className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 font-mono text-sm text-blue-600 break-all select-all">
                            {shareLink}
                        </div>

                        <Button
                            onClick={handleCopy}
                            className="w-full h-12 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg gap-2 shadow-lg shadow-blue-100"
                        >
                            <Copy className="h-5 w-5" />
                            复制链接
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
