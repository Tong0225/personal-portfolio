'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Work } from '@/lib/works';
import { WorkCard } from './work-card';

interface WorksGridProps {
  works: Work[];
  isLoading?: boolean;
  onWorkClick: (work: Work) => void;
  onEdit: (work: Work) => void;
  onDelete: (work: Work) => void;
  onFeaturedToggle: (work: Work) => void;
  isAuthenticated: boolean;
}

export function WorksGrid({
  works,
  isLoading = false,
  onWorkClick,
  onEdit,
  onDelete,
  onFeaturedToggle,
  isAuthenticated,
}: WorksGridProps) {
  const [columns, setColumns] = useState(3);
  const [lazyLoading, setLazyLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 响应式列数
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setColumns(1);
      } else if (width < 1024) {
        setColumns(2);
      } else {
        setColumns(3);
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // 模拟懒加载
  useEffect(() => {
    setLazyLoading(true);
    const timer = setTimeout(() => {
      setLazyLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [works]);

  // 最终加载状态 = 外部传入的加载状态 或 内部懒加载状态
  const showLoading = isLoading || lazyLoading;

  // 将作品分配到各列（瀑布流算法）
  const getColumns = useCallback(() => {
    const columnHeights = new Array(columns).fill(0);
    const columnWorks: Work[][] = Array.from({ length: columns }, () => []);

    works.forEach((work) => {
      // 找到最短的列
      const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
      columnWorks[shortestColumn].push(work);
      // 估算高度（实际高度会在卡片中根据图片比例计算）
      const workHeight = work.type === 'video' ? 300 : work.type === 'audio' ? 250 : work.type === 'pdf' ? 250 : 280;
      columnHeights[shortestColumn] += workHeight;
    });

    return columnWorks;
  }, [works, columns]);

  if (showLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (works.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <svg
          className="w-16 h-16 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <p className="text-lg">暂无作品</p>
        <p className="text-sm mt-2">点击右上角"添加作品"开始创建</p>
      </div>
    );
  }

  const columnWorks = getColumns();

  return (
    <div ref={containerRef} className="w-full">
      {/* 瀑布流布局 */}
      <div className="flex gap-4">
        {columnWorks.map((column, columnIndex) => (
          <div
            key={columnIndex}
            className="flex-1 flex flex-col gap-4"
          >
            {column.map((work) => (
              <WorkCard
                key={work.id}
                work={work}
                onClick={() => onWorkClick(work)}
                onEdit={isAuthenticated ? () => onEdit(work) : undefined}
                onDelete={isAuthenticated ? () => onDelete(work) : undefined}
                onFeaturedToggle={isAuthenticated ? () => onFeaturedToggle(work) : undefined}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
