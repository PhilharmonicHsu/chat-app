import CryptoJS from "crypto-js";

const SECRET_KEY = "your_secret_key"; // 替換為自己的密鑰

// 加密
export function encryptData(data: object): string {
  const jsonData = JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(jsonData, SECRET_KEY).toString();
  return encodeURIComponent(encrypted); // 確保 URL 安全
}

// 解密
export function decryptData(encryptedData): {roomId: string, nickname?: string} {
  try {
    const decrypted = CryptoJS.AES.decrypt(
      decodeURIComponent(encryptedData),
      SECRET_KEY
    ).toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
}
