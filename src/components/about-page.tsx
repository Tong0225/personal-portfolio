'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Github, Play, MessageCircle, Mail, Phone, MapPin, Book, Award, Briefcase } from 'lucide-react';

interface AboutPageProps {
  onBack?: () => void;
}

export function AboutPage({ onBack }: AboutPageProps) {
  // 个人基本信息
  const personalInfo = {
    name: '朱桐',
    phone: '18673564765',
    email: '3110205186@qq.com',
    gmail: 'zmutong@gmail.com',
    gender: '女',
    location: '湖南郴州',
    education: '本科（2026届）',
    school: '湘南学院 · 新闻学',
  };

  // 技能标签
  const skills = [
    { category: '办公软件', items: ['WPS', 'Office'] },
    { category: '拍摄', items: ['摄影', '摄像'] },
    { category: '剪辑', items: ['剪映', 'Pr', 'Au', 'DaVinci Resolve'] },
    { category: '设计', items: ['Ps', 'UI设计'] },
    { category: 'AI工具', items: ['扣子', '即梦', 'Banana'] },
    { category: '编辑工具', items: ['135编辑器', '秀米', '易企秀'] },
  ];

  // 荣誉奖项
  const honors = [
    { title: '湖南省双减公益广告大赛三等奖', type: 'A类', role: '导演' },
    { title: '"用英语讲好湖南故事"三等奖', type: '纪录片类', role: '导演/编剧' },
    { title: '"郴山郴水郴情"文学作品大赛年度三等奖', type: '作品已出版' },
    { title: '优秀青年志愿者', type: '' },
    { title: '连续三年综合测评排名前15%', type: '三次校级奖学金' },
  ];

  // 社交链接
  const socialLinks = [
    { name: 'QQ邮箱', icon: Mail, url: 'mailto:3110205186@qq.com', color: 'hover:bg-blue-500' },
    { name: 'Gmail', icon: Mail, url: 'mailto:zmutong@gmail.com', color: 'hover:bg-red-500' },
    { name: 'GitHub', icon: Github, url: 'https://github.com/Tong0225', color: 'hover:bg-gray-800' },
    { name: 'B站', icon: Play, url: 'https://bilibili.com', color: 'hover:bg-pink-500' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* 头部 */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* 头像 */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-4xl font-bold text-primary-foreground">
                Z
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-green-500 border-4 border-background flex items-center justify-center">
                <span className="text-xs text-white font-bold">26</span>
              </div>
            </div>

            {/* 名称和简介 */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">{personalInfo.name}</h1>
              <p className="text-muted-foreground max-w-md">
                新闻学专业学生，热爱新媒体运营与内容创作，擅长视频拍摄剪辑与图文编辑
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {personalInfo.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {personalInfo.email}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {personalInfo.gmail}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {personalInfo.location}
                </span>
              </div>
            </div>

            {/* 社交链接 */}
            <div className="flex gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-12 h-12 rounded-full bg-muted flex items-center justify-center transition-all ${link.color} text-muted-foreground hover:text-white`}
                  title={link.name}
                >
                  <link.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* 教育背景 */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Book className="w-5 h-5 text-primary" />
              教育背景
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{personalInfo.school}</div>
                  <div className="text-sm text-muted-foreground">新闻学 · 本科</div>
                </div>
                <div className="text-sm text-muted-foreground">2022.09 - 2026.06</div>
              </div>
              <div className="text-sm text-muted-foreground">
                连续三年综合测评排名在年级前15%，三次校级奖学金
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 技能标签 */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">专业技能</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {skills.map((skill) => (
                <div key={skill.category} className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">{skill.category}</div>
                  <div className="flex flex-wrap gap-1">
                    {skill.items.map((item) => (
                      <Badge key={item} variant="secondary" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 荣誉奖项 */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              荣誉奖项
            </h2>
            <div className="space-y-4">
              {honors.map((honor, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium">{honor.title}</div>
                    <div className="flex gap-2 text-sm text-muted-foreground mt-1">
                      {honor.type && (
                        <Badge variant="outline" className="text-xs">{honor.type}</Badge>
                      )}
                      {honor.role && (
                        <Badge variant="outline" className="text-xs">{honor.role}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 工作经历 */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              工作经历
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">盛美文化有限公司（网易郴州）</div>
                    <div className="text-sm text-muted-foreground">编导、新媒体运营</div>
                  </div>
                  <div className="text-sm text-muted-foreground">2025.12 - 2026.04</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 实习经历 */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              实习经历
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">中央广播电台905国资政务中心</div>
                    <div className="text-sm text-muted-foreground">新媒体编辑、运营</div>
                  </div>
                  <div className="text-sm text-muted-foreground">2025.06 - 2025.11</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">湘潭大学教授唐湘岳工作室</div>
                    <div className="text-sm text-muted-foreground">工作室记者</div>
                  </div>
                  <div className="text-sm text-muted-foreground">2022.12 - 2025.01</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 普通话和英语 */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">语言能力</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg text-center">
                <div className="text-2xl font-bold">二级甲等</div>
                <div className="text-sm text-muted-foreground">普通话水平测试</div>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <div className="text-2xl font-bold">CET-4</div>
                <div className="text-sm text-muted-foreground">大学英语四级</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 个人介绍 */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">关于我</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                你好！我叫朱桐，来自湖南郴州，目前是湘南学院新闻学专业的大四学生。
              </p>
              <p>
                我热爱新媒体内容创作，对视频拍摄剪辑、图文编辑都有丰富的实践经验。
                曾参与过多项公益广告和纪录片的创作，获得了省级比赛的奖项认可。
              </p>
              <p>
                这个作品集网站用来展示我的创意作品，包括设计作品、视频作品、摄影作品等。
                如果你对我感兴趣，或者想要合作，欢迎联系我！
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 底部 */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>© {personalInfo.name} · 创意作品集</p>
        </div>
      </div>
    </div>
  );
}
