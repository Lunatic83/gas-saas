import { toNextJsHandler } from 'better-auth/next-js';

import { getAuth } from '@/lib/auth';

export const GET = toNextJsHandler(getAuth()).GET;
export const POST = toNextJsHandler(getAuth()).POST;
