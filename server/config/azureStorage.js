import { BlobServiceClient } from '@azure/storage-blob';
import dotenv from 'dotenv';
dotenv.config();

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;

let blobServiceClient;
let containerClient;

if (AZURE_STORAGE_CONNECTION_STRING) {
  blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  containerClient = blobServiceClient.getContainerClient('questions');
  
  // Ensure container exists
  containerClient.createIfNotExists({ access: 'blob' })
    .then(() => console.log('Azure Storage: questions container hazır.'))
    .catch(err => console.error('Azure Storage container oluşturma hatası:', err));
} else {
  console.warn('UYARI: AZURE_STORAGE_CONNECTION_STRING bulunamadı. Resim yükleme çalışmayabilir.');
}

export const uploadImageToAzure = async (fileBuffer, fileName, mimeType) => {
  if (!containerClient) throw new Error('Azure Storage yapılandırılmadı.');
  
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);
  await blockBlobClient.uploadData(fileBuffer, {
    blobHTTPHeaders: { blobContentType: mimeType }
  });
  
  return blockBlobClient.url;
};
