import { RecordItem } from '../types';
import { LOCAL_STORAGE_KEY, MAX_STORAGE_SIZE } from '../constants';

/**
 * データをJSONファイルとしてエクスポートします。
 * @param data エクスポートするレコードデータの配列
 */
export const exportData = (data: RecordItem[]): void => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `before-after-records-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    alert('データのエクスポートに失敗しました。');
  }
};

/**
 * レコードアイテムが有効かどうかを検証します。
 * @param item 検証するレコードアイテム
 * @returns 有効な場合はtrue、無効な場合はfalse
 */
export const isValidRecord = (item: any): item is RecordItem => {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.date === 'string' &&
    typeof item.createdAt === 'number' &&
    typeof item.updatedAt === 'number' &&
    (item.changeScore === undefined || typeof item.changeScore === 'number') &&
    typeof item.images === 'object' &&
    Array.isArray(item.images.before) &&
    Array.isArray(item.images.after) &&
    item.images.before.every((img: any) => typeof img === 'string' && img.startsWith('data:image/')) &&
    item.images.after.every((img: any) => typeof img === 'string' && img.startsWith('data:image/')) &&
    item.images.before.length === item.images.after.length &&
    (item.changeScore === undefined || (item.changeScore >= 0 && item.changeScore <= 100))
  );
};

/**
 * JSONファイルからデータをインポートします。
 * @param file インポートするJSONファイル
 * @returns インポートされたレコードデータの配列で解決されるPromise
 */
export const importData = (file: File): Promise<RecordItem[]> => {
  return new Promise((resolve, reject) => {
    if (!file.type.includes('json')) {
      return reject(new Error('JSONファイルを選択してください。'));
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result !== 'string') {
          return reject(new Error('ファイルの読み込みに失敗しました。'));
        }
        
        const data = JSON.parse(result);
        
        if (!Array.isArray(data)) {
          return reject(new Error('無効なデータ形式です。配列である必要があります。'));
        }
        
        const validRecords = data.filter(isValidRecord);
        
        if (validRecords.length === 0) {
          return reject(new Error('有効なレコードが見つかりませんでした。'));
        }
        
        if (validRecords.length !== data.length) {
          alert(`${data.length - validRecords.length}件の無効なレコードがスキップされました。`);
        }
        
        resolve(validRecords);
      } catch (error) {
        reject(new Error('JSONファイルの解析に失敗しました。'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('ファイルの読み取りに失敗しました。'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * ローカルストレージからデータを読み込みます。
 * @returns 保存されたレコードデータの配列
 */
export const loadFromStorage = (): RecordItem[] => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return [];
    
    const data = JSON.parse(stored);
    if (!Array.isArray(data)) return [];
    
    return data.filter(isValidRecord);
  } catch (error) {
    console.warn('ローカルストレージからのデータ読み込みに失敗しました:', error);
    return [];
  }
};

/**
 * データをローカルストレージに保存します。
 * @param data 保存するレコードデータの配列
 * @returns 保存が成功した場合はtrue、失敗した場合はfalse
 */
export const saveToStorage = (data: RecordItem[]): boolean => {
  try {
    const jsonString = JSON.stringify(data);
    
    // データサイズをチェック
    if (jsonString.length > MAX_STORAGE_SIZE) {
      console.warn('データサイズが大きすぎます。古いデータを削除してください。');
      return false;
    }
    
    localStorage.setItem(LOCAL_STORAGE_KEY, jsonString);
    return true;
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn('ストレージ容量が不足しています。');
    } else {
      console.warn('データの保存に失敗しました:', error);
    }
    return false;
  }
};