'use client';

import { useState } from 'react';
import { Work, getCategoryPath } from '@/lib/works';
import { Badge } from '@/components/ui/badge';
import { Star, Play, FileText, Image as ImageIcon, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';

interface WorkCardProps {
  work: Work;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onFeaturedToggle?: () => void;
}

export function WorkCard({
  work,
  onClick,
  onEdit,
  onDelete,
  onFeaturedToggle,
}: WorkCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getTypeIcon = () => {
    switch (work.type) {
      case 'video':
        return <Play className="w-4 h-4" />;
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      case 'image':
      default:
        return <ImageIcon className="w-4 h-4" />;
    }
  };

  const getTypeBadge = () => {
    switch (work.type) {
      case 'video':
        return <Badge variant="secondary">视频</Badge>;
      case 'pdf':
        return <Badge variant="secondary">PDF</Badge>;
      case 'image':
      default:
        return <Badge variant="secondary">图片</Badge>;
    }
  };

  // 获取分类显示名称
  const getCategoryDisplay = () => {
    const path = getCategoryPath(work.category);
    if (path === '全部') return work.category;
    return path;
  };

  return (
    <div
      className="group relative rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer"
      onClick={onClick}
    >
      {/* 精选标记 */}
      {work.featured && (
        <div className="absolute top-2 left-2 z-10">
          <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
            <Star className="w-3 h-3 mr-1" />
            精选
          </Badge>
        </div>
      )}

      {/* 操作菜单 */}
      {(onEdit || onDelete || onFeaturedToggle) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onFeaturedToggle && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onFeaturedToggle(); }}>
                <Star className="mr-2 h-4 w-4" />
                {work.featured ? '取消精选' : '设为精选'}
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                <Edit className="mr-2 h-4 w-4" />
                编辑
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                删除
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* 缩略图 */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
            <div className="w-8 h-8 border-4 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
          </div>
        )}
        {imageError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            {getTypeIcon()}
            <span className="text-sm mt-2">加载失败</span>
          </div>
        ) : (
          <img
            src={work.thumbnail}
            alt={work.title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        )}
        
        {/* 视频播放指示 */}
        {work.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <Play className="w-6 h-6 text-gray-800 ml-1" />
            </div>
          </div>
        )}

        {/* PDF指示 */}
        {work.type === 'pdf' && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
            <div className="flex flex-col items-center">
              <FileText className="w-12 h-12 text-primary" />
              <span className="text-sm text-primary mt-2">点击预览</span>
            </div>
          </div>
        )}
      </div>

      {/* 信息 */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold line-clamp-1" title={work.title}>
            {work.title}
          </h3>
          {getTypeBadge()}
        </div>

        {/* 分类显示 */}
        <div className="text-xs text-muted-foreground mb-2">
          {getCategoryDisplay()}
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {work.description}
        </p>

        {/* 标签 */}
        {work.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {work.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {work.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{work.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
