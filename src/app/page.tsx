'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Search,
  MessageSquare,
  Sparkles,
  Loader2,
  Copy,
  Check,
  BookOpen,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileText,
  CheckCircle,
  FolderOpen,
  Gavel,
  Menu,
  Plus,
  FileEdit,
  FileCheck,
  LogOut,
  Paperclip,
  Building2,
  Users,
  User,
  PanelLeftClose,
  PanelLeft,
  Brain,
  Zap,
  Globe,
  HardDrive,
  X,
  File,
  ArrowRight,
  Database,
  Eye,
  Bell,
  HelpCircle,
  Library,
  Wrench,
  Settings,
  Handshake,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Toaster, toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Message, KnowledgeBase } from '@/types';
import {
  mockKnowledgeBases,
  generateMockAIResponse,
  mockAssistants,
} from '@/data/mock';
import { KnowledgeBaseView } from '@/components/knowledge-base/KnowledgeBaseView';
import { KnowledgeBaseSelector } from '@/components/knowledge-base/KnowledgeBaseSelector';
import { AIChatPanel } from '@/components/AIChatPanel';


// Markdown渲染函数 - 支持表格、标题、加粗等
function renderMarkdown(content: string): string {
  // 处理表格
  const renderTable = (tableContent: string): string => {
    const lines = tableContent.trim().split('\n');
    if (lines.length < 2) return tableContent;

    let html = '<div class="overflow-x-auto my-4"><table class="min-w-full border-collapse text-sm">';

    lines.forEach((line, index) => {
      // 跳过分隔行 (|---|---|)
      if (/^\|[\s\-:]+\|/.test(line) && line.includes('-')) return;

      const cells = line.split('|').filter(cell => cell.trim() !== '');
      if (cells.length === 0) return;

      const isHeader = index === 0;
      const tag = isHeader ? 'th' : 'td';
      const cellClass = isHeader
        ? 'border border-gray-200 bg-gray-50 px-3 py-2 text-left font-semibold text-gray-800'
        : 'border border-gray-200 px-3 py-2 text-gray-700';

      html += '<tr>';
      cells.forEach(cell => {
        html += `<${tag} class="${cellClass}">${cell.trim()}</${tag}>`;
      });
      html += '</tr>';
    });

    html += '</table></div>';
    return html;
  };

  // 检测并替换表格
  let result = content;

  // 匹配Markdown表格 (多行以|开头的内容)
  const tableRegex = /(\|.+\|\n)+/g;
  result = result.replace(tableRegex, (match) => {
    // 确认是表格格式(至少有分隔行)
    if (match.includes('|---') || match.includes('| ---')) {
      return renderTable(match);
    }
    return match;
  });

  // 处理其他Markdown语法
  result = result
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-800">$1</strong>')
    .replace(/### (.*)/g, '<h4 class="text-base font-semibold text-gray-800 mt-4 mb-2 first:mt-0">$1</h4>')
    .replace(/\n\n/g, '</p><p class="mt-3">')
    .replace(/\n/g, '<br/>');

  return result;
}

// 引用标签组件
const CitationTag = ({
  citationIndex,
  citation,
  onPreview
}: {
  citationIndex: number;
  citation?: { id: string; title: string; source: string; snippet: string; pageNumber?: number };
  onPreview: (c: any) => void;
}) => {
  if (!citation) return <span className="text-blue-600 font-bold text-[10px] mx-0.5">[{citationIndex}]</span>;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <sup
            onClick={(e) => {
              e.stopPropagation();
              onPreview(citation);
            }}
            className="inline-flex items-center justify-center min-w-[14px] h-[14px] px-0.5 mx-0.5 text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all cursor-pointer select-none align-baseline"
          >
            {citationIndex}
          </sup>
        </TooltipTrigger>
        <TooltipContent className="max-w-[200px] wrap-break-word">
          <div className="font-medium text-[11px] mb-0.5">{citation.title}</div>
          <div className="text-[10px] text-slate-400">{citation.source}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// 助手图标映射
const assistantIcons: Record<string, React.ReactNode> = {
  'FileText': <FileText className="h-5 w-5" />,
  'CheckCircle': <CheckCircle className="h-5 w-5" />,
  'FolderOpen': <FolderOpen className="h-5 w-5" />,
  'Gavel': <Gavel className="h-5 w-5" />,
};

// AI助手菜单 - 分类整理
type MenuItem = {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
};

type MenuCategory = {
  id: string;
  label: string;
  items: MenuItem[];
};

const menuCategories: MenuCategory[] = [
  {
    id: 'qa',
    label: '智能问答',
    items: [
      { id: 'smart-qa', name: '盛视智能问答', icon: Sparkles },
    ],
  },
  {
    id: 'assistants',
    label: '专业助手',
    items: [
      { id: 'doc-assistant', name: '项目文档助手', icon: FileEdit },
      { id: 'verify-assistant', name: '项目校验助手', icon: FileCheck },
      { id: 'material-assistant', name: '项目资料助手', icon: FolderOpen },
      { id: 'bid-assistant', name: '招投标助手', icon: Gavel },
    ],
  },
  {
    id: 'system',
    label: '系统功能',
    items: [
      { id: 'collaboration', name: '智能方案协作系统', icon: Handshake },
      { id: 'knowledge-base', name: '智策汇知识库', icon: Library },
      { id: 'toolbox', name: '方案高效工具箱', icon: Wrench },
    ],
  },
  {
    id: 'config',
    label: '系统设置',
    items: [
      { id: 'settings', name: '平台设置', icon: Settings },
    ],
  },
];

// 通知消息数据
const mockNotifications = [
  {
    id: 'n1',
    title: '新的项目文档已上传',
    content: '技术部门上传了《XX项目技术方案V2.0》',
    time: '10分钟前',
    read: false,
    type: 'document',
  },
  {
    id: 'n2',
    title: '方案评审提醒',
    content: '您有一份待评审的投标方案，请及时处理',
    time: '1小时前',
    read: false,
    type: 'task',
  },
  {
    id: 'n3',
    title: '知识库更新通知',
    content: '企业产品库新增了5份产品文档',
    time: '3小时前',
    read: true,
    type: 'info',
  },
  {
    id: 'n4',
    title: '系统维护通知',
    content: '系统将于今晚22:00进行例行维护',
    time: '昨天',
    read: true,
    type: 'system',
  },
];

// 历史记录按日期分组 - 演示用数据
const groupedHistory = [
  {
    date: '今天',
    items: [
      { id: 'h1', title: '智能系统配置清单查询' },
      { id: 'h2', title: '设备技术参数咨询' },
    ],
  },
  {
    date: '1-11',
    items: [
      { id: 'h3', title: 'XX项目招标文件解读' },
      { id: 'h4', title: 'A区设备选型咨询' },
    ],
  },
  {
    date: '1-10',
    items: [
      { id: 'h5', title: '项目报价方案咨询' },
      { id: 'h6', title: '识别设备产品对比' },
      { id: 'h7', title: '近期项目汇总' },
    ],
  },
  {
    date: '1-9',
    items: [
      { id: 'h8', title: '投标文件技术方案模板' },
      { id: 'h9', title: '检测设备参数规格查询' },
    ],
  },
  {
    date: '1-8',
    items: [
      { id: 'h10', title: 'B区改造项目分析' },
      { id: 'h11', title: '智能系统竞品对比' },
    ],
  },
];

// 推荐问题 - 演示用数据
const suggestedQuestions = [
  'XX项目的招标要求有哪些？',
  '我们的核心产品和竞品有什么区别？',
  '帮我找一下去年类似项目的中标方案作为参考',
];


// 知识库选择器组件



export default function SmartQAPage() {
  // 状态管理
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<string | null>(null);
  const [selectedKnowledgeBases, setSelectedKnowledgeBases] = useState<string[]>([]);

  // 当前视图
  const [currentView, setCurrentView] = useState<string>('knowledge-base');

  // 新增：深度思考模式
  const [thinkingMode, setThinkingMode] = useState<'normal' | 'deep'>('normal');
  // 新增：检索来源（联网/本地）
  const [searchSource, setSearchSource] = useState<'local' | 'internet' | 'hybrid'>('local');
  // 新增：上传的文件列表
  const [uploadedFiles, setUploadedFiles] = useState<{ id: string; name: string; size: string }[]>([]);
  // 文件上传input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 新增：检索状态
  const [searchStatus, setSearchStatus] = useState<{
    isSearching: boolean;
    currentStep: string;
    searchedCount: number;
    matchedCount: number;
    progress?: number;
  }>({ isSearching: false, currentStep: '', searchedCount: 0, matchedCount: 0, progress: 0 });


  // 新增：深度思考步骤
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const [showThinkingSteps, setShowThinkingSteps] = useState(false);

  // 新增：流式输出状态
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [displayedContent, setDisplayedContent] = useState('');

  // 新增：引用预览弹窗
  const [previewCitation, setPreviewCitation] = useState<{
    title: string;
    source: string;
    content: string;
    pageNumber?: number;
  } | null>(null);

  // 新增：助手跳转确认
  const [jumpingAssistant, setJumpingAssistant] = useState<string | null>(null);

  // 滚动引用
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // 发送消息
  const handleSendMessage = async (text?: string) => {
    const contentToSend = text || inputValue;
    if (!contentToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: contentToSend,
      timestamp: new Date(),
    };

    const questionText = contentToSend;
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setThinkingSteps([]);
    setShowThinkingSteps(thinkingMode === 'deep');

    setShowThinkingSteps(thinkingMode === 'deep');

    // 1. 模拟检索过程

    setSearchStatus({ isSearching: true, currentStep: '正在连接知识库...', searchedCount: 0, matchedCount: 0, progress: 10 });
    await new Promise(resolve => setTimeout(resolve, 400));

    const knowledgeBaseNames = ['企业产品库', '部门技术库', '历史项目库', '竞品分析库'];
    for (let i = 0; i < knowledgeBaseNames.length; i++) {
      const progress = 10 + Math.floor(((i + 1) / knowledgeBaseNames.length) * 80);
      setSearchStatus({
        isSearching: true,
        currentStep: `正在检索「${knowledgeBaseNames[i]}」...`,
        searchedCount: i + 1,
        matchedCount: Math.floor(Math.random() * 5) + (i + 1) * 2,
        progress: progress,
      });
      await new Promise(resolve => setTimeout(resolve, 400));
    }


    setSearchStatus(prev => ({
      ...prev,
      currentStep: '检索完成，正在分析结果...',
      progress: 100,
    }));
    await new Promise(resolve => setTimeout(resolve, 400));


    // 2. 深度思考步骤（仅在深度模式下）
    if (thinkingMode === 'deep') {
      const steps = [
        '分析问题关键词和意图...',
        '检索相关知识库文档...',
        '对比历史项目数据...',
        '整合分析多源信息...',
        '生成结构化回复...',
      ];
      for (const step of steps) {
        setThinkingSteps(prev => [...prev, step]);
        await new Promise(resolve => setTimeout(resolve, 400));
      }
    }

    setSearchStatus({ isSearching: false, currentStep: '', searchedCount: 0, matchedCount: 0 });

    // 生成 AI 回复
    const mockResponse = generateMockAIResponse(questionText);
    const aiMessageId = `msg-${Date.now()}-ai`;

    const aiMessage: Message = {
      id: aiMessageId,
      role: 'assistant',
      content: mockResponse.content,
      timestamp: new Date(),
      citations: mockResponse.citations,
      assistantSuggestions: mockResponse.assistantSuggestions,
      thinkingDuration: thinkingMode === 'deep' ? 3.2 : 1.5,
    };

    setMessages(prev => prev.concat(aiMessage));


    // 3. 流式输出效果
    setStreamingMessageId(aiMessageId);
    setDisplayedContent('');

    const fullContent = mockResponse.content;
    const chunkSize = 3; // 每次显示3个字符
    for (let i = 0; i <= fullContent.length; i += chunkSize) {
      setDisplayedContent(fullContent.slice(0, i));
      await new Promise(resolve => setTimeout(resolve, 15));
    }
    setDisplayedContent(fullContent);
    setStreamingMessageId(null);
    setIsLoading(false);
  };

  // 复制消息
  const handleCopyMessage = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast.success('已复制到剪贴板');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 点击推荐问题
  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
  };

  // 跳转到助手（带动画效果）
  const handleGoToAssistant = async (assistantId: string) => {
    const assistant = mockAssistants.find(a => a.id === assistantId);
    if (assistant) {
      setJumpingAssistant(assistantId);

      // 显示跳转动画
      await new Promise(resolve => setTimeout(resolve, 800));

      toast.success(`正在跳转到 ${assistant.name}...`, {
        description: '该功能模块正在设计中，敬请期待',
      });

      setJumpingAssistant(null);
    }
  };

  // 打开引用预览
  const handlePreviewCitation = (citation: { title: string; source: string; snippet: string; pageNumber?: number }) => {
    // 生成更详细的预览内容
    const detailedContent = `## ${citation.title}\n\n**来源**: ${citation.source}${citation.pageNumber ? ` · 第 ${citation.pageNumber} 页` : ''}\n\n---\n\n${citation.snippet}\n\n### 相关内容摘要\n\n本文档详细阐述了相关技术规范和产品参数，涵盖系统架构设计、性能指标要求、接口规范定义等核心内容。文档中对技术实现细节进行了充分说明，可作为方案编写的重要参考资料。\n\n**关键词**: 技术规范、产品参数、系统架构、性能指标\n\n**更新时间**: 2026-01-10`;

    setPreviewCitation({
      title: citation.title,
      source: citation.source,
      content: detailedContent,
      pageNumber: citation.pageNumber,
    });
  };

  // 新增：处理菜单项点击
  const handleMenuItemClick = (itemId: string, itemName: string) => {
    if (itemId === 'smart-qa') {
      setCurrentView('smart-qa');
    } else if (itemId === 'knowledge-base') {
      setCurrentView('knowledge-base');
    } else {
      // 其他助手页面显示"暂未制作"提示
      toast.info(`${itemName} 暂未制作`, {
        description: '该功能模块正在设计中，敬请期待',
      });
    }
  };

  // 新增：从知识库跳转回对话
  const handleNavigateToChat = (query: string) => {
    setCurrentView('smart-qa');
    setInputValue(''); // 清空输入框
    // 延迟一点执行发送，确保视图切换完成（虽然React state update batching可能不需要，但为了保险）
    setTimeout(() => {
      handleSendMessage(query);
    }, 100);
  };

  // 新增：处理文件上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files).map(file => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: formatFileSize(file.size),
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    toast.success(`已添加 ${files.length} 个文件`);

    // 清空input以便重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 新增：格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // 新增：删除上传的文件
  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // 新增：删除历史记录
  const handleDeleteHistory = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    toast('确定要删除这条对话记录吗？', {
      action: {
        label: '删除',
        onClick: () => {
          toast.success('已删除对话记录');
        }
      },
      cancel: { label: '取消', onClick: () => { } }
    });
  };

  const navItems = [
    { id: 'collaboration', name: '方案设计协作系统', icon: Handshake },
    { id: 'knowledge-base', name: '智策汇知识库', icon: Library },
    { id: 'toolbox', name: '方案高效工具箱', icon: Wrench },
    { id: 'smart-qa', name: '盛视个人智能问答', icon: Sparkles },
    { id: 'settings', name: '系统设置', icon: Settings },
  ];

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-white">
        <Toaster position="top-center" richColors />

        {/* 顶部导航栏 - 全宽布局 */}
        <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 z-40 shadow-sm relative">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-100">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-slate-800 tracking-tight text-sm">盛视智能协作平台</span>
            </div>

            {/* 顶部导航按钮 - 仅图标模式，悬停显示名称 */}
            <nav className="flex items-center bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-inner">
              {navItems.map((item) => (
                <Tooltip key={item.id} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setCurrentView(item.id)}
                      className={cn(
                        "w-10 h-10 rounded-xl transition-all flex items-center justify-center relative group",
                        currentView === item.id
                          ? "bg-white text-blue-600 shadow-md border border-slate-200/40"
                          : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                      )}
                    >
                      <item.icon className={cn("h-5 w-5", currentView === item.id ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
                      {currentView === item.id && (
                        <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={12} className="bg-slate-900 text-white border-none py-1.5 px-3 rounded-lg text-xs font-bold">
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                <HelpCircle className="h-5 w-5" />
              </button>
              <div className="relative">
                <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 group cursor-pointer p-1 pr-3 rounded-full hover:bg-slate-50 transition-all">
              <Avatar className="h-8 w-8 ring-2 ring-orange-100">
                <AvatarFallback className="bg-orange-100 text-orange-600 text-xs font-bold font-sans">演</AvatarFallback>
              </Avatar>
              <span className="text-xs font-semibold text-slate-700 font-sans">演示账号</span>
              <ChevronDown className="h-3 w-3 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
          </div>
        </header>

        {/* 内容容器 */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* 左侧/主内容区域 */}
          <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#f8fafc]">
            {/* 主内容区 */}
            <main className="flex-1 overflow-hidden relative flex flex-col">
              {currentView === 'knowledge-base' ? (
                <KnowledgeBaseView
                  aiPanel={
                    <AIChatPanel
                      messages={messages}
                      inputValue={inputValue}
                      setInputValue={setInputValue}
                      isLoading={isLoading}
                      onSendMessage={() => handleSendMessage()}
                      thinkingMode={thinkingMode}
                      setThinkingMode={setThinkingMode}
                      searchSource={searchSource === 'hybrid' ? 'local' : searchSource}
                      setSearchSource={(s) => setSearchSource(s)}
                      selectedKnowledgeBases={selectedKnowledgeBases}
                      setSelectedKnowledgeBases={setSelectedKnowledgeBases}
                      uploadedFiles={uploadedFiles}
                      onFileUpload={handleFileUpload}
                      onRemoveFile={handleRemoveFile}
                      onPreviewCitation={handlePreviewCitation}
                      onDeleteHistory={handleDeleteHistory}
                      historyItems={groupedHistory}
                      selectedHistory={selectedHistory}
                      onSelectHistory={setSelectedHistory}
                      onNewChat={() => {
                        setMessages([]);
                        setSelectedHistory(null);
                        toast.success('已开启新对话');
                      }}
                      searchStatus={searchStatus}
                      thinkingSteps={thinkingSteps}
                      isSidebar={true}
                    />

                  }
                />
              ) : currentView === 'smart-qa' ? (
                <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
                  <AIChatPanel
                    messages={messages}
                    inputValue={inputValue}
                    setInputValue={setInputValue}
                    isLoading={isLoading}
                    onSendMessage={() => handleSendMessage()}
                    thinkingMode={thinkingMode}
                    setThinkingMode={setThinkingMode}
                    searchSource={searchSource === 'hybrid' ? 'local' : searchSource}
                    setSearchSource={(s) => setSearchSource(s)}
                    selectedKnowledgeBases={selectedKnowledgeBases}
                    setSelectedKnowledgeBases={setSelectedKnowledgeBases}
                    uploadedFiles={uploadedFiles}
                    onFileUpload={handleFileUpload}
                    onRemoveFile={handleRemoveFile}
                    onPreviewCitation={handlePreviewCitation}
                    onDeleteHistory={handleDeleteHistory}
                    historyItems={groupedHistory}
                    selectedHistory={selectedHistory}
                    onSelectHistory={setSelectedHistory}
                    onNewChat={() => {
                      setMessages([]);
                      setSelectedHistory(null);
                      toast.success('已开启新对话');
                    }}
                    searchStatus={searchStatus}
                    thinkingSteps={thinkingSteps}
                    isSidebar={false}
                  />

                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-slate-50/50">
                  <div className="w-20 h-20 rounded-3xl bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center mb-8 border border-slate-100 animate-in zoom-in-50 duration-500">
                    {(() => {
                      const ActiveIcon = navItems.find(i => i.id === currentView)?.icon || Sparkles;
                      return <ActiveIcon className="h-10 w-10 text-blue-500" />;
                    })()}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">
                    {navItems.find(i => i.id === currentView)?.name || '欢迎使用'}
                  </h2>
                  <p className="text-slate-500 max-w-md leading-relaxed text-sm">
                    功能模块开发中。右侧 AI 助手已就绪，您可以随时向它咨询关于
                    <span className="text-blue-600 font-medium mx-1">
                      {navItems.find(i => i.id === currentView)?.name || '系统'}
                    </span>
                    的相关问题。
                  </p>
                </div>
              )}
            </main>
          </div>

          {/* 引用预览 Dialog */}
          <Dialog open={!!previewCitation} onOpenChange={() => setPreviewCitation(null)}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col p-0 gap-0 border-none shadow-2xl rounded-3xl">
              <DialogHeader className="p-6 border-b border-slate-100 shrink-0 bg-white">
                <DialogTitle className="flex items-center gap-3 text-xl text-slate-800 font-bold tracking-tight">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  {previewCitation?.title}
                </DialogTitle>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-2 ml-13">
                  <span className="px-2 py-0.5 bg-slate-100 rounded-full font-medium">{previewCitation?.source}</span>
                  {previewCitation?.pageNumber && (
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">第 {previewCitation?.pageNumber} 页</span>
                  )}
                </div>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/30">
                <div
                  className="prose prose-slate prose-sm max-w-none prose-headings:text-slate-800 prose-p:text-slate-600 prose-strong:text-slate-900 prose-pre:bg-slate-900 prose-pre:rounded-2xl"
                  dangerouslySetInnerHTML={{
                    __html: previewCitation?.content ? renderMarkdown(previewCitation.content) : ''
                  }}
                />
              </div>
              <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between px-6">
                <Button variant="ghost" size="sm" onClick={() => setPreviewCitation(null)} className="rounded-xl text-slate-500 hover:bg-slate-50">
                  关闭
                </Button>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="gap-2 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50">
                    <Copy className="h-4 w-4" />
                    <span>复制内容</span>
                  </Button>
                  <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200 border-none px-4">
                    <ExternalLink className="h-4 w-4" />
                    <span>打开原文</span>
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </TooltipProvider>
  );
}

