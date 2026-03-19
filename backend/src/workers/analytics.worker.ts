import prisma from '../lib/prisma.js';

export class AnalyticsWorker {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  private readonly TICK_RATE_MS = 60 * 1000; // Run every minute

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('[AnalyticsWorker] Started background processing...');
    
    // Initial run
    void this.processQueue();
    
    // Scheduled runs
    this.intervalId = setInterval(() => {
      void this.processQueue();
    }, this.TICK_RATE_MS);
  }

  stop() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    console.log('[AnalyticsWorker] Stopped background processing.');
  }

  private async processQueue() {
    console.log('[AnalyticsWorker] Running scheduled analytics aggregation...');
    
    try {
      // In a production environment, this would pull jobs from SQS, BullMQ, or RabbitMQ
      // Here we simulate aggregating metrics across all tenants
      
      const tenants = await prisma.organization.findMany({ select: { id: true, name: true } });
      
      for (const tenant of tenants) {
        // Example: Aggregate average cleanliness scores per tenant
        const zones = await prisma.zone.findMany({
          where: { organizationId: tenant.id },
          select: { cleanlinessScore: true }
        });
        
        if (zones.length > 0) {
          const avgScore = zones.reduce((acc, curr) => acc + curr.cleanlinessScore, 0) / zones.length;
          console.log(`[AnalyticsWorker] ${tenant.name} - Avg Cleanliness: ${avgScore.toFixed(2)}`);
          
          // Here you'd update a materialized view or aggregated stats table manually
        }
      }
    } catch (error) {
      console.error('[AnalyticsWorker] Error processing queue:', error);
    }
  }
}

export const analyticsWorker = new AnalyticsWorker();
