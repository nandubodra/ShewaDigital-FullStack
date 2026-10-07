import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { status, note } = await req.json();

  const app = await prisma.application.findUnique({
    where: { id: params.id }
  });

  if (!app) {
    return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
  }

  const updated = await prisma.application.update({
    where: { id: params.id },
    data: {
      status: status || app.status,
      history: {
        create: {
          status: status || app.status,
          note: note || 'Status updated by government office'
        }
      }
    },
    include: {
      history: true,
      service: true
    }
  });

  return NextResponse.json({
    id: updated.id,
    serviceId: updated.serviceId,
    serviceName: updated.service.name,
    status: updated.status.toLowerCase(),
    formData: updated.formData as Record<string, string>,
    uploadedFiles: (updated.uploadedFiles as any[]) || [],
    history: updated.history.map((h) => ({
      status: h.status.toLowerCase(),
      note: h.note || '',
      createdAt: h.createdAt.toISOString()
    }))
  });
}
