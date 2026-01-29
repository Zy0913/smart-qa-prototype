import { KnowledgeBase, Conversation, Assistant, SuggestedQuestion } from '@/types';

// Mock 知识库数据 - 三级结构：企业库、部门库、个人库
export const mockKnowledgeBases: KnowledgeBase[] = [
  // 企业库
  {
    id: 'kb-enterprise-1',
    name: '产品资料库',
    type: 'enterprise',
    documentCount: 1256,
    lastUpdated: '2026-01-12',
    isFavorite: true,
  },
  {
    id: 'kb-enterprise-2',
    name: '政策法规库',
    type: 'enterprise',
    documentCount: 892,
    lastUpdated: '2026-01-11',
  },
  {
    id: 'kb-enterprise-3',
    name: '品牌选型库',
    type: 'enterprise',
    documentCount: 567,
    lastUpdated: '2026-01-10',
  },
  {
    id: 'kb-enterprise-4',
    name: '历史项目合同库',
    type: 'enterprise',
    documentCount: 2341,
    lastUpdated: '2026-01-09',
  },
  {
    id: 'kb-enterprise-5',
    name: '方法论库',
    type: 'enterprise',
    documentCount: 156,
    lastUpdated: '2026-01-08',
  },
  // 部门库
  {
    id: 'kb-dept-1',
    name: '区域项目资料库',
    type: 'department',
    documentCount: 456,
    lastUpdated: '2026-01-12',
    isFavorite: true,
  },
  {
    id: 'kb-dept-2',
    name: '技术方案模板库',
    type: 'department',
    documentCount: 189,
    lastUpdated: '2026-01-11',
  },
  {
    id: 'kb-dept-3',
    name: '报价参考库',
    type: 'department',
    documentCount: 234,
    lastUpdated: '2026-01-10',
  },
  {
    id: 'kb-dept-4',
    name: '竞品分析库',
    type: 'department',
    documentCount: 78,
    lastUpdated: '2026-01-09',
  },
  // 个人库
  {
    id: 'kb-personal-1',
    name: '我的项目笔记',
    type: 'personal',
    documentCount: 45,
    lastUpdated: '2026-01-12',
    isFavorite: true,
  },
  {
    id: 'kb-personal-2',
    name: '客户沟通记录',
    type: 'personal',
    documentCount: 67,
    lastUpdated: '2026-01-10',
  },
  {
    id: 'kb-personal-3',
    name: '学习资料收藏',
    type: 'personal',
    documentCount: 23,
    lastUpdated: '2026-01-08',
  },
];


// Mock 助手数据 - 基于功能脑图定义
export const mockAssistants: Assistant[] = [
  {
    id: 'assistant-doc',
    name: '项目文档助手',
    icon: 'FileText',
    description: '项目文档生成、文档模板选择、篇章阅读、文档润色、多文档合稿',
  },
  {
    id: 'assistant-verify',
    name: '项目校验助手',
    icon: 'CheckCircle',
    description: '项目清单校验、内容一致性检查、清单查重比较、参数报价核对',
  },
  {
    id: 'assistant-material',
    name: '项目资料助手',
    icon: 'FolderOpen',
    description: '资料上传分类归档、智能分类规则、资料检索下载、档案范围选择',
  },
  {
    id: 'assistant-bid',
    name: '招投标助手',
    icon: 'Gavel',
    description: '招标文件解读、智能深化清单、智能询价报价、清单对照分析、标围图纸分析',
  },
];

// Mock 历史对话
export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    title: 'A区项目报价咨询',
    messages: [],
    createdAt: new Date('2026-01-12T10:30:00'),
    updatedAt: new Date('2026-01-12T11:45:00'),
  },
  {
    id: 'conv-2',
    title: 'B区检测站设备选型',
    messages: [],
    createdAt: new Date('2026-01-11T14:20:00'),
    updatedAt: new Date('2026-01-11T16:30:00'),
  },
];

// Mock 推荐问题
export const mockSuggestedQuestions: SuggestedQuestion[] = [
  {
    id: 'sq-1',
    text: 'XX项目的招标要求有哪些？',
    category: '招标解读',
  },
  {
    id: 'sq-2',
    text: '我们的核心产品和竞品有什么区别？',
    category: '竞品对比',
  },
  {
    id: 'sq-3',
    text: '帮我找一下去年类似项目的中标方案作为参考',
    category: '历史案例',
  },
];


