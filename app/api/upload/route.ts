import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  const formData = await req.formData();
  const files = formData.getAll('files');

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadDir, { recursive: true });

  const saved: Array<{ name: string; path: string }> = [];

  for (const file of files) {
    const f = file as File;
    const buffer = Buffer.from(await f.arrayBuffer());
    const safeName = `${Date.now()}-${f.name.replace(/\s+/g, '-')}`;
    const target = path.join(uploadDir, safeName);

    await writeFile(target, buffer);

    saved.push({
      name: f.name,
      path: `/uploads/${safeName}`
    });
  }

  return NextResponse.json({ files: saved });
}
