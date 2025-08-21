import { type ProcessedFile, type InsertProcessedFile } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<any | undefined>;
  getUserByUsername(username: string): Promise<any | undefined>;
  createUser(user: any): Promise<any>;
  createProcessedFile(file: InsertProcessedFile): Promise<ProcessedFile>;
  getProcessedFile(id: string): Promise<ProcessedFile | undefined>;
  updateProcessedFile(id: string, updates: Partial<ProcessedFile>): Promise<ProcessedFile | undefined>;
  deleteProcessedFile(id: string): Promise<boolean>;
  getExpiredFiles(): Promise<ProcessedFile[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, any>;
  private processedFiles: Map<string, ProcessedFile>;

  constructor() {
    this.users = new Map();
    this.processedFiles = new Map();
  }

  async getUser(id: string): Promise<any | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: any): Promise<any> {
    const id = randomUUID();
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createProcessedFile(insertFile: InsertProcessedFile): Promise<ProcessedFile> {
    const id = randomUUID();
    const file: ProcessedFile = {
      ...insertFile,
      id,
      createdAt: new Date(),
      metadata: insertFile.metadata || null,
      status: insertFile.status || 'processing',
      downloadUrl: insertFile.downloadUrl || null,
    };
    this.processedFiles.set(id, file);
    return file;
  }

  async getProcessedFile(id: string): Promise<ProcessedFile | undefined> {
    return this.processedFiles.get(id);
  }

  async updateProcessedFile(id: string, updates: Partial<ProcessedFile>): Promise<ProcessedFile | undefined> {
    const existing = this.processedFiles.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.processedFiles.set(id, updated);
    return updated;
  }

  async deleteProcessedFile(id: string): Promise<boolean> {
    return this.processedFiles.delete(id);
  }

  async getExpiredFiles(): Promise<ProcessedFile[]> {
    const now = new Date();
    return Array.from(this.processedFiles.values()).filter(
      file => file.expiresAt < now
    );
  }
}

export const storage = new MemStorage();
