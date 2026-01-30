'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, AlertCircle, Sparkles, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { BrandSelectionItem, ProductQuoteItem, RndQuoteItem } from '@/types';

interface ParsePreviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    libraryType: 'brand' | 'quote-equipment' | 'quote-rnd' | 'normal';
    uploadedFiles: File[];
    onConfirm: (items: any[]) => void;
}

export function ParsePreviewModal({
    open,
    onOpenChange,
    libraryType,
    uploadedFiles,
    onConfirm
}: ParsePreviewModalProps) {
    const [parseProgress, setParseProgress] = useState(0);
    const [isParsing, setIsParsing] = useState(true);
    const [parsedItems, setParsedItems] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);

    // 模拟 AI 解析过程
    useEffect(() => {
        if (open && uploadedFiles.length > 0) {
            setIsParsing(true);
            setParseProgress(0);
            setParsedItems([]);

            // 模拟解析进度
            const progressInterval = setInterval(() => {
                setParseProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(progressInterval);
                        return 100;
                    }
                    return prev + 10;
                });
            }, 300);

            // 模拟解析完成
            setTimeout(() => {
                const mockParsedData = generateMockParsedData(libraryType, uploadedFiles);
                setParsedItems(mockParsedData);
                setIsParsing(false);
                toast.success(`AI 解析完成，共识别 ${mockParsedData.length} 条数据`);
            }, 3500);

            return () => clearInterval(progressInterval);
        }
    }, [open, uploadedFiles, libraryType]);

    // 生成 Mock 解析数据
    const generateMockParsedData = (type: string, files: File[]): any[] => {
        if (type === 'brand') {
            return files.flatMap((file, fileIdx) => [
                {
                    id: `parsed-brand-${fileIdx}-1`,
                    name: `高性能服务器 ${String.fromCharCode(65 + fileIdx)}1`,
                    image: '/PreFlow-AI/mock/server.jpg',
                    model: `SRV-2026-${fileIdx}01`,
                    price: `¥${(20000 + fileIdx * 5000).toLocaleString()}`,
                    cost: `¥${(15000 + fileIdx * 3000).toLocaleString()}`,
                    status: 'active' as const,
                    isSelected: true
                },
                {
                    id: `parsed-brand-${fileIdx}-2`,
                    name: `工业交换机 ${String.fromCharCode(65 + fileIdx)}2`,
                    image: '/PreFlow-AI/mock/switch.jpg',
                    model: `SW-IND-${fileIdx}02`,
                    price: `¥${(8000 + fileIdx * 1000).toLocaleString()}`,
                    cost: `¥${(5000 + fileIdx * 800).toLocaleString()}`,
                    status: 'active' as const,
                    isSelected: true
                }
            ]);
        } else if (type === 'quote-equipment') {
            return files.flatMap((file, fileIdx) => [
                {
                    id: `parsed-eq-${fileIdx}-1`,
                    materialNo: `M2026${String(fileIdx + 1).padStart(3, '0')}`,
                    name: `智能网关 ${String.fromCharCode(65 + fileIdx)}型`,
                    region: ['华南区', '华北区', '华东区'][fileIdx % 3],
                    price: `¥${(3000 + fileIdx * 500).toLocaleString()}`,
                    quoteTime: new Date().toISOString().split('T')[0],
                    isSelected: true
                }
            ]);
        } else {
            return files.flatMap((file, fileIdx) => [
                {
                    id: `parsed-rnd-${fileIdx}-1`,
                    functionName: `${['人脸识别', '数据大屏', '智能分析'][fileIdx % 3]}算法定制`,
                    systemName: `${['AI中台', '可视化平台', '数据平台'][fileIdx % 3]}`,
                    unitPrice: `¥${(2000 + fileIdx * 500).toLocaleString()}`,
                    manMonth: 3 + fileIdx,
                    totalPrice: `¥${((2000 + fileIdx * 500) * (3 + fileIdx)).toLocaleString()}`,
                    quoteTime: new Date().toISOString().split('T')[0],
                    isSelected: true
                }
            ]);
        }
    };

    const handleToggleSelect = (id: string) => {
        setParsedItems(prev => prev.map(item =>
            item.id === id ? { ...item, isSelected: !item.isSelected } : item
        ));
    };

    const handleToggleSelectAll = () => {
        const allSelected = parsedItems.every(item => item.isSelected);
        setParsedItems(prev => prev.map(item => ({ ...item, isSelected: !allSelected })));
    };

    const handleEdit = (id: string) => {
        setEditingId(id);
    };

    const handleSaveEdit = (id: string, updates: any) => {
        setParsedItems(prev => prev.map(item =>
            item.id === id ? { ...item, ...updates } : item
        ));
        setEditingId(null);
        toast.success('修改已保存');
    };

    const handleDelete = (id: string) => {
        setParsedItems(prev => prev.filter(item => item.id !== id));
        toast.success('已删除该条数据');
    };

    const handleConfirm = () => {
        const selectedItems = parsedItems.filter(item => item.isSelected);
        if (selectedItems.length === 0) {
            toast.error('请至少选择一条数据');
            return;
        }
        onConfirm(selectedItems);
        onOpenChange(false);
    };

    const selectedCount = parsedItems.filter(item => item.isSelected).length;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-none! w-[90vw] h-[85vh] p-0 overflow-hidden flex flex-col border-none shadow-2xl rounded-2xl">
                <DialogHeader className="px-6 py-4 border-b border-slate-200 shrink-0">
                    <DialogTitle className="flex items-center gap-3 text-lg font-bold text-slate-800">
                        <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-purple-600" />
                        </div>
                        AI 智能解析预览
                    </DialogTitle>
                </DialogHeader>

                {isParsing ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-6">
                        <div className="w-20 h-20 rounded-2xl bg-purple-100 flex items-center justify-center animate-pulse">
                            <Sparkles className="h-10 w-10 text-purple-600" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-lg font-bold text-slate-800">AI 正在解析文件...</h3>
                            <p className="text-sm text-slate-500">
                                正在提取结构化数据
                            </p>
                        </div>
                        <div className="w-full max-w-md space-y-2">
                            <Progress value={parseProgress} className="h-2" />
                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <span>已处理 {uploadedFiles.length} 个文件</span>
                                <span>{parseProgress}%</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-hidden flex flex-col">
                            {libraryType === 'brand' && (
                                <BrandPreviewTable
                                    items={parsedItems}
                                    editingId={editingId}
                                    onToggleSelect={handleToggleSelect}
                                    onToggleSelectAll={handleToggleSelectAll}
                                    onEdit={handleEdit}
                                    onSaveEdit={handleSaveEdit}
                                    onDelete={handleDelete}
                                />
                            )}
                            {libraryType === 'quote-equipment' && (
                                <QuoteEquipmentPreviewTable
                                    items={parsedItems}
                                    editingId={editingId}
                                    onToggleSelect={handleToggleSelect}
                                    onToggleSelectAll={handleToggleSelectAll}
                                    onEdit={handleEdit}
                                    onSaveEdit={handleSaveEdit}
                                    onDelete={handleDelete}
                                />
                            )}
                            {libraryType === 'quote-rnd' && (
                                <QuoteRndPreviewTable
                                    items={parsedItems}
                                    editingId={editingId}
                                    onToggleSelect={handleToggleSelect}
                                    onToggleSelectAll={handleToggleSelectAll}
                                    onEdit={handleEdit}
                                    onSaveEdit={handleSaveEdit}
                                    onDelete={handleDelete}
                                />
                            )}
                            {libraryType === 'normal' && (
                                <div className="flex-1 flex items-center justify-center p-12 text-slate-400">
                                    <div className="text-center">
                                        <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                        <p className="text-sm">该库类型不支持智能解析</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <DialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="text-sm text-slate-600">
                                    已选择 <span className="font-bold text-blue-600">{selectedCount}</span> / {parsedItems.length} 条数据
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" onClick={() => onOpenChange(false)} className="px-5">
                                    取消
                                </Button>
                                <Button
                                    onClick={handleConfirm}
                                    disabled={selectedCount === 0}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-7 rounded-xl shadow-lg shadow-blue-100"
                                >
                                    确认入库 ({selectedCount})
                                </Button>
                            </div>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

// 品牌选型库预览表格
function BrandPreviewTable({ items, editingId, onToggleSelect, onToggleSelectAll, onEdit, onSaveEdit, onDelete }: any) {
    const [editForm, setEditForm] = useState<any>({});

    const handleStartEdit = (item: any) => {
        setEditForm({ ...item });
        onEdit(item.id);
    };

    const handleSave = () => {
        onSaveEdit(editingId, editForm);
        setEditForm({});
    };

    const handleCancel = () => {
        onEdit(null);
        setEditForm({});
    };

    const allSelected = items.every((item: any) => item.isSelected);

    return (
        <div className="flex-1 overflow-auto px-4 py-3">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent border-b-2 border-slate-200">
                        <TableHead style={{ width: '60px', minWidth: '60px' }} className="text-center py-3">
                            <Checkbox checked={allSelected} onCheckedChange={onToggleSelectAll} />
                        </TableHead>
                        <TableHead style={{ width: '340px', minWidth: '340px' }} className="font-bold text-slate-700 py-3">产品名称</TableHead>
                        <TableHead style={{ width: '200px', minWidth: '200px' }} className="font-bold text-slate-700 py-3">型号</TableHead>
                        <TableHead style={{ width: '140px', minWidth: '140px' }} className="font-bold text-slate-700 py-3">售价</TableHead>
                        <TableHead style={{ width: '140px', minWidth: '140px' }} className="font-bold text-slate-700 py-3">成本</TableHead>
                        <TableHead style={{ width: '120px', minWidth: '120px' }} className="font-bold text-slate-700 py-3">状态</TableHead>
                        <TableHead style={{ width: '140px', minWidth: '140px' }} className="text-right font-bold text-slate-700 py-3 pr-4">操作</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                            {items.map((item: any) => (
                                <TableRow key={item.id} className={cn(
                                    "border-b border-slate-100 hover:bg-slate-50/50 transition-colors",
                                    !item.isSelected && "opacity-40"
                                )}>
                                    <TableCell style={{ width: '60px' }} className="text-center py-4">
                                        <Checkbox
                                            checked={item.isSelected}
                                            onCheckedChange={() => onToggleSelect(item.id)}
                                        />
                                    </TableCell>
                                    <TableCell style={{ width: '340px' }} className="py-4">
                                        {editingId === item.id ? (
                                            <Input
                                                value={editForm.name || ''}
                                                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                                className="h-9 text-sm"
                                            />
                                        ) : (
                                            <span className="font-medium text-slate-800 text-sm">{item.name}</span>
                                        )}
                                    </TableCell>
                                    <TableCell style={{ width: '200px' }} className="py-4">
                                        {editingId === item.id ? (
                                            <Input
                                                value={editForm.model || ''}
                                                onChange={e => setEditForm({ ...editForm, model: e.target.value })}
                                                className="h-9 text-sm"
                                            />
                                        ) : (
                                            <span className="text-slate-600 font-mono text-sm">{item.model}</span>
                                        )}
                                    </TableCell>
                                    <TableCell style={{ width: '140px' }} className="py-4">
                                        {editingId === item.id ? (
                                            <Input
                                                value={editForm.price || ''}
                                                onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                                                className="h-9 text-sm"
                                            />
                                        ) : (
                                            <span className="text-red-600 font-semibold text-sm">{item.price}</span>
                                        )}
                                    </TableCell>
                                    <TableCell style={{ width: '140px' }} className="py-4">
                                        {editingId === item.id ? (
                                            <Input
                                                value={editForm.cost || ''}
                                                onChange={e => setEditForm({ ...editForm, cost: e.target.value })}
                                                className="h-9 text-sm"
                                            />
                                        ) : (
                                            <span className="text-slate-500 text-sm">{item.cost}</span>
                                        )}
                                    </TableCell>
                                    <TableCell style={{ width: '120px' }} className="py-4">
                                        {editingId === item.id ? (
                                            <Select value={editForm.status || 'active'} onValueChange={v => setEditForm({ ...editForm, status: v })}>
                                                <SelectTrigger className="h-9 w-full text-sm">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">在售</SelectItem>
                                                    <SelectItem value="discontinued">停产</SelectItem>
                                                    <SelectItem value="not-recommended">不推荐</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Badge variant={item.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                                                {item.status === 'active' ? '在售' : item.status === 'discontinued' ? '停产' : '不推荐'}
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell style={{ width: '140px' }} className="text-right py-4 pr-4">
                                        {editingId === item.id ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <Button size="sm" variant="ghost" onClick={handleCancel} className="h-8 px-3 text-xs">
                                                    取消
                                                </Button>
                                                <Button size="sm" onClick={handleSave} className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700">
                                                    保存
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600" onClick={() => handleStartEdit(item)}>
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-red-50 hover:text-red-600" onClick={() => onDelete(item.id)}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
        </div>
    );
}

// 产品报价库-设备报价预览表格
function QuoteEquipmentPreviewTable({ items, editingId, onToggleSelect, onToggleSelectAll, onEdit, onSaveEdit, onDelete }: any) {
    const [editForm, setEditForm] = useState<any>({});

    const handleStartEdit = (item: any) => {
        setEditForm({ ...item });
        onEdit(item.id);
    };

    const handleSave = () => {
        onSaveEdit(editingId, editForm);
        setEditForm({});
    };

    const handleCancel = () => {
        onEdit(null);
        setEditForm({});
    };

    const allSelected = items.every((item: any) => item.isSelected);

    return (
        <div className="flex-1 overflow-auto px-4 py-3">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent border-b-2 border-slate-200">
                        <TableHead style={{ width: '60px', minWidth: '60px' }} className="text-center py-3">
                            <Checkbox checked={allSelected} onCheckedChange={onToggleSelectAll} />
                        </TableHead>
                        <TableHead style={{ width: '180px', minWidth: '180px' }} className="font-bold text-slate-700 py-3">物料号</TableHead>
                        <TableHead style={{ width: '320px', minWidth: '320px' }} className="font-bold text-slate-700 py-3">设备名称</TableHead>
                        <TableHead style={{ width: '140px', minWidth: '140px' }} className="font-bold text-slate-700 py-3">区域</TableHead>
                        <TableHead style={{ width: '140px', minWidth: '140px' }} className="font-bold text-slate-700 py-3">价格</TableHead>
                        <TableHead style={{ width: '140px', minWidth: '140px' }} className="font-bold text-slate-700 py-3">报价时间</TableHead>
                        <TableHead style={{ width: '140px', minWidth: '140px' }} className="text-right font-bold text-slate-700 py-3 pr-4">操作</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item: any) => (
                        <TableRow key={item.id} className={cn(
                            "border-b border-slate-100 hover:bg-slate-50/50 transition-colors",
                            !item.isSelected && "opacity-40"
                        )}>
                            <TableCell style={{ width: '60px' }} className="text-center py-4">
                                <Checkbox
                                    checked={item.isSelected}
                                    onCheckedChange={() => onToggleSelect(item.id)}
                                />
                            </TableCell>
                            <TableCell style={{ width: '180px' }} className="py-4">
                                {editingId === item.id ? (
                                    <Input
                                        value={editForm.materialNo || ''}
                                        onChange={e => setEditForm({ ...editForm, materialNo: e.target.value })}
                                        className="h-9 text-sm"
                                    />
                                ) : (
                                    <span className="font-mono text-slate-700 text-sm font-medium">{item.materialNo}</span>
                                )}
                            </TableCell>
                            <TableCell style={{ width: '320px' }} className="py-4">
                                {editingId === item.id ? (
                                    <Input
                                        value={editForm.name || ''}
                                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                        className="h-9 text-sm"
                                    />
                                ) : (
                                    <span className="font-medium text-slate-800 text-sm">{item.name}</span>
                                )}
                            </TableCell>
                            <TableCell style={{ width: '140px' }} className="py-4">
                                {editingId === item.id ? (
                                    <Input
                                        value={editForm.region || ''}
                                        onChange={e => setEditForm({ ...editForm, region: e.target.value })}
                                        className="h-9 text-sm"
                                    />
                                ) : (
                                    <span className="text-slate-600 text-sm">{item.region}</span>
                                )}
                            </TableCell>
                            <TableCell style={{ width: '140px' }} className="py-4">
                                {editingId === item.id ? (
                                    <Input
                                        value={editForm.price || ''}
                                        onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                                        className="h-9 text-sm"
                                    />
                                ) : (
                                    <span className="text-red-600 font-semibold text-sm">{item.price}</span>
                                )}
                            </TableCell>
                            <TableCell style={{ width: '140px' }} className="py-4">
                                {editingId === item.id ? (
                                    <Input
                                        type="date"
                                        value={editForm.quoteTime || ''}
                                        onChange={e => setEditForm({ ...editForm, quoteTime: e.target.value })}
                                        className="h-9 text-sm"
                                    />
                                ) : (
                                    <span className="text-slate-500 text-sm">{item.quoteTime}</span>
                                )}
                            </TableCell>
                            <TableCell style={{ width: '140px' }} className="text-right py-4 pr-4">
                                {editingId === item.id ? (
                                    <div className="flex items-center justify-end gap-2">
                                        <Button size="sm" variant="ghost" onClick={handleCancel} className="h-8 px-3 text-xs">
                                            取消
                                        </Button>
                                        <Button size="sm" onClick={handleSave} className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700">
                                            保存
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-end gap-1.5">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600" onClick={() => handleStartEdit(item)}>
                                            <Edit2 className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-red-50 hover:text-red-600" onClick={() => onDelete(item.id)}>
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

// 产品报价库-研发报价预览表格
function QuoteRndPreviewTable({ items, editingId, onToggleSelect, onToggleSelectAll, onEdit, onSaveEdit, onDelete }: any) {
    const [editForm, setEditForm] = useState<any>({});

    const handleStartEdit = (item: any) => {
        setEditForm({ ...item });
        onEdit(item.id);
    };

    const handleSave = () => {
        onSaveEdit(editingId, editForm);
        setEditForm({});
    };

    const handleCancel = () => {
        onEdit(null);
        setEditForm({});
    };

    const allSelected = items.every((item: any) => item.isSelected);

    return (
        <div className="flex-1 overflow-auto px-4 py-3">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent border-b-2 border-slate-200">
                        <TableHead style={{ width: '60px', minWidth: '60px' }} className="text-center py-3">
                            <Checkbox checked={allSelected} onCheckedChange={onToggleSelectAll} />
                        </TableHead>
                        <TableHead style={{ width: '280px', minWidth: '280px' }} className="font-bold text-slate-700 py-3">功能名称</TableHead>
                        <TableHead style={{ width: '220px', minWidth: '220px' }} className="font-bold text-slate-700 py-3">系统名称</TableHead>
                        <TableHead style={{ width: '130px', minWidth: '130px' }} className="font-bold text-slate-700 py-3">单价</TableHead>
                        <TableHead style={{ width: '100px', minWidth: '100px' }} className="font-bold text-slate-700 py-3">人/月</TableHead>
                        <TableHead style={{ width: '130px', minWidth: '130px' }} className="font-bold text-slate-700 py-3">总价</TableHead>
                        <TableHead style={{ width: '140px', minWidth: '140px' }} className="font-bold text-slate-700 py-3">报价时间</TableHead>
                        <TableHead style={{ width: '140px', minWidth: '140px' }} className="text-right font-bold text-slate-700 py-3 pr-4">操作</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item: any) => (
                        <TableRow key={item.id} className={cn(
                            "border-b border-slate-100 hover:bg-slate-50/50 transition-colors",
                            !item.isSelected && "opacity-40"
                        )}>
                            <TableCell style={{ width: '60px' }} className="text-center py-4">
                                <Checkbox
                                    checked={item.isSelected}
                                    onCheckedChange={() => onToggleSelect(item.id)}
                                />
                            </TableCell>
                            <TableCell style={{ width: '280px' }} className="py-4">
                                {editingId === item.id ? (
                                    <Input
                                        value={editForm.functionName || ''}
                                        onChange={e => setEditForm({ ...editForm, functionName: e.target.value })}
                                        className="h-9 text-sm"
                                    />
                                ) : (
                                    <span className="font-medium text-slate-800 text-sm">{item.functionName}</span>
                                )}
                            </TableCell>
                            <TableCell style={{ width: '220px' }} className="py-4">
                                {editingId === item.id ? (
                                    <Input
                                        value={editForm.systemName || ''}
                                        onChange={e => setEditForm({ ...editForm, systemName: e.target.value })}
                                        className="h-9 text-sm"
                                    />
                                ) : (
                                    <span className="text-slate-700 text-sm">{item.systemName}</span>
                                )}
                            </TableCell>
                            <TableCell style={{ width: '130px' }} className="py-4">
                                {editingId === item.id ? (
                                    <Input
                                        value={editForm.unitPrice || ''}
                                        onChange={e => setEditForm({ ...editForm, unitPrice: e.target.value })}
                                        className="h-9 text-sm"
                                    />
                                ) : (
                                    <span className="text-slate-600 text-sm">{item.unitPrice}</span>
                                )}
                            </TableCell>
                            <TableCell style={{ width: '100px' }} className="py-4">
                                {editingId === item.id ? (
                                    <Input
                                        type="number"
                                        value={editForm.manMonth || ''}
                                        onChange={e => setEditForm({ ...editForm, manMonth: parseInt(e.target.value) })}
                                        className="h-9 text-sm"
                                    />
                                ) : (
                                    <span className="text-slate-600 text-sm font-medium">{item.manMonth}</span>
                                )}
                            </TableCell>
                            <TableCell style={{ width: '130px' }} className="py-4">
                                {editingId === item.id ? (
                                    <Input
                                        value={editForm.totalPrice || ''}
                                        onChange={e => setEditForm({ ...editForm, totalPrice: e.target.value })}
                                        className="h-9 text-sm"
                                    />
                                ) : (
                                    <span className="text-red-600 font-semibold text-sm">{item.totalPrice}</span>
                                )}
                            </TableCell>
                            <TableCell style={{ width: '140px' }} className="py-4">
                                {editingId === item.id ? (
                                    <Input
                                        type="date"
                                        value={editForm.quoteTime || ''}
                                        onChange={e => setEditForm({ ...editForm, quoteTime: e.target.value })}
                                        className="h-9 text-sm"
                                    />
                                ) : (
                                    <span className="text-slate-500 text-sm">{item.quoteTime}</span>
                                )}
                            </TableCell>
                            <TableCell style={{ width: '140px' }} className="text-right py-4 pr-4">
                                {editingId === item.id ? (
                                    <div className="flex items-center justify-end gap-2">
                                        <Button size="sm" variant="ghost" onClick={handleCancel} className="h-8 px-3 text-xs">
                                            取消
                                        </Button>
                                        <Button size="sm" onClick={handleSave} className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700">
                                            保存
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-end gap-1.5">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600" onClick={() => handleStartEdit(item)}>
                                            <Edit2 className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-red-50 hover:text-red-600" onClick={() => onDelete(item.id)}>
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
