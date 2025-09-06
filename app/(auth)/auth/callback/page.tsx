// app/(auth)/auth/callback/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import AuthCallbackClient from './AuthCallbackClient';

export default function Page() {
  return <AuthCallbackClient />;
}
