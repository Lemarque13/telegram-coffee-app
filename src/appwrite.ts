// src/appwrite.ts

import { Client, Account, Databases, Functions } from 'appwrite';

const VITE_APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const VITE_APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;

export const client = new Client();

client
    .setEndpoint(VITE_APPWRITE_ENDPOINT)
    .setProject(VITE_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const functions = new Functions(client);

export { ID, Query } from 'appwrite';