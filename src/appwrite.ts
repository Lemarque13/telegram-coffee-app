// src/appwrite.ts (ВРЕМЕННАЯ ВЕРСИЯ ДЛЯ ОТЛАДКИ)

import { Client, Account, Databases, Functions } from 'appwrite';

export const client = new Client();

client
    .setEndpoint("https://fra.cloud.appwrite.io/v1") // <-- Жестко прописали эндпоинт
    .setProject("zen-coffee");                      // <-- Жестко прописали ID проекта

export const account = new Account(client);
export const databases = new Databases(client);
export const functions = new Functions(client);

export { ID, Query } from 'appwrite';