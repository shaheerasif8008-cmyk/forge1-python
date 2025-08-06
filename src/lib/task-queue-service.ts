export interface Task {
  id: string;
  type: 'agent_execution' | 'training' | 'deployment' | 'chat' | 'analysis' | 'multi_llm';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  agentId?: string;
  userId: string;
  payload: any;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  progress?: number;
  result?: any;
  error?: string;
  retryCount: number;
  maxRetries: number;
  timeout: number; // in milliseconds
  dependencies?: string[]; // task IDs that must complete before this one
}

export interface TaskQueueConfig {
  maxConcurrentTasks: number;
  retryDelay: number; // in milliseconds
  timeout: number; // default timeout in milliseconds
  maxRetries: number;
  priorityMode: 'strict' | 'weighted';
}

export interface QueueMetrics {
  totalTasks: number;
  pendingTasks: number;
  runningTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageProcessingTime: number;
  queueLengthByPriority: Record<string, number>;
  throughput: number; // tasks per minute
}

export class TaskQueueService {
  private tasks: Task[] = [];
  private runningTasks: Map<string, NodeJS.Timeout> = new Map();
  private config: TaskQueueConfig;
  private processing = false;
  private storage: Storage;

  constructor(config: Partial<TaskQueueConfig> = {}) {
    this.config = {
      maxConcurrentTasks: 5,
      retryDelay: 1000,
      timeout: 30000,
      maxRetries: 3,
      priorityMode: 'weighted',
      ...config
    };
    
    this.storage = localStorage; // In production, this would be a database
    this.loadTasks();
    this.startProcessing();
  }

  // Add a new task to the queue
  async addTask(task: Omit<Task, 'id' | 'createdAt' | 'retryCount' | 'status'>): Promise<string> {
    const newTask: Task = {
      ...task,
      id: this.generateId(),
      createdAt: new Date(),
      retryCount: 0,
      status: 'pending'
    };

    this.tasks.push(newTask);
    this.saveTasks();

    // If not processing, start processing
    if (!this.processing) {
      this.startProcessing();
    }

    return newTask.id;
  }

  // Get task status
  getTask(taskId: string): Task | undefined {
    return this.tasks.find(t => t.id === taskId);
  }

  // Get all tasks for an agent
  getTasksByAgent(agentId: string): Task[] {
    return this.tasks.filter(t => t.agentId === agentId);
  }

  // Get all tasks for a user
  getTasksByUser(userId: string): Task[] {
    return this.tasks.filter(t => t.userId === userId);
  }

  // Cancel a task
  async cancelTask(taskId: string): Promise<boolean> {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return false;

    if (task.status === 'pending') {
      task.status = 'cancelled';
      this.saveTasks();
      return true;
    }

    if (task.status === 'running') {
      // Cancel the running task
      const timeout = this.runningTasks.get(taskId);
      if (timeout) {
        clearTimeout(timeout);
        this.runningTasks.delete(taskId);
      }
      task.status = 'cancelled';
      task.completedAt = new Date();
      this.saveTasks();
      return true;
    }

    return false;
  }

  // Retry a failed task
  async retryTask(taskId: string): Promise<boolean> {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task || task.status !== 'failed') return false;

    if (task.retryCount < task.maxRetries) {
      task.status = 'pending';
      task.retryCount++;
      task.error = undefined;
      this.saveTasks();
      
      // Restart processing if needed
      if (!this.processing) {
        this.startProcessing();
      }
      
      return true;
    }

