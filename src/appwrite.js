// src/appwrite.js

import { Client, Account, Databases, Functions } from 'appwrite';

// Эти переменные мы задали в настройках Vercel
const VITE_APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const VITE_APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;

export const client = new Client();

client
    .setEndpoint(VITE_APPWRITE_ENDPOINT)
    .setProject(VITE_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const functions = new Functions(client);

// Экспортируем ID для удобства, если понадобятся
export { ID, Query } from 'appwrite';