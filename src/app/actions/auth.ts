'use server';

import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyPassword, createSession } from '@/lib/auth';

export async function loginUser(prevState: any, formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const targetRole = formData.get('targetRole') as string;

    if (!email || !password) {
      return { error: 'Please enter both email and password.' };
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: 'Invalid email or password.' };
    }

    // Ensure the db user's role actually matches the portal they selected!
    if (user.role !== targetRole) {
      // It is important to obscure specifically why auth failed for security, 
      // but the exact requirement from the prompt indicates strict validation
      return { error: `Authentication failed: This account does not possess the ${targetRole} role.` };
    }

    // Verify the password
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return { error: 'Invalid email or password.' };
    }

    // Create session (JWT) payload
    const sessionPayload = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    };

    const token = await createSession(sessionPayload);

    // Set the cookie (session cookie expires on browser close)
    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    // Provide the role for client-side redirection
    return { success: true, role: user.role, mustChangePassword: user.mustChangePassword };

  } catch (error) {
    console.error('Login action error:', error);
    return { error: 'An unexpected error occurred. Please try again later.' };
  }
}

export async function changePassword(prevState: any, formData: FormData) {
  try {
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!password || !confirmPassword) {
      return { error: 'Please enter both passwords.' };
    }

    if (password !== confirmPassword) {
      return { error: 'Passwords do not match.' };
    }

    if (password.length < 6) {
      return { error: 'Password must be at least 6 characters long.' };
    }

    // Get session to identify the user
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return { error: 'Session expired. Please login again.' };

    const { verifySession, hashPassword } = await import('@/lib/auth');
    const session = await verifySession(token);
    if (!session || !session.userId) return { error: 'Invalid session.' };

    const hashedPassword = await hashPassword(password);

    await prisma.user.update({
      where: { id: Number(session.userId) },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      },
    });

    // REFRESH SESSION: Create a new session token with mustChangePassword: false
    const sessionPayload = {
      userId: session.userId,
      name: session.name,
      email: session.email,
      role: session.role,
      mustChangePassword: false,
    };

    const { createSession } = await import('@/lib/auth');
    const token2 = await createSession(sessionPayload);

    cookieStore.set('session', token2, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return { success: true };

  } catch (error) {
    console.error('Change password error:', error);
    return { error: 'Failed to update password.' };
  }
}

export async function registerUser(prevState: any, formData: FormData) {
  try {
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const targetRole = formData.get('targetRole') as string;

    if (!firstName || !lastName || !email || !password || !targetRole) {
      return { error: 'Please fill in all fields (First Name, Last Name, Email, and Password).' };
    }

    const name = `${firstName} ${lastName}`;

    // Protection Check: Ensure NO admin exists yet if trying to setup Admin
    if (targetRole === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' }
      });

      if (adminCount > 0) {
        return { error: 'Security Exception: An Admin account has already been registered.' };
      }
    }

    // Check if email already in use globally
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: 'This email is already associated with another account.' };
    }

    const { hashPassword } = await import('@/lib/auth');
    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: targetRole === 'ADMIN' ? 'ADMIN' : (targetRole === 'TEACHER' ? 'TEACHER' : 'STUDENT'),
      }
    });

    return { success: true };

  } catch (error) {
    console.error('Registration action error:', error);
    return { error: 'An unexpected error occurred during account generation.' };
  }
}

import { redirect } from 'next/navigation';

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('session'); // This clears the login status
  redirect('/');
}

