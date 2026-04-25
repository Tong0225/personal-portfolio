'use client';

import { Category, defaultCategories, getStats } from '@/lib/works';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CategoryFilter } from './category-filter';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  tags: string[];
  selectedTag: string;
  onTagChange: (tag: string) => void;
  stats?: {
    byCategory: Record<string, number>;
    byParentCategory: Record<string, number>;
    total?: number;
    featured?: number;
  };
  onAddCategory?: (parentId: string, name: string) => void;
  onDeleteCategory?: (id: string) => void;
}

export function Sidebar({
  open,
  onClose,
  categories,
  selectedCategory,
  onCategoryChange,
  tags,
  selectedTag,
  onTagChange,
  stats,
  onAddCategory,
  onDeleteCategory,
}: SidebarProps) {
  // 使用传入的 stats，如果没有则计算（兼容旧调用方式）
  const calculatedStats = stats || getStats();
  const allStats = {
    ...calculatedStats,
    total: calculatedStats.total || Object.values(calculatedStats.byParentCategory || {}).reduce((a, b) => a + b, 0),
    featured: calculatedStats.featured || 0
  };

  return (
    <>
      {/* 移动端遮罩 */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* 侧边栏 */}
      <aside
        className={cn(
          'h-full w-72 bg-background border-r transition-transform duration-300 overflow-y-auto',
          // 移动端和桌面端使用不同的定位方式
          open ? 'translate-x-0' : '-translate-x-full',
          // 桌面端：相对定位，始终显示
          'md:relative md:translate-x-0 md:z-0',
          // 移动端：固定定位
          'fixed left-0 top-16 z-40 md:top-16'
        )}
      >
        {/* 移动端头部 */}
        <div className="flex items-center justify-between p-4 border-b md:hidden">
          <h2 className="font-semibold">筛选</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 space-y-6">
          {/* 统计信息 */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">统计数据</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-muted rounded-lg text-center">
                <div className="text-2xl font-bold">{allStats.total}</div>
                <div className="text-xs text-muted-foreground">作品总数</div>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <div className="text-2xl font-bold">{allStats.featured}</div>
                <div className="text-xs text-muted-foreground">精选作品</div>
              </div>
            </div>
          </div>

          {/* 分类筛选 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">分类</h3>
            </div>
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={onCategoryChange}
              stats={stats?.byCategory || {}}
              parentStats={stats?.byParentCategory || {}}
              onAddCategory={onAddCategory}
              onDeleteCategory={onDeleteCategory}
              showManage={false}
            />
          </div>

          {/* 标签筛选 */}
          {tags.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">标签</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onTagChange('')}
                  className={cn(
                    'px-2 py-1 text-xs rounded-full transition-colors',
                    selectedTag === ''
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  )}
                >
                  全部
                </button>
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => onTagChange(tag)}
                    className={cn(
                      'px-2 py-1 text-xs rounded-full transition-colors',
                      selectedTag === tag
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
