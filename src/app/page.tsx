'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Work, defaultCategories, worksStorage, getAllTags, passwordStorage, getStats, customCategoriesStorage, Category } from '@/lib/works';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { WorksGrid } from '@/components/works-grid';
import { WorkModal } from '@/components/work-modal';
import { WorkForm } from '@/components/work-form';
import { SettingsDialog } from '@/components/settings-dialog';
import { SyncSettings } from '@/components/sync-settings';
import { PasswordDialog } from '@/components/password-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  // 数据状态
  const [works, setWorks] = useState<Work[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [tags, setTags] = useState<string[]>([]);
  const [categoriesVersion, setCategoriesVersion] = useState(0); // 用于触发分类刷新
  const [syncEnabled, setSyncEnabled] = useState(false); // 云同步是否启用
  const [isLoading, setIsLoading] = useState(true); // 初始加载状态
  
  // 筛选状态
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // UI状态
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<Work | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSyncOpen, setIsSyncOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Work | null>(null);
  const [mounted, setMounted] = useState(false);
  const [needsPassword, setNeedsPassword] = useState(false);

  // 使用ref来存储函数引用，避免闭包问题
  const loadWorksRef = useRef<() => void>(() => {});
  const checkPasswordRef = useRef<() => void>(() => {});
  const pendingDeleteWorkRef = useRef<Work | null>(null); // 待删除作品（密码验证后）

  // 定义loadWorks函数
  const loadWorks = useCallback(() => {
    const allWorks = worksStorage.getAll();
    setWorks(allWorks);
    setTags(getAllTags());
  }, []);

  // 定义checkPassword函数
  const checkPassword = useCallback(() => {
    const enabled = passwordStorage.isEnabled();
    setNeedsPassword(enabled);
    setIsAuthenticated(!enabled);
  }, []);

  // 更新ref
  useEffect(() => {
    loadWorksRef.current = loadWorks;
    checkPasswordRef.current = checkPassword;
  }, [loadWorks, checkPassword]);

  // 加载数据
  useEffect(() => {
    setMounted(true);
    setIsLoading(true);
    
    // 获取同步配置
    const syncKey = localStorage.getItem('portfolio-jsonbin-sync-key');
    const apiKey = localStorage.getItem('portfolio-jsonbin-api-key');
    
    // 构建 binId（如果没有自定义密钥，使用默认的共享 bin）
    let binId = localStorage.getItem('portfolio-jsonbin-bin-id');
    if (!binId && syncKey) {
      // 根据密钥生成 binId
      binId = 'portfolio-' + btoa(syncKey).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
    } else if (!binId) {
      // 使用默认的共享 bin（朱桐作品集）
      binId = '69ec3e18856a6821896df20a';
    }
    
    // 自动从云端获取数据
    console.log('开始从云端获取数据...');
    fetch(`/api/jsonbin?binId=${binId}${apiKey ? '&apiKey=' + apiKey : ''}`)
      .then(res => {
        console.log('云端响应状态:', res.status);
        return res.json();
      })
      .then(result => {
        console.log('云端数据:', result);
        if (result.works && Array.isArray(result.works)) {
          // 用云端数据覆盖本地数据
          worksStorage.saveAll(result.works);
          setWorks(result.works);
          // 从云端数据中提取所有标签
          const allTags = [...new Set(result.works.flatMap((w: Work) => w.tags))] as string[];
          setTags(allTags);
        }
      })
      .catch(err => {
        console.error('云端同步失败:', err);
        // 同步失败时使用本地数据
        loadWorksRef.current();
      })
      .finally(() => {
        setIsLoading(false);
        console.log('数据加载完成');
      });
    
    checkPasswordRef.current();
    setCategories(customCategoriesStorage.getMergedCategories());
  }, []);

  // 筛选作品
  const filteredWorks = useMemo(() => {
    let result = works;

    // 分类筛选（支持一级和二级分类）
    if (selectedCategory !== 'all') {
      if (selectedCategory.includes(':')) {
        // 二级分类
        result = result.filter((w) => w.category === selectedCategory);
      } else {
        // 一级分类，匹配所有子分类
        result = result.filter((w) => 
          w.category.startsWith(selectedCategory + ':') || 
          w.category === selectedCategory
        );
      }
    }

    // 标签筛选
    if (selectedTag) {
      result = result.filter((w) => w.tags.includes(selectedTag));
    }

    // 搜索
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (w) =>
          w.title.toLowerCase().includes(query) ||
          w.description.toLowerCase().includes(query) ||
          w.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    return result;
  }, [works, selectedCategory, selectedTag, searchQuery]);

  // 统计数据
  const stats = useMemo(() => {
    return getStats(works);
  }, [works]);

  // 处理添加作品
  const handleAddWork = useCallback(() => {
    if (needsPassword && !isAuthenticated) {
      setIsPasswordOpen(true);
      return;
    }
    setEditingWork(null);
    setIsFormOpen(true);
  }, [needsPassword, isAuthenticated]);

  // 处理编辑作品
  const handleEditWork = useCallback((work: Work) => {
    if (needsPassword && !isAuthenticated) {
      setIsPasswordOpen(true);
      return;
    }
    setEditingWork(work);
    setIsFormOpen(true);
  }, [needsPassword, isAuthenticated]);

  // 处理删除作品
  const handleDeleteWork = useCallback((work: Work) => {
    if (needsPassword && !isAuthenticated) {
      pendingDeleteWorkRef.current = work; // 保存待删除的作品
      setIsPasswordOpen(true);
      return;
    }
    setDeleteTarget(work);
  }, [needsPassword, isAuthenticated]);

  // 自动同步到云端
  const autoSyncToCloud = useCallback(async () => {
    const syncKey = localStorage.getItem('portfolio-jsonbin-sync-key');
    
    // 构建 binId（如果没有自定义密钥，使用默认的共享 bin）
    let binId = localStorage.getItem('portfolio-jsonbin-bin-id');
    if (!binId && syncKey) {
      binId = 'portfolio-' + btoa(syncKey).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
    } else if (!binId) {
      // 使用默认的共享 bin（朱桐作品集）
      binId = '69ec3e18856a6821896df20a';
    }
    
    const apiKey = localStorage.getItem('portfolio-jsonbin-api-key') || '';
    
    try {
      const currentWorks = worksStorage.getAll();
      
      await fetch('/api/jsonbin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          works: currentWorks, 
          binId,
          apiKey 
        }),
      });
    } catch (err) {
      console.error('自动同步失败:', err);
    }
  }, []);

  // 确认删除
  const confirmDelete = useCallback(() => {
    if (deleteTarget) {
      worksStorage.delete(deleteTarget.id);
      loadWorks();
      setDeleteTarget(null);
      // 自动同步到云端
      autoSyncToCloud();
    }
  }, [deleteTarget, loadWorks, autoSyncToCloud]);

  // 处理精选切换
  const handleFeaturedToggle = useCallback((work: Work) => {
    if (needsPassword && !isAuthenticated) {
      setIsPasswordOpen(true);
      return;
    }
    worksStorage.update(work.id, { featured: !work.featured });
    loadWorks();
  }, [needsPassword, isAuthenticated, loadWorks]);

  // 提交作品表单
  const handleFormSubmit = useCallback((data: Omit<Work, 'id' | 'createdAt'>) => {
    if (editingWork) {
      worksStorage.update(editingWork.id, data);
    } else {
      worksStorage.add(data);
    }
    loadWorks();
    setEditingWork(null);
    // 自动同步到云端
    autoSyncToCloud();
  }, [editingWork, loadWorks, autoSyncToCloud]);

  // 导出数据
  const handleExport = useCallback(() => {
    const data = worksStorage.getAll();
    const json = JSON.stringify({ works: data }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `works-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // 密码验证成功
  const handlePasswordSuccess = useCallback(() => {
    setIsAuthenticated(true);
    
    // 检查是否有待删除的作品
    const pendingWork = pendingDeleteWorkRef.current;
    if (pendingWork) {
      setDeleteTarget(pendingWork);
      pendingDeleteWorkRef.current = null;
    }
  }, []);

  // 设置保存成功
  const handleSettingsSaved = useCallback(() => {
    checkPassword();
    setIsAuthenticated(!passwordStorage.isEnabled());
  }, [checkPassword]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <Header
        onSearch={setSearchQuery}
        onAddClick={handleAddWork}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onSyncClick={() => setIsSyncOpen(true)}
        onExportClick={handleExport}
        searchQuery={searchQuery}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMenuOpen={isSidebarOpen}
      />

      <div className="flex pt-16">
        {/* 侧边栏 */}
        <Sidebar
          open={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          tags={tags}
          selectedTag={selectedTag}
          onTagChange={setSelectedTag}
          stats={{
            byCategory: stats.byCategory,
            byParentCategory: stats.byParentCategory,
            total: stats.total,
            featured: stats.featured,
          }}
        />

        {/* 主内容 */}
        <main className="flex-1 p-6 container mx-auto">
          {/* 移动端分类筛选 */}
          <div className="md:hidden mb-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* 作品网格 */}
          <WorksGrid
            works={filteredWorks}
            isLoading={isLoading}
            onWorkClick={(work) => {
              setSelectedWork(work);
              setIsWorkModalOpen(true);
            }}
            onEdit={handleEditWork}
            onDelete={handleDeleteWork}
            onFeaturedToggle={handleFeaturedToggle}
            isAuthenticated={isAuthenticated || !needsPassword}
          />
        </main>
      </div>

      {/* 作品预览弹窗 */}
      <WorkModal
        work={selectedWork}
        open={isWorkModalOpen}
        onOpenChange={setIsWorkModalOpen}
      />

      {/* 作品表单弹窗 */}
      <WorkForm
        work={editingWork}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
      />

      {/* 设置弹窗 */}
      <SettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        onPasswordVerified={handleSettingsSaved}
        onCategoriesChange={() => setCategories(customCategoriesStorage.getMergedCategories())}
      />

      {/* 同步设置弹窗 */}
      <SyncSettings
        open={isSyncOpen}
        onOpenChange={setIsSyncOpen}
        onSyncComplete={loadWorks}
      />

      {/* 密码验证弹窗 */}
      <PasswordDialog
        open={isPasswordOpen}
        onOpenChange={setIsPasswordOpen}
        onSuccess={handlePasswordSuccess}
      />

      {/* 删除确认 */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除作品&quot;{deleteTarget?.title}&quot;吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
