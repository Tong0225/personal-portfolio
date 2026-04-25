import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from './supabase-client';

export async function GET() {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('works')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ works: data || [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { works } = await request.json();
    
    if (!Array.isArray(works)) {
      return NextResponse.json({ error: 'Invalid works data' }, { status: 400 });
    }
    
    const client = getSupabaseClient();
    
    // 获取云端所有作品
    const { data: cloudWorks, error: fetchError } = await client
      .from('works')
      .select('id');
    
    if (fetchError) {
      // 检查是否是连接错误
      if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('fetch failed')) {
        return NextResponse.json({ 
          error: '云端服务未配置，请联系管理员配置 Supabase 数据库', 
          code: 'SERVICE_NOT_CONFIGURED' 
        }, { status: 503 });
      }
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }
    
    const cloudIds = new Set((cloudWorks || []).map((w: { id: string }) => w.id));
    const localIds = new Set(works.map((w: { id: string }) => w.id));
    
    // 插入或更新本地作品
    for (const work of works) {
      if (cloudIds.has(work.id)) {
        // 更新
        await client
          .from('works')
          .update({ 
            ...work, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', work.id);
      } else {
        // 插入
        await client.from('works').insert(work);
      }
    }
    
    // 删除云端有但本地没有的作品
    for (const cloudWork of cloudWorks || []) {
      if (!localIds.has(cloudWork.id)) {
        await client.from('works').delete().eq('id', cloudWork.id);
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    // 检查是否是环境变量缺失错误
    if (error instanceof Error && error.message.includes('Missing Supabase credentials')) {
      return NextResponse.json({ 
        error: '云端同步功能暂不可用，数据库服务未配置', 
        code: 'SERVICE_NOT_CONFIGURED' 
      }, { status: 503 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
