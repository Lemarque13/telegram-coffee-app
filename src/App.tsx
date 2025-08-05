// src/App.tsx

import { useState, useEffect } from 'react';
import QRCode from "react-qr-code";
import { client, account, databases, functions, Query } from './appwrite'; // Импортируем из нашего файла
import { Profile, AuthResponse } from './types'; // Импортируем наши типы
import './App.css'; // Импортируем стили

// --- ВАЖНО: ЗАПОЛНИ ЭТИ ДАННЫЕ! ---
const AUTH_FUNCTION_ID = '68926887002236522883'; // ID твоей функции из Appwrite
const DB_ID = '68926674003cccc28681'; // ID твоей базы данных из Appwrite
const PROFILES_COLLECTION_ID = '6892668e002499775b19'; // ID твоей коллекции 'profiles'
// ------------------------------------

// Объявляем глобальную переменную для Telegram Web App, чтобы TypeScript не ругался
declare global {
  interface Window {
    Telegram?: {
      WebApp: any;
    };
  }
}

function App() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const init = async () => {
      try {
        await account.get(); // Проверяем наличие сессии
      } catch (e) {
        // Если сессии нет, создаем ее
        try {
          if (window.Telegram?.WebApp?.initData) {
            const response = await functions.createExecution(
              AUTH_FUNCTION_ID,
              JSON.stringify({ initData: window.Telegram.WebApp.initData }),
              false,
              '/',
              'POST'
            );
            
            const result: AuthResponse | { error: string } = JSON.parse(response.responseBody);
            
            if ('success' in result) {
                await account.createSession(result.session.id, result.session.secret);
            } else {
                throw new Error(result.error || 'Ошибка создания сессии');
            }
          } else {
            throw new Error("Приложение должно быть запущено в Telegram");
          }
        } catch (authError: any) {
          setError(`Ошибка аутентификации: ${authError.message}`);
          setIsLoading(false);
          return;
        }
      }
      
      // Сессия есть, получаем данные
      try {
        const currentUser = await account.get();
        const profileResponse = await databases.listDocuments(
            DB_ID,
            PROFILES_COLLECTION_ID,
            [Query.equal("userId", currentUser.$id)]
        );

        if (profileResponse.documents.length > 0) {
            setProfile(profileResponse.documents[0] as Profile);
        } else {
            throw new Error("Профиль пользователя не найден в базе данных!");
        }
      } catch (profileError: any) {
        setError(profileError.message);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  if (isLoading) {
    return <div className="container loader">Загрузка...</div>;
  }
  
  if (error) {
    return <div className="container error-container"><h2>Ошибка</h2><p>{error}</p></div>;
  }
  
  if (!profile) {
    return <div className="container loader">Не удалось загрузить профиль...</div>;
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Привет, {profile.userName || 'гость'}!</h1>
      </header>
      
      <div className="card balance-card">
        <h2>Ваш кэшбэк</h2>
        <p className="balance-amount">{profile.cashbackBalance}<span> баллов</span></p>
      </div>
      
      <div className="card qr-card">
        <h3>Ваш QR-код</h3>
        <div className="qr-container">
            <QRCode value={profile.$id} bgColor="#FFFFFF" fgColor="#1e1e1e" size={192} />
        </div>
        <p className="qr-help">Покажите этот код кассиру для начисления или списания баллов</p>
      </div>
    </div>
  );
}

export default App;