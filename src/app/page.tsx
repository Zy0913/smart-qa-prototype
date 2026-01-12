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
      { id: 'smart-qa', name: '盛视智能问答', icon: Sparkles, active: true },
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
function KnowledgeBaseSelector({
  selectedBases,
  onSelectionChange,
}: {
  selectedBases: string[];
  onSelectionChange: (bases: string[]) => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    enterprise: true,
    department: true,
    personal: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleBase = (baseId: string) => {
    if (selectedBases.includes(baseId)) {
      onSelectionChange(selectedBases.filter(id => id !== baseId));
    } else {
      onSelectionChange([...selectedBases, baseId]);
    }
  };

  const filterBases = (bases: KnowledgeBase[]) => {
    if (!searchTerm) return bases;
    return bases.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  const enterpriseBases = filterBases(mockKnowledgeBases.filter(b => b.type === 'enterprise'));
  const departmentBases = filterBases(mockKnowledgeBases.filter(b => b.type === 'department'));
  const personalBases = filterBases(mockKnowledgeBases.filter(b => b.type === 'personal'));

  const sections = [
    { key: 'enterprise', label: '企业库', icon: Building2, bases: enterpriseBases, color: 'text-blue-600' },
    { key: 'department', label: '部门库', icon: Users, bases: departmentBases, color: 'text-green-600' },
    { key: 'personal', label: '个人库', icon: User, bases: personalBases, color: 'text-orange-600' },
  ];

  // 获取所有知识库ID
  const allBaseIds = mockKnowledgeBases.map(b => b.id);
  const isAllSelected = allBaseIds.length > 0 && allBaseIds.every(id => selectedBases.includes(id));
  const isPartialSelected = selectedBases.length > 0 && !isAllSelected;

  // 全选/取消全选
  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(allBaseIds);
    }
  };

  // 按分类全选/取消全选
  const handleSelectSection = (sectionBases: KnowledgeBase[]) => {
    const sectionIds = sectionBases.map(b => b.id);
    const allSectionSelected = sectionIds.every(id => selectedBases.includes(id));

    if (allSectionSelected) {
      onSelectionChange(selectedBases.filter(id => !sectionIds.includes(id)));
    } else {
      const newSelection = [...new Set([...selectedBases, ...sectionIds])];
      onSelectionChange(newSelection);
    }
  };

  // 检查某分类是否全选
  const isSectionAllSelected = (sectionBases: KnowledgeBase[]) => {
    if (sectionBases.length === 0) return false;
    return sectionBases.every(b => selectedBases.includes(b.id));
  };

  // 检查某分类是否部分选择
  const isSectionPartialSelected = (sectionBases: KnowledgeBase[]) => {
    if (sectionBases.length === 0) return false;
    const selectedCount = sectionBases.filter(b => selectedBases.includes(b.id)).length;
    return selectedCount > 0 && selectedCount < sectionBases.length;
  };

  return (
    <div className="w-64">
      {/* 搜索框 */}
      <div className="p-3 pb-2 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            placeholder="搜索..."
            className="h-7 pl-8 text-xs bg-gray-50 border-gray-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 全选行 */}
      <label className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 border-b border-gray-100">
        <Checkbox
          checked={isAllSelected}
          // @ts-ignore - 支持 indeterminate 状态
          data-state={isPartialSelected ? 'indeterminate' : isAllSelected ? 'checked' : 'unchecked'}
          onCheckedChange={handleSelectAll}
          className="h-3.5 w-3.5"
        />
        <span className="text-xs font-medium text-gray-700 flex-1">全部知识库</span>
        <span className="text-[10px] text-gray-400">{allBaseIds.length}</span>
      </label>

      {/* 知识库列表 */}
      <div className="max-h-64 overflow-y-auto custom-scrollbar">
        {sections.map((section) => {
          const sectionAllSelected = isSectionAllSelected(section.bases);
          const sectionPartialSelected = isSectionPartialSelected(section.bases);

          return (
            <div key={section.key}>
              {/* 分类标题行 - 带全选checkbox */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/80">
                <Checkbox
                  checked={sectionAllSelected}
                  data-state={sectionPartialSelected ? 'indeterminate' : sectionAllSelected ? 'checked' : 'unchecked'}
                  onCheckedChange={() => handleSelectSection(section.bases)}
                  className="h-3.5 w-3.5"
                />
                <section.icon className={cn("h-3.5 w-3.5", section.color)} />
                <span className="text-xs font-medium text-gray-600 flex-1">{section.label}</span>
                <button
                  onClick={() => toggleSection(section.key)}
                  className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                >
                  {expandedSections[section.key] ? (
                    <ChevronUp className="h-3.5 w-3.5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                  )}
                </button>
              </div>
              {/* 知识库列表 */}
              {expandedSections[section.key] && section.bases.length > 0 && (
                <div className="py-1">
                  {section.bases.map((base) => (
                    <label
                      key={base.id}
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer pl-[38px]"
                    >
                      <Checkbox
                        checked={selectedBases.includes(base.id)}
                        onCheckedChange={() => toggleBase(base.id)}
                        className="h-3.5 w-3.5"
                      />
                      <span className="text-xs text-gray-600 flex-1 truncate">{base.name}</span>
                      <span className="text-[10px] text-gray-400">{base.documentCount}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 底部状态 */}
      <div className="px-3 py-2 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <span className="text-[11px] text-gray-500">
          {selectedBases.length === 0 ? '检索全部' : `已选 ${selectedBases.length} 个`}
        </span>
        {selectedBases.length > 0 && (
          <button
            onClick={() => onSelectionChange([])}
            className="text-[11px] text-blue-600 hover:text-blue-700"
          >
            清空
          </button>
        )}
      </div>
    </div>
  );
}


export default function SmartQAPage() {
  // 状态管理
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [historyCollapsed, setHistoryCollapsed] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<string | null>(null);
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [selectedKnowledgeBases, setSelectedKnowledgeBases] = useState<string[]>([]);

  // 新增：深度思考模式
  const [thinkingMode, setThinkingMode] = useState<'normal' | 'deep'>('normal');
  // 新增：检索来源（联网/本地）
  const [searchSource, setSearchSource] = useState<'local' | 'internet' | 'hybrid'>('local');
  // 新增：上传的文件列表
  const [uploadedFiles, setUploadedFiles] = useState<{id: string; name: string; size: string}[]>([]);
  // 文件上传input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 新增：检索状态
  const [searchStatus, setSearchStatus] = useState<{
    isSearching: boolean;
    currentStep: string;
    searchedCount: number;
    matchedCount: number;
  }>({ isSearching: false, currentStep: '', searchedCount: 0, matchedCount: 0 });

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
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    const questionText = inputValue;
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setThinkingSteps([]);
    setShowThinkingSteps(thinkingMode === 'deep');

    // 模拟 AI 思考
    const thinkingMessage: Message = {
      id: `msg-thinking-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isThinking: true,
    };
    setMessages(prev => [...prev, thinkingMessage]);

    // 1. 模拟检索过程
    setSearchStatus({ isSearching: true, currentStep: '正在连接知识库...', searchedCount: 0, matchedCount: 0 });
    await new Promise(resolve => setTimeout(resolve, 400));

    const knowledgeBaseNames = ['企业产品库', '部门技术库', '历史项目库', '竞品分析库'];
    for (let i = 0; i < knowledgeBaseNames.length; i++) {
      setSearchStatus({
        isSearching: true,
        currentStep: `正在检索「${knowledgeBaseNames[i]}」...`,
        searchedCount: i + 1,
        matchedCount: Math.floor(Math.random() * 5) + (i + 1) * 2,
      });
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setSearchStatus(prev => ({
      ...prev,
      currentStep: '检索完成，正在分析结果...',
    }));
    await new Promise(resolve => setTimeout(resolve, 300));

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

    setMessages(prev => prev.filter(m => !m.isThinking).concat(aiMessage));

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
      // 当前已是智能问答页面，不做处理
      return;
    }
    // 其他助手页面显示"暂未制作"提示
    toast.info(`${itemName} 暂未制作`, {
      description: '该功能模块正在设计中，敬请期待',
    });
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


  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen w-screen overflow-hidden bg-[#f5f7fa]">
        <Toaster position="top-center" richColors />

        {/* 左侧导航栏 */}
        <aside className={cn(
          "bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-300",
          sidebarCollapsed ? "w-16" : "w-[240px]"
        )}>
          {/* Logo & 系统名称 */}
          <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100">
            {!sidebarCollapsed && (
              <span className="font-semibold text-gray-800 text-sm truncate">售前方案协作智能平台</span>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded hover:bg-gray-100 text-gray-500 flex-shrink-0"
            >
              {sidebarCollapsed ? <PanelLeft className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>

          {/* 菜单 - 分类展示 */}
          <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
            {menuCategories.map((category, categoryIndex) => (
              <div key={category.id} className={cn(categoryIndex > 0 && "mt-4")}>
                {/* 分类标题 - 仅在展开时显示 */}
                {!sidebarCollapsed && (
                  <div className="px-4 py-2">
                    <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                      {category.label}
                    </span>
                  </div>
                )}
                {/* 分隔线 - 仅在折叠时显示 */}
                {sidebarCollapsed && categoryIndex > 0 && (
                  <div className="mx-3 my-2 border-t border-gray-100" />
                )}
                {/* 菜单项 */}
                <div className="space-y-0.5 px-2">
                  {category.items.map((item) => (
                    <Tooltip key={item.id} delayDuration={sidebarCollapsed ? 100 : 1000}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleMenuItemClick(item.id, item.name)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                            item.active
                              ? "bg-blue-50 text-blue-600 font-medium"
                              : "text-gray-600 hover:bg-gray-50"
                          )}
                        >
                          <item.icon className={cn("h-[18px] w-[18px] flex-shrink-0", item.active && "text-blue-600")} />
                          {!sidebarCollapsed && (
                            <span className="flex-1 text-left truncate">{item.name}</span>
                          )}
                        </button>
                      </TooltipTrigger>
                      {sidebarCollapsed && (
                        <TooltipContent side="right">{item.name}</TooltipContent>
                      )}
                    </Tooltip>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 底部留白 */}
          <div className="h-4" />
        </aside>


        {/* 中间历史记录面板 - 可收起 */}
        <div
          className={cn(
            "bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-300 ease-in-out overflow-hidden",
            historyCollapsed ? "w-0 opacity-0" : "w-[260px] opacity-100"
          )}
        >
          {/* 标题栏 */}
          <div className="flex items-center gap-2 px-3 h-14 border-b border-gray-100 min-w-[260px]">
            <MessageSquare className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 flex-1">历史记录</span>
            <button
              onClick={() => {
                setMessages([]);
                setSelectedHistory(null);
                toast.success('已创建新对话');
              }}
              className="p-1.5 rounded hover:bg-blue-50 text-blue-500 hover:text-blue-600 transition-colors"
              title="新建对话"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              onClick={() => setHistoryCollapsed(true)}
              className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>

          {/* 搜索框 */}
          <div className="px-3 py-3 min-w-[260px]">
            <div className="relative">
              <Input
                placeholder="输入搜索关键词"
                className="h-9 pl-3 pr-3 text-sm bg-gray-50 border-gray-200 rounded-lg"
                value={historySearchTerm}
                onChange={(e) => setHistorySearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* 历史列表 */}
          <div className="flex-1 overflow-y-auto custom-scrollbar min-w-[260px]">
            {groupedHistory.map((group) => (
              <div key={group.date} className="mb-2">
                <div className="px-4 py-2 text-xs text-gray-400 font-medium">{group.date}</div>
                <div className="space-y-0.5">
                  {group.items
                    .filter(item => !historySearchTerm || item.title.includes(historySearchTerm))
                    .map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedHistory(item.id)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors",
                        selectedHistory === item.id && "bg-gray-50"
                      )}
                    >
                      <MessageSquare className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate text-left">{item.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* 主内容区 */}
        <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
          {/* 顶部导航栏 - 右上角区域 */}
          <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 flex-shrink-0 relative z-30">
            {/* 左侧 - 历史记录按钮（收起时显示） */}
            <div className="flex items-center gap-2">
              {historyCollapsed && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setHistoryCollapsed(false)}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                    >
                      <MessageSquare className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">展开历史记录</TooltipContent>
                </Tooltip>
              )}
              <button
                onClick={() => {
                  setMessages([]);
                  setSelectedHistory(null);
                  toast.success('已创建新对话');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-blue-50 text-blue-600 text-sm font-medium transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>新对话</span>
              </button>
            </div>

            {/* 右侧 - 用户区域 */}
            <div className="flex items-center gap-2">
              {/* 帮助文档按钮 */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => toast.info('帮助文档', { description: '帮助中心正在建设中，敬请期待' })}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                  >
                    <HelpCircle className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>帮助文档</TooltipContent>
              </Tooltip>

              {/* 通知消息按钮 */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors relative">
                    <Bell className="h-5 w-5" />
                    {/* 未读消息红点 */}
                    {mockNotifications.some(n => !n.read) && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">通知消息</span>
                      <Badge variant="secondary" className="text-xs">
                        {mockNotifications.filter(n => !n.read).length} 条未读
                      </Badge>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {mockNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors",
                          !notification.read && "bg-blue-50/30"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                            notification.type === 'document' && "bg-blue-100 text-blue-600",
                            notification.type === 'task' && "bg-orange-100 text-orange-600",
                            notification.type === 'info' && "bg-green-100 text-green-600",
                            notification.type === 'system' && "bg-gray-100 text-gray-600"
                          )}>
                            {notification.type === 'document' && <FileText className="h-4 w-4" />}
                            {notification.type === 'task' && <CheckCircle className="h-4 w-4" />}
                            {notification.type === 'info' && <Bell className="h-4 w-4" />}
                            {notification.type === 'system' && <Settings className="h-4 w-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "text-sm truncate",
                                !notification.read ? "font-medium text-gray-800" : "text-gray-600"
                              )}>
                                {notification.title}
                              </span>
                              {!notification.read && (
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{notification.content}</p>
                            <span className="text-xs text-gray-400 mt-1 block">{notification.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                    <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                      查看全部通知
                    </button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* 分隔线 */}
              <div className="w-px h-6 bg-gray-200 mx-1" />

              {/* 用户信息 */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatar.png" />
                      <AvatarFallback className="bg-orange-100 text-orange-600 text-xs">演</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-700 font-medium">演示账号</span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2" align="end">
                  <div className="px-3 py-2 border-b border-gray-100 mb-2">
                    <div className="font-medium text-gray-800">演示账号</div>
                    <div className="text-xs text-gray-500">demo@example.com</div>
                  </div>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <User className="h-4 w-4" />
                    <span>个人设置</span>
                  </button>
                  <button
                    onClick={() => toast.info('已退出登录', { description: '演示功能，实际不执行退出操作' })}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>退出登录</span>
                  </button>
                </PopoverContent>
              </Popover>
            </div>
          </header>

          {/* 背景装饰 */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <svg className="absolute bottom-0 right-0 w-[600px] h-[400px] opacity-30" viewBox="0 0 600 400" fill="none">
              <path d="M0 300 Q150 250 300 280 T600 250 L600 400 L0 400 Z" fill="url(#wave1)" />
              <path d="M0 320 Q150 280 300 300 T600 280 L600 400 L0 400 Z" fill="url(#wave2)" />
              <defs>
                <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#e0f2fe" />
                  <stop offset="100%" stopColor="#ddd6fe" />
                </linearGradient>
                <linearGradient id="wave2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.5" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* 对话区域 */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto custom-scrollbar relative z-10"
          >
            <div className="max-w-3xl mx-auto py-12 px-6">
              {messages.length === 0 ? (
                // 空状态 - 欢迎界面
                <div className="flex flex-col items-center pt-16">
                  {/* 欢迎语 */}
                  <h1 className="text-xl font-semibold text-gray-800 mb-8">
                    你好，我是盛视科技通用<span className="text-blue-600">智能问答助手</span>，你可以向我提问...
                  </h1>

                  {/* 输入框 */}
                  <div className="w-full max-w-2xl mb-8">
                    {/* 隐藏的文件上传input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      multiple
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.jpg,.jpeg,.png"
                    />

                    <div className="relative bg-white rounded-xl border border-gray-200 shadow-sm">
                      {/* 已上传文件展示区域 */}
                      {uploadedFiles.length > 0 && (
                        <div className="px-4 pt-3 pb-2 border-b border-gray-100">
                          <div className="flex flex-wrap gap-2">
                            {uploadedFiles.map(file => (
                              <div
                                key={file.id}
                                className="flex items-center gap-2 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600"
                              >
                                <File className="h-3.5 w-3.5 text-gray-400" />
                                <span className="max-w-[120px] truncate">{file.name}</span>
                                <span className="text-gray-400">{file.size}</span>
                                <button
                                  onClick={() => handleRemoveFile(file.id)}
                                  className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                                >
                                  <X className="h-3 w-3 text-gray-400" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder="请输入内容"
                        className="h-24 px-4 pt-4 pb-12 text-sm border-0 focus-visible:ring-0 resize-none bg-transparent"
                        disabled={isLoading}
                      />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {/* 深度思考模式切换 */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => setThinkingMode(thinkingMode === 'normal' ? 'deep' : 'normal')}
                                className={cn(
                                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors text-sm",
                                  thinkingMode === 'deep'
                                    ? "bg-purple-100 text-purple-600"
                                    : "hover:bg-gray-100 text-gray-500"
                                )}
                              >
                                {thinkingMode === 'deep' ? (
                                  <Brain className="h-4 w-4" />
                                ) : (
                                  <Zap className="h-4 w-4" />
                                )}
                                <span>{thinkingMode === 'deep' ? '深度思考' : '快速回答'}</span>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {thinkingMode === 'deep' ? '切换为快速回答模式' : '切换为深度思考模式'}
                            </TooltipContent>
                          </Tooltip>

                          {/* 联网/本地检索切换 */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => {
                                  const nextSource = searchSource === 'local' ? 'internet' : searchSource === 'internet' ? 'hybrid' : 'local';
                                  setSearchSource(nextSource);
                                  const labels = { local: '仅本地知识库', internet: '仅联网检索', hybrid: '本地+联网' };
                                  toast.success(`已切换为 ${labels[nextSource]}`);
                                }}
                                className={cn(
                                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors text-sm",
                                  searchSource === 'internet'
                                    ? "bg-green-100 text-green-600"
                                    : searchSource === 'hybrid'
                                    ? "bg-blue-100 text-blue-600"
                                    : "hover:bg-gray-100 text-gray-500"
                                )}
                              >
                                {searchSource === 'internet' ? (
                                  <Globe className="h-4 w-4" />
                                ) : searchSource === 'hybrid' ? (
                                  <>
                                    <Globe className="h-4 w-4" />
                                    <span className="text-xs">+</span>
                                    <HardDrive className="h-3.5 w-3.5" />
                                  </>
                                ) : (
                                  <HardDrive className="h-4 w-4" />
                                )}
                                {searchSource !== 'hybrid' && (
                                  <span>{searchSource === 'internet' ? '联网' : '本地'}</span>
                                )}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {searchSource === 'local' && '点击切换为联网检索'}
                              {searchSource === 'internet' && '点击切换为本地+联网'}
                              {searchSource === 'hybrid' && '点击切换为仅本地知识库'}
                            </TooltipContent>
                          </Tooltip>

                          {/* 知识库选择器 */}
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors text-sm">
                                <BookOpen className="h-4 w-4" />
                                <span>知识库</span>
                                {selectedKnowledgeBases.length > 0 && (
                                  <Badge variant="secondary" className="h-5 px-1.5 text-xs bg-blue-100 text-blue-600">
                                    {selectedKnowledgeBases.length}
                                  </Badge>
                                )}
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 w-auto" align="start">
                              <KnowledgeBaseSelector
                                selectedBases={selectedKnowledgeBases}
                                onSelectionChange={setSelectedKnowledgeBases}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* 附件上传按钮 */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => fileInputRef.current?.click()}
                                className={cn(
                                  "p-2 rounded-lg transition-colors",
                                  uploadedFiles.length > 0
                                    ? "bg-blue-100 text-blue-600"
                                    : "hover:bg-gray-100 text-gray-400"
                                )}
                              >
                                <Paperclip className="h-5 w-5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>上传附件（支持PDF、Word、Excel、图片等）</TooltipContent>
                          </Tooltip>
                          <button
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim() || isLoading}
                            className={cn(
                              "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
                              inputValue.trim()
                                ? "bg-blue-500 text-white hover:bg-blue-600"
                                : "bg-blue-100 text-blue-300"
                            )}
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 推荐问题 */}
                  <div className="w-full max-w-2xl">
                    <div className="text-sm text-gray-500 mb-4">你可以这样问</div>
                    <div className="space-y-3">
                      {suggestedQuestions.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestedQuestion(question)}
                          className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 bg-white/80 hover:bg-white hover:border-gray-300 hover:shadow-sm transition-all text-sm text-gray-600"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // 消息列表
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3 w-full",
                        message.role === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      {/* AI头像 - 仅AI消息显示 */}
                      {message.role === 'assistant' && (
                        <Avatar className="h-9 w-9 flex-shrink-0">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-medium">
                            <Sparkles className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}

                      {/* 消息内容 */}
                      <div className={cn(
                        message.role === 'user' ? "max-w-[75%]" : "max-w-[85%] flex-1"
                      )}>
                        {message.isThinking ? (
                          // 思考中状态 - 增强版
                          <div className="space-y-3">
                            <div className="bg-white px-5 py-4 rounded-2xl rounded-tl-sm border border-gray-200 shadow-sm">
                              {/* 检索状态 */}
                              {searchStatus.isSearching && (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-3">
                                    <div className="relative">
                                      <Database className="h-5 w-5 text-blue-500" />
                                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="text-sm font-medium text-gray-700">{searchStatus.currentStep}</div>
                                      <div className="text-xs text-gray-400 mt-0.5">
                                        已检索 {searchStatus.searchedCount} 个知识库 · 找到 {searchStatus.matchedCount} 条相关内容
                                      </div>
                                    </div>
                                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                  </div>

                                  {/* 检索进度条 */}
                                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
                                      style={{ width: `${(searchStatus.searchedCount / 4) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              )}

                              {/* 深度思考步骤 */}
                              {showThinkingSteps && thinkingSteps.length > 0 && (
                                <div className={cn("space-y-2", searchStatus.isSearching && "mt-4 pt-4 border-t border-gray-100")}>
                                  <div className="flex items-center gap-2 text-xs font-medium text-purple-600">
                                    <Brain className="h-4 w-4" />
                                    <span>深度思考中...</span>
                                  </div>
                                  <div className="space-y-1.5 pl-6">
                                    {thinkingSteps.map((step, idx) => (
                                      <div
                                        key={idx}
                                        className={cn(
                                          "flex items-center gap-2 text-xs transition-all duration-300",
                                          idx === thinkingSteps.length - 1
                                            ? "text-gray-700"
                                            : "text-gray-400"
                                        )}
                                      >
                                        {idx === thinkingSteps.length - 1 ? (
                                          <Loader2 className="h-3 w-3 animate-spin text-purple-500" />
                                        ) : (
                                          <Check className="h-3 w-3 text-green-500" />
                                        )}
                                        <span>{step}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* 默认思考状态 */}
                              {!searchStatus.isSearching && thinkingSteps.length === 0 && (
                                <div className="flex items-center gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                  <span className="text-sm text-gray-500">思考中...</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : message.role === 'user' ? (
                          // 用户消息 - 右对齐
                          <div className="flex justify-end">
                            <div className="bg-blue-500 text-white px-4 py-3 rounded-2xl rounded-tr-sm">
                              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                {message.content}
                              </p>
                            </div>
                          </div>
                        ) : (
                          // AI 回复
                          <div className="space-y-3">
                            <div className="bg-white px-5 py-4 rounded-2xl rounded-tl-sm border border-gray-200 shadow-sm">
                              {/* 回复内容 - 支持流式输出 */}
                              <div
                                className="text-sm text-gray-700 leading-relaxed prose-content"
                                dangerouslySetInnerHTML={{
                                  __html: renderMarkdown(
                                    streamingMessageId === message.id
                                      ? displayedContent
                                      : message.content
                                  )
                                }}
                              />
                              {/* 流式输出光标 */}
                              {streamingMessageId === message.id && (
                                <span className="inline-block w-2 h-4 bg-blue-500 ml-0.5 animate-pulse" />
                              )}

                              {/* 操作按钮 */}
                              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs text-gray-500 hover:text-gray-700"
                                  onClick={() => handleCopyMessage(message.content, message.id)}
                                >
                                  {copiedId === message.id ? (
                                    <Check className="h-3.5 w-3.5 mr-1 text-green-500" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5 mr-1" />
                                  )}
                                  {copiedId === message.id ? '已复制' : '复制'}
                                </Button>
                                {message.thinkingDuration && (
                                  <span className="text-xs text-gray-400 ml-auto">
                                    思考用时 {message.thinkingDuration}s
                                  </span>
                                )}
                              </div>
                            </div>


                            {/* 引用来源 - 支持点击预览 */}
                            {message.citations && message.citations.length > 0 && !streamingMessageId && (
                              <div className="space-y-2">
                                <div className="text-xs font-medium text-gray-500 flex items-center gap-1.5 px-1">
                                  <BookOpen className="h-3.5 w-3.5" />
                                  <span>引用来源</span>
                                  <span className="text-gray-400">({message.citations.length})</span>
                                </div>
                                <div className="space-y-2">
                                  {message.citations.map((citation) => (
                                    <Card
                                      key={citation.id}
                                      className="bg-gray-50 border-gray-200 overflow-hidden cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all"
                                      onClick={() => handlePreviewCitation(citation)}
                                    >
                                      <CardContent className="p-3">
                                        <div className="flex items-start gap-3">
                                          <div className="flex-1 min-w-0 overflow-hidden">
                                            <div className="flex items-center gap-2">
                                              <div className="text-sm font-medium text-gray-700 truncate">
                                                {citation.title}
                                              </div>
                                              {/* 知识库类型标签 */}
                                              <Badge variant="outline" className={cn(
                                                "text-xs px-1.5 py-0 h-5 flex-shrink-0",
                                                citation.source.includes('产品') || citation.source.includes('政策')
                                                  ? "border-blue-200 text-blue-600 bg-blue-50"
                                                  : citation.source.includes('华南') || citation.source.includes('技术')
                                                  ? "border-green-200 text-green-600 bg-green-50"
                                                  : "border-orange-200 text-orange-600 bg-orange-50"
                                              )}>
                                                {citation.source.includes('产品') || citation.source.includes('政策')
                                                  ? '企业库'
                                                  : citation.source.includes('华南') || citation.source.includes('技术')
                                                  ? '部门库'
                                                  : '个人库'}
                                              </Badge>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                              {citation.source}
                                              {citation.pageNumber && ` · 第 ${citation.pageNumber} 页`}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                                              {citation.snippet}
                                            </p>
                                          </div>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 flex-shrink-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handlePreviewCitation(citation);
                                                }}
                                              >
                                                <Eye className="h-3.5 w-3.5" />
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>查看详情</TooltipContent>
                                          </Tooltip>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            )}


                            {/* 助手跳转建议 - 增强交互 */}
                            {message.assistantSuggestions && message.assistantSuggestions.length > 0 && !streamingMessageId && (
                              <div className="space-y-2">
                                <div className="text-xs font-medium text-gray-500 flex items-center gap-1.5 px-1">
                                  <Sparkles className="h-3.5 w-3.5" />
                                  <span>推荐使用</span>
                                </div>
                                <div className="space-y-2">
                                  {message.assistantSuggestions.map((suggestion) => (
                                    <Card
                                      key={suggestion.assistant.id}
                                      className={cn(
                                        "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/60 overflow-hidden transition-all",
                                        jumpingAssistant === suggestion.assistant.id
                                          ? "scale-[1.02] shadow-lg border-blue-400"
                                          : "hover:shadow-md"
                                      )}
                                    >
                                      <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                          <div className={cn(
                                            "w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600 flex-shrink-0 transition-all",
                                            jumpingAssistant === suggestion.assistant.id && "animate-pulse"
                                          )}>
                                            {assistantIcons[suggestion.assistant.icon]}
                                          </div>
                                          <div className="flex-1 min-w-0 overflow-hidden">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <span className="font-medium text-gray-800">
                                                {suggestion.assistant.name}
                                              </span>
                                              <Badge className="bg-blue-100 text-blue-700 text-xs hover:bg-blue-100">
                                                匹配度 {Math.round(suggestion.confidence * 100)}%
                                              </Badge>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 truncate">
                                              {suggestion.reason}
                                            </p>
                                          </div>
                                          {/* 一键跳转按钮 */}
                                          <Button
                                            size="sm"
                                            className={cn(
                                              "h-8 px-3 gap-1.5 transition-all",
                                              jumpingAssistant === suggestion.assistant.id
                                                ? "bg-blue-600"
                                                : "bg-blue-500 hover:bg-blue-600"
                                            )}
                                            onClick={() => handleGoToAssistant(suggestion.assistant.id)}
                                            disabled={jumpingAssistant !== null}
                                          >
                                            {jumpingAssistant === suggestion.assistant.id ? (
                                              <>
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                <span className="text-xs">跳转中</span>
                                              </>
                                            ) : (
                                              <>
                                                <span className="text-xs">立即使用</span>
                                                <ArrowRight className="h-3.5 w-3.5" />
                                              </>
                                            )}
                                          </Button>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>


          {/* 底部输入框 - 仅在有消息时显示 */}
          {messages.length > 0 && (
            <div className="flex-shrink-0 border-t border-gray-200 bg-white/80 backdrop-blur-sm p-4 relative z-10">
              <div className="max-w-3xl mx-auto">
                <div className="relative bg-white rounded-xl border border-gray-200 shadow-sm">
                  {/* 已上传文件展示区域 */}
                  {uploadedFiles.length > 0 && (
                    <div className="px-4 pt-3 pb-2 border-b border-gray-100">
                      <div className="flex flex-wrap gap-2">
                        {uploadedFiles.map(file => (
                          <div
                            key={file.id}
                            className="flex items-center gap-2 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600"
                          >
                            <File className="h-3.5 w-3.5 text-gray-400" />
                            <span className="max-w-[120px] truncate">{file.name}</span>
                            <span className="text-gray-400">{file.size}</span>
                            <button
                              onClick={() => handleRemoveFile(file.id)}
                              className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                            >
                              <X className="h-3 w-3 text-gray-400" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 px-3 py-2">
                    {/* 左侧功能按钮 */}
                    <div className="flex items-center gap-1">
                      {/* 深度思考模式 */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setThinkingMode(thinkingMode === 'normal' ? 'deep' : 'normal')}
                            className={cn(
                              "p-2 rounded-lg transition-colors",
                              thinkingMode === 'deep'
                                ? "bg-purple-100 text-purple-600"
                                : "hover:bg-gray-100 text-gray-400"
                            )}
                          >
                            {thinkingMode === 'deep' ? (
                              <Brain className="h-5 w-5" />
                            ) : (
                              <Zap className="h-5 w-5" />
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {thinkingMode === 'deep' ? '深度思考模式（点击切换）' : '快速回答模式（点击切换）'}
                        </TooltipContent>
                      </Tooltip>

                      {/* 联网/本地检索 */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => {
                              const nextSource = searchSource === 'local' ? 'internet' : searchSource === 'internet' ? 'hybrid' : 'local';
                              setSearchSource(nextSource);
                              const labels = { local: '仅本地知识库', internet: '仅联网检索', hybrid: '本地+联网' };
                              toast.success(`已切换为 ${labels[nextSource]}`);
                            }}
                            className={cn(
                              "p-2 rounded-lg transition-colors",
                              searchSource === 'internet'
                                ? "bg-green-100 text-green-600"
                                : searchSource === 'hybrid'
                                ? "bg-blue-100 text-blue-600"
                                : "hover:bg-gray-100 text-gray-400"
                            )}
                          >
                            {searchSource === 'internet' ? (
                              <Globe className="h-5 w-5" />
                            ) : searchSource === 'hybrid' ? (
                              <Globe className="h-5 w-5" />
                            ) : (
                              <HardDrive className="h-5 w-5" />
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {searchSource === 'local' && '本地知识库（点击切换联网）'}
                          {searchSource === 'internet' && '联网检索（点击切换混合）'}
                          {searchSource === 'hybrid' && '本地+联网（点击切换本地）'}
                        </TooltipContent>
                      </Tooltip>

                      {/* 知识库选择器 */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors relative">
                            <BookOpen className="h-5 w-5" />
                            {selectedKnowledgeBases.length > 0 && (
                              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                                {selectedKnowledgeBases.length}
                              </span>
                            )}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-auto" align="start">
                          <KnowledgeBaseSelector
                            selectedBases={selectedKnowledgeBases}
                            onSelectionChange={setSelectedKnowledgeBases}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* 输入框 */}
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="请输入内容"
                      className="flex-1 h-10 px-3 text-sm border-0 focus-visible:ring-0 bg-transparent"
                      disabled={isLoading}
                    />

                    {/* 右侧按钮 */}
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className={cn(
                              "p-2 rounded-lg transition-colors",
                              uploadedFiles.length > 0
                                ? "bg-blue-100 text-blue-600"
                                : "hover:bg-gray-100 text-gray-400"
                            )}
                          >
                            <Paperclip className="h-5 w-5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>上传附件</TooltipContent>
                      </Tooltip>
                      <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isLoading}
                        className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
                          inputValue.trim()
                            ? "bg-blue-500 text-white hover:bg-blue-600"
                            : "bg-blue-100 text-blue-300"
                        )}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* 引用预览弹窗 */}
        <Dialog open={!!previewCitation} onOpenChange={() => setPreviewCitation(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-blue-600" />
                {previewCitation?.title}
              </DialogTitle>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <span>{previewCitation?.source}</span>
                {previewCitation?.pageNumber && (
                  <>
                    <span>·</span>
                    <span>第 {previewCitation?.pageNumber} 页</span>
                  </>
                )}
              </div>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto py-4">
              <div
                className="prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{
                  __html: previewCitation?.content
                    ? renderMarkdown(previewCitation.content)
                    : ''
                }}
              />
            </div>
            <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t border-gray-100">
              <Button variant="outline" size="sm" onClick={() => setPreviewCitation(null)}>
                关闭
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Copy className="h-4 w-4" />
                  复制内容
                </Button>
                <Button size="sm" className="gap-1.5 bg-blue-500 hover:bg-blue-600">
                  <ExternalLink className="h-4 w-4" />
                  打开原文
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
