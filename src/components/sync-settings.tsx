'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Cloud, RefreshCw, Check, AlertCircle, Save, Info } from 'lucide-react';

const SYNC_LAST_TIME_KEY = 'portfolio-sync-last-time';
const JSONBIN_BIN_ID_KEY = 'portfolio-jsonbin-bin-id';
const JSONBIN_API_KEY_KEY = 'portfolio-jsonbin-api-key';
const JSONBIN_SYNC_KEY_KEY = 'portfolio-jsonbin-sync-key';

interface SyncSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSyncComplete?: () => void;
}

export function SyncSettings({ open, onOpenChange, onSyncComplete }: SyncSettingsProps) {
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // JSONBin.io 配置
  const [apiKey, setApiKey] = useState('');
  const [syncKey, setSyncKey] = useState('');
  const [binId, setBinId] = useState('');

  // 加载配置
  useEffect(() => {
    if (open) {
      setLastSyncTime(
        localStorage.getItem(SYNC_LAST_TIME_KEY) 
          ? parseInt(localStorage.getItem(SYNC_LAST_TIME_KEY)!) 
          : null
      );
      setApiKey(localStorage.getItem(JSONBIN_API_KEY_KEY) || '');
      setSyncKey(localStorage.getItem(JSONBIN_SYNC_KEY_KEY) || '');
      setBinId(localStorage.getItem(JSONBIN_BIN_ID_KEY) || '');
    }
  }, [open]);

  // 保存配置
  const saveConfig = () => {
    localStorage.setItem(JSONBIN_API_KEY_KEY, apiKey);
    localStorage.setItem(JSONBIN_SYNC_KEY_KEY, syncKey);
    localStorage.setItem(JSONBIN_BIN_ID_KEY, binId);
  };

  // 执行同步
  const handleSync = async () => {
    if (!syncKey.trim()) {
      setSyncMessage({ type: 'error', text: '请先输入同步密钥' });
      return;
    }

    setIsSyncing(true);
    setSyncMessage(null);

    try {
      // 生成基于 syncKey 的 binId
      const generatedBinId = 'portfolio-' + btoa(syncKey).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
      const currentBinId = generatedBinId;
      localStorage.setItem(JSONBIN_SYNC_KEY_KEY, syncKey);
      localStorage.setItem(JSONBIN_BIN_ID_KEY, currentBinId);
      setBinId(currentBinId);

      // 推送本地数据到云端
      const localData = localStorage.getItem('portfolio-works');
      const localWorks = localData ? JSON.parse(localData) : [];
      
      const response = await fetch('/api/jsonbin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          works: localWorks, 
          binId: currentBinId,
          apiKey: apiKey 
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        if (result.code === 'API_KEY_REQUIRED') {
          setSyncMessage({ 
            type: 'error', 
            text: '需要 JSONBin.io API Key 才能保存数据到同一位置。请注册获取免费 API Key。' 
          });
        } else {
          setSyncMessage({ type: 'error', text: result.error || '同步失败' });
        }
        return;
      }
      
      saveConfig();
      setSyncMessage({ type: 'success', text: `已同步 ${localWorks.length} 个作品` });

      const now = Date.now();
      setLastSyncTime(now);
      localStorage.setItem(SYNC_LAST_TIME_KEY, now.toString());
      
      onSyncComplete?.();
    } catch (error) {
      console.error('Sync error:', error);
      setSyncMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : '同步失败' 
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            云端同步
          </DialogTitle>
          <DialogDescription>
            自动同步作品数据，发送给任何人都会自动显示最新内容
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 使用说明 */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <p className="font-medium">已启用云端同步：</p>
                <p>• 每次打开网站会自动获取最新数据</p>
                <p>• 添加/编辑/删除作品后会自动同步</p>
                <p className="text-xs opacity-80">
                  <a 
                    href="https://jsonbin.io/register" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    点击这里注册 JSONBin.io 获取免费 API Key（可实现数据持久保存）
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* 同步密钥 */}
          <div className="space-y-2">
            <Label htmlFor="sync-key">同步密钥</Label>
            <Input
              id="sync-key"
              value={syncKey}
              onChange={(e) => setSyncKey(e.target.value)}
              placeholder="输入任意字符串作为同步密钥"
            />
            <p className="text-xs text-muted-foreground">
              同一密钥在不同设备可同步数据
            </p>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="api-key">JSONBin.io API Key（可选）</Label>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="粘贴您的 API Key"
            />
            <p className="text-xs text-muted-foreground">
              不填写则只能创建新存储，无法更新已有数据
            </p>
          </div>

          {/* 已保存的 Bin ID */}
          {binId && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm">当前存储 ID：</span>
                <code className="text-xs bg-muted-foreground/10 px-2 py-1 rounded">
                  {binId}
                </code>
              </div>
            </div>
          )}

          {/* 最后同步时间 */}
          {lastSyncTime && (
            <div className="text-sm text-muted-foreground">
              最后同步：{formatTime(lastSyncTime)}
            </div>
          )}

          {/* 同步结果提示 */}
          {syncMessage && (
            <div className={`p-3 rounded-lg flex items-center gap-2 ${
              syncMessage.type === 'success' 
                ? 'bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-200' 
                : 'bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-200'
            }`}>
              {syncMessage.type === 'success' ? (
                <Check className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              {syncMessage.text}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
          <Button 
            onClick={handleSync} 
            disabled={isSyncing || !syncKey.trim()}
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                同步中...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                同步到云端
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
