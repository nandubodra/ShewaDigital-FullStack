import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const services = await prisma.service.findMany({
    orderBy: { createdAt: 'asc' }
  });

  if (services.length === 0) {
    const seed = [
      {
        slug: 'pan-card',
        name: 'PAN Card',
        fee: '₹107',
        time: '15-20 days',
        eligibility: 'Any Indian citizen aged 18+ or guardian for minors.',
        docs: ['Aadhaar card', 'Passport photo', 'DOB proof', 'Address proof']
      },
      {
        slug: 'voter-id',
        name: 'Voter ID Card',
        fee: 'Free',
        time: '30 days',
        eligibility: 'Indian citizen aged 18 years or above.',
        docs: ['Aadhaar card', 'Passport photo', 'Age proof', 'Address proof']
      },
      {
        slug: 'income-certificate',
        name: 'Income Certificate',
        fee: '₹30',
        time: '7-15 days',
        eligibility: 'Resident of the state where the certificate is applied.',
        docs: ['Aadhaar card', 'Ration card', 'Income proof', 'Address proof']
      },
      {
        slug: 'driving-license',
        name: 'Driving License',
        fee: '₹200-1000',
        time: '15-30 days',
        eligibility: '16+ for gearless vehicles, 18+ for gear vehicles.',
        docs: ['Aadhaar card', 'Passport photo', 'Learner license', 'Address proof']
      }
    ];

    for (const item of seed) {
      await prisma.service.create({ data: item });
    }

    return NextResponse.json(seed);
  }

  return NextResponse.json(services);
}
