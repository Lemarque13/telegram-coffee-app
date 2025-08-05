// src/types.ts

// ИСПРАВЛЕНИЕ: Добавили 'type', чтобы удовлетворить настройку verbatimModuleSyntax
import type { Models } from 'appwrite';

export interface Profile extends Models.Document {
  userName: string;
  cashbackBalance: number;
  userId: string;
}

export interface AuthResponse {
  success: true;
  session: {
    secret: string;
    id: string;
  };
  profile: Profile;
}