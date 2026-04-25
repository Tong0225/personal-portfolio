import { NextRequest, NextResponse } from 'next/server';

const JSONBIN_API = 'https://api.jsonbin.io/v3';
// 默认的公开 bin ID（任何人打开链接都能看到最新数据）
const DEFAULT_BIN_ID = '69ec3e18856a6821896df20a';
// 默认的 API Key（用户注册的）
const DEFAULT_API_KEY = '$2a$10$bcr2h4UhMgMcd5c/T2XasepW7CqrX/yYzJMM94oNc9EiVmUgDF4bO';

// 获取云端数据
async function fetchFromCloud(binId: string, apiKey?: string) {
  const url = `${JSONBIN_API}/b/${binId}/latest`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (apiKey) {
    headers['X-Master-Key'] = apiKey;
  }

  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    if (response.status === 404) {
      return null; // bin 不存在
    }
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.record?.works || data.record || [];
}

// 保存数据到云端
async function saveToCloud(binId: string, works: any[], apiKey?: string) {
  if (!apiKey) {
    throw new Error('需要 API Key 才能保存数据');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Master-Key': apiKey,
  };

  // 尝试更新现有 bin
  const updateUrl = `${JSONBIN_API}/b/${binId}`;
  const updateResponse = await fetch(updateUrl, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ works }),
  });

  if (updateResponse.ok) {
    return { success: true, binId };
  }

  // 如果更新失败，尝试创建新 bin
  const createUrl = `${JSONBIN_API}/b`;
  const createResponse = await fetch(createUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ works }),
  });

  if (!createResponse.ok) {
    throw new Error(`Save failed: ${createResponse.status}`);
  }

  const result = await createResponse.json();
  return { success: true, binId: result.metadata.id };
}

// 获取云端数据
export async function GET(request: NextRequest) {
  try {
    // 从查询参数获取配置，默认使用默认的 bin
    const url = new URL(request.url);
    const binId = url.searchParams.get('binId') || DEFAULT_BIN_ID;
    const apiKey = url.searchParams.get('apiKey') || DEFAULT_API_KEY;

    // 获取云端数据
    const works = await fetchFromCloud(binId, apiKey);
    
    if (works === null) {
      // bin 不存在，返回空数据
      return NextResponse.json({ works: [] });
    }

    return NextResponse.json({ works });
  } catch (error) {
    console.error('JSONBin fetch error:', error);
    return NextResponse.json({ works: [] });
  }
}

// 保存数据到云端
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { works, binId: customBinId, apiKey: customApiKey } = body;
    
    if (!Array.isArray(works)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // 优先使用前端传来的配置，否则使用默认值
    const binId = customBinId || DEFAULT_BIN_ID;
    const apiKey = customApiKey || DEFAULT_API_KEY;
    
    const result = await saveToCloud(binId, works, apiKey);
    return NextResponse.json(result);
  } catch (error) {
    console.error('JSONBin save error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '保存到云端失败' },
      { status: 500 }
    );
  }
}
