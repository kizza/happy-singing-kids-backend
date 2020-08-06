// import crypto from "crypto";

// export const encrypt = (text: string) => {
//   const cipher = crypto.createCipher("aes-256-cbc", process.env.SALT!);
//   const encrypted = cipher.update(text, "utf8", "hex");
//   const result = encrypted + cipher.final("hex");
//   console.log("ENCRYPTED", result);
//   return result;
// };

// export const decrypt = (text: string) => {
//   const decipher = crypto.createDecipher("aes-256-cbc", process.env.SALT!);
//   const decrypted = decipher.update(text, "hex", "utf8");
//   return decrypted + decipher.final("utf8");
// };

export const websiteUrl = (path: string) => `${process.env.websiteUrl}${path}`;

export const apiUrl = (path: string) => `${process.env.apiUrl}${path}`;
