// src/App.tsx (Версия с выводом отладки на экран)

import { useState, useEffect } from 'react';
import QRCode from "react-qr-code";
import { account, databases, functions, Query } from './appwrite';
import type { Profile, AuthResponse } from './types';
import './App.css';

const AUTH_FUNCTION_ID = 'auth-telegram-user';
const DB_ID = 'CoffeeShop';
const PROFILES_COLLECTION_ID = 'profiles';

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
  const [debugInfo, setDebugInfo] = useState<string[]>([]); // Состояние для хранения логов

  // Функция для добавления новой строки в лог на экране
  const log = (message: string) => {
    setDebugInfo(prev => [...prev, message]);
  };

  useEffect(() => {
    const init = async () => {
      log("1. Приложение запущено.");
      log(`2. User Agent: ${navigator.userAgent}`);

      if (typeof window !== 'undefined') {
        log("3. Объект 'window' существует.");
      } else {
        log("3. КРИТИЧЕСКАЯ ОШИБКА: Объект 'window' не существует.");
        return;
      }

      if (window.Telegram) {
        log("4. Объект 'window.Telegram' НАЙДЕН.");
        if (window.Telegram.WebApp) {
          log("5. Объект 'window.Telegram.WebApp' НАЙДЕН.");
          log(`6. Содержимое initData: ${window.Telegram.WebApp.initData || 'пусто'}`);
        } else {
          log("5. ОШИБКА: 'window.Telegram.WebApp' НЕ НАЙДЕН.");
        }
      } else {
        log("4. ОШИБКА: Объект 'window.Telegram' НЕ НАЙДЕН.");
      }
      
      try {
        await account.get();
      } catch (e) {
        try {
          if (window.Telegram?.WebApp?.initData) {
            log("7. Аутентификация: initData найдена, вызываем функцию Appwrite.");
            const response = await functions.createExecution(
              AUTH_FUNCTION_ID,
              JSON.stringify({ initData: window.Telegram.WebApp.initData })
            );
            const result: AuthResponse | { error: string } = JSON.parse(response.responseBody);
            if ('success' in result && result.success) {
                await account.createSession(result.session.id, result.session.secret);
            } else {
                throw new Error((result as { error: string }).error || 'Ошибка создания сессии');
            }
          } else {
            log("7. ПРОВАЛ: Условие 'window.Telegram?.WebApp?.initData' не выполнено.");
            throw new Error("Приложение должно быть запущено в Telegram");
          }
        } catch (authError: any) {
          setError(`Ошибка аутентификации: ${authError.message}`);
          setIsLoading(false);
          return;
        }
      }
      
      try {
        log("8. Сессия есть, получаем профиль...");
        const currentUser = await account.get();
        const profileResponse = await databases.listDocuments<Profile>(
            DB_ID, PROFILES_COLLECTION_ID, [Query.equal("userId", currentUser.$id)]
        );
        if (profileResponse.documents.length > 0) {
            log("9. Профиль успешно получен.");
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

  // --- Рендеринг ---
  
  // Всегда отображаем блок с отладкой поверх всего
  const renderDebugBlock = () => (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.9)', color: '#00ff00',
      padding: '10px', fontFamily: 'monospace', fontSize: '12px',
      zIndex: 9999, overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all'
    }}>
      <h2>-- DEBUG LOG --</h2>
      {debugInfo.map((msg, index) => (
        <p key={index} style={{margin: '5px 0', borderBottom: '1px solid #333'}}>{msg}</p>
      ))}
      {error && <p style={{color: 'red'}}>ОШИБКА НА ЭКРАНЕ: {error}</p>}
    </div>
  );

  // Если есть ошибка или приложение загружается, показываем только отладку
  if (isLoading || error) {
    return renderDebugBlock();
  }

  // Если все хорошо, показываем и приложение, и отладку
  return (
    <div className="container">
      {renderDebugBlock()}
      <header className="header"><h1>Привет, {profile?.userName || 'гость'}!</h1></header>
      <div className="card balance-card"><h2>Ваш кэшбэк</h2><p className="balance-amount">{profile?.cashbackBalance}<span> баллов</span></p></div>
      <div className="card qr-card"><h3>Ваш QR-код</h3><div className="qr-container"><QRCode value={profile?.$id || ''} bgColor="#FFFFFF" fgColor="#1e1e1e" size={192} /></div><p className="qr-help">Покажите этот код кассиру для начисления или списания баллов</p></div>
    </div>
  );
}

export default App;