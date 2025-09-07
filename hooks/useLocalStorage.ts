import { useState } from 'react';
import { MAX_STORAGE_SIZE } from '../constants';

/**
 * ローカルストレージと同期するReactフック
 * @param key ローカルストレージのキー
 * @param initialValue 初期値
 * @returns [値, 設定関数] のタプル
 */
export const useLocalStorage = <T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] => {
  // ローカルストレージから初期値を読み込む
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // ローカルストレージがサポートされているかチェック
      if (typeof window === 'undefined' || !window.localStorage) {
        console.warn('ローカルストレージがサポートされていません。');
        return initialValue;
      }

      const item = window.localStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }

      const parsed = JSON.parse(item);
      
      // データ型の検証
      if (typeof parsed !== typeof initialValue) {
        console.warn('ローカルストレージのデータ型が期待される型と異なります。初期値を使用します。');
        window.localStorage.removeItem(key);
        return initialValue;
      }

      return parsed;
    } catch (error) {
      console.warn('ローカルストレージからの読み込みでエラーが発生しました。破損したデータを削除します。', error);
      try {
        window.localStorage.removeItem(key);
      } catch (removeError) {
        console.warn('破損したデータの削除に失敗しました。', removeError);
      }
      return initialValue;
    }
  });

  // 値を設定する関数
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // 関数の場合は現在の値を渡して実行
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      // ローカルストレージがサポートされているかチェック
      if (typeof window === 'undefined' || !window.localStorage) {
        console.warn('ローカルストレージがサポートされていません。');
        return;
      }

      const jsonString = JSON.stringify(valueToStore);
      
      // データサイズをチェック
      if (jsonString.length > MAX_STORAGE_SIZE) {
        console.warn('データサイズが大きすぎます（最大5MB）。保存をスキップします。');
        return;
      }

      window.localStorage.setItem(key, jsonString);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'QuotaExceededError') {
          console.warn('ストレージ容量が不足しています。古いデータを削除してください。');
        } else {
          console.warn('ローカルストレージへの保存でエラーが発生しました。', error);
        }
      } else {
        console.warn('不明なエラーが発生しました。', error);
      }
    }
  };

  return [storedValue, setValue];
};