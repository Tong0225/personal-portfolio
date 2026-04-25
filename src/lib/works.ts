// 作品类型定义
export type WorkType = 'video' | 'image' | 'pdf' | 'audio';

export interface Work {
  id: string;
  title: string;
  type: WorkType;
  category: string; // 格式：parentId:childId，如 "design:ui"
  subCategory?: string; // 二级分类名称
  tags: string[];
  description: string;
  source: string; // B站BV号 或 GitHub路径 或音频链接
  thumbnail: string;
  featured: boolean;
  createdAt: number;
}

// 分类类型
export interface Category {
  id: string;
  name: string;
  icon: string;
  children?: Category[];
}

// 预设分类（一级）- 只保留"全部"，其他由用户自定义
export const defaultCategories: Category[] = [
  { id: 'all', name: '全部', icon: '📁' },
];

// 获取所有叶子分类（用于选择）- 从自定义分类中获取
export function getAllLeafCategories(): Category[] {
  const leaves: Category[] = [];
  const custom = customCategoriesStorage.getAll();
  
  // 找出所有二级分类（id 中有两个冒号，如 "custom:xxx:yyy"）
  custom.forEach(cat => {
    const colonCount = (cat.id.match(/:/g) || []).length;
    if (colonCount >= 2) {
      leaves.push(cat);
    }
  });
  
  // 如果没有二级分类，返回一级分类
  if (leaves.length === 0) {
    custom.filter(c => {
      const colonCount = (c.id.match(/:/g) || []).length;
      return colonCount === 1;
    }).forEach(cat => {
      leaves.push(cat);
    });
  }
  
  return leaves;
}

// 获取分类路径（用于显示）
export function getCategoryPath(categoryId: string): string {
  if (categoryId === 'all') return '全部';
  
  const custom = customCategoriesStorage.getAll();
  
  // 如果是二级分类（有两个或更多冒号）
  const colonCount = (categoryId.match(/:/g) || []).length;
  if (colonCount >= 2) {
    const lastColonIndex = categoryId.lastIndexOf(':');
    const parentId = categoryId.substring(0, lastColonIndex);
    const parent = custom.find(c => c.id === parentId);
    const child = custom.find(c => c.id === categoryId);
    if (parent && child) {
      return `${parent.name} > ${child.name}`;
    }
  }
  
  // 如果是一级分类
  const cat = custom.find(c => c.id === categoryId);
  if (cat) {
    return cat.name;
  }
  
  return categoryId;
}

// 获取一级分类
export function getParentCategory(categoryId: string): Category | null {
  if (categoryId === 'all') return null;
  
  const custom = customCategoriesStorage.getAll();
  
  const colonCount = (categoryId.match(/:/g) || []).length;
  if (colonCount >= 2) {
    const lastColonIndex = categoryId.lastIndexOf(':');
    const parentId = categoryId.substring(0, lastColonIndex);
    return custom.find(c => c.id === parentId) || null;
  }
  
  return custom.find(c => c.id === categoryId) || null;
}

// 示例作品数据（空，由用户自己添加）
export const sampleWorks: Work[] = [];

// 生成分页ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// localStorage 键名
const WORKS_KEY = 'portfolio-works';
const PASSWORD_KEY = 'portfolio-password';
const PASSWORD_ENABLED_KEY = 'portfolio-password-enabled';
const CUSTOM_CATEGORIES_KEY = 'portfolio-custom-categories';

