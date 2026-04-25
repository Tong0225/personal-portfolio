import { Metadata } from 'next';
import Link from 'next/link';
import { AboutPage } from '@/components/about-page';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: '关于我',
  description: '了解创意设计师的更多信息',
};

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回作品集
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      <AboutPage />
    </div>
  );
}