    return false;
  }

  // Get queue metrics
  getMetrics(): QueueMetrics {
    const totalTasks = this.tasks.length;
    const pendingTasks = this.tasks.filter(t => t.status === 'pending').length;
    const runningTasks = this.tasks.filter(t => t.status === 'running').length;
    const completedTasks = this.tasks.filter(t => t.status === 'completed').length;
    const failedTasks = this.tasks.filter(t => t.status === 'failed').length;

    const queueLengthByPriority = this.tasks
      .filter(t => t.status === 'pending')
      .reduce((acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    // Calculate average processing time
    const completedTasksWithDuration = this.tasks.filter(t => 
      t.status === 'completed' && t.startedAt && t.completedAt
    );
    
    const averageProcessingTime = completedTasksWithDuration.length > 0
      ? completedTasksWithDuration.reduce((sum, task) => {
          const duration = task.completedAt!.getTime() - task.startedAt!.getTime();
          return sum + duration;
        }, 0) / completedTasksWithDuration.length
      : 0;

    // Calculate throughput (tasks per minute)
    const recentCompletedTasks = this.tasks.filter(t => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      return t.status === 'completed' && t.completedAt && t.completedAt > oneHourAgo;
    });
    
    const throughput = recentCompletedTasks.length; // tasks per hour

    return {
      totalTasks,
      pendingTasks,
      runningTasks,
      completedTasks,
      failedTasks,
      averageProcessingTime,
      queueLengthByPriority,
      throughput: throughput / 60 // convert to tasks per minute
    };
  }

  // Clean up old tasks
  async cleanup(olderThan: Date = new Date(Date.now() - 24 * 60 * 60 * 1000)): Promise<number> {
    const initialCount = this.tasks.length;
    
    this.tasks = this.tasks.filter(task => {
      // Keep tasks that are recent, pending, or running
      if (task.status === 'pending' || task.status === 'running') return true;
      if (task.createdAt > olderThan) return true;
      return false;
    });

    const cleanedCount = initialCount - this.tasks.length;
    if (cleanedCount > 0) {
      this.saveTasks();
    }

    return cleanedCount;
  }

  // Start processing the queue
  private startProcessing(): void {
    if (this.processing) return;
    
    this.processing = true;
    this.processQueue();
  }

  // Process the queue
  private async processQueue(): Promise<void> {
    while (this.processing) {
      const runningCount = this.tasks.filter(t => t.status === 'running').length;
      
      if (runningCount >= this.config.maxConcurrentTasks) {
        // Wait for a task to complete
        await this.sleep(100);
        continue;
      }

      const nextTask = this.getNextTask();
      if (!nextTask) {
        // No more tasks to process
        this.processing = false;
        break;
      }

      // Check dependencies
      if (nextTask.dependencies && nextTask.dependencies.length > 0) {
        const dependenciesCompleted = nextTask.dependencies.every(depId => {
          const depTask = this.tasks.find(t => t.id === depId);
          return depTask?.status === 'completed';
        });

        if (!dependenciesCompleted) {
          // Skip this task for now, will check again later
          await this.sleep(100);
          continue;
        }
      }

      // Execute the task
      this.executeTask(nextTask);
    }
  }

  // Get the next task to execute
  private getNextTask(): Task | undefined {
    const pendingTasks = this.tasks.filter(t => t.status === 'pending');
    if (pendingTasks.length === 0) return undefined;

    if (this.config.priorityMode === 'strict') {
      // Strict priority: always execute highest priority first
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return pendingTasks.sort((a, b) => {
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a.createdAt.getTime() - b.createdAt.getTime(); // FIFO for same priority
      })[0];
    } else {
      // Weighted priority: consider both priority and wait time
      return pendingTasks.sort((a, b) => {
        const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
        const waitTimeA = Date.now() - a.createdAt.getTime();
        const waitTimeB = Date.now() - b.createdAt.getTime();
        
        const scoreA = priorityWeight[a.priority] + (waitTimeA / 10000); // Add wait time weight
        const scoreB = priorityWeight[b.priority] + (waitTimeB / 10000);
        
        return scoreB - scoreA;
      })[0];
    }
  }

  // Execute a single task
  private async executeTask(task: Task): Promise<void> {
    task.status = 'running';
    task.startedAt = new Date();
    this.saveTasks();

    const timeout = setTimeout(async () => {
      try {
        const result = await this.processTaskPayload(task);
        
        task.status = 'completed';
        task.result = result;
        task.completedAt = new Date();
        task.progress = 100;
        
      } catch (error) {
        task.status = 'failed';
        task.error = error instanceof Error ? error.message : 'Unknown error';
        task.completedAt = new Date();
        
        // Auto-retry if configured
        if (task.retryCount < task.maxRetries) {
          setTimeout(() => {
            this.retryTask(task.id);
          }, this.config.retryDelay);
        }
      } finally {
        this.runningTasks.delete(task.id);
        this.saveTasks();
      }
    }, task.timeout);

    this.runningTasks.set(task.id, timeout);
  }

  // Process the task payload based on task type
  private async processTaskPayload(task: Task): Promise<any> {
    switch (task.type) {
      case 'agent_execution':
        return await this.executeAgentTask(task);
      
      case 'training':
        return await this.executeTrainingTask(task);
      
      case 'deployment':
        return await this.executeDeploymentTask(task);
      
      case 'chat':
        return await this.executeChatTask(task);
      
      case 'analysis':
        return await this.executeAnalysisTask(task);
      
      case 'multi_llm':
        return await this.executeMultiLLMTask(task);
      
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  // Task execution methods
  private async executeAgentTask(task: Task): Promise<any> {
    const { agentId, prompt, config } = task.payload;
    
    // Simulate agent execution
    await this.sleep(1000 + Math.random() * 2000);
    
    // Update progress
    if (task.progress !== undefined) {
      task.progress = Math.min(100, task.progress + 25);
    }
    
    return {
      agentId,
      response: `Agent response for: ${prompt}`,
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - task.startedAt!.getTime()
    };
  }

  private async executeTrainingTask(task: Task): Promise<any> {
    const { agentId, trainingData } = task.payload;
    
    // Simulate training process
    const steps = 10;
    for (let i = 0; i < steps; i++) {
      await this.sleep(500 + Math.random() * 1000);
      task.progress = Math.round(((i + 1) / steps) * 100);
    }
    
    return {
      agentId,
      trainingComplete: true,
      accuracy: 0.85 + Math.random() * 0.1,
      timestamp: new Date().toISOString()
    };
  }

  private async executeDeploymentTask(task: Task): Promise<any> {
    const { agentId, deploymentConfig } = task.payload;
    
    // Simulate deployment process
    await this.sleep(2000 + Math.random() * 3000);
    
    return {
      agentId,
      deployed: true,
      endpoint: `https://api.example.com/agents/${agentId}`,
      timestamp: new Date().toISOString()
    };
  }

  private async executeChatTask(task: Task): Promise<any> {
    const { agentId, message, sessionId } = task.payload;
    
    // Simulate chat processing
    await this.sleep(500 + Math.random() * 1500);
    
    return {
      agentId,
      sessionId,
      response: `Response to: ${message}`,
      timestamp: new Date().toISOString()
    };
  }

  private async executeAnalysisTask(task: Task): Promise<any> {
    const { agentId, data, analysisType } = task.payload;
    
    // Simulate analysis process
    await this.sleep(1500 + Math.random() * 2500);
    
    return {
      agentId,
      analysisType,
      results: {
        insights: ['Insight 1', 'Insight 2', 'Insight 3'],
        confidence: 0.8 + Math.random() * 0.15,
        timestamp: new Date().toISOString()
      }
    };
  }

  private async executeMultiLLMTask(task: Task): Promise<any> {
    const { prompt, config, context } = task.payload;
    
    // Simulate multi-LLM execution
    await this.sleep(2000 + Math.random() * 3000);
    
    return {
      prompt,
      response: 'Multi-LLM collaboration result',
      modelsUsed: config.models.filter((m: any) => m.enabled).length,
      collaborationMode: config.collaborationMode,
      timestamp: new Date().toISOString()
    };
  }

  // Utility methods
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private loadTasks(): void {
    try {
      const data = this.storage.getItem('task_queue');
      if (data) {
        const parsed = JSON.parse(data);
        this.tasks = parsed.map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          startedAt: t.startedAt ? new Date(t.startedAt) : undefined,
          completedAt: t.completedAt ? new Date(t.completedAt) : undefined
        }));
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      this.tasks = [];
    }
  }

  private saveTasks(): void {
    try {
      this.storage.setItem('task_queue', JSON.stringify(this.tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  }
}

// Singleton instance
export const taskQueueService = new TaskQueueService();