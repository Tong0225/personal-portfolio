// 作品类型定义
export interface Work {
  id: string;
  title: string;
  type: 'video' | 'image' | 'pdf';
  category: string; // 格式：parentId:childId，如 "design:ui"
  subCategory?: string; // 二级分类名称
  tags: string[];
  description: string;
  source: string; // B站BV号 或 GitHub路径
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
  
  // 找出所有二级分类（叶子节点）
  custom.forEach(cat => {
    if (cat.id.includes(':')) {
      leaves.push(cat);
    }
  });
  
  // 如果没有二级分类，返回一级分类
  if (leaves.length === 0) {
    custom.filter(c => !c.id.includes(':')).forEach(cat => {
      leaves.push(cat);
    });
  }
  
  return leaves;
}

// 获取分类路径（用于显示）
export function getCategoryPath(categoryId: string): string {
  if (categoryId === 'all') return '全部';
  
  const custom = customCategoriesStorage.getAll();
  
  // 如果是二级分类
  if (categoryId.includes(':')) {
    const parentId = categoryId.split(':')[0];
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
  
  if (categoryId.includes(':')) {
    const parentId = categoryId.split(':')[0];
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
    
    // 找出所有一级分类（不包含冒号的）
    const parentCategories = custom.filter(c => !c.id.includes(':'));
    
    // 为每个一级分类添加其子分类
    parentCategories.forEach(parent => {
      const children = custom.filter(c => c.id.startsWith(parent.id + ':'));
      result.push({
        ...parent,
        children: children.length > 0 ? children : undefined
      });
    });
    
    // 找出独立的二级分类（没有对应的一级分类）
    const orphanChildren = custom.filter(c => {
      if (!c.id.includes(':')) return false;
      const parentId = c.id.split(':')[0];
      return !parentCategories.some(p => p.id === parentId);
    });
    
    // 为孤立的二级分类创建一级分类
    const orphanParents = new Map<string, Category>();
    orphanChildren.forEach(child => {
      const parentId = child.id.split(':')[0];
      if (!orphanParents.has(parentId)) {
        orphanParents.set(parentId, {
          id: parentId,
          name: parentId,
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
    
    // 如果是二级分类（如 design:ui）
    if (category.includes(':')) {
      return works.filter(w => w.category === category);
    }
    
    // 如果是一级分类，匹配所有子分类
    return works.filter(w => w.category.startsWith(category + ':') || w.category === category);
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
    categoryCount[work.category] = (categoryCount[work.category] || 0) + 1;
    
    // 统计一级分类
    const parentId = work.category.includes(':') 
      ? work.category.split(':')[0] 
      : work.category;
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
