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

// 预设分类（一级）
export const defaultCategories: Category[] = [
  { id: 'all', name: '全部', icon: '📁' },
  { id: 'design', name: '设计', icon: '🎨', children: [
    { id: 'design:ui', name: 'UI设计', icon: '📱' },
    { id: 'design:brand', name: '品牌设计', icon: '🏷️' },
    { id: 'design:print', name: '印刷设计', icon: '📄' },
    { id: 'design:other', name: '其他设计', icon: '🎯' },
  ]},
  { id: 'video', name: '视频', icon: '🎬', children: [
    { id: 'video:mv', name: '短片', icon: '🎥' },
    { id: 'video:motion', name: '动效', icon: '✨' },
    { id: 'video:other', name: '其他', icon: '🎞️' },
  ]},
  { id: 'photo', name: '摄影', icon: '📷', children: [
    { id: 'photo:portrait', name: '人像', icon: '👤' },
    { id: 'photo:landscape', name: '风光', icon: '🏔️' },
    { id: 'photo:product', name: '产品', icon: '📦' },
    { id: 'photo:other', name: '其他', icon: '📸' },
  ]},
  { id: 'code', name: '代码', icon: '💻', children: [
    { id: 'code:web', name: '网页', icon: '🌐' },
    { id: 'code:app', name: '应用', icon: '📲' },
    { id: 'code:game', name: '游戏', icon: '🎮' },
    { id: 'code:other', name: '其他', icon: '⚙️' },
  ]},
  { id: 'other', name: '其他', icon: '📦', children: [
    { id: 'other:writing', name: '写作', icon: '✍️' },
    { id: 'other:music', name: '音乐', icon: '🎵' },
    { id: 'other:3d', name: '3D', icon: '🎲' },
    { id: 'other:other', name: '其他', icon: '📋' },
  ]},
];

// 获取所有叶子分类（用于选择）
export function getAllLeafCategories(): Category[] {
  const leaves: Category[] = [];
  
  function traverse(categories: Category[]) {
    for (const cat of categories) {
      if (cat.id === 'all') continue;
      if (cat.children && cat.children.length > 0) {
        traverse(cat.children);
      } else {
        leaves.push(cat);
      }
    }
  }
  
  traverse(defaultCategories);
  return leaves;
}

// 获取分类路径（用于显示）
export function getCategoryPath(categoryId: string): string {
  if (categoryId === 'all') return '全部';
  
  for (const cat of defaultCategories) {
    if (cat.children) {
      for (const child of cat.children) {
        if (child.id === categoryId) {
          return `${cat.name} > ${child.name}`;
        }
      }
    }
    if (cat.id === categoryId) {
      return cat.name;
    }
  }
  
  return categoryId;
}

// 获取一级分类
export function getParentCategory(categoryId: string): Category | null {
  if (categoryId === 'all') return null;
  
  for (const cat of defaultCategories) {
    if (cat.children) {
      for (const child of cat.children) {
        if (child.id === categoryId) {
          return cat;
        }
      }
    }
    if (cat.id === categoryId) {
      return cat;
    }
  }
  
  return null;
}

// 示例作品数据
export const sampleWorks: Work[] = [
  {
    id: '1',
    title: '创意海报设计',
    type: 'image',
    category: 'design:ui',
    subCategory: 'UI设计',
    tags: ['海报', '平面设计', '创意'],
    description: '这是一组创意海报设计作品，灵感来源于现代艺术风格。',
    source: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800',
    thumbnail: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400',
    featured: true,
    createdAt: Date.now() - 86400000 * 7,
  },
  {
    id: '2',
    title: '产品设计展示',
    type: 'video',
    category: 'design:ui',
    subCategory: 'UI设计',
    tags: ['产品', '设计', '展示'],
    description: '产品设计理念与实现过程的完整展示视频。',
    source: 'BV1xx411c7mD',
    thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    featured: true,
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: '3',
    title: 'UI界面设计',
    type: 'image',
    category: 'design:ui',
    subCategory: 'UI设计',
    tags: ['UI', '界面', 'APP'],
    description: '移动端APP界面设计，包含多个页面的完整设计稿。',
    source: 'https://images.unsplash.com/photo-1545235617-9465d2a55698?w=800',
    thumbnail: 'https://images.unsplash.com/photo-1545235617-9465d2a55698?w=400',
    featured: false,
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: '4',
    title: '品牌视觉设计',
    type: 'image',
    category: 'design:brand',
    subCategory: '品牌设计',
    tags: ['品牌', '视觉', 'VI'],
    description: '企业品牌视觉识别系统设计，包括logo、名片等。',
    source: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800',
    thumbnail: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=400',
    featured: true,
    createdAt: Date.now() - 86400000 * 2,
  },
];

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

  // 获取合并后的所有分类（默认 + 自定义）
  getMergedCategories: (): Category[] => {
    const merged = JSON.parse(JSON.stringify(defaultCategories)); // 深拷贝
    const custom = customCategoriesStorage.getAll();
    
    // 将自定义分类添加到对应位置
    custom.forEach(cat => {
      // 检查是否有一级分类
      if (cat.id.includes(':')) {
        const parentId = cat.id.split(':')[0];
        const parentIndex = merged.findIndex((c: Category) => c.id === parentId);
        
        if (parentIndex !== -1 && merged[parentIndex].children) {
          // 检查是否已存在该子分类
          const exists = merged[parentIndex].children!.some((c: Category) => c.id === cat.id);
          if (!exists) {
            merged[parentIndex].children!.push({...cat, name: cat.name});
          }
        }
      } else {
        // 作为新的一级分类添加
        const exists = merged.some((c: Category) => c.id === cat.id);
        if (!exists) {
          merged.push({...cat, children: []});
        }
      }
    });
    
    return merged;
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
