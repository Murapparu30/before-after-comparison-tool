import { IMAGE_MAX_DIMENSION, IMAGE_JPEG_QUALITY, MAX_FILE_SIZE } from '../constants';

/**
 * 画像ファイルを処理: リサイズ、圧縮し、Base64のJPEGデータURLに変換します。
 * @param file 処理する画像ファイル
 * @returns Base64データURLで解決されるPromise
 */
export const processImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // ファイルの基本検証
    if (!file) {
      return reject(new Error('ファイルが指定されていません。'));
    }
    
    if (!file.type.startsWith('image/')) {
      return reject(new Error('画像ファイルを選択してください。'));
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return reject(new Error('ファイルサイズが大きすぎます（最大10MB）。'));
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result;
      if (!result || typeof result !== 'string') {
        return reject(new Error('ファイルの読み込みに失敗しました。'));
      }
      
      const img = new Image();
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return reject(new Error('2Dコンテキストの取得に失敗しました。'));
          }

          let { width, height } = img;
          
          // 画像サイズの検証
          if (width <= 0 || height <= 0) {
            return reject(new Error('無効な画像サイズです。'));
          }
          
          // アスペクト比を維持しながら、最大辺がIMAGE_MAX_DIMENSIONになるようにリサイズ
          if (width > height) {
            if (width > IMAGE_MAX_DIMENSION) {
              height = Math.round(height * (IMAGE_MAX_DIMENSION / width));
              width = IMAGE_MAX_DIMENSION;
            }
          } else {
            if (height > IMAGE_MAX_DIMENSION) {
              width = Math.round(width * (IMAGE_MAX_DIMENSION / height));
              height = IMAGE_MAX_DIMENSION;
            }
          }

          canvas.width = width;
          canvas.height = height;
          
          // 画像をキャンバスに描画
          ctx.drawImage(img, 0, 0, width, height);
          
          // JPEGとしてBase64エンコード
          const dataUrl = canvas.toDataURL('image/jpeg', IMAGE_JPEG_QUALITY);
          
          if (!dataUrl || dataUrl === 'data:,') {
            return reject(new Error('画像の変換に失敗しました。'));
          }
          
          resolve(dataUrl);
        } catch (error) {
          reject(new Error('画像処理中にエラーが発生しました。'));
        }
      };
      
      img.onerror = () => {
        reject(new Error('画像の読み込みに失敗しました。'));
      };
      
      img.src = result;
    };
    
    reader.onerror = () => {
      reject(new Error('ファイルの読み取りに失敗しました。'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * 2つの画像の「変化スコア」を計算します。
 * 比較用に画像を64x64pxに縮小し、ピクセル毎のRGB値の差の平均から変化率を算出します。
 * @param beforeImgSrc 「ビフォー」画像のBase64データURL
 * @param afterImgSrc 「アフター」画像のBase64データURL
 * @returns 変化率（0-100）で解決されるPromise
 */
export const calculateChangeScore = (beforeImgSrc: string, afterImgSrc: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const imgBefore = new Image();
    const imgAfter = new Image();
    let loadedCount = 0;

    const onImageLoad = () => {
      loadedCount++;
      if (loadedCount === 2) {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return reject(new Error('2Dコンテキストの取得に失敗しました。'));
          }

          const size = 64; // 比較用の小さなサイズ
          canvas.width = size;
          canvas.height = size;

          // ビフォー画像のピクセルデータを取得
          ctx.drawImage(imgBefore, 0, 0, size, size);
          const beforeData = ctx.getImageData(0, 0, size, size).data;

          // アフター画像のピクセルデータを取得
          ctx.drawImage(imgAfter, 0, 0, size, size);
          const afterData = ctx.getImageData(0, 0, size, size).data;

          // ピクセル毎の差を計算
          let totalDiff = 0;
          const pixelCount = size * size;

          for (let i = 0; i < beforeData.length; i += 4) {
            const rDiff = Math.abs(beforeData[i] - afterData[i]);
            const gDiff = Math.abs(beforeData[i + 1] - afterData[i + 1]);
            const bDiff = Math.abs(beforeData[i + 2] - afterData[i + 2]);
            totalDiff += (rDiff + gDiff + bDiff) / 3;
          }

          // 変化率を0-100の範囲で計算
          const changeScore = Math.round((totalDiff / pixelCount / 255) * 100);
          resolve(Math.min(100, changeScore));
        } catch (error) {
          reject(new Error('変化スコアの計算に失敗しました。'));
        }
      }
    };

    imgBefore.onload = onImageLoad;
    imgAfter.onload = onImageLoad;
    imgBefore.onerror = () => reject(new Error('ビフォー画像の読み込みに失敗しました。'));
    imgAfter.onerror = () => reject(new Error('アフター画像の読み込みに失敗しました。'));

    imgBefore.src = beforeImgSrc;
    imgAfter.src = afterImgSrc;
  });
};