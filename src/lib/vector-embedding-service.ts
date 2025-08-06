export interface VectorEmbedding {
  id: string;
  vector: number[];
  content: string;
  metadata: {
    agentId: string;
    sessionId?: string;
    timestamp: Date;
    type: 'message' | 'document' | 'knowledge' | 'context';
    topic?: string;
    emotion?: string;
    tags?: string[];
    source?: string;
    confidence?: number;
  };
}

export interface SimilaritySearch {
  query: string;
  agentId?: string;
  sessionId?: string;
  type?: VectorEmbedding['metadata']['type'];
  topic?: string;
  tags?: string[];
  limit?: number;
  threshold?: number;
}

export interface SearchResult {
  embedding: VectorEmbedding;
  similarity: number;
  relevanceScore: number;
}

export interface ContextWindow {
  embeddings: VectorEmbedding[];
  summary: string;
  keyTopics: string[];
  relevanceScore: number;
  timestamp: Date;
}

export class VectorEmbeddingService {
  private embeddings: VectorEmbedding[] = [];
  private dimension = 1536; // Standard OpenAI embedding dimension
  private storage: Storage;

  constructor() {
    this.storage = localStorage; // In production, this would be a vector database
    this.loadEmbeddings();
  }

  // Generate a simple embedding (in production, this would use a proper embedding model)
  async generateEmbedding(text: string): Promise<number[]> {
    // Simple hash-based embedding for demo purposes
    // In production, this would use OpenAI's text-embedding-ada-002 or similar
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(this.dimension).fill(0);
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const hash = this.simpleHash(word);
      
      // Distribute the hash across the embedding dimensions
      for (let j = 0; j < this.dimension; j++) {
        embedding[j] += Math.sin(hash * (j + 1)) * (1 / Math.sqrt(words.length));
      }
    }
    
