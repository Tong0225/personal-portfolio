'use client';

import { useState, useEffect } from 'react';
import { Category, customCategoriesStorage, generateId } from '@/lib/works';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Trash2, Edit2, FolderOpen, ChevronRight, ChevronDown, Settings } from 'lucide-react';

interface CategoryManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoriesChange?: () => void;
}

// 可选的图标列表
const ICONS = ['📁', '📂', '📄', '📝', '📸', '🎨', '🎬', '🎵', '🎮', '💻', '🌐', '📱', '✏️', '🖼️', '🎞️', '📹', '🎥', '🎙️', '🎤', '🎧', '🎷', '🎸', '🎹', '🎺', '🎻', '🪘', '🎭', '🎪', '🎨', '🖌️', '🖍️', '📐', '📏', '✂️', '🗂️', '📋', '📌', '📍', '🔖', '🏷️', '📦', '🎁', '💡', '🔮', '🧩', '🃏', '♟️', '🎯', '🎲', '🧮', '⚙️', '🔧', '🔩', '⚡', '🔥', '💧', '🌟', '⭐', '✨', '💫', '🌙', '☀️', '🌈', '⚡', '🌊', '🍀', '🌸', '🌺', '🌻', '🌼', '🌷', '🪷', '🪻', '🌹', '🥀', '💐', '🌾', '🌿', '🍃', '🍂', '🍁', '🌵', '🌲', '🌳', '🌴', '🪵', '🪨', '🏔️', '⛰️', '🌋', '🗻', '🏕️', '🏞️', '🌅', '🌄', '🌠', '🎇', '🎆', '🧨', '🎉', '🎊', '🎈', '🎏', '🎀', '🎁', '🎫', '🏅', '🥇', '🥈', '🥉', '🏆', '🎖️', '🎗️', '🎟️', '🎫'];

export function CategoryManager({ open, onOpenChange, onCategoriesChange }: CategoryManagerProps) {
  const [customCategories, setCustomCategories] = useState<Category[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddChildDialogOpen, setIsAddChildDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('📁');
  const [parentCategoryId, setParentCategoryId] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['all']));

  // 加载自定义分类
  useEffect(() => {
    if (open) {
      setCustomCategories(customCategoriesStorage.getAll());
    }
  }, [open]);

  // 切换分类展开
  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCategories(newExpanded);
  };

  // 添加一级分类
  const handleAddParent = () => {
    if (!newCategoryName.trim()) return;
    const id = 'custom:' + generateId();
    const category: Category = { id, name: newCategoryName.trim(), icon: selectedIcon, children: [] };
    customCategoriesStorage.add(category);
    setCustomCategories([...customCategories, category]);
    setNewCategoryName('');
    setSelectedIcon('📁');
    setIsAddDialogOpen(false);
    onCategoriesChange?.();
  };

  // 添加二级分类
  const handleAddChild = () => {
    if (!newCategoryName.trim() || !parentCategoryId) return;
    const id = `${parentCategoryId}:${generateId()}`;
    const category: Category = { id, name: newCategoryName.trim(), icon: selectedIcon };
    customCategoriesStorage.add(category);
    setCustomCategories([...customCategories, category]);
    setNewCategoryName('');
    setSelectedIcon('📁');
    setIsAddChildDialogOpen(false);
    setParentCategoryId(null);
    onCategoriesChange?.();
  };

  // 删除分类
  const handleDelete = () => {
    if (!categoryToDelete) return;
    customCategoriesStorage.deleteCategory(categoryToDelete.id);
    setCustomCategories(customCategories.filter(c => c.id !== categoryToDelete.id && !c.id.startsWith(categoryToDelete.id + ':')));
    setCategoryToDelete(null);
    setIsDeleteDialogOpen(false);
    onCategoriesChange?.();
  };

  // 获取所有一级分类
  const getAllParentCategories = () => {
    const parents: Category[] = [];
    // 一级分类的ID只有一个冒号，如 "custom:xxx"
    customCategories.filter(c => {
      const colonCount = (c.id.match(/:/g) || []).length;
      return colonCount === 1;
    }).forEach(cat => {
      parents.push({...cat, children: []});
    });
    return parents;
  };

  // 获取某个一级分类下的所有子分类
  const getChildren = (parentId: string) => {
    return customCategories.filter(c => c.id.startsWith(parentId + ':'));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            分类管理
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 提示信息 */}
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <p>• 点击"添加新一级分类"创建新的分类</p>
            <p>• 在一级分类下可以添加二级分类</p>
            <p>• 删除分类不会影响其下的作品</p>
          </div>

          {/* 一级分类列表 */}
          <div className="space-y-2">
            {getAllParentCategories().map(parent => {
              const children = getChildren(parent.id);
              const isExpanded = expandedCategories.has(parent.id);
              
              return (
                <div key={parent.id} className="border rounded-lg overflow-hidden bg-primary/5">
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleExpand(parent.id)}
                        className="p-1 hover:bg-muted rounded"
                      >
                        {children.length > 0 ? (
                          isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                        ) : (
                          <FolderOpen className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                      <span className="text-lg">{parent.icon}</span>
                      <span className="font-medium">{parent.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setParentCategoryId(parent.id);
                          setIsAddChildDialogOpen(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        添加子分类
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setCategoryToDelete(parent);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* 子分类列表 */}
                  {isExpanded && children.length > 0 && (
                    <div className="border-t bg-muted/20">
                      {children.map(child => {
                        return (
                          <div
                            key={child.id}
                            className="flex items-center justify-between px-4 py-2 pl-12 border-b last:border-b-0"
                          >
                            <div className="flex items-center gap-2">
                              <span>{child.icon}</span>
                              <span>{child.name}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setCategoryToDelete(child);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            
            {getAllParentCategories().length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>暂无分类</p>
                <p className="text-sm mt-1">点击下方按钮添加一级分类</p>
              </div>
            )}
          </div>

          {/* 添加新一级分类按钮 */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            添加新一级分类
          </Button>
        </div>

        {/* 添加一级分类对话框 */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>添加一级分类</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">分类名称</label>
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="输入分类名称"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">选择图标</label>
                <div className="grid grid-cols-10 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                  {ICONS.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setSelectedIcon(icon)}
                      className={`p-2 text-xl rounded hover:bg-muted ${
                        selectedIcon === icon ? 'bg-primary/20 ring-2 ring-primary' : ''
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleAddParent} disabled={!newCategoryName.trim()}>
                  添加
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* 添加二级分类对话框 */}
        <Dialog open={isAddChildDialogOpen} onOpenChange={setIsAddChildDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>添加子分类</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">子分类名称</label>
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="输入子分类名称"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">选择图标</label>
                <div className="grid grid-cols-10 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                  {ICONS.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setSelectedIcon(icon)}
                      className={`p-2 text-xl rounded hover:bg-muted ${
                        selectedIcon === icon ? 'bg-primary/20 ring-2 ring-primary' : ''
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setIsAddChildDialogOpen(false);
                  setNewCategoryName('');
                }}>
                  取消
                </Button>
                <Button onClick={handleAddChild} disabled={!newCategoryName.trim()}>
                  添加
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* 删除确认对话框 */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除</AlertDialogTitle>
              <AlertDialogDescription>
                确定要删除分类"{categoryToDelete?.name}"吗？
                {categoryToDelete && !categoryToDelete.id.includes(':') && (
                  <span className="block mt-2 text-amber-600">
                    注意：此分类下的所有子分类也会被删除。
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}
