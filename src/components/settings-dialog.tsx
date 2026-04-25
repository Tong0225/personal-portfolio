'use client';

import { useState, useEffect } from 'react';
import { passwordStorage } from '@/lib/works';
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
import { AlertTriangle, Lock, Unlock, FolderOpen } from 'lucide-react';
import { CategoryManager } from './category-manager';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPasswordVerified: () => void;
  onCategoriesChange?: () => void;
}

export function SettingsDialog({
  open,
  onOpenChange,
  onPasswordVerified,
  onCategoriesChange,
}: SettingsDialogProps) {
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);

  useEffect(() => {
    if (open) {
      const enabled = passwordStorage.isEnabled();
      const hasPassword = passwordStorage.get() !== '';
      setPasswordEnabled(enabled);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
      setConfirmError('');
      setIsAuthenticated(!enabled || !hasPassword);
      setIsChangingPassword(false);
    }
  }, [open]);

  // 处理密码保护开关变化
  const handlePasswordToggle = (checked: boolean) => {
    if (checked) {
      // 开启密码保护
      if (passwordStorage.get() === '') {
        // 没有密码，先设置密码
        setIsChangingPassword(true);
        setPasswordEnabled(true);
      } else {
        // 有密码，先验证
        setIsChangingPassword(true);
        setPasswordEnabled(true);
      }
    } else {
      // 关闭密码保护，需要验证密码
      if (passwordStorage.get() !== '') {
        setIsChangingPassword(true);
        setPasswordEnabled(false);
      } else {
        passwordStorage.setEnabled(false);
        onPasswordVerified();
        onOpenChange(false);
      }
    }
  };

  // 验证现有密码
  const handleVerifyPassword = () => {
    if (passwordStorage.verify(currentPassword)) {
      setIsAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('密码错误，请重试');
    }
  };

  // 保存新密码
  const handleSavePassword = () => {
    // 如果是开启密码保护且没有现有密码，或修改密码
    if (!currentPassword && passwordStorage.get() !== '') {
      setPasswordError('请先验证当前密码');
      return;
    }

    if (passwordStorage.get() !== '' && !passwordStorage.verify(currentPassword)) {
      setPasswordError('当前密码错误');
      return;
    }

    if (newPassword.length < 4) {
      setConfirmError('密码长度至少4位');
      return;
    }

    if (newPassword !== confirmPassword) {
      setConfirmError('两次输入的密码不一致');
      return;
    }

    if (newPassword) {
      passwordStorage.set(newPassword);
    }
    passwordStorage.setEnabled(passwordEnabled);
    onPasswordVerified();
    onOpenChange(false);
  };

  // 清除密码
  const handleClearPassword = () => {
    passwordStorage.clear();
    setPasswordEnabled(false);
    setNewPassword('');
    setConfirmPassword('');
    setIsAuthenticated(true);
    onPasswordVerified();
    onOpenChange(false);
  };

  const hasExistingPassword = passwordStorage.get() !== '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            密码保护设置
          </DialogTitle>
          <DialogDescription>
            设置密码以保护作品管理功能
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 密码保护开关 */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="password-enabled" className="flex items-center gap-2">
                {passwordEnabled ? (
                  <Lock className="w-4 h-4 text-green-500" />
                ) : (
                  <Unlock className="w-4 h-4 text-muted-foreground" />
                )}
                启用密码保护
              </Label>
              <p className="text-sm text-muted-foreground">
                {passwordEnabled ? '已启用，编辑和删除需要密码' : '关闭后所有人可管理作品'}
              </p>
            </div>
            <Switch
              id="password-enabled"
              checked={passwordEnabled}
              onCheckedChange={handlePasswordToggle}
            />
          </div>

          {/* 需要验证密码的情况 */}
          {isChangingPassword && (
            <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
              {/* 第一步：验证现有密码（如果有） */}
              {hasExistingPassword && !isAuthenticated && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    请输入当前密码以继续
                  </Label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="输入当前密码"
                  />
                  {passwordError && (
                    <p className="text-sm text-destructive">{passwordError}</p>
                  )}
                  <Button onClick={handleVerifyPassword} className="w-full">
                    验证密码
                  </Button>
                </div>
              )}

              {/* 第二步：设置/修改密码 */}
              {(!hasExistingPassword || isAuthenticated) && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    {hasExistingPassword ? '设置新密码' : '设置密码'}
                  </Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="输入新密码（至少4位）"
                  />
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="再次输入密码"
                  />
                  {confirmError && (
                    <p className="text-sm text-destructive">{confirmError}</p>
                  )}
                  <Button onClick={handleSavePassword} className="w-full">
                    保存设置
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordEnabled(hasExistingPassword);
                    }}
                    className="w-full"
                  >
                    取消
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* 清除密码保护 */}
          {hasExistingPassword && passwordEnabled && !isChangingPassword && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  清除密码保护
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确定清除密码保护？</AlertDialogTitle>
                  <AlertDialogDescription>
                    清除后，所有人无需密码即可管理作品，此操作不可撤销。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearPassword}>
                    确定清除
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* 分类管理 */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsCategoryManagerOpen(true)}
          >
            <FolderOpen className="mr-2 h-4 w-4" />
            管理分类
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* 分类管理弹窗 */}
      <CategoryManager
        open={isCategoryManagerOpen}
        onOpenChange={setIsCategoryManagerOpen}
        onCategoriesChange={onCategoriesChange}
      />
    </Dialog>
  );
}
