import * as bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

// Get secret key for JWT signing - falling back to a default for testing
const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET_KEY || 'default-secret-key-for-local-development-only';
  return new TextEncoder().encode(secret);
};

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(payload: any) {
  const secretKey = getJwtSecretKey();
  
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h') // 24 hours
    .sign(secretKey);
    
  return token;
}

export async function verifySession(token: string) {
  try {
    const secretKey = getJwtSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (error) {
    console.error('Session verification failed:', error);
    return null;
  }
}
