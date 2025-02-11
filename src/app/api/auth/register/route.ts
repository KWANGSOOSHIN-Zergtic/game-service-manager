import { NextResponse } from 'next/server';
import { DataSource } from 'typeorm';
import { DB_COLLECTION } from '../../db-information/db-collection';
import bcrypt from 'bcryptjs';

// 관리자 계정 생성 요청 타입 정의
interface RegisterRequest {
  username: string;
  password: string;
  name: string;
  type: string;
  description?: string;
}

export async function POST(request: Request) {
  let AppDataSource: DataSource | null = null;
  
  try {
    const body: RegisterRequest = await request.json();
    const { username, password, name, type, description = '' } = body;

    // football_service DB 설정 가져오기
    const dbConfig = DB_COLLECTION['football_service'];
    if (!dbConfig) {
      return NextResponse.json(
        { error: 'DB 설정을 찾을 수 없습니다.' },
        { status: 500 }
      );
    }

    // DB 연결 설정
    AppDataSource = new DataSource({
      type: 'postgres',
      host: dbConfig.host,
      port: Number(dbConfig.port || '5432'),
      username: dbConfig.config.service_db.user,
      password: dbConfig.config.service_db.password,
      database: dbConfig.data_base,
      synchronize: false,
      logging: true,
    });

    // DB 연결
    await AppDataSource.initialize();
    console.log('DB 연결 성공');

    // 기존 계정 확인
    const existingUser = await AppDataSource.query(
      'SELECT * FROM public.service_admin_account WHERE id = $1',
      [username]
    );

    if (existingUser && existingUser.length > 0) {
      return NextResponse.json(
        { error: '이미 존재하는 계정입니다.' },
        { status: 400 }
      );
    }

    // 관리자 계정 생성 쿼리
    const query = `
      INSERT INTO public.service_admin_account 
      (id, password, name, type, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await AppDataSource.query(query, [
      username,
      password, // 실제 환경에서는 bcrypt.hash(password, 10) 사용
      name,
      type,
      description
    ]);

    console.log('관리자 계정 생성 완료:', result[0]);

    return NextResponse.json({
      success: true,
      message: '관리자 계정이 생성되었습니다.',
      admin: {
        id: result[0].id,
        name: result[0].name,
        type: result[0].type,
        description: result[0].description
      },
    });
  } catch (error) {
    console.error('관리자 계정 생성 에러:', error);
    return NextResponse.json(
      { error: '관리자 계정 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    // DB 연결 종료
    if (AppDataSource && AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('DB 연결 종료');
    }
  }
} 