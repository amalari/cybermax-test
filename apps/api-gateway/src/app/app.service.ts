import { DrizzleService } from '@cybermax-test-1/nest-database';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor(private readonly drizzleService: DrizzleService) {}
  
  async getData(): Promise<{ message: string }> {
    const a = await this.drizzleService.db.query.locations.findMany();
    return { message: 'Hello API' };
  }
}
