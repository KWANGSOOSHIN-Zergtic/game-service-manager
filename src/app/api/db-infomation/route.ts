import { NextResponse } from 'next/server';
import { saveDBCollection } from './db_infomation';

export async function GET() {
    const result = await saveDBCollection();
    return NextResponse.json(result);
} 