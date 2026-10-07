import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  const body = await req.json();

  const { name, email, phone, password, aadhaar, address, state, district } = body;

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Name, email and password are required.' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { email: String(email).toLowerCase() }
  });

  if (existing) {
    return NextResponse.json({ error: 'User already exists.' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(String(password), 12);

  const user = await prisma.user.create({
    data: {
      name: String(name),
      email: String(email).toLowerCase(),
      phone: phone ? String(phone) : null,
      aadhaar: aadhaar ? String(aadhaar) : null,
      address: address ? String(address) : null,
      state: state ? String(state) : null,
      district: district ? String(district) : null,
      passwordHash,
      role: 'USER'
    }
  });

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  }, { status: 201 });
}
