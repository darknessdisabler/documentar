import { users, projects, userSettings, type User, type InsertUser, type Project, type InsertProject, type UserSettings, type InsertUserSettings } from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Projects
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByUserId(userId: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // User Settings
  getUserSettings(userId: number): Promise<UserSettings | undefined>;
  createUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
  updateUserSettings(userId: number, updates: Partial<InsertUserSettings>): Promise<UserSettings | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private userSettings: Map<number, UserSettings>;
  private currentUserId: number;
  private currentProjectId: number;
  private currentSettingsId: number;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.userSettings = new Map();
    this.currentUserId = 1;
    this.currentProjectId = 1;
    this.currentSettingsId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectsByUserId(userId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.userId === userId,
    );
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const now = new Date();
    const project: Project = { 
      ...insertProject, 
      id, 
      createdAt: now,
      updatedAt: now 
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject: Project = { 
      ...project, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  async getUserSettings(userId: number): Promise<UserSettings | undefined> {
    return Array.from(this.userSettings.values()).find(
      (settings) => settings.userId === userId,
    );
  }

  async createUserSettings(insertSettings: InsertUserSettings): Promise<UserSettings> {
    const id = this.currentSettingsId++;
    const settings: UserSettings = { ...insertSettings, id };
    this.userSettings.set(id, settings);
    return settings;
  }

  async updateUserSettings(userId: number, updates: Partial<InsertUserSettings>): Promise<UserSettings | undefined> {
    const existing = await this.getUserSettings(userId);
    if (!existing) return undefined;
    
    const updatedSettings: UserSettings = { ...existing, ...updates };
    this.userSettings.set(existing.id, updatedSettings);
    return updatedSettings;
  }
}

export const storage = new MemStorage();
