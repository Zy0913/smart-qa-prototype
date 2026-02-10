export type SystemTagTaxonomy = Record<string, string[]>;

export const defaultSystemTagTaxonomy: SystemTagTaxonomy = {
    生命周期: ['项目启动', '项目规划', '项目执行', '监控与控制', '项目收尾'],
    文档类型: ['需求文档', '设计文档', '计划书', '汇报材料', '会议纪要', '合同协议'],
    优先级: ['P0-紧急', 'P1-高优', 'P2-普通'],
    所属部门: ['项目办', '产品部', '研发部', '测试部', '市场部'],
};

export const flattenSystemTags = (taxonomy: SystemTagTaxonomy): string[] => {
    return Array.from(new Set(Object.values(taxonomy).flat()));
};
