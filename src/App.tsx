// src/App.tsx (Финальная чистая версия)

import { useState, useEffect } from 'react';
import QRCode from "react-qr-code";
import { account, databases, functions, Query } from './appwrite';
import type { Profile } from './types'; // Убрали AuthResponse, так как он больше не нужен здесь
import './App.css';

// --- Убедись, что тут твои реальные ID ---
const AUTH_FUNCTION_ID = '68926887002236522883'; // <-- НЕ ЗАБУДЬ ВСТАВИТЬ СВОЙ ID
const DB_ID = '68926674003cccc28681';
const PROFILES_COLLECTION_ID = '6892668e002499775b19';
// ------------------------------------------

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
        await account.get();
      } catch (e) {
        try {
          if (window.Telegram?.WebApp?.initData) {
            const response = await functions.createExecution(
              AUTH_FUNCTION_ID,
              JSON.stringify({ initData: window.Telegram.WebApp.initData })
            );
            
            // Типизация для AuthResponse нужна была только для отладки, теперь упростим
            const result = JSON.parse(response.responseBody);
            
            if (result.success) {
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
      
      try {
        const currentUser = await account.get();
        const profileResponse = await databases.listDocuments<Profile>(
            DB_ID,
            PROFILES_COLLECTION_ID,
            [Query.equal("userId", currentUser.$id)]
        );

        if (profileResponse.documents.length > 0) {
            setProfile(profileResponse.documents[0]);
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