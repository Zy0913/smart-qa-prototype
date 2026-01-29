import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FolderOperationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: 'create' | 'rename';
    initialName?: string;
    onConfirm: (name: string) => void;
}

export function FolderOperationModal({ open, onOpenChange, type, initialName = '', onConfirm }: FolderOperationModalProps) {
    const [name, setName] = useState('');

    useEffect(() => {
        if (open) {
            setName(initialName || (type === 'create' ? '新建文件夹' : ''));
        }
    }, [open, initialName, type]);

    const handleConfirm = () => {
        if (!name.trim()) return;
        onConfirm(name);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] rounded-2xl border-none shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-slate-800">
                        {type === 'create' ? '新建文件夹' : '重命名文件夹'}
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="folderName" className="text-sm font-medium text-slate-700">
                            文件夹名称
                        </Label>
                        <Input
                            id="folderName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="请输入文件夹名称"
                            className="rounded-xl border-slate-200"
                            autoFocus
                        />
                    </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0 mt-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl border-slate-200 text-slate-600">
                        取消
                    </Button>
                    <Button onClick={handleConfirm} disabled={!name.trim()} className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-100 px-6">
                        确定
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