// Mock AI 回复生成 - 演示用模拟数据
export const generateMockAIResponse = (question: string): {
  content: string;
  citations: { id: string; title: string; source: string; snippet: string; pageNumber?: number }[];
  assistantSuggestions?: { assistant: Assistant; confidence: number; reason: string }[];
} => {
  // 招标要求相关
  if (question.includes('招标要求') || question.includes('招标') || question.includes('项目')) {
    return {
      content: `根据知识库检索，为您整理**XX项目招标要点**：

### 项目基本信息
- **项目名称**：XX智能系统采购项目
- **预算金额**：500万元
- **投标截止**：2026年2月15日 14:30
- **开标地点**：XX市公共资源交易中心

### 核心技术要求
1. **设备子系统**
   - 扫描分辨率不低于 2mm×2mm
   - 支持高速处理模式
   - 具备 AI 自动识别功能（准确率 ≥95%）[2]

2. **验证通道**
   - 响应时间 ≤1秒
   - 支持多种证件类型识别
   - 日处理能力 ≥8000次/通道

3. **系统集成要求**
   - 需与现有平台对接
   - 数据存储满足安全等级要求

### 资质要求
- 投标人需具备相关资质证书 [1]
- 近3年内有2个以上同类项目业绩
- 本地化服务团队不少于5人

建议使用**招投标助手**进行招标文件解读，输出要点和风险点。`,
      citations: [
        {
          id: 'cite-1',
          title: 'XX项目采购招标文件.pdf',
          source: '政策法规库',
          snippet: '本项目采用公开招标方式，投标人须满足相关法规规定，具备独立法人资格...',
          pageNumber: 5,
        },
        {
          id: 'cite-2',
          title: 'XX项目技术需求说明书.docx',
          source: '区域项目资料库',
          snippet: '系统需支持多种场景应用，日均处理量预计较大，需确保系统稳定运行...',
          pageNumber: 12,
        },
      ],
      assistantSuggestions: [
        {
          assistant: mockAssistants[3],
          confidence: 0.95,
          reason: '可上传招标文件进行深度解读，AI检索知识库后输出要点和风险点，支持生成深化清单',
        },
      ],
    };
  }

  // 竞品对比相关
  if (question.includes('区别') || question.includes('对比') || question.includes('竞品') || question.includes('核心产品')) {
    return {
      content: `根据竞品分析库资料，为您对比**我方产品 vs 竞品产品**：

### 产品对比
| 对比项 | 我方产品 A100 | 竞品产品 B200 |
|-------|---------------|--------------|
| 识别速度 | **≤0.8秒** | ≤1.2秒 |
| 准确率 | **99.7%** | 99.2% |
| 支持类型 | 12种 | 8种 |
| 检测技术 | 3D结构光 | 2D红外 |
| 整机功耗 | 35W | 45W |
| 参考单价 | 1.8万/台 | 2.1万/台 |

### 核心优势分析

**我方优势：**
1. **处理速度更快** - 采用自研AI芯片，响应时间缩短30%
2. **功能支持更全** - 涵盖多种应用场景
3. **性价比更高** - 同等配置下价格低15%
4. **本地服务** - 本地区域2小时响应

**对方优势：**
1. 品牌知名度较高，部分客户有品牌偏好
2. 在某些特定领域有较多案例

### 投标建议
根据项目要求，我方产品在关键指标上具有明显优势，建议重点突出此技术亮点。

如需生成详细的对比分析，可使用**招投标助手**的清单对照功能。`,
      citations: [
        {
          id: 'cite-1',
          title: '2025年设备竞品分析报告.pdf',
          source: '竞品分析库',
          snippet: '本报告对国内主流厂商进行横向对比，涵盖多个品牌...',
          pageNumber: 23,
        },
        {
          id: 'cite-2',
          title: 'A100产品技术白皮书.pdf',
          source: '产品资料库',
          snippet: '采用自主研发的第三代AI识别引擎，在权威检测中心测试中各项指标均达到行业领先水平...',
          pageNumber: 8,
        },
        {
          id: 'cite-3',
          title: '竞品产品调研记录.docx',
          source: '竞品分析库',
          snippet: '通过参加行业展会和客户反馈收集的竞品信息，B200为其主推型号...',
          pageNumber: 3,
        },
      ],
      assistantSuggestions: [
        {
          assistant: mockAssistants[3],
          confidence: 0.88,
          reason: '可使用清单对照功能上传两份清单进行对比分析，AI自动输出比较结论',
        },
      ],
    };
  }

  // 历史案例/中标方案相关
  if (question.includes('去年') || question.includes('历史') || question.includes('中标方案') || question.includes('案例') || question.includes('参考') || question.includes('类似')) {
    return {
      content: `为您检索到**相关历史项目**资料：

### 某区域智能系统项目（2025年）
- **中标金额**：892万元
- **中标时间**：2025年6月
- **项目周期**：8个月（已验收）
- **项目负责人**：项目经理A

### 项目配置清单
| 设备类型 | 型号 | 数量 | 金额(万) |
|---------|------|------|---------|
| 扫描系统 | A-3000 | 4套 | 183.2 |
| 验证终端 | A-200 | 24台 | 43.2 |
| 识别设备 | A-150 | 16台 | 57.6 |
| 分析平台 | P-500 | 1套 | 120.0 |
| 集成实施费 | - | - | 89.2 |

### 技术方案亮点
1. 创新模式，效率提升40%
2. AI分析准确率达到98.7%，误报率仅0.3%
3. 与客户现有系统成功对接

### 可复用资料
- 《技术方案V3.2》（92页）
- 《项目实施组织方案》（45页）
- 《验收报告及客户评价》

是否需要我帮您下载这些资料？或使用**项目文档助手**基于此方案生成新的投标文档？`,
      citations: [
        {
          id: 'cite-1',
          title: '智能系统技术方案V3.2.docx',
          source: '区域项目资料库',
          snippet: '本方案采用"感知层-传输层-平台层-应用层"四层架构，实现系统的智能化、高效化...',
          pageNumber: 15,
        },
        {
          id: 'cite-2',
          title: '项目中标通知书.pdf',
          source: '历史项目合同库',
          snippet: '经评标委员会评审，确定中标人，中标金额892万元整...',
          pageNumber: 1,
        },
        {
          id: 'cite-3',
          title: '项目验收报告.pdf',
          source: '区域项目资料库',
          snippet: '经测试验证，系统各项功能指标均满足合同要求，客户对项目实施质量表示满意...',
          pageNumber: 8,
        },
      ],
      assistantSuggestions: [
        {
          assistant: mockAssistants[0],
          confidence: 0.92,
          reason: '可使用文档模板选择和篇章阅读功能，基于历史方案快速生成新的项目文档',
        },
        {
          assistant: mockAssistants[2],
          confidence: 0.85,
          reason: '可使用资料检索下载功能，输入资料描述后AI给出相关资料清单，支持直接下载',
        },
      ],
    };
  }

  // 配置清单/设备查询相关
  if (question.includes('配置清单') || question.includes('设备') || question.includes('系统') || question.includes('产品')) {
    return {
      content: `根据知识库检索，为您整理**智能系统标准配置清单**：

### 一、主设备子系统
| 设备名称 | 型号 | 数量 | 单价(万元) |
|---------|------|------|-----------|
| 扫描设备 | A-3000 | 2套 | 45.8 |
| 检查系统 | A-2000 | 1套 | 38.5 |
| 辅助系统 | A-500 | 1套 | 22.3 |

### 二、验证子系统
| 设备名称 | 型号 | 数量 | 单价(万元) |
|---------|------|------|-----------|
| 验证终端 | A-200 | 6台 | 1.8 |
| 识别设备 | A-150 | 8台 | 3.6 |
| 检测设备 | X-800 | 2台 | 28.6 |

### 三、智能分析平台
- 预警模块（含3年授权）
- 大数据分析引擎
- 可视化管理软件

**总预算参考**：约 280-350 万元（根据项目规模浮动）

如需生成正式报价单，建议使用**招投标助手**的智能询价功能。`,
      citations: [
        {
          id: 'cite-1',
          title: '智能系统产品手册 V3.2.pdf',
          source: '产品资料库',
          snippet: '智能系统采用模块化设计，可根据需求灵活配置，支持多种场景...',
          pageNumber: 8,
        },
        {
          id: 'cite-2',
          title: '2026年产品报价单（内部）.xlsx',
          source: '报价参考库',
          snippet: '本报价单适用于项目投标参考，有效期至2026年6月30日...',
          pageNumber: 3,
        },
      ],
      assistantSuggestions: [
        {
          assistant: mockAssistants[3],
          confidence: 0.88,
          reason: '可上传项目清单使用智能询价功能，AI检索报价库自动生成报价，支持在文档编辑器中修改',
        },
      ],
    };
  }

  // 技术参数/报价相关
  if (question.includes('技术参数') || question.includes('报价') || question.includes('价格')) {
    return {
      content: `为您查询产品报价信息，请问您想了解哪类产品的报价？

### 主要产品线报价概览
| 产品类别 | 代表型号 | 参考单价 |
|---------|---------|---------|
| 扫描系统 | A-3000 | 45.8-58.5万/套 |
| 验证终端 | A-200 | 1.8万/台 |
| 识别设备 | A-150 | 3.6万/台 |
| 检测设备 | X-800 | 28.6万/台 |
| 分析平台 | P-500 | 80-150万/套 |

**说明**：以上为2026年标准报价，实际成交价格根据项目规模、付款方式等因素浮动。

如需获取详细报价或生成正式报价单，建议使用**招投标助手**的智能询价功能。`,
      citations: [
        {
          id: 'cite-1',
          title: '2026年产品报价单（内部）.xlsx',
          source: '报价参考库',
          snippet: '本报价单包含全系列产品标准报价，适用于项目投标参考...',
          pageNumber: 1,
        },
      ],
      assistantSuggestions: [
        {
          assistant: mockAssistants[3],
          confidence: 0.90,
          reason: '可上传清单并输入项目总金额，AI检索报价库自动生成询价列，支持报价依据检索',
        },
      ],
    };
  }

  // 文档/方案相关
  if (question.includes('文档') || question.includes('方案') || question.includes('PPT') || question.includes('报告') || question.includes('模板')) {
    return {
      content: `我理解您需要进行文档相关的工作。建议您使用**项目文档助手**来高效完成。

### 可用功能
- **项目文档生成**：输入需求后AI检索知识库模板生成word文档，支持直接下载
- **文档模板选择**：提供常用项目标准文档模板，可预览后选择生成
- **篇章阅读**：选择常用段落/篇章后显示标准提示词，根据需要修改后提问
- **文档润色**：上传文档后选择段落填写要求，系统在文档编辑器中进行润色
- **多文档合稿**：上传多份word文档，AI根据内容进行合稿，实时查看编辑

### 常用模板
1. 《技术方案模板-通用版》
2. 《投标文件模板-政府采购》
3. 《项目汇报PPT-简洁版》

点击下方卡片即可开始使用。`,
      citations: [
        {
          id: 'cite-1',
          title: '技术方案撰写规范.pdf',
          source: '方法论库',
          snippet: '本规范涵盖技术方案的标准结构、章节要求和写作要点...',
          pageNumber: 1,
        },
      ],
      assistantSuggestions: [
        {
          assistant: mockAssistants[0],
          confidence: 0.94,
          reason: '支持文档生成、模板选择、篇章阅读、文档润色和多文档合稿功能',
        },
      ],
    };
  }

  // 校验/审核相关
  if (question.includes('校验') || question.includes('审核') || question.includes('查重') || question.includes('核对')) {
    return {
      content: `您可以使用**项目校验助手**来完成文档校验工作。

### 支持的校验类型
1. **项目清单校验**：上传Excel或Word文档，AI检索知识库标记有误内容，鼠标悬停显示修改建议
2. **内容一致性检查**：校验同一份项目清单的名称、参数、报价值是否一致
3. **清单查重比较**：上传两份项目清单进行查重比较，打开文档编辑器标记重复部分
4. **参数报价核对**：验证型号是否在售、价格是否最新，核对技术指标与产品库是否一致

点击下方卡片开始使用。`,
      citations: [],
      assistantSuggestions: [
        {
          assistant: mockAssistants[1],
          confidence: 0.96,
          reason: '支持清单校验、一致性检查、查重比较，AI标记问题并提供悬停提示和修改建议',
        },
      ],
    };
  }

  // 默认回复
  return {
    content: `感谢您的提问！我是售前方案智能协作平台的AI助手，可以帮您完成以下工作：

### 我能帮您做什么？
1. **项目信息查询**：招标公告解读、历史项目案例检索
2. **产品知识问答**：设备参数、配置方案、报价信息
3. **竞品分析**：与其他厂商产品的对比分析
4. **资料检索**：快速查找技术方案、合同、验收报告等

### 试试这样问我
- "XX项目的招标要求有哪些？"
- "我们的核心产品和竞品有什么区别？"
- "帮我找一下去年类似项目的中标方案"

请告诉我您具体想了解什么？`,
    citations: [
      {
        id: 'cite-1',
        title: '智能问答使用指南.pdf',
        source: '方法论库',
        snippet: '本指南介绍智能问答系统的功能和最佳使用方法...',
        pageNumber: 1,
      },
    ],
  };
};