// 自定义分类存储
export const customCategoriesStorage = {
  // 获取所有自定义分类
  getAll: (): Category[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  },

  // 保存所有自定义分类
  saveAll: (categories: Category[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(categories));
  },

  // 添加自定义分类
  add: (category: Category) => {
    const categories = customCategoriesStorage.getAll();
    categories.push(category);
    customCategoriesStorage.saveAll(categories);
  },

  // 删除自定义分类
  delete: (id: string) => {
    const categories = customCategoriesStorage.getAll().filter(c => c.id !== id);
    customCategoriesStorage.saveAll(categories);
  },

  // 获取合并后的所有分类（默认"全部" + 自定义分类）
  getMergedCategories: (): Category[] => {
    const custom = customCategoriesStorage.getAll();
    
    // 构建分类树
    const result: Category[] = [{ id: 'all', name: '全部', icon: '📁' }];
    
    // 找出所有一级分类（id 中只有一个冒号，如 "custom:xxx"）
    const parentCategories = custom.filter(c => {
      const colonCount = (c.id.match(/:/g) || []).length;
      return colonCount === 1;
    });
    
    // 为每个一级分类添加其子分类
    parentCategories.forEach(parent => {
      // 子分类的 id 应该以父 id + ':' 开头
      const children = custom.filter(c => c.id.startsWith(parent.id + ':') && c.id !== parent.id);
      result.push({
        ...parent,
        children: children.length > 0 ? children : undefined
      });
    });
    
    // 找出独立的二级分类（没有对应的一级分类）
    const orphanChildren = custom.filter(c => {
      const colonCount = (c.id.match(/:/g) || []).length;
      if (colonCount < 2) return false; // 必须是二级或更深
      
      // 获取父 id（去掉最后一个冒号后面的部分）
      const lastColonIndex = c.id.lastIndexOf(':');
      const parentId = c.id.substring(0, lastColonIndex);
      
      return !parentCategories.some(p => p.id === parentId);
    });
    
    // 为孤立的二级分类创建一级分类
    const orphanParents = new Map<string, Category>();
    orphanChildren.forEach(child => {
      const lastColonIndex = child.id.lastIndexOf(':');
      const parentId = child.id.substring(0, lastColonIndex);
      
      if (!orphanParents.has(parentId)) {
        orphanParents.set(parentId, {
          id: parentId,
          name: parentId.includes(':') ? parentId.split(':').pop() || parentId : parentId,
          icon: '📁',
          children: []
        });
      }
      orphanParents.get(parentId)!.children!.push(child);
    });
    
    orphanParents.forEach(parent => {
      result.push(parent);
    });
    
    return result;
  },
  
  // 添加一级自定义分类
  addParent: (name: string, icon: string): Category => {
    const id = 'custom:' + generateId();
    const category: Category = { id, name, icon, children: [] };
    const categories = customCategoriesStorage.getAll();
    categories.push(category);
    customCategoriesStorage.saveAll(categories);
    return category;
  },
  
  // 添加二级自定义分类（属于某个一级分类）
  addChild: (parentId: string, name: string, icon: string): Category | null => {
    const category: Category = { id: `${parentId}:${generateId()}`, name, icon };
    const categories = customCategoriesStorage.getAll();
    categories.push(category);
    customCategoriesStorage.saveAll(categories);
    return category;
  },
  
  // 删除自定义分类（同时删除其子分类）
  deleteCategory: (id: string) => {
    const categories = customCategoriesStorage.getAll().filter(c => 
      c.id !== id && !c.id.startsWith(id + ':')
    );
    customCategoriesStorage.saveAll(categories);
  },
};

