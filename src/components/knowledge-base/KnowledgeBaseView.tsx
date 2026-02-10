
import { useState, useMemo, useEffect } from 'react';
import { DetailedKnowledgeBase, KBTab } from '@/types';
import { mockDetailedKnowledgeBases } from '@/data/kb-mock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LibraryCard } from './LibraryCard';
import { LibraryDetail } from './LibraryDetail';
import { UploadModal } from './UploadModal';
import { EditLibraryModal } from './EditLibraryModal';
import { ShareModal } from './ShareModal';
import { MembersModal } from './MembersModal';
import { KBTreeList } from './KBTreeList';
import { FilePreview } from './FilePreview';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Brain, Upload, Plus, Users, Trash2, Share2, HelpCircle, Bell, ChevronDown, MessageSquare, LayoutGrid, List as ListIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { SystemTagTaxonomy } from '@/data/system-tags';

interface KnowledgeBaseViewProps {
    aiPanel?: React.ReactNode;
    tagTaxonomy?: SystemTagTaxonomy;
}

export function KnowledgeBaseView({ aiPanel, tagTaxonomy }: KnowledgeBaseViewProps) {
    const [selectedLibraryId, setSelectedLibraryId] = useState<string | null>(null);
    const [currentTab, setCurrentTab] = useState<KBTab>('department');
    const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
    const [previewFile, setPreviewFile] = useState<any | null>(null);

    // Modals state
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [selectedMemberLib, setSelectedMemberLib] = useState<DetailedKnowledgeBase | null>(null);
    const [sharingLibrary, setSharingLibrary] = useState<DetailedKnowledgeBase | null>(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [isAIUpload, setIsAIUpload] = useState(false);
    const [isFolderUpload, setIsFolderUpload] = useState(false);
    const [uploadLibraryType, setUploadLibraryType] = useState<'brand' | 'quote-equipment' | 'quote-rnd' | 'normal'>('normal');
    const [uploadParseCallback, setUploadParseCallback] = useState<((files: File[]) => void) | undefined>(undefined);

    // 模拟数据状态化，以便实时反映分享状态
    const [allLibraries, setAllLibraries] = useState<DetailedKnowledgeBase[]>(mockDetailedKnowledgeBases);

    // Filter libraries
    const libraries = currentTab === 'shared'
        ? allLibraries.filter(kb => kb.isShared)
        : allLibraries.filter(kb => kb.type === currentTab);

    const selectedLibrary = allLibraries.find(kb => kb.id === selectedLibraryId);

    // Handlers
    const handleCardClick = (id: string) => setSelectedLibraryId(id);


    const handleAIUpload = () => {
        setIsAIUpload(true);
        setIsFolderUpload(false);
        setShowUploadModal(true);
    };

    const handeNormalUpload = (libraryType: 'brand' | 'quote-equipment' | 'quote-rnd' | 'normal' = 'normal', onParseComplete?: (files: File[]) => void) => {
        setIsAIUpload(false);
        setIsFolderUpload(false);
        setUploadLibraryType(libraryType);
        setUploadParseCallback(() => onParseComplete);
        setShowUploadModal(true);
    };

    const handleFolderUpload = () => {
        setIsAIUpload(false);
        setIsFolderUpload(true);
        setShowUploadModal(true);
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setModalMode('edit');
        setShowEditModal(true);
    };

    const handlePreviewFile = (file: any) => {
        setPreviewFile(file);
    };

    const handleClosePreview = () => {
        setPreviewFile(null);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        toast('确定要删除该知识库吗？此操作无法撤销。', {
            action: {
                label: '删除',
                onClick: () => toast.success('已删除知识库')
            },
            cancel: {
                label: '取消',
                onClick: () => { }
            }
        });
    };

    const handleMembers = (lib: DetailedKnowledgeBase, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedMemberLib(lib);
        setShowMembersModal(true);
    };

    const handleShareClick = (lib: DetailedKnowledgeBase, e: React.MouseEvent) => {
        e.stopPropagation();
        setSharingLibrary(lib);
        setShowShareModal(true);
    };

    const handleShareConfirm = (libId: string, isShared: boolean) => {
        setAllLibraries(prev => prev.map(lib =>
            lib.id === libId ? { ...lib, isShared } : lib
        ));
        if (isShared) {
            toast.success('知识库已成功分享至共享广场');
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#f5f7fa] relative">


            {/* Main Content */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-[#f8fafc]">
                {selectedLibrary ? (
                    <LibraryDetail
                        library={selectedLibrary}
                        allLibraries={allLibraries}
                        onBack={() => setSelectedLibraryId(null)}
                        onPreviewFile={handlePreviewFile}
                        previewFile={previewFile}
                        tagTaxonomy={tagTaxonomy}
                    />
                ) : (
                    <div className="flex-1 flex overflow-hidden min-h-0 bg-[#f8fafc]">
                        {/* 左侧主要内容区 */}
                        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden border-r border-slate-200/40">
                            <Tabs value={currentTab} onValueChange={(v: string) => setCurrentTab(v as KBTab)} className="flex-1 flex flex-col min-h-0">
                                {/* 知识库头部 */}
                                <div className="flex items-center gap-10 px-8 py-5 border-b border-slate-200/40 bg-white shrink-0">
                                    <TabsList className="bg-slate-50 border border-slate-200/60 p-1 rounded-2xl h-[48px] shadow-inner">
                                        <TabsTrigger value="personal" className="h-full px-6 rounded-xl text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm">个人库</TabsTrigger>
                                        <TabsTrigger value="department" className="h-full px-6 rounded-xl text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">部门库</TabsTrigger>
                                        <TabsTrigger value="enterprise" className="h-full px-6 rounded-xl text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm">企业库</TabsTrigger>
                                        <TabsTrigger value="shared" className="h-full px-6 rounded-xl text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm">共享广场</TabsTrigger>
                                    </TabsList>

                                    <div className="flex items-center gap-3 ml-auto">
                                        <Button onClick={handleAIUpload} className="bg-linear-to-r from-[#8b5cf6] to-[#6366f1] hover:from-[#7c3aed] hover:to-[#4f46e5] text-white shadow-lg shadow-indigo-100/50 border-0 gap-2 h-10 px-5 rounded-xl transition-all hover:scale-[1.02] active:scale-95 text-sm">
                                            <Sparkles className="h-4 w-4" />
                                            AI 智能上传
                                        </Button>
                                        <Button onClick={() => { setModalMode('create'); setShowEditModal(true); }} className="gap-2 bg-blue-600 text-white hover:bg-blue-700 h-10 px-5 rounded-xl shadow-lg shadow-blue-100 border-0 transition-all hover:scale-[1.02] active:scale-95 text-sm">
                                            <Plus className="h-4 w-4" /> 新增知识库
                                        </Button>

                                        <div className="h-10 border border-slate-200/50 bg-white rounded-xl p-1 flex items-center shadow-sm ml-2">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant={viewMode === 'card' ? 'secondary' : 'ghost'}
                                                            size="icon"
                                                            className={cn("h-8 w-8 rounded-lg", viewMode === 'card' ? "bg-slate-100 text-slate-800 shadow-sm" : "text-slate-400")}
                                                            onClick={() => setViewMode('card')}
                                                        >
                                                            <LayoutGrid className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>卡片视图</TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                                            size="icon"
                                                            className={cn("h-8 w-8 rounded-lg", viewMode === 'list' ? "bg-slate-100 text-slate-800 shadow-sm" : "text-slate-400")}
                                                            onClick={() => setViewMode('list')}
                                                        >
                                                            <ListIcon className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>列表视图</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </div>
                                </div>

                                {/* 知识库列表/卡片区 */}
                                <div className="flex-1 overflow-hidden p-8">
                                    {previewFile && viewMode === 'card' ? (
                                        <div className="absolute inset-0 z-40 bg-white">
                                            <FilePreview
                                                title={previewFile.name}
                                                content={previewFile.content || "暂无内容"}
                                                onClose={handleClosePreview}
                                            />
                                        </div>
                                    ) : previewFile && viewMode === 'list' ? (
                                        <div className="flex h-full bg-white rounded-xl border border-gray-200 overflow-hidden">
                                            {/* Left Sidebar (Compact Tree) */}
                                            <div className="w-[280px] border-r border-gray-200 flex flex-col bg-gray-50/50">
                                                <div className="p-3 border-b border-gray-100 font-medium text-sm text-gray-600 flex items-center justify-between">
                                                    <span>知识库目录</span>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setPreviewFile(null)}>
                                                        <ChevronDown className="h-4 w-4 rotate-90" />
                                                    </Button>
                                                </div>
                                                <KBTreeList
                                                    libraries={libraries}
                                                    onEnterLibrary={handleCardClick}
                                                    compact={true}
                                                    onSelectFile={handlePreviewFile}
                                                    selectedFileId={previewFile.id}
                                                />
                                            </div>
                                            {/* Right Content (Preview) */}
                                            <div className="flex-1 min-w-0 h-full overflow-hidden">
                                                <FilePreview
                                                    title={previewFile.name}
                                                    content={previewFile.content || "暂无内容"}
                                                    onClose={handleClosePreview}
                                                />
                                            </div>
                                        </div>
                                    ) : viewMode === 'card' ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 auto-rows-max overflow-y-auto pb-8 custom-scrollbar h-full">
                                            {libraries.map(lib => (
                                                <LibraryCard
                                                    key={lib.id}
                                                    library={lib}
                                                    onClick={() => handleCardClick(lib.id)}
                                                    onEdit={handleEdit}
                                                    onDelete={handleDelete}
                                                    onMembers={(e) => handleMembers(lib, e)}
                                                    onShare={(e) => handleShareClick(lib, e)}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
                                            <KBTreeList
                                                libraries={libraries}
                                                onEnterLibrary={handleCardClick}
                                                onSelectFile={handlePreviewFile}
                                                selectedFileId={previewFile?.id}
                                            />
                                        </div>
                                    )}
                                </div>
                            </Tabs>
                        </div>

                        {/* 右侧 AI 助手面板 - 提到顶层与内容区并列 */}
                        {aiPanel && (
                            <aside className="w-[420px] shrink-0 h-full bg-white shadow-[-8px_0_24px_rgba(0,0,0,0.02)] overflow-hidden z-10">
                                {aiPanel}
                            </aside>
                        )}
                    </div>
                )}
            </div>


            {/* Modals */}
            <UploadModal
                open={showUploadModal}
                onOpenChange={setShowUploadModal}
                isAI={isAIUpload}
                isFolder={isFolderUpload}
                libraryType={uploadLibraryType}
                tagTaxonomy={tagTaxonomy}
                onParseComplete={uploadParseCallback}
                onConfirm={(_uploadedFiles, _isFolder) => {
                    setShowUploadModal(false);
                    if (isAIUpload) {
                        toast('AI分析完成，建议上传至 "品牌选型库"', {
                            action: { label: '确认归档', onClick: () => toast.success('已归档') }
                        });
                    } else {
                        toast.success('文件上传成功');
                    }
                }}
            />
            <EditLibraryModal
                open={showEditModal}
                onOpenChange={setShowEditModal}
                mode={modalMode}
                onConfirm={() => {
                    setShowEditModal(false);
                    toast.success(modalMode === 'create' ? '知识库创建成功' : '知识库更新成功');
                }}
            />
            {selectedMemberLib && (
                <MembersModal
                    open={showMembersModal}
                    onOpenChange={setShowMembersModal}
                    libraryName={selectedMemberLib.name}
                    currentMembers={selectedMemberLib.members}
                />
            )}
            <ShareModal
                open={showShareModal}
                onOpenChange={setShowShareModal}
                library={sharingLibrary}
                onShareUpdate={handleShareConfirm}
            />
        </div>
    );
}
