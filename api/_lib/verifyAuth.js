import { auth } from './admin.js';

// Verify the caller's Firebase ID token from `Authorization: Bearer <token>`.
// Returns the decoded token (incl. uid) or throws.
export async function verifyAuth(req) {
  const header = req.headers.authorization || req.headers.Authorization || '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) {
    const err = new Error('Missing Authorization bearer token');
    err.status = 401;
    throw err;
  }
  try {
    return await auth.verifyIdToken(match[1]);
  } catch {
    const err = new Error('Invalid or expired token');
    err.status = 401;
    throw err;
  }
}
