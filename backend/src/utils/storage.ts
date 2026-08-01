import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * StorageAdapter interface for file operations.
 * Designed for easy swap to S3/Cloudinary later.
 */
export interface StorageAdapter {
  upload(file: Buffer, filename: string, mimeType: string): Promise<string>;
  delete(filepath: string): Promise<void>;
  getUrl(filepath: string): string;
}

/**
 * Local file system storage adapter.
 * Stores files under ./uploads/images/ or ./uploads/videos/ based on MIME type.
 * Uses UUID for unique filenames to prevent naming collisions.
 */
export class LocalStorageAdapter implements StorageAdapter {
  private basePath: string;

  constructor(basePath?: string) {
    this.basePath = basePath || path.resolve(__dirname, '../../uploads');
  }

  /**
   * Upload a file to local storage.
   * Determines subdirectory (images/videos) based on MIME type.
   * Generates a unique filename using UUID to prevent collisions.
   *
   * @param file - The file buffer to store
   * @param filename - The original filename (used for extension extraction)
   * @param mimeType - The MIME type of the file
   * @returns The relative storage path of the uploaded file
   */
  async upload(file: Buffer, filename: string, mimeType: string): Promise<string> {
    const subDir = this.getSubDirectory(mimeType);
    const ext = path.extname(filename);
    const uniqueFilename = `${uuidv4()}${ext}`;
    const dirPath = path.join(this.basePath, subDir);
    const filePath = path.join(dirPath, uniqueFilename);

    // Ensure directory exists
    await fs.promises.mkdir(dirPath, { recursive: true });

    // Write file to disk
    await fs.promises.writeFile(filePath, file);

    // Return relative path from uploads root
    return `${subDir}/${uniqueFilename}`;
  }

  /**
   * Delete a file from local storage.
   *
   * @param filepath - The relative path of the file to delete (e.g., "images/uuid.jpg")
   */
  async delete(filepath: string): Promise<void> {
    const fullPath = path.join(this.basePath, filepath);

    try {
      await fs.promises.unlink(fullPath);
    } catch (err: any) {
      // Ignore if file doesn't exist (already deleted)
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }
  }

  /**
   * Get the public URL for a stored file.
   *
   * @param filepath - The relative path of the file (e.g., "images/uuid.jpg")
   * @returns The URL path accessible via the static file server
   */
  getUrl(filepath: string): string {
    return `/uploads/${filepath}`;
  }

  /**
   * Determine the storage subdirectory based on MIME type.
   */
  private getSubDirectory(mimeType: string): string {
    if (mimeType.startsWith('video/')) {
      return 'videos';
    }
    return 'images';
  }
}

/**
 * Default storage adapter instance for use throughout the application.
 */
export const storageAdapter: StorageAdapter = new LocalStorageAdapter();

export default storageAdapter;
