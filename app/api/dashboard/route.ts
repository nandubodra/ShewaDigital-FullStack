import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const [totalUsers, totalApplications, pending, inProcess, approved, rejected] = await Promise.all([
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.application.count(),
    prisma.application.count({ where: { status: 'PENDING' } }),
    prisma.application.count({ where: { status: 'IN_PROCESS' } }),
    prisma.application.count({ where: { status: 'APPROVED' } }),
    prisma.application.count({ where: { status: 'REJECTED' } })
  ]);

  return NextResponse.json({
    totalUsers,
    totalApplications,
    pending,
    in_process: inProcess,
    approved,
    rejected
  });
}
