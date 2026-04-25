# 个人创意作品集网站

## 项目概述
基于项目书实现的个人创意作品集展示网站，支持多种文件类型的在线预览和管理，云端数据同步。

## 技术栈
- **框架**: Next.js 16 (App Router)
- **核心**: React 19
- **语言**: TypeScript 5
- **UI组件**: shadcn/ui (基于 Radix UI)
- **样式**: Tailwind CSS 4
- **数据库**: Supabase PostgreSQL
- **存储**: S3 兼容对象存储

## 最近修复
- ✅ 修复 work-modal.tsx 重复关闭按钮问题
- ✅ 修复删除功能：密码验证后可继续删除操作
- ✅ 添加自定义分类管理功能（支持添加/删除一二级分类）

## 目录结构
```
src/
├── app/                    # 页面路由
│   ├── api/               # API接口
│   │   ├── fetch/         # URL内容获取接口
│   │   ├── sync/          # 数据同步接口
│   │   │   ├── route.ts
│   │   │   └── supabase-client.ts
│   │   └── upload/        # 文件上传接口
│   ├── about/             # 关于页面
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # 组件
│   ├── ui/                # shadcn UI组件
│   ├── header.tsx         # 顶部导航
│   ├── sidebar.tsx         # 侧边栏
│   ├── works-grid.tsx      # 瀑布流作品列表
│   ├── work-card.tsx       # 作品卡片
│   ├── work-modal.tsx      # 作品预览弹窗
│   ├── work-form.tsx       # 作品表单
│   ├── category-filter.tsx  # 分类筛选
│   ├── settings-dialog.tsx  # 设置弹窗
│   ├── sync-settings.tsx   # 同步设置弹窗
│   ├── password-dialog.tsx # 密码验证弹窗
│   ├── about-page.tsx      # 关于页面组件
│   └── theme-provider.tsx  # 主题Provider
└── lib/
    ├── utils.ts            # 工具函数
    └── works.ts            # 作品数据管理
```

## 功能清单

### P0核心功能
- ✅ 作品管理（上传、分类、编辑、删除）
- ✅ 深色/浅色主题切换 + 跟随系统
- ✅ 文件预览（图片、视频、PDF）
- ✅ 密码保护（编辑/删除需验证）
- ✅ 分类筛选（支持一二级分类）

### 推荐功能
- ✅ 作品详情页 + 标签系统
- ✅ 关键词搜索
- ✅ 瀑布流布局 + 懒加载
- ✅ 关于页面 + 社交链接
- ✅ 精选标记
- ✅ 数据导出

### 新增功能
- ✅ 云端数据同步（跨设备访问）
- ✅ 图片/视频/缩略图上传
- ✅ 自定义分类管理

## 预览地址
http://localhost:5000

## 开发命令
```bash
pnpm dev    # 开发环境
pnpm build  # 构建
pnpm start  # 生产环境
```

## 数据库表结构

### works 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | varchar | 主键 |
| title | varchar | 作品标题 |
| type | varchar | 类型（image/video/pdf） |
| category | varchar | 分类ID（一级:二级格式） |
| sub_category | varchar | 二级分类名称 |
| tags | jsonb | 标签数组 |
| description | text | 描述 |
| source | text | 资源链接/B站BV号 |
| thumbnail | text | 缩略图 |
| featured | boolean | 是否精选 |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |

## 注意事项
- 作品数据默认存储在 localStorage
- 开启同步后，数据会同步到云端数据库
- 视频支持B站iframe嵌入或直接上传视频

## 云端同步功能状态

### 当前状态
- ✅ 使用 JSONBin.io 实现云端同步
- ✅ **默认使用共享存储**：任何人打开链接都会自动显示最新数据
- ✅ 添加/编辑/删除作品后自动同步到云端
- ✅ 支持保存作品链接、缩略图等所有数据

### 使用方法

#### 默认模式（推荐）
无需任何配置！任何人打开链接都会自动获取最新数据。

#### 自定义同步密钥
如果需要区分不同用户的数据：
1. 打开"同步"设置
2. 输入自定义密钥
3. 点击"同步到云端"

#### 获取 API Key（可选）
注册后可实现数据持久保存：
1. 访问 [jsonbin.io/register](https://jsonbin.io/register) 注册免费账号
2. 获取 API Key
3. 在同步设置中粘贴

### 优势
- 发送给任何人都会自动显示最新内容
- 无需手动同步操作
- 数据完全由您掌控
- 支持所有作品类型（图片链接、视频链接、PDF链接等）
- 免费额度充足
- PDF使用PDF.js预览
- 主题切换自动保存到localStorage
- 关于页面根据朱桐简历内容定制
