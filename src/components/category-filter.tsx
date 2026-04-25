'use client';

import { useState, useEffect } from 'react';
import { Category, getCategoryPath } from '@/lib/works';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, Plus, Edit2, Trash2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  stats?: Record<string, number>;
  parentStats?: Record<string, number>;
  onAddCategory?: (parentId: string, name: string) => void;
  onDeleteCategory?: (id: string) => void;
  showManage?: boolean;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  stats = {},
  parentStats = {},
  onAddCategory,
  onDeleteCategory,
  showManage = false,
}: CategoryFilterProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedParentId, setSelectedParentId] = useState('');

  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim() && selectedParentId && onAddCategory) {
      onAddCategory(selectedParentId, newCategoryName.trim());
      setNewCategoryName('');
    }
  };

  // 渲染分类项
  const renderCategoryItem = (category: Category, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const count = level === 0 
      ? parentStats[category.id] || 0 
      : stats[category.id] || 0;
    const isSelected = selectedCategory === category.id;
    const isParentSelected = level === 0 && selectedCategory.startsWith(category.id + ':');

    return (
      <div key={category.id}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpand(category.id);
            }
            onCategoryChange(category.id);
          }}
          className={cn(
            'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
            'hover:bg-muted',
            (isSelected || (isParentSelected && !hasChildren)) && level > 0
              ? 'bg-primary text-primary-foreground'
              : level === 0 && (isSelected || isParentSelected)
              ? 'bg-primary/10 text-primary font-medium'
              : ''
          )}
          style={{ paddingLeft: `${12 + level * 16}px` }}
        >
          <div className="flex items-center gap-2">
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )
            ) : (
              <span className="w-4" />
            )}
            <span>{category.icon}</span>
            <span>{category.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={isSelected ? 'secondary' : 'outline'}
              className={cn(
                'text-xs',
                isSelected && 'bg-primary-foreground/20'
              )}
            >
              {count}
            </Badge>
            {showManage && hasChildren && level === 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedParentId(category.id);
                  setIsManageOpen(true);
                }}
                className="p-1 hover:bg-muted rounded"
              >
                <Plus className="w-3 h-3" />
              </button>
            )}
          </div>
        </button>

        {/* 子分类 */}
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {category.children!.map(child => renderCategoryItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {categories.map(category => renderCategoryItem(category))}

      {/* 添加分类弹窗 */}
      {showManage && (
        <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>添加子分类</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>父分类</Label>
                <div className="p-2 bg-muted rounded text-sm">
                  {categories.find(c => c.id === selectedParentId)?.name || '未选择'}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-name">子分类名称</Label>
                <Input
                  id="category-name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="输入分类名称"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsManageOpen(false)}>
                取消
              </Button>
              <Button onClick={handleAddCategory} disabled={!newCategoryName.trim()}>
                添加
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// 独立的分类选择器组件
interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  categories: Category[];
}

export function CategorySelect({ value, onChange, categories }: CategorySelectProps) {
  const [parentId, setParentId] = useState('');
  const [childId, setChildId] = useState('');

  // 从value中解析父分类
  useEffect(() => {
    if (value && value.includes(':')) {
      const parts = value.split(':');
      setParentId(parts[0]);
      setChildId(value);
    } else if (value) {
      setParentId(value);
      setChildId('');
    }
  }, [value]);

  const handleParentChange = (newParentId: string) => {
    setParentId(newParentId);
    
    const parent = categories.find(c => c.id === newParentId);
    if (parent?.children && parent.children.length > 0) {
      // 有子分类，选第一个
      setChildId(parent.children[0].id);
      onChange(parent.children[0].id);
    } else {
      setChildId('');
      onChange(newParentId);
    }
  };

  const handleChildChange = (newChildId: string) => {
    setChildId(newChildId);
    onChange(newChildId);
  };

  const currentParent = categories.find(c => c.id === parentId);

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <label className="text-sm font-medium">一级分类</label>
        <div className="flex flex-wrap gap-2">
          {categories.filter(c => c.id !== 'all').map(cat => (
            <button
              key={cat.id}
              onClick={() => handleParentChange(cat.id)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm transition-colors',
                parentId === cat.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {currentParent?.children && currentParent.children.length > 0 && (
        <div className="space-y-1">
          <label className="text-sm font-medium">二级分类</label>
          <div className="flex flex-wrap gap-2">
            {currentParent.children.map(child => (
              <button
                key={child.id}
                onClick={() => handleChildChange(child.id)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm transition-colors',
                  childId === child.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                )}
              >
                {child.icon} {child.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
