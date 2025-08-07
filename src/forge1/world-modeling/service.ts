import ZAI from 'z-ai-web-dev-sdk';

export interface WorldModel {
  id: string;
  name: string;
  description: string;
  state: Record<string, any>;
  constraints: string[];
  objectives: string[];
  created_at: Date;
  updated_at: Date;
}

export interface PlanningStep {
  id: string;
  type: 'react' | 'tree_of_thought' | 'open_planner';
  thought: string;
  action: string;
  observation?: string;
  confidence: number;
  metadata: Record<string, any>;
}

export interface PlanningSession {
  id: string;
  world_model_id: string;
  objective: string;
  steps: PlanningStep[];
  status: 'planning' | 'executing' | 'completed' | 'failed';
  created_at: Date;
  updated_at: Date;
}

export class WorldModelingService {
  private zai: any;

  constructor() {
    this.initializeZAI();
  }

  private async initializeZAI() {
    try {
      this.zai = await ZAI.create();
    } catch (error) {
      console.error('Failed to initialize ZAI:', error);
    }
  }

  async createWorldModel(data: {
    name: string;
    description: string;
    initialState: Record<string, any>;
    constraints: string[];
    objectives: string[];
  }): Promise<WorldModel> {
    const worldModel: WorldModel = {
      id: `wm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: data.name,
      description: data.description,
      state: data.initialState,
      constraints: data.constraints,
      objectives: data.objectives,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Store in database or memory for now
    await this.saveWorldModel(worldModel);
    return worldModel;
  }

  async generatePlan(
    worldModel: WorldModel,
    objective: string,
    method: 'react' | 'tree_of_thought' | 'open_planner' = 'open_planner'
  ): Promise<PlanningSession> {
    const session: PlanningSession = {
      id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      world_model_id: worldModel.id,
      objective,
      steps: [],
      status: 'planning',
      created_at: new Date(),
      updated_at: new Date()
    };

    try {
      let steps: PlanningStep[] = [];

      switch (method) {
        case 'react':
          steps = await this.generateReActPlan(worldModel, objective);
          break;
        case 'tree_of_thought':
          steps = await this.generateTreeOfThoughtPlan(worldModel, objective);
          break;
        case 'open_planner':
        default:
          steps = await this.generateOpenPlannerPlan(worldModel, objective);
          break;
      }

      session.steps = steps;
      session.status = 'completed';
    } catch (error) {
      console.error('Plan generation failed:', error);
      session.status = 'failed';
    }

    session.updated_at = new Date();
    await this.savePlanningSession(session);
    return session;
  }

  private async generateReActPlan(worldModel: WorldModel, objective: string): Promise<PlanningStep[]> {
    const steps: PlanningStep[] = [];
    const maxSteps = 10;
    let currentStep = 0;

    while (currentStep < maxSteps) {
      const prompt = `
        You are using the ReAct (Reasoning and Acting) framework to achieve the following objective:
        Objective: ${objective}
        
        Current World State:
        ${JSON.stringify(worldModel.state, null, 2)}
        
        Constraints:
        ${worldModel.constraints.join('\n')}
        
        Objectives:
        ${worldModel.objectives.join('\n')}
        
        Please provide your reasoning and next action in the following format:
        Thought: [your reasoning about the current situation]
        Action: [the specific action you want to take]
      `;

      try {
        const completion = await this.zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are an AI planner using the ReAct framework. Always respond with Thought and Action.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        });

        const response = completion.choices[0]?.message?.content || '';
        const thoughtMatch = response.match(/Thought:\s*(.+)/i);
        const actionMatch = response.match(/Action:\s*(.+)/i);

        const step: PlanningStep = {
          id: `step_${currentStep}`,
          type: 'react',
          thought: thoughtMatch?.[1]?.trim() || 'No thought provided',
          action: actionMatch?.[1]?.trim() || 'No action provided',
          confidence: 0.8,
          metadata: { stepNumber: currentStep }
        };

        steps.push(step);

        // Simulate observation
        step.observation = `Executed: ${step.action}`;
        
        // Check if objective is achieved
        if (this.isObjectiveAchieved(worldModel, objective, steps)) {
          break;
        }

        currentStep++;
      } catch (error) {
        console.error('ReAct step generation failed:', error);
        break;
      }
    }

    return steps;
  }

  private async generateTreeOfThoughtPlan(worldModel: WorldModel, objective: string): Promise<PlanningStep[]> {
    const steps: PlanningStep[] = [];
    const maxDepth = 3;
    const branchingFactor = 3;

    const generateThoughts = async (currentObjective: string, depth: number): Promise<PlanningStep[]> => {
      if (depth >= maxDepth) return [];

      const prompt = `
        You are using the Tree of Thought framework to explore multiple paths for achieving:
        Objective: ${currentObjective}
        
        Current World State:
        ${JSON.stringify(worldModel.state, null, 2)}
        
        Constraints:
        ${worldModel.constraints.join('\n')}
        
        Please generate ${branchingFactor} different approaches/paths to achieve this objective.
        For each approach, provide:
        1. A brief description of the approach
        2. The first step to take in this approach
        3. A confidence score (0-1) for this approach
      `;

      try {
        const completion = await this.zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are an AI planner using the Tree of Thought framework. Generate multiple approaches with confidence scores.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 800
        });

        const response = completion.choices[0]?.message?.content || '';
        const approaches = this.parseApproaches(response);

        let localSteps: PlanningStep[] = [];
        
        for (const approach of approaches) {
          const step: PlanningStep = {
            id: `step_${steps.length + localSteps.length}`,
            type: 'tree_of_thought',
            thought: approach.description,
            action: approach.firstStep,
            confidence: approach.confidence,
            metadata: { depth, approachIndex: approaches.indexOf(approach) }
          };

          localSteps.push(step);

          // Recursively generate thoughts for sub-problems
          if (approach.confidence > 0.5) {
            const subSteps = await generateThoughts(approach.firstStep, depth + 1);
            localSteps = localSteps.concat(subSteps);
          }
        }

        return localSteps;
      } catch (error) {
        console.error('Tree of Thought generation failed:', error);
        return [];
      }
    };

    return await generateThoughts(objective, 0);
  }

  private async generateOpenPlannerPlan(worldModel: WorldModel, objective: string): Promise<PlanningStep[]> {
    const steps: PlanningStep[] = [];

    const prompt = `
      You are using the OpenPlanner framework to create a comprehensive plan for achieving the following objective:
      Objective: ${objective}
      
      Current World State:
      ${JSON.stringify(worldModel.state, null, 2)}
      
      Constraints:
      ${worldModel.constraints.join('\n')}
      
      Objectives:
      ${worldModel.objectives.join('\n')}
      
      Please create a detailed plan with the following structure:
      1. High-level strategy overview
      2. Step-by-step execution plan
      3. Contingency considerations
      4. Success criteria
      
      Format your response as a structured plan that can be parsed into individual steps.
    `;

    try {
      const completion = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an advanced AI planner using the OpenPlanner framework. Create comprehensive, structured plans.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 1000
      });

      const response = completion.choices[0]?.message?.content || '';
      const planSections = this.parseOpenPlannerResponse(response);

      // Convert plan sections into steps
      planSections.forEach((section, index) => {
        const step: PlanningStep = {
          id: `step_${index}`,
          type: 'open_planner',
          thought: section.description,
          action: section.action,
          confidence: section.confidence,
          metadata: { sectionType: section.type, priority: section.priority }
        };
        steps.push(step);
      });

    } catch (error) {
      console.error('OpenPlanner generation failed:', error);
    }

    return steps;
  }

  private parseApproaches(response: string): Array<{
    description: string;
    firstStep: string;
    confidence: number;
  }> {
    // Simple parsing logic - in production, this would be more sophisticated
    const approaches: Array<{
      description: string;
      firstStep: string;
      confidence: number;
    }> = [];

    const lines = response.split('\n');
    let currentApproach: any = {};

    for (const line of lines) {
      if (line.toLowerCase().includes('approach') || line.toLowerCase().includes('path')) {
        if (currentApproach.description) {
          approaches.push(currentApproach);
        }
        currentApproach = { description: line, firstStep: '', confidence: 0.5 };
      } else if (line.toLowerCase().includes('step') || line.toLowerCase().includes('action')) {
        currentApproach.firstStep = line.replace(/^.*?[:]\s*/, '');
      } else if (line.toLowerCase().includes('confidence')) {
        const match = line.match(/(\d+\.?\d*)/);
        if (match) {
          currentApproach.confidence = parseFloat(match[1]);
        }
      }
    }

    if (currentApproach.description) {
      approaches.push(currentApproach);
    }

    return approaches;
  }

  private parseOpenPlannerResponse(response: string): Array<{
    type: string;
    description: string;
    action: string;
    confidence: number;
    priority: number;
  }> {
    const sections: Array<{
      type: string;
      description: string;
      action: string;
      confidence: number;
      priority: number;
    }> = [];

    // Simple parsing - identify sections by keywords
    const strategyMatch = response.match(/strategy[^:]*:\s*([\s\S]*?)(?=\n\s*[A-Z]|$)/i);
    const stepsMatch = response.match(/steps?[^:]*:\s*([\s\S]*?)(?=\n\s*[A-Z]|$)/i);
    const contingencyMatch = response.match(/contingency[^:]*:\s*([\s\S]*?)(?=\n\s*[A-Z]|$)/i);

    if (strategyMatch) {
      sections.push({
        type: 'strategy',
        description: strategyMatch[1].trim(),
        action: 'Define strategic approach',
        confidence: 0.9,
        priority: 1
      });
    }

    if (stepsMatch) {
      const stepLines = stepsMatch[1].split('\n').filter(line => line.trim());
      stepLines.forEach((step, index) => {
        if (step.trim()) {
          sections.push({
            type: 'execution',
            description: step.trim(),
            action: `Execute step ${index + 1}`,
            confidence: 0.8,
            priority: index + 2
          });
        }
      });
    }

    if (contingencyMatch) {
      sections.push({
        type: 'contingency',
        description: contingencyMatch[1].trim(),
        action: 'Prepare contingency plans',
        confidence: 0.7,
        priority: sections.length + 1
      });
    }

    return sections;
  }

  private isObjectiveAchieved(worldModel: WorldModel, objective: string, steps: PlanningStep[]): boolean {
    // Simple heuristic - in production, this would be more sophisticated
    return steps.length >= 3; // Basic completion criteria
  }

  private async saveWorldModel(worldModel: WorldModel): Promise<void> {
    // In production, save to database
    console.log('Saving world model:', worldModel);
  }

  private async savePlanningSession(session: PlanningSession): Promise<void> {
    // In production, save to database
    console.log('Saving planning session:', session);
  }

  async getWorldModel(id: string): Promise<WorldModel | null> {
    // In production, retrieve from database
    return null;
  }

  async getPlanningSession(id: string): Promise<PlanningSession | null> {
    // In production, retrieve from database
    return null;
  }

  async executePlan(session: PlanningSession): Promise<void> {
    session.status = 'executing';
    session.updated_at = new Date();
    
    // Execute each step
    for (const step of session.steps) {
      try {
        console.log(`Executing step: ${step.action}`);
        // Simulate execution
        await new Promise(resolve => setTimeout(resolve, 1000));
        step.observation = `Successfully executed: ${step.action}`;
      } catch (error) {
        step.observation = `Failed to execute: ${step.action}`;
        session.status = 'failed';
        break;
      }
    }

    if (session.status === 'executing') {
      session.status = 'completed';
    }

    session.updated_at = new Date();
    await this.savePlanningSession(session);
  }
}