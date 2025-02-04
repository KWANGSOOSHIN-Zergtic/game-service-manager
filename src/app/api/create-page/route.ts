import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { category, pageName } = await request.json();

    // Pascal Case로 변환하는 함수
    const toPascalCase = (str: string): string => {
      return str.split('-')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
    };

    // 기본 페이지 템플릿
    const pageTemplate = `'use client';

import { PageContainer } from "@/components/layout/page-container";

export default function ${toPascalCase(pageName)}Page() {
  return (
    <PageContainer path="${category}/${pageName}">
      <div>
        <h1>${toPascalCase(pageName).split(/(?=[A-Z])/).join(' ')}</h1>
      </div>
    </PageContainer>
  );
}
`;

    // 페이지 디렉토리 경로 생성
    const pageDir = path.join(process.cwd(), 'src', 'app', '(main)', category, pageName);
    const pagePath = path.join(pageDir, 'page.tsx');

    // menu.ts 파일 경로
    const menuPath = path.join(process.cwd(), 'src', 'config', 'menu.ts');

    // 디렉토리가 없으면 생성
    await fs.mkdir(pageDir, { recursive: true });

    // 페이지 파일 생성
    await fs.writeFile(pagePath, pageTemplate, 'utf-8');

    // menu.ts 파일 읽기
    const menuContent = await fs.readFile(menuPath, 'utf-8');
    
    // 메인 카테고리 찾기
    const mainCategoryMatch = menuContent.match(new RegExp(`path:\\s*"${category}"[^}]*icon:\\s*([^,\\n]*)`));
    if (!mainCategoryMatch) {
      throw new Error('메인 카테고리를 찾을 수 없습니다.');
    }
    
    const mainCategoryIcon = mainCategoryMatch[1].trim();

    // 새로운 메뉴 아이템 생성
    const newMenuItem = `      { path: "${category}/${pageName}", icon: ${mainCategoryIcon}, label: "${toPascalCase(pageName)}", showInSidebar: true }`;

    // subItems 배열이 있는지 확인
    const hasSubItems = menuContent.includes(`path: "${category}",`) && menuContent.includes('subItems: [');

    let updatedContent;
    if (hasSubItems) {
      // subItems 배열의 마지막 항목을 찾아서 그 뒤에 새 항목 추가
      updatedContent = menuContent.replace(
        new RegExp(`(path:\\s*"${category}"[^}]*subItems:\\s*\\[[^\\]]*)(\\s*\\])`, 'g'),
        `$1,\n${newMenuItem}$2`
      );
    } else {
      // subItems 배열 새로 생성
      updatedContent = menuContent.replace(
        new RegExp(`({\\s*path:\\s*"${category}"[^}]*)(})`, 'g'),
        `$1,\n    subItems: [\n${newMenuItem}\n    ]$2`
      );
    }

    // menu.ts 파일 업데이트
    await fs.writeFile(menuPath, updatedContent, 'utf-8');

    return NextResponse.json({ 
      success: true, 
      message: '페이지가 성공적으로 생성되었습니다.',
      path: `/${category}/${pageName}` 
    });

  } catch (error) {
    console.error('페이지 생성 중 오류 발생:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: '페이지 생성에 실패했습니다.' 
      },
      { status: 500 }
    );
  }
} 