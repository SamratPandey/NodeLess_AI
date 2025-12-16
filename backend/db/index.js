import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

const __dirname = dirname(fileURLToPath(import.meta.url));

const file = join(__dirname, 'db.json');

const adapter = new JSONFile(file);
const db = new Low(adapter, {});

await db.read();

if (!db.data || Object.keys(db.data).length === 0) {
  db.data = {
    workflows: [],
    executions: [],
    cache: {}
  };
  await db.write();
}

export const dbHelpers = {
  async getAllWorkflows() {
    await db.read();
    return db.data.workflows;
  },

  async getWorkflowById(id) {
    await db.read();
    return db.data.workflows.find(w => w.id === id);
  },

  async createWorkflow(workflow) {
    await db.read();
    const newWorkflow = {
      id: generateId(),
      ...workflow,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.data.workflows.push(newWorkflow);
    await db.write();
    return newWorkflow;
  },

  async updateWorkflow(id, updates) {
    await db.read();
    const index = db.data.workflows.findIndex(w => w.id === id);
    if (index !== -1) {
      db.data.workflows[index] = {
        ...db.data.workflows[index],
        ...updates,
        updated_at: new Date().toISOString()
      };
      await db.write();
      return db.data.workflows[index];
    }
    return null;
  },
  
  async getAllExecutions() {
    await db.read();
    return db.data.executions;
  },

  async getExecutionById(id) {
    await db.read();
    return db.data.executions.find(e => e.id === id);
  },

  async createExecution(execution) {
    await db.read();
    const newExecution = {
      id: generateId(),
      ...execution,
      status: execution.status || 'pending',
      created_at: new Date().toISOString()
    };
    db.data.executions.push(newExecution);
    await db.write();
    return newExecution;
  },

  async updateExecution(id, updates) {
    await db.read();
    const index = db.data.executions.findIndex(e => e.id === id);
    if (index !== -1) {
      db.data.executions[index] = {
        ...db.data.executions[index],
        ...updates,
        updated_at: new Date().toISOString()
      };
      await db.write();
      return db.data.executions[index];
    }
    return null;
  },


  async getCacheValue(key) {
    await db.read();
    const item = db.data.cache[key];
    if (item && item.expires_at && new Date(item.expires_at) < new Date()) {

      delete db.data.cache[key];
      await db.write();
      return null;
    }
    return item ? item.response : null;
  },

  async setCacheValue(key, value, ttlSeconds = 86400) {
    await db.read();
    db.data.cache[key] = {
      response: value,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + (ttlSeconds * 1000)).toISOString()
    };
    await db.write();
  },

  async clearExpiredCache() {
    await db.read();
    const now = new Date();
    let changed = false;
    
    for (const [key, item] of Object.entries(db.data.cache)) {
      if (item.expires_at && new Date(item.expires_at) < now) {
        delete db.data.cache[key];
        changed = true;
      }
    }
    
    if (changed) {
      await db.write();
    }
  }
};


function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export default db;