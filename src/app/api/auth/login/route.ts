// file: app/api/auth/login/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // 1. Validasi input
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username dan password diperlukan" },
        { status: 400 }
      );
    }

    // 2. Cari operator di database
    const operator = await prisma.operator.findUnique({
      where: { username },
    });

    if (!operator) {
      return NextResponse.json(
        { error: "Username atau password salah" },
        { status: 401 } // Unauthorized
      );
    }

    // 3. Bandingkan password yang diinput dengan hash di database
    const isPasswordValid = await bcrypt.compare(password, operator.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Username atau password salah" },
        { status: 401 }
      );
    }

    // 4. Jika valid, buat JWT
    const token = jwt.sign(
      { operatorId: operator.id },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" } // Token berlaku selama 1 hari
    );

    // 5. Buat respons dan atur token di httpOnly cookie
    const response = NextResponse.json({
      message: "Login berhasil",
      success: true,
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 hari
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}