// 作品数据操作
export const worksStorage = {
  // 获取所有作品
  getAll: (): Work[] => {
    if (typeof window === 'undefined') return sampleWorks;
    const stored = localStorage.getItem(WORKS_KEY);
    if (!stored) {
      // 初始化示例数据
      worksStorage.saveAll(sampleWorks);
      return sampleWorks;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return sampleWorks;
    }
  },

  // 保存所有作品
  saveAll: (works: Work[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(WORKS_KEY, JSON.stringify(works));
  },

  // 添加作品
  add: (work: Omit<Work, 'id' | 'createdAt'>): Work => {
    const works = worksStorage.getAll();
    const newWork: Work = {
      ...work,
      id: generateId(),
      createdAt: Date.now(),
    };
    works.unshift(newWork);
    worksStorage.saveAll(works);
    return newWork;
  },

  // 更新作品
  update: (id: string, updates: Partial<Work>): Work | null => {
    const works = worksStorage.getAll();
    const index = works.findIndex(w => w.id === id);
    if (index === -1) return null;
    
    works[index] = { ...works[index], ...updates };
    worksStorage.saveAll(works);
    return works[index];
  },

  // 删除作品
  delete: (id: string): boolean => {
    const works = worksStorage.getAll();
    const filtered = works.filter(w => w.id !== id);
    if (filtered.length === works.length) return false;
    
    worksStorage.saveAll(filtered);
    return true;
  },

  // 按分类筛选（支持一级和二级）
  filterByCategory: (category: string): Work[] => {
    const works = worksStorage.getAll();
    if (category === 'all') return works;
    
    const colonCount = (category.match(/:/g) || []).length;
    
    // 二级分类（2个冒号）：精确匹配
    if (colonCount >= 2) {
      return works.filter(w => w.category === category);
    }
    
    // 一级分类（1个冒号）：匹配该分类及其所有子分类
    if (colonCount === 1) {
      return works.filter(w => w.category === category || w.category.startsWith(category + ':'));
    }
    
    // 特殊分类（0个冒号，如 'all'）
    return works.filter(w => w.category === category);
  },

  // 搜索作品
  search: (query: string): Work[] => {
    const works = worksStorage.getAll();
    const lowerQuery = query.toLowerCase();
    return works.filter(w => 
      w.title.toLowerCase().includes(lowerQuery) ||
      w.description.toLowerCase().includes(lowerQuery) ||
      w.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  },

  // 获取精选作品
  getFeatured: (): Work[] => {
    return worksStorage.getAll().filter(w => w.featured);
  },

  // 按标签筛选
  filterByTag: (tag: string): Work[] => {
    const works = worksStorage.getAll();
    return works.filter(w => w.tags.includes(tag));
  },
};

// 密码保护操作
export const passwordStorage = {
  // 获取密码
  get: (): string => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(PASSWORD_KEY) || '';
  },

  // 设置密码
  set: (password: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PASSWORD_KEY, password);
  },

  // 验证密码
  verify: (password: string): boolean => {
    const stored = passwordStorage.get();
    return stored === '' || stored === password;
  },

  // 是否启用密码保护
  isEnabled: (): boolean => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(PASSWORD_ENABLED_KEY) === 'true';
  },

  // 设置密码保护开关
  setEnabled: (enabled: boolean) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PASSWORD_ENABLED_KEY, String(enabled));
  },

  // 清除密码
  clear: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(PASSWORD_KEY);
    localStorage.removeItem(PASSWORD_ENABLED_KEY);
  },
};

// 获取所有标签
export function getAllTags(worksData?: Work[]): string[] {
  const works = worksData || worksStorage.getAll();
  const tagSet = new Set<string>();
  works.forEach(work => {
    work.tags.forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}

// 获取统计数据
export function getStats(worksData?: Work[]) {
  const works = worksData || worksStorage.getAll();
  const categoryCount: Record<string, number> = {};
  const parentCategoryCount: Record<string, number> = {};
  
  works.forEach(work => {
    // 统计二级分类
    categoryCount[work.category] = (categoryCount[work.category] || 0) + 1;
    
    // 统计一级分类
    // 一级分类ID格式: custom:xxx (1个冒号)
    // 二级分类ID格式: custom:xxx:yyy (2个冒号)
    const colonCount = (work.category.match(/:/g) || []).length;
    let parentId = work.category;
    if (colonCount >= 2) {
      // 二级分类：取最后一个冒号之前的部分作为一级分类ID
      const lastColonIndex = work.category.lastIndexOf(':');
      parentId = work.category.substring(0, lastColonIndex);
    }
    // 一级分类或特殊分类：parentId 就是自身
    parentCategoryCount[parentId] = (parentCategoryCount[parentId] || 0) + 1;
  });
  
  return {
    total: works.length,
    featured: works.filter(w => w.featured).length,
    byCategory: categoryCount,
    byParentCategory: parentCategoryCount,
    tags: getAllTags(works).length,
  };
}
