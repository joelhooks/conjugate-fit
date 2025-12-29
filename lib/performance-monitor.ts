export class PerformanceMonitor {
  private static startTime: number | null = null
  private static endTime: number | null = null

  static start(label: string): void {
    if (typeof performance !== "undefined") {
      PerformanceMonitor.startTime = performance.now()
    }
  }

  static end(label: string): void {
    if (typeof performance !== "undefined" && PerformanceMonitor.startTime !== null) {
      PerformanceMonitor.endTime = performance.now()
      const duration = PerformanceMonitor.endTime - PerformanceMonitor.startTime
      //console.log(`Performance Monitor: ${label} took ${duration.toFixed(2)}ms`);
      PerformanceMonitor.startTime = null
      PerformanceMonitor.endTime = null
    }
  }
}
