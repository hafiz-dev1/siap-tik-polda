// file: app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username dan password diperlukan" }, { status: 400 });
    }

    const pengguna = await prisma.pengguna.findUnique({
      where: { username },
      select: { id: true, role: true, password: true, deletedAt: true },
    });
    if (!pengguna || pengguna.deletedAt !== null) {
      return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, pengguna.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
    }

    // Pastikan payload token berisi 'role'
    const token = jwt.sign(
      { operatorId: pengguna.id, role: pengguna.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    // Return no content for faster client handling; cookie carries session
    const response = new NextResponse(null, { status: 204 });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}