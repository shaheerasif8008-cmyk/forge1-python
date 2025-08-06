import { Forge1Config, SystemLayer, AIAgent } from '../types';

export const FORGE1_CONFIG: Forge1Config = {
  system_name: 'Forge1',
  version: '1.0.0',
  layers: [
    {
      id: 'interface',
      name: 'Interface/API',
      tech: 'FastAPI + Web UI',
      description: 'Human interface + API calls',
      status: 'active',
      progress: 85,
      color: 'bg-blue-500',
      config: {
        enabled: true,
        settings: {
          port: 8000,
          cors_enabled: true,
          rate_limit: 1000
        },
        dependencies: ['agent', 'actions'],
        resources: {
          cpu: 2,
          memory: 4,
          storage: 10,
          network: 100
        }
      }
    },
    {
      id: 'agent',
      name: 'Agent Logic',
      tech: 'AutoGen',
      description: 'Main reasoning engine + agent orchestration',
      status: 'active',
      progress: 75,
      color: 'bg-orange-500',
      config: {
        enabled: true,
        settings: {
          max_concurrent_agents: 50,
          reasoning_timeout: 30000
        },
        dependencies: ['memory', 'actions'],
        resources: {
          cpu: 8,
          memory: 16,
          storage: 50,
          gpu: true,
          network: 1000
        }
      }
    },
    {
      id: 'actions',
      name: 'Actions/Tools',
      tech: 'LangChain tools + custom tools',
      description: 'Execution of API calls, file I/O, code, etc',
      status: 'active',
      progress: 70,
      color: 'bg-yellow-500',
      config: {
        enabled: true,
        settings: {
          tool_timeout: 10000,
          max_tools_per_agent: 20
        },
        dependencies: ['interface'],
        resources: {
          cpu: 4,
          memory: 8,
          storage: 20,
          network: 500
        }
      }
    },
    {
      id: 'rag',
      name: 'RAG',
      tech: 'LangChain + LlamaIndex + Haystack',
      description: 'Advanced Retrieval-Augmented Generation',
      status: 'active',
      progress: 65,
      color: 'bg-green-500',
      config: {
        enabled: true,
        settings: {
          embedding_model: 'text-embedding-ada-002',
          chunk_size: 1000,
          overlap: 200
        },
        dependencies: ['memory'],
        resources: {
          cpu: 4,
          memory: 16,
          storage: 100,
          gpu: true,
          network: 500
        }
      }
    },
    {
      id: 'memory',
      name: 'Memory',
      tech: 'Redis + PostgreSQL hybrid',
      description: 'Fast + long-term memory for agents',
      status: 'active',
      progress: 80,
      color: 'bg-purple-500',
      config: {
        enabled: true,
        settings: {
          redis_ttl: 3600,
          pg_connection_pool: 20
        },
        dependencies: [],
        resources: {
          cpu: 2,
          memory: 8,
          storage: 200,
          network: 1000
        }
      }
    },
    {
      id: 'async',
      name: 'Async Execution',
      tech: 'Celery + FastAPI + Function Calling',
      description: 'Async background + parallel workflows',
      status: 'active',
      progress: 60,
      color: 'bg-red-500',
      config: {
        enabled: true,
        settings: {
          worker_concurrency: 10,
          task_timeout: 300
        },
        dependencies: ['agent', 'actions'],
        resources: {
          cpu: 4,
          memory: 8,
          storage: 10,
          network: 500
        }
      }
    },
    {
      id: 'multimodal',
      name: 'Multimodal',
      tech: 'GPT-4o multimodal OR plug-ins',
      description: 'Image, vision, audio input/output',
      status: 'active',
      progress: 55,
      color: 'bg-pink-500',
      config: {
        enabled: true,
        settings: {
          max_file_size: 10485760,
          supported_formats: ['jpg', 'png', 'mp3', 'wav']
        },
        dependencies: ['agent'],
        resources: {
          cpu: 8,
          memory: 16,
          storage: 50,
          gpu: true,
          network: 1000
        }
      }
    },
    {
      id: 'dev',
      name: 'Dev Autonomy',
      tech: 'GPT Engineer + Open Interpreter',
      description: 'Build tools FOR YOU, not for Forge',
      status: 'active',
      progress: 50,
      color: 'bg-indigo-500',
      config: {
        enabled: true,
        settings: {
          auto_deploy: false,
          code_review_enabled: true
        },
        dependencies: ['async', 'security'],
        resources: {
          cpu: 4,
          memory: 8,
          storage: 20,
          network: 500
        }
      }
    },
    {
      id: 'visual',
      name: 'Visual UI',
      tech: 'SuperAGI dashboard',
      description: 'Inspect agent runs if you want GUI',
      status: 'inactive',
      progress: 30,
      color: 'bg-gray-500',
      config: {
        enabled: false,
        settings: {
          dashboard_theme: 'dark',
          refresh_interval: 5000
        },
        dependencies: ['interface'],
        resources: {
          cpu: 2,
          memory: 4,
          storage: 5,
          network: 100
        }
      }
    },
    {
      id: 'security',
      name: 'Security & CI/CD',
      tech: 'Docker + GitHub Actions + auth + pre-commit',
      description: 'Real dev pipeline',
      status: 'active',
      progress: 75,
      color: 'bg-teal-500',
      config: {
        enabled: true,
        settings: {
          mfa_enabled: true,
          audit_log_retention: 365
        },
        dependencies: [],
        resources: {
          cpu: 2,
          memory: 4,
          storage: 10,
          network: 100
        }
      }
    }
  ],
  agents: [
    {
      id: 'agent-001',
      name: 'Financial Analyst',
      type: 'white_collar',
      role: 'Senior Financial Analyst',
      capabilities: ['Financial Analysis', 'Risk Assessment', 'Market Research', 'Report Generation'],
      status: 'ready',
      performance: {
        accuracy: 0.95,
        speed: 0.88,
        reliability: 0.92,
        cost_efficiency: 0.85,
        human_comparison: 1.25
      },
      config: {
        model: 'gpt-4',
        temperature: 0.1,
        max_tokens: 4000,
        tools: ['calculator', 'web_search', 'data_analyzer'],
        memory_config: {
          short_term: true,
          long_term: true,
          context_window: 32000,
          retention_policy: 'keep_all'
        }
      }
    },
    {
      id: 'agent-002',
      name: 'Legal Assistant',
      type: 'white_collar',
      role: 'Legal Document Specialist',
      capabilities: ['Contract Review', 'Legal Research', 'Document Generation', 'Compliance Check'],
      status: 'ready',
      performance: {
        accuracy: 0.92,
        speed: 0.85,
        reliability: 0.90,
        cost_efficiency: 0.80,
        human_comparison: 1.15
      },
      config: {
        model: 'gpt-4',
        temperature: 0.05,
        max_tokens: 4000,
        tools: ['document_parser', 'legal_database', 'compliance_checker'],
        memory_config: {
          short_term: true,
          long_term: true,
          context_window: 32000,
          retention_policy: 'keep_all'
        }
      }
    }
  ],
  deployment: {
    environment: 'development',
    infrastructure: 'docker',
    scaling: {
      auto_scale: true,
      min_instances: 1,
      max_instances: 10,
      target_cpu_utilization: 70,
      target_memory_utilization: 80
    },
    security: {
      authentication: true,
      authorization: true,
      encryption: true,
      audit_logging: true,
      rate_limiting: true
    }
  },
  status: {
    overall_health: 'good',
    active_agents: 2,
    total_agents: 2,
    system_load: 0.45,
    uptime: '24/7',
    last_update: new Date(),
    alerts: []
  }
};