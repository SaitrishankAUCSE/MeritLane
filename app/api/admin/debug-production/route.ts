import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rolesSnapshot = await db.collection('roles').get();
    const roles = rolesSnapshot.docs.map(d => ({
      id: d.id,
      title: d.data().title,
      skills: d.data().skills,
      employerId: d.data().employerId
    }));

    const candsSnapshot = await db.collection('candidates').where('verificationStatus', '==', 'verified').get();
    const candidates = candsSnapshot.docs.map(d => {
      const data = d.data();
      return {
        uid: d.id,
        verificationStatus: data.verificationStatus,
        skills: data.skills || [],
        assessmentScores: data.assessmentScores || {},
        projects: (data.projects || []).map((p: any) => ({ title: p.title, description: p.description }))
      };
    });

    return NextResponse.json({
      commitSha: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
      roles,
      candidates
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
