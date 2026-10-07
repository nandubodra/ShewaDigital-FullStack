import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get('email');

  const apps = await prisma.application.findMany({
    include: {
      service: true,
      history: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const mapped = apps.map((app) => ({
    id: app.id,
    userEmail: app.userId,
    serviceId: app.serviceId,
    serviceName: app.service.name,
    status: app.status.toLowerCase(),
    formData: app.formData as Record<string, string>,
    uploadedFiles: (app.uploadedFiles as any[]) || [],
    history: app.history.map((h) => ({
      status: h.status.toLowerCase(),
      note: h.note || '',
      createdAt: h.createdAt.toISOString()
    }))
  }));

  if (email) {
    return NextResponse.json(mapped.filter((app) => app.userEmail.toLowerCase() === email.toLowerCase()));
  }

  return NextResponse.json(mapped);
}

export async function POST(req: Request) {
  const body = await req.json();

  const { userId, serviceId, formData, uploadedFiles } = body;

  if (!userId || !serviceId) {
    return NextResponse.json({ error: 'User and service are required.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: String(userId) } });
  if (!user) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  const service = await prisma.service.findUnique({ where: { id: String(serviceId) } });
  if (!service) {
    return NextResponse.json({ error: 'Service not found.' }, { status: 404 });
  }

  const app = await prisma.application.create({
    data: {
      userId: user.id,
      serviceId: service.id,
      formData: formData || {},
      uploadedFiles: uploadedFiles || [],
      status: 'PENDING',
      history: {
        create: {
          status: 'PENDING',
          note: 'Application submitted by citizen'
        }
      }
    },
    include: {
      service: true,
      history: true
    }
  });

  return NextResponse.json({
    id: app.id,
    userEmail: user.email,
    serviceId: app.serviceId,
    serviceName: app.service.name,
    status: app.status.toLowerCase(),
    formData: app.formData as Record<string, string>,
    uploadedFiles: (app.uploadedFiles as any[]) || [],
    history: app.history.map((h) => ({
      status: h.status.toLowerCase(),
      note: h.note || '',
      createdAt: h.createdAt.toISOString()
    }))
  }, { status: 201 });
}
