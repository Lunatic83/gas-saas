import { toNextJsHandler } from 'better-auth/next-js';

import { auth } from '@/lib/auth';

export const GET = toNextJsHandler(auth).GET;
export const POST = toNextJsHandler(auth).POST;
