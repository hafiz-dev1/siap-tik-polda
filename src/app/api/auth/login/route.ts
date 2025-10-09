// file: app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { logActivity, ActivityDescriptions, getIpAddress, getUserAgent } from "@/lib/activityLogger";

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Login attempt started');
    const { username, password } = await request.json();
    console.log('📝 Username:', username);

    if (!username || !password) {
      console.log('❌ Missing username or password');
      return NextResponse.json({ error: "Username dan password diperlukan" }, { status: 400 });
    }

    console.log('🔍 Searching for user in database...');
    const pengguna = await prisma.pengguna.findUnique({
      where: { username },
      select: { id: true, username: true, nama: true, role: true, password: true, deletedAt: true },
    });
    
    if (!pengguna) {
      console.log('❌ User not found');
      
      // Log failed login attempt (create a temporary log without userId)
      // Note: We can't log to ActivityLog without a valid userId, so we'll skip it
      
      return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
    }
    
    console.log('✅ User found:', { id: pengguna.id, role: pengguna.role, deletedAt: pengguna.deletedAt });
    
    if (pengguna.deletedAt !== null) {
      console.log('❌ User is soft-deleted');
      return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
    }

    console.log('🔑 Verifying password...');
    const isPasswordValid = await bcrypt.compare(password, pengguna.password);
    console.log('🔑 Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      
      // Log failed login attempt
      await logActivity({
        userId: pengguna.id,
        category: 'AUTH',
        type: 'LOGIN',
        description: ActivityDescriptions.LOGIN_FAILED(pengguna.username),
        ipAddress: getIpAddress(request),
        userAgent: getUserAgent(request),
        status: 'FAILED',
      });
      
      return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
    }

    console.log('🎫 Checking JWT_SECRET...');
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET is not defined!');
      return NextResponse.json({ error: "Konfigurasi server tidak lengkap" }, { status: 500 });
    }
    console.log('✅ JWT_SECRET exists');

    console.log('🎫 Creating JWT token...');
    // Pastikan payload token berisi 'role', 'username', dan 'nama'
    const token = jwt.sign(
      { 
        operatorId: pengguna.id, 
        role: pengguna.role,
        username: pengguna.username,
        nama: pengguna.nama
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    console.log('✅ Token created');

    // ✅ DIPERBAIKI: Auto-detect production environment
    const isProduction = process.env.NODE_ENV === 'production' || 
                         process.env.VERCEL === '1' ||
                         process.env.RAILWAY_ENVIRONMENT === 'production';

    // Return JSON response dengan data user untuk memastikan cookie sudah diset
    const response = NextResponse.json(
      { 
        success: true,
        user: {
          id: pengguna.id,
          role: pengguna.role
        }
      }, 
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: isProduction,  // Auto-detect
      sameSite: isProduction ? "lax" : "strict",  // lax untuk HTTPS compatibility
      maxAge: 60 * 60 * 24,
      path: "/",
    });
    
    // Log successful login
    await logActivity({
      userId: pengguna.id,
      category: 'AUTH',
      type: 'LOGIN',
      description: ActivityDescriptions.LOGIN_SUCCESS(pengguna.username),
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      status: 'SUCCESS',
    });
    
    // Logging untuk debugging
    console.log('🍪 Cookie settings:', {
      secure: isProduction,
      sameSite: isProduction ? "lax" : "strict",
      environment: process.env.NODE_ENV,
    });
    return response;
  } catch (error) {
    console.error("❌❌❌ Login error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ 
      error: "Terjadi kesalahan pada server",
      details: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 });
  }
}