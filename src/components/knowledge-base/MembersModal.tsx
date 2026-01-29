
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, UserPlus, X, ChevronRight, ChevronDown, Check, User, Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { mockDepartments, mockAllUsers } from '@/data/kb-mock';
import { KBMember } from '@/types';
import { toast } from 'sonner';

interface MembersModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    libraryName: string;
    currentMembers: KBMember[];
}

export function MembersModal({ open, onOpenChange, libraryName, currentMembers: initialMembers }: MembersModalProps) {
    const [members, setMembers] = useState<KBMember[]>(initialMembers);
    const [view, setView] = useState<'list' | 'add'>('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedDepts, setExpandedDepts] = useState<string[]>(['d1', 'd2']);

    const toggleDept = (id: string) => {
        setExpandedDepts(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleRemoveMember = (id: string) => {
        setMembers(prev => prev.filter(m => m.id !== id));
        toast.success('已移除成员');
    };

    const handleAddMember = (user: any) => {
        if (members.some(m => m.id === user.id)) {
            toast.error('该用户已在成员列表中');
            return;
        }
        const newMember: KBMember = {
            id: user.id,
            name: user.name,
            role: 'viewer',
            department: user.department
        };
        setMembers(prev => [...prev, newMember]);
        toast.success(`已添加成员 ${user.name}`);
    };

    const filteredUsers = searchTerm
        ? mockAllUsers.filter(u => u.name.includes(searchTerm) || u.department.includes(searchTerm))
        : [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden gap-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="flex items-center justify-between">
                        <span className="truncate">成员管理 - {libraryName}</span>
                        {view === 'list' ? (
                            <Button size="sm" variant="outline" className="text-blue-600 border-blue-100 hover:bg-blue-50 gap-2" onClick={() => setView('add')}>
                                <UserPlus className="h-4 w-4" /> 添加成员
                            </Button>
                        ) : (
                            <Button size="sm" variant="ghost" className="text-slate-500" onClick={() => setView('list')}>
                                返回列表
                            </Button>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <div className="h-[450px] flex flex-col">
                    {view === 'list' ? (
                        <div className="flex-1 flex flex-col px-6">
                            <div className="py-2">
                                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">当前成员 ({members.length})</span>
                            </div>
                            <ScrollArea className="flex-1 -mx-2 px-2">
                                <div className="space-y-1 pb-4">
                                    {members.map(member => (
                                        <div key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 group transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9 border border-slate-100">
                                                    <AvatarImage src={member.avatar} />
                                                    <AvatarFallback className="bg-blue-50 text-blue-600 text-xs">
                                                        {member.name.substring(0, 1)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-slate-700">{member.name}</span>
                                                        {member.role === 'admin' && <Badge className="text-[10px] h-4 px-1 bg-amber-50 text-amber-600 border-amber-100">管理员</Badge>}
                                                    </div>
                                                    <span className="text-[11px] text-slate-400">{member.department || '未设置部门'}</span>
                                                </div>
                                            </div>
                                            {member.role !== 'admin' && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleRemoveMember(member.id)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {/* Search bar */}
                            <div className="px-6 py-2 border-b border-slate-50">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="搜索姓名、部门..."
                                        className="pl-9 h-10 bg-slate-50/50 border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <ScrollArea className="flex-1 px-6">
                                {searchTerm ? (
                                    <div className="py-4 space-y-1">
                                        <span className="text-[11px] text-slate-400 font-medium px-2 block mb-2">搜索结果</span>
                                        {filteredUsers.length > 0 ? filteredUsers.map(user => {
                                            const isSelected = members.some(m => m.id === user.id);
                                            return (
                                                <div
                                                    key={user.id}
                                                    className={cn(
                                                        "flex items-center justify-between p-2 rounded-lg transition-colors",
                                                        isSelected ? "bg-slate-50" : "hover:bg-blue-50/30 cursor-pointer"
                                                    )}
                                                    onClick={() => !isSelected && handleAddMember(user)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback className="bg-slate-100 text-slate-500 text-[10px]">{user.name.substring(0, 1)}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-slate-700">{user.name}</span>
                                                            <span className="text-[11px] text-slate-400">{user.department}</span>
                                                        </div>
                                                    </div>
                                                    {isSelected ? (
                                                        <Check className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <Button variant="ghost" size="sm" className="h-8 text-blue-600 hover:text-blue-700 p-0 px-2">添加</Button>
                                                    )}
                                                </div>
                                            );
                                        }) : (
                                            <div className="text-center py-10">
                                                <p className="text-sm text-slate-400">未找到相关人员</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="py-4">
                                        <span className="text-[11px] text-slate-400 font-medium px-2 block mb-2">按组织架构选择</span>
                                        {mockDepartments.map(dept => (
                                            <div key={dept.id} className="space-y-1">
                                                <div
                                                    className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg cursor-pointer group"
                                                    onClick={() => toggleDept(dept.id)}
                                                >
                                                    {expandedDepts.includes(dept.id) ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                                                    <span className="text-sm font-medium text-slate-700">{dept.name}</span>
                                                </div>

                                                {/* Dept Members & Subdepts */}
                                                {expandedDepts.includes(dept.id) && (
                                                    <div className="ml-6 space-y-1 border-l border-slate-100 pl-2">
                                                        {/* Sub-departments */}
                                                        {dept.children.map(sub => (
                                                            <div key={sub.id} className="space-y-1">
                                                                <div
                                                                    className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer"
                                                                    onClick={() => toggleDept(sub.id)}
                                                                >
                                                                    {expandedDepts.includes(sub.id) ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
                                                                    <span className="text-xs text-slate-600">{sub.name}</span>
                                                                </div>

                                                                {expandedDepts.includes(sub.id) && (
                                                                    <div className="ml-4 space-y-0.5">
                                                                        {mockAllUsers.filter(u => u.department === sub.name).map(user => {
                                                                            const isSelected = members.some(m => m.id === user.id);
                                                                            return (
                                                                                <div
                                                                                    key={user.id}
                                                                                    className={cn(
                                                                                        "flex items-center justify-between p-1.5 pl-3 rounded-lg transition-colors group",
                                                                                        isSelected ? "bg-slate-50" : "hover:bg-blue-50/30 cursor-pointer"
                                                                                    )}
                                                                                    onClick={() => !isSelected && handleAddMember(user)}
                                                                                >
                                                                                    <div className="flex items-center gap-2">
                                                                                        <User className="h-3.5 w-3.5 text-slate-300" />
                                                                                        <span className="text-xs text-slate-600">{user.name}</span>
                                                                                    </div>
                                                                                    {isSelected ? <Check className="h-3.5 w-3.5 text-green-500 mr-2" /> : <Plus className="h-3.5 w-3.5 text-blue-500 mr-2 opacity-0 group-hover:opacity-100" />}
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}

                                                        {/* Direct members of parent dept (if any) */}
                                                        {mockAllUsers.filter(u => u.department === dept.name).map(user => {
                                                            const isSelected = members.some(m => m.id === user.id);
                                                            return (
                                                                <div
                                                                    key={user.id}
                                                                    className={cn(
                                                                        "flex items-center justify-between p-1.5 pl-3 rounded-lg transition-colors group",
                                                                        isSelected ? "bg-slate-50" : "hover:bg-blue-50/30 cursor-pointer"
                                                                    )}
                                                                    onClick={() => !isSelected && handleAddMember(user)}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <User className="h-3.5 w-3.5 text-slate-300" />
                                                                        <span className="text-xs text-slate-600">{user.name}</span>
                                                                    </div>
                                                                    {isSelected ? <Check className="h-3.5 w-3.5 text-green-500 mr-2" /> : <Plus className="h-3.5 w-3.5 text-blue-500 mr-2 opacity-0 group-hover:opacity-100" />}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 border-t border-slate-50">
                    <Button className="bg-blue-600 hover:bg-blue-700 w-full rounded-xl" onClick={() => onOpenChange(false)}>
                        完成设置
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
