import { NextResponse } from 'next/server';
import { adminDb as db } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!db) return NextResponse.json({ error: 'No db' }, { status: 500 });
  try {
    const rolesSnapshot = await db.collection('roles').where('title', '==', 'Python Full Stack Engineer').get();
    
    if (rolesSnapshot.empty) {
      return NextResponse.json({ message: 'Role not found' });
    }
    
    const roleDoc = rolesSnapshot.docs[0];
    const roleData = roleDoc.data();
    
    // Fix skills
    if (roleData.skills && roleData.skills.length === 1 && roleData.skills[0] === 'Python React Firebase') {
      await roleDoc.ref.update({
        skills: ['Python', 'React', 'Firebase']
      });
    }

    const updatedDoc = await roleDoc.ref.get();

    return NextResponse.json({
      commitSha: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
      fixedRole: { id: updatedDoc.id, ...updatedDoc.data() },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
