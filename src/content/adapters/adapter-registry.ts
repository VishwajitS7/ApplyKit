import { ApplicationAdapter } from './base-adapter';
import { defaultAdapter } from './generic';
import { greenhouseAdapter } from './greenhouse';
import { leverAdapter } from './lever';
import { workdayAdapter } from './workday';
import { ashbyAdapter } from './ashby';

export class AdapterRegistry {
  private adapters: ApplicationAdapter[] = [];
  private fallbackAdapter: ApplicationAdapter;

  constructor(fallback: ApplicationAdapter = defaultAdapter) {
    this.fallbackAdapter = fallback;
    // Register specialized ATS adapters in order of preference
    this.register(greenhouseAdapter);
    this.register(leverAdapter);
    this.register(workdayAdapter);
    this.register(ashbyAdapter);
  }

  register(adapter: ApplicationAdapter): void {
    // Avoid duplicate registration
    if (!this.adapters.some((a) => a.id === adapter.id)) {
      this.adapters.push(adapter);
    }
  }

  getAll(): ApplicationAdapter[] {
    return [...this.adapters, this.fallbackAdapter];
  }

  getActiveAdapter(): ApplicationAdapter {
    for (const adapter of this.adapters) {
      try {
        if (adapter.matches()) {
          return adapter;
        }
      } catch (err) {
        console.warn(`[ApplyKit] Error checking matches() for adapter ${adapter.id}:`, err);
      }
    }
    return this.fallbackAdapter;
  }
}

export const adapterRegistry = new AdapterRegistry();

export function getActiveAdapter(): ApplicationAdapter {
  return adapterRegistry.getActiveAdapter();
}
