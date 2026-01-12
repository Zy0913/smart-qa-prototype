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
