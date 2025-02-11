import { NextResponse } from 'next/server';
import { DataSource } from 'typeorm';
import { DB_COLLECTION } from '../../db-information/db-collection';
import jwt from 'jsonwebtoken';

// 로그인 요청 타입 정의
interface LoginRequest {
  username: string;
  password: string;
}

// 관리자 계정 인터페이스
interface ServiceAdminAccount {
  index: number;
  id: string;
  password: string;
  name: string;
  type: string;
  ip: string;
  mac_addr: string;
  description: string;
  createAt: Date;
  updateAt: Date;
}

export async function POST(request: Request) {
  let AppDataSource: DataSource | null = null;
  
  try {
    const body: LoginRequest = await request.json();
    const { username, password } = body;

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

    // 관리자 계정 조회 쿼리
    const query = `
      SELECT * FROM public.service_admin_account 
      WHERE id = $1 AND password = $2
    `;
    
    console.log('관리자 계정 조회 시작:', { username });
    const admins = await AppDataSource.query(query, [username, password]);
    console.log('조회된 계정 수:', admins.length);

    if (!admins || admins.length === 0) {
      return NextResponse.json(
        { error: '아이디 또는 비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      );
    }

    const admin: ServiceAdminAccount = admins[0];

    // JWT 토큰 생성
    const token = jwt.sign(
      { 
        adminId: admin.id,
        adminIndex: admin.index,
        adminName: admin.name,
        adminType: admin.type
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    // 성공 응답
    return NextResponse.json({
      success: true,
      message: '로그인 성공',
      token,
      admin: {
        index: admin.index,
        id: admin.id,
        name: admin.name,
        type: admin.type,
        description: admin.description
      },
    });
  } catch (error) {
    console.error('로그인 에러:', error);
    return NextResponse.json(
      { error: '로그인 처리 중 오류가 발생했습니다.' },
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