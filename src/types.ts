// src/types.ts

// Описываем, как выглядит документ профиля из нашей базы данных
export interface Profile {
  $id: string;          // Уникальный ID документа
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  userName: string;
  cashbackBalance: number;
  userId: string;
}

// Описываем, как выглядит успешный ответ от нашей функции аутентификации
export interface AuthResponse {
  success: true;
  session: {
    secret: string;
    id: string;
  };
  profile: Profile;
}