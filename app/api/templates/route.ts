import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Example template registry for Phase 4
  const templates = [
    {
      id: 'pixel-standard',
      name: 'Pixel OS Standard',
      description: 'The classic terminal-inspired layout.',
      isPremium: false,
      thumbnailUrl: '/templates/pixel-standard.png'
    },
    {
      id: 'executive-deep',
      name: 'Executive Deep',
      description: 'Clean, dense layout for senior roles.',
      isPremium: true,
      thumbnailUrl: '/templates/executive-deep.png'
    }
  ];

  return NextResponse.json({ templates });
}
