import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'index.ts'),
      name: 'FileStorage',
      fileName: () => `index.js`,
    },
    rollupOptions: {
      external: ['@aws-sdk/client-s3', '@aws-sdk/s3-request-presigner'],
      output: {
        exports: 'named',
        globals: {
          '@aws-sdk/client-s3': 'AWS_SDK_Client_S3',
          '@aws-sdk/s3-request-presigner': 'AWS_SDK_S3_Request_Presigner',
        },
      },
    },
  },
});