    // Normalize the embedding
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
  }

  // Store an embedding with metadata
  async storeEmbedding(
    content: string,
    metadata: VectorEmbedding['metadata']
  ): Promise<VectorEmbedding> {
    const vector = await this.generateEmbedding(content);
    
    const embedding: VectorEmbedding = {
      id: this.generateId(),
      vector,
      content,
      metadata: {
        ...metadata,
        timestamp: new Date()
      }
    };

    this.embeddings.push(embedding);
    this.saveEmbeddings();

    return embedding;
  }

  // Search for similar embeddings
  async similaritySearch(search: SimilaritySearch): Promise<SearchResult[]> {
    const queryVector = await this.generateEmbedding(search.query);
    
    let filteredEmbeddings = this.embeddings;

    // Apply filters
    if (search.agentId) {
      filteredEmbeddings = filteredEmbeddings.filter(e => e.metadata.agentId === search.agentId);
    }

    if (search.sessionId) {
      filteredEmbeddings = filteredEmbeddings.filter(e => e.metadata.sessionId === search.sessionId);
    }

    if (search.type) {
      filteredEmbeddings = filteredEmbeddings.filter(e => e.metadata.type === search.type);
    }

    if (search.topic) {
      filteredEmbeddings = filteredEmbeddings.filter(e => 
        e.metadata.topic?.toLowerCase().includes(search.topic!.toLowerCase())
      );
    }

    if (search.tags && search.tags.length > 0) {
      filteredEmbeddings = filteredEmbeddings.filter(e =>
        search.tags!.some(tag => e.metadata.tags?.includes(tag))
      );
    }

    // Calculate similarity scores
    const results: SearchResult[] = filteredEmbeddings.map(embedding => {
      const similarity = this.cosineSimilarity(queryVector, embedding.vector);
      const relevanceScore = this.calculateRelevanceScore(embedding, search);
      
      return {
        embedding,
        similarity,
        relevanceScore
      };
    });

    // Filter by threshold and sort
    const threshold = search.threshold || 0.5;
    const filteredResults = results.filter(r => r.similarity >= threshold);
    
    // Sort by combined score (similarity + relevance)
    filteredResults.sort((a, b) => {
      const scoreA = (a.similarity * 0.7) + (a.relevanceScore * 0.3);
      const scoreB = (b.similarity * 0.7) + (b.relevanceScore * 0.3);
      return scoreB - scoreA;
    });

    // Apply limit
    const limit = search.limit || 10;
    return filteredResults.slice(0, limit);
  }

  // Build context window from relevant embeddings
  async buildContextWindow(
    query: string,
    agentId: string,
    sessionId?: string,
    options: {
      maxEmbeddings?: number;
      timeWindow?: number; // hours
      types?: VectorEmbedding['metadata']['type'][];
    } = {}
  ): Promise<ContextWindow> {
    const search: SimilaritySearch = {
      query,
      agentId,
      sessionId,
      limit: options.maxEmbeddings || 20,
      threshold: 0.3
    };

    if (options.types) {
      search.type = options.types[0]; // For simplicity, search for one type at a time
    }

    const results = await this.similaritySearch(search);

    // Apply time window filter
    let filteredResults = results;
    if (options.timeWindow) {
      const cutoffTime = new Date(Date.now() - options.timeWindow * 60 * 60 * 1000);
      filteredResults = results.filter(r => r.embedding.metadata.timestamp > cutoffTime);
    }

    // Extract key topics
    const allTopics = filteredResults
      .map(r => r.embedding.metadata.topic)
      .filter((topic): topic is string => !!topic);
    
    const topicCounts = allTopics.reduce((acc, topic) => {
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const keyTopics = Object.entries(topicCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic);

    // Generate a summary of the context
    const summary = await this.generateContextSummary(
      query,
      filteredResults.map(r => r.embedding)
    );

    // Calculate overall relevance score
    const relevanceScore = filteredResults.reduce((sum, r) => sum + r.relevanceScore, 0) / filteredResults.length;

    return {
      embeddings: filteredResults.map(r => r.embedding),
      summary,
      keyTopics,
      relevanceScore,
      timestamp: new Date()
    };
  }

  // Update embedding metadata
  async updateEmbeddingMetadata(
    embeddingId: string,
    metadataUpdates: Partial<VectorEmbedding['metadata']>
  ): Promise<boolean> {
    const embedding = this.embeddings.find(e => e.id === embeddingId);
    if (!embedding) return false;

    embedding.metadata = {
      ...embedding.metadata,
      ...metadataUpdates
    };

    this.saveEmbeddings();
    return true;
  }

  // Delete embeddings
  async deleteEmbeddings(filter: {
    agentId?: string;
    sessionId?: string;
    type?: VectorEmbedding['metadata']['type'];
    before?: Date;
  }): Promise<number> {
    let initialCount = this.embeddings.length;

    this.embeddings = this.embeddings.filter(embedding => {
      if (filter.agentId && embedding.metadata.agentId !== filter.agentId) return true;
      if (filter.sessionId && embedding.metadata.sessionId !== filter.sessionId) return true;
      if (filter.type && embedding.metadata.type !== filter.type) return true;
      if (filter.before && embedding.metadata.timestamp > filter.before) return true;
      return false;
    });

    const deletedCount = initialCount - this.embeddings.length;
    if (deletedCount > 0) {
      this.saveEmbeddings();
    }

    return deletedCount;
  }

  // Get analytics on embeddings
  async getEmbeddingAnalytics(agentId?: string): Promise<{
    totalEmbeddings: number;
    embeddingsByType: Record<string, number>;
    embeddingsByTopic: Record<string, number>;
    averageSimilarity: number;
    growthTrend: Array<{ date: string; count: number }>;
  }> {
    let filteredEmbeddings = this.embeddings;
    if (agentId) {
      filteredEmbeddings = filteredEmbeddings.filter(e => e.metadata.agentId === agentId);
    }

    // By type
    const embeddingsByType = filteredEmbeddings.reduce((acc, embedding) => {
      const type = embedding.metadata.type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // By topic
    const embeddingsByTopic = filteredEmbeddings.reduce((acc, embedding) => {
      const topic = embedding.metadata.topic || 'unknown';
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Average similarity (sample calculation)
    let totalSimilarity = 0;
    let comparisonCount = 0;
    
    for (let i = 0; i < Math.min(filteredEmbeddings.length, 100); i++) {
      for (let j = i + 1; j < Math.min(filteredEmbeddings.length, 100); j++) {
        totalSimilarity += this.cosineSimilarity(
          filteredEmbeddings[i].vector,
          filteredEmbeddings[j].vector
        );
        comparisonCount++;
      }
    }

    const averageSimilarity = comparisonCount > 0 ? totalSimilarity / comparisonCount : 0;

    // Growth trend (last 7 days)
    const growthTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = filteredEmbeddings.filter(e => {
        const embeddingDate = new Date(e.metadata.timestamp);
        return embeddingDate.toISOString().split('T')[0] === dateStr;
      }).length;

      growthTrend.push({ date: dateStr, count });
    }

    return {
      totalEmbeddings: filteredEmbeddings.length,
      embeddingsByType,
      embeddingsByTopic,
      averageSimilarity,
      growthTrend
    };
  }

  // Utility methods
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;

    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));

    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
  }

  private calculateRelevanceScore(embedding: VectorEmbedding, search: SimilaritySearch): number {
    let score = 0;

    // Type relevance
    if (search.type && embedding.metadata.type === search.type) {
      score += 0.3;
    }

    // Topic relevance
    if (search.topic && embedding.metadata.topic?.toLowerCase().includes(search.topic.toLowerCase())) {
      score += 0.3;
    }

    // Tag relevance
    if (search.tags && search.tags.length > 0) {
      const matchingTags = search.tags.filter(tag => embedding.metadata.tags?.includes(tag));
      score += (matchingTags.length / search.tags.length) * 0.2;
    }

    // Recency (more recent = higher score)
    const ageInHours = (Date.now() - embedding.metadata.timestamp.getTime()) / (1000 * 60 * 60);
    const recencyScore = Math.max(0, 1 - (ageInHours / 168)); // Decay over a week
    score += recencyScore * 0.2;

    return Math.min(score, 1);
  }

  private async generateContextSummary(query: string, embeddings: VectorEmbedding[]): Promise<string> {
    if (embeddings.length === 0) return "No relevant context found.";

    // Simple summary based on content overlap and key topics
    const allContent = embeddings.map(e => e.content).join(' ');
    const contentLength = allContent.length;
    
    // Extract key terms (simple frequency-based)
    const words = allContent.toLowerCase().split(/\s+/);
    const wordFreq = words.reduce((acc, word) => {
      if (word.length > 3) { // Ignore short words
        acc[word] = (acc[word] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const keyTerms = Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([term]) => term);

    const topics = embeddings
      .map(e => e.metadata.topic)
      .filter((topic): topic is string => !!topic);

    const uniqueTopics = [...new Set(topics)];

    return `Context summary: Found ${embeddings.length} relevant items covering topics: ${uniqueTopics.join(', ')}. Key terms include: ${keyTerms.join(', ')}. Total context size: ${contentLength} characters.`;
  }

  private loadEmbeddings(): void {
    try {
      const data = this.storage.getItem('vector_embeddings');
      if (data) {
        const parsed = JSON.parse(data);
        this.embeddings = parsed.map((e: any) => ({
          ...e,
          metadata: {
            ...e.metadata,
            timestamp: new Date(e.metadata.timestamp)
          }
        }));
      }
    } catch (error) {
      console.error('Error loading embeddings:', error);
      this.embeddings = [];
    }
  }

  private saveEmbeddings(): void {
    try {
      this.storage.setItem('vector_embeddings', JSON.stringify(this.embeddings));
    } catch (error) {
      console.error('Error saving embeddings:', error);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// Singleton instance
export const vectorEmbeddingService = new VectorEmbeddingService();