'use client';

import { useEffect } from 'react';
import { seedDemoContent } from '@/lib/storage/seeder';

export function DemoSeederTrigger() {
  useEffect(() => {
    seedDemoContent();
  }, []);

  return null;
}
