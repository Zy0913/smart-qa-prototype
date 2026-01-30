import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface EditItemModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: any;
    type: 'brand' | 'quote-equipment' | 'quote-rnd';
    onConfirm: (updatedItem: any) => void;
}

export function EditItemModal({ open, onOpenChange, item, type, onConfirm }: EditItemModalProps) {
    const [formData, setFormData] = useState<any>({});
    const [imagePreview, setImagePreview] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (item) {
            setFormData({ ...item });
            setImagePreview(item.image || '');
        }
    }, [item, open]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // 验证文件类型
            if (!file.type.startsWith('image/')) {
                toast.error('请上传图片文件');
                return;
            }
            // 验证文件大小（限制5MB）
            if (file.size > 5 * 1024 * 1024) {
                toast.error('图片大小不能超过 5MB');
                return;
            }

            // 创建预览
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setImagePreview(result);
                setFormData({ ...formData, image: result });
                toast.success('图片已更新');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImagePreview('');
        setFormData({ ...formData, image: '' });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleConfirm = () => {
        onConfirm(formData);
        onOpenChange(false);
    };

    const renderFields = () => {
        if (type === 'brand') {
            return (
                <div className="grid gap-4 py-4">
                    {/* 图片上传区域 */}
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right text-slate-500 pt-2">产品图片</Label>
                        <div className="col-span-3">
                            {imagePreview ? (
                                <div className="relative group">
                                    <img 
                                        src={imagePreview} 
                                        alt="产品图片" 
                                        className="w-full h-40 object-cover rounded-xl border-2 border-slate-200"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="secondary"
                                            className="rounded-lg"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Upload className="h-4 w-4 mr-1" />
                                            更换
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="destructive"
                                            className="rounded-lg"
                                            onClick={handleRemoveImage}
                                        >
                                            <X className="h-4 w-4 mr-1" />
                                            移除
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full h-40 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-400 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-blue-500"
                                >
                                    <Upload className="h-8 w-8" />
                                    <span className="text-sm font-medium">点击上传产品图片</span>
                                    <span className="text-xs text-slate-400">支持 JPG、PNG，最大 5MB</span>
                                </button>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </div>
                    </div>

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
