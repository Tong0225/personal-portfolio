'use client';

import { useState, useEffect, useRef } from 'react';
import { Work, defaultCategories, getAllLeafCategories } from '@/lib/works';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Upload, Loader2, Image as ImageIcon, CloudUpload } from 'lucide-react';
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
  const [category, setCategory] = useState('design:ui');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [description, setDescription] = useState('');
  const [source, setSource] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [featured, setFeatured] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // 上传相关状态
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

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
      setCategory('design:ui');
      setTags([]);
      setDescription('');
      setSource('');
      setThumbnail('');
      setFeatured(false);
    }
    setTagInput('');
    setErrors({});
    setUploadError('');
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

  // 上传文件
  const uploadFile = async (file: File, target: 'source' | 'thumbnail'): Promise<string | null> => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError('');

    try {
      const formData = new FormData();
      const uploadType = target === 'source' && type === 'video' ? 'video' : 'image';
      formData.append('file', file);
      formData.append('type', uploadType);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      setUploadProgress(100);
      
      return result.url;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      setUploadError(message);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // 处理文件选择
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, target: 'source' | 'thumbnail') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadFile(file, target);
    if (url) {
      if (target === 'source') {
        setSource(url);
      } else {
        setThumbnail(url);
      }
    }
    
    // 重置input
    e.target.value = '';
  };

  // 处理拖拽
  const handleDrop = async (e: React.DragEvent, target: 'source' | 'thumbnail') => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const url = await uploadFile(file, target);
    if (url) {
      if (target === 'source') {
        setSource(url);
      } else {
        setThumbnail(url);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = '请输入作品标题';
    }
    
    if (!source.trim()) {
      newErrors.source = '请上传资源或输入链接';
    } else if (type === 'video') {
      // 验证B站BV号格式 - 现在支持直接上传视频或输入BV号
      const bvRegex = /^(BV[a-zA-Z0-9]+|av\d+)$/;
      // 如果不是BV号格式，检查是否是URL
      const isUrl = source.startsWith('http://') || source.startsWith('https://');
      if (!bvRegex.test(source.trim()) && !isUrl) {
        newErrors.source = '请输入正确的B站BV号（如 BV1xx411c7mD）或上传视频文件';
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
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>分类 *</Label>
              <CategorySelect
                value={category}
                onChange={setCategory}
                categories={defaultCategories}
              />
            </div>
          </div>

          {/* 资源链接/上传 */}
          <div className="space-y-2">
            <Label htmlFor="source">
              {type === 'video' ? '视频（B站BV号或上传视频）' : '资源链接/上传'}
            </Label>
            
            {/* 上传区域 */}
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              onDrop={(e) => handleDrop(e, 'source')}
              onDragOver={handleDragOver}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={type === 'video' ? 'video/*' : type === 'image' ? 'image/*' : '.pdf'}
                className="hidden"
                onChange={(e) => handleFileSelect(e, 'source')}
                disabled={isUploading}
              />
              <div className="flex flex-col items-center gap-2">
                {isUploading ? (
                  <>
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">上传中... {uploadProgress}%</p>
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-8 h-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      点击或拖拽上传{type === 'video' ? '视频' : type === 'image' ? '图片' : 'PDF'}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* 或者输入链接 */}
            <div className="flex items-center gap-2">
              <div className="flex-1 border-t" />
              <span className="text-xs text-muted-foreground">或者输入链接</span>
              <div className="flex-1 border-t" />
            </div>

            <Input
              id="source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder={
                type === 'video'
                  ? 'B站BV号（如 BV1xx411c7mD）或视频URL'
                  : type === 'pdf'
                  ? 'PDF 文件链接'
                  : '图片直链'
              }
              className={errors.source ? 'border-destructive' : ''}
            />
            {errors.source && (
              <p className="text-sm text-destructive">{errors.source}</p>
            )}
            {uploadError && (
              <p className="text-sm text-destructive">{uploadError}</p>
            )}
            {type === 'video' && (
              <p className="text-xs text-muted-foreground">
                支持上传视频文件或输入B站BV号
              </p>
            )}
          </div>

          {/* 缩略图 */}
          <div className="space-y-2">
            <Label>缩略图</Label>
            
            {/* 缩略图上传区域 */}
            <div
              className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => thumbnailInputRef.current?.click()}
              onDrop={(e) => handleDrop(e, 'thumbnail')}
              onDragOver={handleDragOver}
            >
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e, 'thumbnail')}
                disabled={isUploading}
              />
              {thumbnail ? (
                <div className="relative w-full">
                  <img
                    src={thumbnail}
                    alt="缩略图预览"
                    className="w-full h-32 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setThumbnail('');
                    }}
                    className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-4">
                  <ImageIcon className="w-6 h-6 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    点击上传缩略图
                  </p>
                </div>
              )}
            </div>

            {/* 或输入链接 */}
            <Input
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              placeholder="或输入缩略图链接（留空使用资源链接）"
            />
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
            <Button type="submit" disabled={isUploading}>
              {isUploading ? '上传中...' : (work ? '保存' : '添加')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
