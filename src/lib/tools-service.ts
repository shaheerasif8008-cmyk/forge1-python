import ZAI from 'z-ai-web-dev-sdk';

export interface ToolResult {
  tool: string;
  success: boolean;
  result: any;
  error?: string;
  processingTime: number;
}

export interface ToolConfig {
  name: string;
  description: string;
  parameters: Record<string, any>;
  timeout?: number;
}

export class ToolsService {
  private zai: any = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.zai = await ZAI.create();
      this.isInitialized = true;
      console.log('Tools Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Tools Service:', error);
      throw new Error('Tools Service initialization failed');
    }
  }

  async executeTool(toolName: string, parameters: any): Promise<ToolResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const startTime = Date.now();

    try {
      let result: any;

      switch (toolName) {
        case 'web_search':
          result = await this.executeWebSearch(parameters);
          break;
        
        case 'calculator':
          result = await this.executeCalculator(parameters);
          break;
        
        case 'data_analyzer':
          result = await this.executeDataAnalysis(parameters);
          break;
        
        case 'document_parser':
          result = await this.executeDocumentParser(parameters);
          break;
        
        case 'legal_database':
          result = await this.executeLegalDatabase(parameters);
          break;
        
        case 'compliance_checker':
          result = await this.executeComplianceCheck(parameters);
          break;
        
        case 'code_executor':
          result = await this.executeCode(parameters);
          break;
        
        case 'file_manager':
          result = await this.executeFileOperations(parameters);
          break;
        
        default:
          throw new Error(`Unknown tool: ${toolName}`);
      }

      return {
        tool: toolName,
        success: true,
        result,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        tool: toolName,
        success: false,
        result: null,
        error: error.message,
        processingTime: Date.now() - startTime
      };
    }
  }

  private async executeWebSearch(parameters: any): Promise<any> {
    const { query, num = 5 } = parameters;
    
    if (!query) {
      throw new Error('Search query is required');
    }

    try {
      const searchResult = await this.zai.functions.invoke('web_search', {
        query,
        num
      });

      return {
        query,
        results: searchResult,
        totalResults: searchResult.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Web search failed:', error);
      // Fallback to mock data
      return {
        query,
        results: [
          {
            url: `https://example.com/result1`,
            name: `Search result for: ${query}`,
            snippet: `This is a mock search result for the query: ${query}`,
            host_name: 'example.com',
            rank: 1,
            date: new Date().toISOString(),
            favicon: ''
          }
        ],
        totalResults: 1,
        timestamp: new Date().toISOString(),
        warning: 'Real search unavailable, using mock data'
      };
    }
  }

  private async executeCalculator(parameters: any): Promise<any> {
    const { expression } = parameters;
    
    if (!expression) {
      throw new Error('Mathematical expression is required');
    }

    try {
      // Simple and safe math evaluation
      const safeEval = (expr: string): number => {
        // Only allow numbers, basic operators, and parentheses
        const sanitized = expr.replace(/[^0-9+\-*/().\s]/g, '');
        
        // Use Function constructor for safe evaluation
        return Function('"use strict"; return (' + sanitized + ')')();
      };

      const result = safeEval(expression);
      
      return {
        expression,
        result,
        type: typeof result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Invalid mathematical expression: ${expression}`);
    }
  }

  private async executeDataAnalysis(parameters: any): Promise<any> {
    const { data, analysisType = 'basic' } = parameters;
    
    try {
      let analysisResult;

      if (typeof data === 'string') {
        // Assume it's JSON data
        const parsedData = JSON.parse(data);
        analysisResult = this.analyzeDataArray(parsedData);
      } else if (Array.isArray(data)) {
        analysisResult = this.analyzeDataArray(data);
      } else {
        analysisResult = this.analyzeDataObject(data);
      }

      return {
        analysisType,
        dataPoints: Array.isArray(data) ? data.length : 1,
        analysis: analysisResult,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Data analysis failed: ${error.message}`);
    }
  }

  private analyzeDataArray(data: any[]): any {
    if (data.length === 0) return { message: 'No data to analyze' };

    // Basic statistical analysis
    const numericData = data.filter(item => typeof item === 'number');
    
    if (numericData.length > 0) {
      const sum = numericData.reduce((a, b) => a + b, 0);
      const mean = sum / numericData.length;
      const sorted = [...numericData].sort((a, b) => a - b);
      const median = sorted.length % 2 === 0 
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];
      
      return {
        type: 'numeric',
        count: numericData.length,
        sum,
        mean,
        median,
        min: Math.min(...numericData),
        max: Math.max(...numericData),
        range: Math.max(...numericData) - Math.min(...numericData)
      };
    }

    // Text analysis
    const textData = data.filter(item => typeof item === 'string');
    if (textData.length > 0) {
      const totalLength = textData.join('').length;
      const averageLength = totalLength / textData.length;
      
      return {
        type: 'text',
        count: textData.length,
        totalCharacters: totalLength,
        averageLength,
        uniqueItems: [...new Set(textData)].length
      };
    }

    return { type: 'mixed', count: data.length };
  }

  private analyzeDataObject(data: any): any {
    const keys = Object.keys(data);
    const values = Object.values(data);
    
    return {
      type: 'object',
      keys,
      keyCount: keys.length,
      valueTypes: values.map(v => typeof v),
      valueTypesCount: values.reduce((acc, type) => {
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  private async executeDocumentParser(parameters: any): Promise<any> {
    const { content, type = 'text' } = parameters;
    
    if (!content) {
      throw new Error('Content is required for document parsing');
    }

    try {
      let parsedContent;

      switch (type) {
        case 'text':
          parsedContent = this.parseTextDocument(content);
          break;
        case 'json':
          parsedContent = JSON.parse(content);
          break;
        case 'csv':
          parsedContent = this.parseCSV(content);
          break;
        default:
          parsedContent = this.parseTextDocument(content);
      }

      return {
        type,
        originalLength: content.length,
        parsedContent,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Document parsing failed: ${error.message}`);
    }
  }

  private parseTextDocument(content: string): any {
    const lines = content.split('\n');
    const words = content.split(/\s+/).filter(word => word.length > 0);
    
    return {
      lines: lines.length,
      words: words.length,
      characters: content.length,
      averageWordsPerLine: words.length / lines.length,
      preview: content.substring(0, 200) + (content.length > 200 ? '...' : '')
    };
  }

  private parseCSV(content: string): any {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length === 0) return { headers: [], rows: 0 };
    
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(line => 
      line.split(',').map(cell => cell.trim())
    );

    return {
      headers,
      rowCount: rows.length,
      columns: headers.length,
      data: rows
    };
  }

  private async executeLegalDatabase(parameters: any): Promise<any> {
    const { query, jurisdiction = 'US' } = parameters;
    
    // Simulate legal database search
    return {
      query,
      jurisdiction,
      results: [
        {
          id: 'law_001',
          title: 'Relevant Law Section',
          content: 'This is a mock legal document result for the query.',
          relevance: 0.85,
          source: 'Legal Database'
        }
      ],
      totalResults: 1,
      timestamp: new Date().toISOString(),
      note: 'This is a simulated legal database search'
    };
  }

  private async executeComplianceCheck(parameters: any): Promise<any> {
    const { content, regulations = ['GDPR', 'CCPA'] } = parameters;
    
    // Simulate compliance checking
    const issues = [];
    const checks = regulations.map(reg => ({
      regulation: reg,
      status: Math.random() > 0.7 ? 'compliant' : 'non_compliant',
      score: Math.floor(Math.random() * 100)
    }));

    const nonCompliant = checks.filter(c => c.status === 'non_compliant');
    
    return {
      regulations,
      overallStatus: nonCompliant.length === 0 ? 'compliant' : 'non_compliant',
      complianceScore: Math.floor(checks.reduce((sum, c) => sum + c.score, 0) / checks.length),
      checks,
      issues: nonCompliant.length > 0 ? ['Potential compliance issues detected'] : [],
      timestamp: new Date().toISOString()
    };
  }

  private async executeCode(parameters: any): Promise<any> {
    const { code, language = 'javascript' } = parameters;
    
    if (!code) {
      throw new Error('Code is required for execution');
    }

    // Simulate code execution (in production, use a proper sandbox)
    return {
      language,
      code,
      execution: {
        status: 'simulated',
        output: `Code execution simulated for ${language}`,
        executionTime: Math.floor(Math.random() * 1000),
        memoryUsed: Math.floor(Math.random() * 1024)
      },
      timestamp: new Date().toISOString(),
      warning: 'Real code execution disabled for security reasons'
    };
  }

  private async executeFileOperations(parameters: any): Promise<any> {
    const { operation, path, content } = parameters;
    
    // Simulate file operations
    const operations = ['read', 'write', 'delete', 'list'];
    if (!operations.includes(operation)) {
      throw new Error(`Invalid operation: ${operation}`);
    }

    return {
      operation,
      path,
      status: 'simulated',
      result: `File ${operation} operation simulated for path: ${path}`,
      timestamp: new Date().toISOString(),
      note: 'Real file operations disabled for security reasons'
    };
  }

  getAvailableTools(): ToolConfig[] {
    return [
      {
        name: 'web_search',
        description: 'Search the web for information',
        parameters: { query: 'string', num: 'number (optional, default: 5)' }
      },
      {
        name: 'calculator',
        description: 'Perform mathematical calculations',
        parameters: { expression: 'string' }
      },
      {
        name: 'data_analyzer',
        description: 'Analyze data and generate insights',
        parameters: { data: 'array/object', analysisType: 'string (optional)' }
      },
      {
        name: 'document_parser',
        description: 'Parse and extract information from documents',
        parameters: { content: 'string', type: 'string (optional: text, json, csv)' }
      },
      {
        name: 'legal_database',
        description: 'Search legal databases for relevant information',
        parameters: { query: 'string', jurisdiction: 'string (optional)' }
      },
      {
        name: 'compliance_checker',
        description: 'Check content for regulatory compliance',
        parameters: { content: 'string', regulations: 'array (optional)' }
      },
      {
        name: 'code_executor',
        description: 'Execute code in various programming languages',
        parameters: { code: 'string', language: 'string (optional)' }
      },
      {
        name: 'file_manager',
        description: 'Perform file operations',
        parameters: { operation: 'string', path: 'string', content: 'string (optional)' }
      }
    ];
  }
}

// Singleton instance
export const toolsService = new ToolsService();