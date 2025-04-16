import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true, // чтобы использовать describe/it/expect без импорта
    environment: "node", // или 'jsdom', если тестируешь браузерное поведение
    include: ["__tests__/*.test.ts"], // путь к тестам
  },
});
