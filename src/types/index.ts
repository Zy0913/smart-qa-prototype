// 思考模式
export type ThinkingMode = 'normal' | 'deep';

// 检索来源
export type SearchSource = 'internet' | 'local' | 'hybrid';

// 知识库范围
export type KnowledgeScope = 'all' | 'specific';

// 知识库类型
export type KnowledgeBaseType = 'personal' | 'department' | 'enterprise';

// 知识库
export interface KnowledgeBase {
  id: string;
  name: string;
  type: KnowledgeBaseType;
  documentCount: number;
  lastUpdated: string;
  isFavorite?: boolean;
}

// 检索配置
export interface SearchConfig {
  thinkingMode: ThinkingMode;
  searchSource: SearchSource;
  knowledgeScope: KnowledgeScope;
  selectedBases: string[];
}

// 引用来源
export interface Citation {
  id: string;
  title: string;
  source: string;
  snippet: string;
  pageNumber?: number;
  excerpt?: string;
}

// 助手类型
export interface Assistant {
  id: string;
  name: string;
  icon: string;
  description: string;
}

// 助手跳转建议
export interface AssistantSuggestion {
  assistant: Assistant;
  confidence: number;
  reason: string;
}

// 消息
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  searchConfig?: SearchConfig;
  citations?: Citation[];
  assistantSuggestions?: AssistantSuggestion[];
  isThinking?: boolean;
  thinkingDuration?: number;
}

// 对话
export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

// 推荐提问
export interface SuggestedQuestion {
  id: string;
  text: string;
  category: string;
}

// ----------------------
// 智策汇知识库相关类型
// ----------------------

export type KBTab = 'personal' | 'department' | 'enterprise' | 'shared';

export interface KBMember {
  id: string;
  name: string;
  avatar?: string;
  department?: string;
  role: 'admin' | 'editor' | 'viewer';
}

export type KBType = 'folder' | 'word' | 'ppt' | 'excel' | 'pdf' | 'image' | 'cad' | 'other';

export interface KBFile {
  id: string;
  name: string;
  type: KBType; // 'folder' 也是一种类型
  size?: string; // 文件夹可能没有大小
  updatedAt: string;
  views: number;
  downloads: number;
  tags?: string[];
  description?: string;
  children?: KBFile[]; // 文件夹的子内容
  isLocked?: boolean;
  parentId?: string;
  content?: string;
}

// 特殊库的数据项接口
export interface BrandSelectionItem {
  id: string;
  name: string;
  image: string;
  model: string;
  price: string;
  cost: string;
  status: 'active' | 'discontinued' | 'not-recommended';
}

export interface ProductQuoteItem {
  id: string;
  materialNo: string;
  name: string;
  region: string;
  price: string;
  quoteTime: string;
}

export interface RndQuoteItem {
  id: string;
  functionName: string;
  systemName: string;
  unitPrice: string;
  manMonth: number;
  totalPrice: string;
  quoteTime: string;
}

export interface DetailedKnowledgeBase extends KnowledgeBase {
  description: string;
  parsedCount: number;
  unparsedCount: number;
  members: KBMember[];
  badge?: 'system' | 'custom'; // 系统库 or 自定义库
  isLocked?: boolean; // 涉密政策库上锁
  viewType?: 'list' | 'brand-card' | 'quote-table'; // 库内视图类型
  files?: KBFile[]; // 普通库文件
  brandItems?: BrandSelectionItem[]; // 品牌库数据
  quoteItems?: {
    equipment: ProductQuoteItem[];
    rnd: RndQuoteItem[];
  }; // 报价库数据
  isShared?: boolean;
}

