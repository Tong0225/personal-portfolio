'use client';

import { useState, useEffect } from 'react';
import { Work, defaultCategories, getAllLeafCategories, customCategoriesStorage } from '@/lib/works';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CategorySelect } from './category-filter';

interface WorkFormProps {
  work?: Work | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Work, 'id' | 'createdAt'>) => void;
}

export function WorkForm({ work, open, onOpenChange, onSubmit }: WorkFormProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<Work['type']>('image');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [description, setDescription] = useState('');
  const [source, setSource] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [featured, setFeatured] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState(defaultCategories);

  useEffect(() => {
    if (work) {
      setTitle(work.title);
      setType(work.type);
      setCategory(work.category);
      setTags([...work.tags]);
      setDescription(work.description);
      setSource(work.source);
      setThumbnail(work.thumbnail);
      setFeatured(work.featured);
    } else {
      // 重置表单
      setTitle('');
      setType('image');
      setCategory('');
      setTags([]);
      setDescription('');
      setSource('');
      setThumbnail('');
      setFeatured(false);
    }
    setTagInput('');
    setErrors({});
    // 加载用户自定义分类
    setCategories(customCategoriesStorage.getMergedCategories());
  }, [work, open]);

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = '请输入作品标题';
    }
    
    // 检查是否有自定义分类
    const userCategories = categories.filter(c => c.id !== 'all');
    if (userCategories.length === 0) {
      newErrors.category = '请先在侧边栏添加分类';
    } else if (!category.trim()) {
      newErrors.category = '请选择分类';
    }
    
    if (!source.trim()) {
      newErrors.source = '请输入资源链接';
    } else if (type === 'video') {
      // 验证B站BV号格式
      const bvRegex = /^(BV[a-zA-Z0-9]+|av\d+)$/;
      const isUrl = source.startsWith('http://') || source.startsWith('https://');
      if (!bvRegex.test(source.trim()) && !isUrl) {
        newErrors.source = '请输入正确的B站BV号（如 BV1xx411c7mD）用于视频播放';
      }
    } else if (type === 'audio') {
      // 验证B站音频au号格式
      const auRegex = /^au\d+$/;
      const isUrl = source.startsWith('http://') || source.startsWith('https://');
      if (!auRegex.test(source.trim()) && !isUrl) {
        newErrors.source = '请输入正确的B站音频ID（如 au10004738426）';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    const finalThumbnail = thumbnail.trim() || source.trim();

    // 获取二级分类名称
    const allCategories = getAllLeafCategories();
    const selectedCat = allCategories.find(c => c.id === category);
    const subCategoryName = selectedCat?.name || '';

    onSubmit({
      title: title.trim(),
      type,
      category,
      subCategory: subCategoryName,
      tags,
      description: description.trim(),
      source: source.trim(),
      thumbnail: finalThumbnail,
      featured,
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{work ? '编辑作品' : '添加作品'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 标题 */}
          <div className="space-y-2">
            <Label htmlFor="title">作品标题 *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入作品标题"
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          {/* 类型和分类 */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label>作品类型 *</Label>
              <Select value={type} onValueChange={(v) => setType(v as Work['type'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">图片</SelectItem>
                  <SelectItem value="video">视频</SelectItem>
                  <SelectItem value="audio">音频</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>分类 *</Label>
              {categories.filter(c => c.id !== 'all').length === 0 ? (
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-2">暂无分类，请先添加分类</p>
                  <p className="text-xs text-muted-foreground">点击侧边栏的"管理分类"按钮添加</p>
                </div>
              ) : (
                <CategorySelect
                  value={category}
                  onChange={setCategory}
                  categories={categories}
                />
              )}
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category}</p>
              )}
            </div>
          </div>

          {/* 资源链接 */}
          <div className="space-y-2">
            <Label htmlFor="source">
              {type === 'video' ? '视频链接' : type === 'audio' ? '音频链接' : type === 'pdf' ? 'PDF链接' : '图片链接'} *
            </Label>
            
            <Input
              id="source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder={
                type === 'video'
                  ? 'B站BV号（如 BV1xx411c7mD）或视频URL'
                  : type === 'audio'
                  ? 'B站音频ID（如 au10004738426）'
                  : type === 'pdf'
                  ? 'PDF 文件链接'
                  : '图片直链'
              }
              className={errors.source ? 'border-destructive' : ''}
            />
            {errors.source && (
              <p className="text-sm text-destructive">{errors.source}</p>
            )}
            {type === 'video' && (
              <p className="text-xs text-muted-foreground">
                输入B站BV号即可自动嵌入播放器
              </p>
            )}
            {type === 'audio' && (
              <p className="text-xs text-muted-foreground">
                输入B站音频ID（au开头）即可自动嵌入播放器
              </p>
            )}
            {type === 'image' && (
              <p className="text-xs text-muted-foreground">
                可使用图床（如 imgbb.com）获取图片链接
              </p>
            )}
            {type === 'pdf' && (
              <p className="text-xs text-muted-foreground">
                可将PDF上传到GitHub或云存储获取链接
              </p>
            )}
          </div>

          {/* 缩略图 */}
          <div className="space-y-2">
            <Label>缩略图链接（可选）</Label>
            <Input
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              placeholder="输入缩略图链接（留空则使用资源链接）"
            />
            {thumbnail && (
              <div className="mt-2">
                <img
                  src={thumbnail}
                  alt="缩略图预览"
                  className="w-full h-32 object-cover rounded border"
                />
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              不填写则自动使用资源链接作为缩略图
            </p>
          </div>

          {/* 描述 */}
          <div className="space-y-2">
            <Label htmlFor="description">作品描述</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="描述作品内容..."
              rows={3}
            />
          </div>

          {/* 标签 */}
          <div className="space-y-2">
            <Label>标签</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="输入标签后按回车添加"
              />
              <Button type="button" variant="outline" onClick={addTag}>
                添加
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* 精选 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="featured"
                checked={featured}
                onCheckedChange={setFeatured}
              />
              <Label htmlFor="featured">设为精选作品</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit">
              {work ? '保存' : '添加'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
