'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createSession, deleteSession } from '@/lib/session';
import { redirect } from 'next/navigation';

// Login
export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email e senha são obrigatórios.' };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { error: 'Email ou senha incorretos.' };
  }

  await createSession(user.id, user.role, user.name);
  redirect('/');
}

// Logout
export async function logout() {
  await deleteSession();
  redirect('/login');
}

// Setup do primeiro Admin
export async function setupAdmin(formData: FormData) {
  const count = await prisma.user.count();
  if (count > 0) {
    return { error: 'Sistema já configurado.' };
  }

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!name || !email || !password || password.length < 6) {
    return { error: 'Preencha todos os campos. Senha mínima: 6 caracteres.' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role: 'admin' },
  });

  await createSession(user.id, user.role, user.name);
  redirect('/');
}

// Criar novo usuário (apenas Admin)
export async function createUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = (formData.get('role') as string) || 'operador';

  if (!name || !email || !password) {
    return { error: 'Preencha todos os campos.' };
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return { error: 'Este e-mail já está em uso.' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email, password: hashedPassword, role },
  });

  return { success: true };
}
