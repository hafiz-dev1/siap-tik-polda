import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

/**
 * API Test untuk check database schema di production
 * Access: /api/test-db-schema
 * ONLY for SUPER_ADMIN
 */
export async function GET() {
  try {
    // Security: Only SUPER_ADMIN can access
    const session = await getSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({
        error: 'Unauthorized - SUPER_ADMIN only'
      }, { status: 403 });
    }

    // Test 1: Check pengguna.profilePictureUrl schema
    const penggunaSchema = await prisma.$queryRaw<Array<{
      column_name: string;
      data_type: string;
      character_maximum_length: number | null;
      is_nullable: string;
    }>>`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'pengguna' 
        AND column_name = 'profilePictureUrl'
    `;

    // Test 2: Check lampiran.path_file schema
    const lampiranSchema = await prisma.$queryRaw<Array<{
      column_name: string;
      data_type: string;
      character_maximum_length: number | null;
      is_nullable: string;
    }>>`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'lampiran' 
        AND column_name = 'path_file'
    `;

    // Test 3: Sample data check
    const sampleUser = await prisma.pengguna.findFirst({
      where: { profilePictureUrl: { not: null } },
      select: { 
        id: true,
        username: true,
        profilePictureUrl: true 
      }
    });

    const sampleLampiran = await prisma.lampiran.findFirst({
      select: {
        id: true,
        nama_file: true,
        path_file: true
      }
    });

    // Analyze results
    const analysis = {
      pengguna_profilePictureUrl: {
        schema: penggunaSchema,
        isCorrect: penggunaSchema[0]?.data_type === 'text',
        expected: 'text',
        actual: penggunaSchema[0]?.data_type || 'NOT FOUND',
        recommendation: penggunaSchema[0]?.data_type === 'text' 
          ? '✅ CORRECT' 
          : '❌ NEED MIGRATION - Run: ALTER TABLE pengguna ALTER COLUMN "profilePictureUrl" TYPE TEXT;'
      },
      lampiran_path_file: {
        schema: lampiranSchema,
        isCorrect: lampiranSchema[0]?.data_type === 'text',
        expected: 'text',
        actual: lampiranSchema[0]?.data_type || 'NOT FOUND',
        recommendation: lampiranSchema[0]?.data_type === 'text'
          ? '✅ CORRECT'
          : '❌ NEED MIGRATION - Run: ALTER TABLE lampiran ALTER COLUMN path_file TYPE TEXT;'
      },
      sampleData: {
        hasUserWithPhoto: !!sampleUser,
        photoIsBase64: sampleUser?.profilePictureUrl?.startsWith('data:') || false,
        photoLength: sampleUser?.profilePictureUrl?.length || 0,
        hasLampiran: !!sampleLampiran,
        lampiranIsBase64: sampleLampiran?.path_file?.startsWith('data:') || false,
        lampiranLength: sampleLampiran?.path_file?.length || 0,
      }
    };

    const overallStatus = 
      analysis.pengguna_profilePictureUrl.isCorrect && 
      analysis.lampiran_path_file.isCorrect
        ? '✅ ALL SCHEMAS CORRECT - Ready for Base64 uploads'
        : '❌ MIGRATION NEEDED - See recommendations below';

    return NextResponse.json({
      success: true,
      status: overallStatus,
      timestamp: new Date().toISOString(),
      analysis,
      nextSteps: analysis.pengguna_profilePictureUrl.isCorrect && analysis.lampiran_path_file.isCorrect
        ? [
            '1. Schema is correct ✅',
            '2. Deploy latest code to Vercel',
            '3. Test upload functionality',
            '4. Monitor for errors'
          ]
        : [
            '1. ⚠️ Run database migration (see recommendations)',
            '2. Verify schema again after migration',
            '3. Deploy latest code',
            '4. Test upload functionality'
          ]
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      note: 'Check database connection and permissions'
    }, { status: 500 });
  }
}
