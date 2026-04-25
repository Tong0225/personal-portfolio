'use client';

import { useEffect, useState } from 'react';
import { Work, getCategoryPath } from '@/lib/works';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ExternalLink, Star, AlertCircle, Video, Loader2, Music } from 'lucide-react';

interface WorkModalProps {
  work: Work | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkModal({ work, open, onOpenChange }: WorkModalProps) {
  const [videoError, setVideoError] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // 设备检测
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
  }, []);

  // ESC键关闭
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onOpenChange]);

  // 重置状态当work变化时
  useEffect(() => {
    if (work?.type === 'video' || work?.type === 'audio') {
      setVideoError(false);
      setVideoLoading(true);
    }
  }, [work]);

  if (!work) return null;

  // 构建B站视频/音频URL
  const getBilibiliUrl = (sourceId: string, type?: string): string => {
    const id = sourceId.trim();
    
    // B站音频（au开头）
    if (id.startsWith('au')) {
      return `https://www.bilibili.com/audio/${id}`;
    }
    
    // 如果包含BV前缀，直接使用
    if (id.startsWith('BV')) {
      return `https://player.bilibili.com/player.html?bvid=${id}&high_quality=1&autoplay=0`;
    }
    
    // 如果是纯数字（av号），转换为BV或直接使用
    if (/^\d+$/.test(id)) {
      return `https://player.bilibili.com/player.html?aid=${id}&high_quality=1&autoplay=0`;
    }
    
    // 假设已经是纯BV号（没有BV前缀的情况）
    return `https://player.bilibili.com/player.html?bvid=${id}&high_quality=1&autoplay=0`;
  };

  const renderPreview = () => {
    switch (work.type) {
      case 'video':
      case 'audio':
        const bilibiliUrl = getBilibiliUrl(work.source);
        
        if (videoError) {
          return (
            <div className="relative aspect-video w-full bg-muted rounded-lg flex flex-col items-center justify-center gap-4">
              <AlertCircle className="w-12 h-12 text-destructive" />
              <p className="text-muted-foreground">{work.type === 'audio' ? '音频' : '视频'}加载失败</p>
              <p className="text-sm text-muted-foreground">
                {work.source.startsWith('au') ? '音频ID' : 'BV号'}: {work.source}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setVideoError(false);
                  setVideoLoading(true);
                }}
              >
                重试
              </Button>
              <Button
                variant="link"
                size="sm"
                onClick={() => {
                  const url = work.source.startsWith('au') 
                    ? `https://www.bilibili.com/audio/${work.source}`
                    : `https://www.bilibili.com/video/${work.source}`;
                  window.open(url, '_blank');
                }}
              >
                在B站打开
              </Button>
            </div>
          );
        }

        return (
          <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ height: work.type === 'audio' ? '80px' : undefined, aspectRatio: work.type === 'audio' ? undefined : '16/9' }}>
            {videoLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
              </div>
            )}
            {work.type === 'audio' ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-r from-purple-900/80 to-pink-900/80">
                <Music className="w-8 h-8 text-white mb-2" />
                <p className="text-white text-sm">音频播放中...</p>
              </div>
            ) : null}
            <iframe
              src={bilibiliUrl}
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allowFullScreen
              scrolling="no"
              onLoad={() => setVideoLoading(false)}
              onError={() => {
                setVideoLoading(false);
                setVideoError(true);
              }}
            />
          </div>
        );

      case 'pdf':
        if (isMobile) {
          return (
            <div className="flex flex-col items-center justify-center h-[60vh] bg-muted rounded-lg">
              <p className="text-muted-foreground mb-4">移动端暂不支持PDF预览</p>
              <Button
                variant="default"
                size="sm"
                onClick={() => window.open(work.source, '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                在新窗口打开
              </Button>
            </div>
          );
        }
        return (
          <div className="relative w-full h-[80vh] bg-muted rounded-lg overflow-hidden">
            <iframe
              src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(work.source)}`}
              className="absolute inset-0 w-full h-full"
              title="PDF Preview"
            />
          </div>
        );

      case 'image':
      default:
        return (
          <div className="relative w-full flex items-center justify-center bg-muted rounded-lg overflow-hidden">
            <img
              src={work.source}
              alt={work.title}
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-[95vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-xl flex items-center gap-2">
                {work.title}
                {work.featured && (
                  <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
                    <Star className="w-3 h-3 mr-1" />
                    精选
                  </Badge>
                )}
              </DialogTitle>
              {/* 分类显示 */}
              <p className="text-sm text-muted-foreground mt-1">
                {getCategoryPath(work.category)}
              </p>
            </div>
          </div>

          {/* 操作按钮行 - 标题下方 */}
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => window.open(work.source, '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              在新窗口打开
            </Button>
            {work.type === 'video' || work.type === 'audio' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://www.bilibili.com/video/${work.source}`, '_blank')}
              >
                <Video className="mr-2 h-4 w-4" />
                在B站{work.type === 'audio' ? '收听' : '查看'}
              </Button>
            ) : null}
          </div>

          {/* 标签 */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{work.subCategory || work.category}</Badge>
            {work.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </DialogHeader>

        {/* 预览内容 */}
        <div className="mt-4">
          {renderPreview()}
        </div>

        {/* 描述 */}
        {work.description && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">作品描述</h4>
            <p className="text-muted-foreground">{work.description}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
