import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EditItemModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: any;
    type: 'brand' | 'quote-equipment' | 'quote-rnd';
    onConfirm: (updatedItem: any) => void;
}

export function EditItemModal({ open, onOpenChange, item, type, onConfirm }: EditItemModalProps) {
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        if (item) {
            setFormData({ ...item });
        }
    }, [item, open]);

    const handleConfirm = () => {
        onConfirm(formData);
        onOpenChange(false);
    };

    const renderFields = () => {
        if (type === 'brand') {
            return (
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right text-slate-500">品牌名称</Label>
                        <Input id="name" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="col-span-3 rounded-xl border-slate-200" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="model" className="text-right text-slate-500">型号规格</Label>
                        <Input id="model" value={formData.model || ''} onChange={e => setFormData({ ...formData, model: e.target.value })} className="col-span-3 rounded-xl border-slate-200" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right text-slate-500">当前售价</Label>
                        <Input id="price" value={formData.price || ''} onChange={e => setFormData({ ...formData, price: e.target.value })} className="col-span-3 rounded-xl border-slate-200" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="cost" className="text-right text-slate-500">成本参考</Label>
                        <Input id="cost" value={formData.cost || ''} onChange={e => setFormData({ ...formData, cost: e.target.value })} className="col-span-3 rounded-xl border-slate-200" />
                    </div>
                </div>
            );
        }

        if (type === 'quote-equipment') {
            return (
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="materialNo" className="text-right text-slate-500">物料号</Label>
                        <Input id="materialNo" value={formData.materialNo || ''} onChange={e => setFormData({ ...formData, materialNo: e.target.value })} className="col-span-3 rounded-xl border-slate-200" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right text-slate-500">设备名称</Label>
                        <Input id="name" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="col-span-3 rounded-xl border-slate-200" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="region" className="text-right text-slate-500">覆盖区域</Label>
                        <Input id="region" value={formData.region || ''} onChange={e => setFormData({ ...formData, region: e.target.value })} className="col-span-3 rounded-xl border-slate-200" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right text-slate-500">设备价格</Label>
                        <Input id="price" value={formData.price || ''} onChange={e => setFormData({ ...formData, price: e.target.value })} className="col-span-3 rounded-xl border-slate-200" />
                    </div>
                </div>
            );
        }

        if (type === 'quote-rnd') {
            return (
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="functionName" className="text-right text-slate-500">功能名称</Label>
                        <Input id="functionName" value={formData.functionName || ''} onChange={e => setFormData({ ...formData, functionName: e.target.value })} className="col-span-3 rounded-xl border-slate-200" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="systemName" className="text-right text-slate-500">所属系统</Label>
                        <Input id="systemName" value={formData.systemName || ''} onChange={e => setFormData({ ...formData, systemName: e.target.value })} className="col-span-3 rounded-xl border-slate-200" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="unitPrice" className="text-right text-slate-500">人月单价</Label>
                        <Input id="unitPrice" value={formData.unitPrice || ''} onChange={e => setFormData({ ...formData, unitPrice: e.target.value })} className="col-span-3 rounded-xl border-slate-200" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="manMonth" className="text-right text-slate-500">投入人月</Label>
                        <Input id="manMonth" value={formData.manMonth || ''} onChange={e => setFormData({ ...formData, manMonth: e.target.value })} className="col-span-3 rounded-xl border-slate-200" />
                    </div>
                </div>
            );
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] rounded-2xl border-none shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-slate-800">编辑条目信息</DialogTitle>
                </DialogHeader>
                {renderFields()}
                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl border-slate-200 text-slate-600">取消</Button>
                    <Button onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-100 px-6">
                        保存修改
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
