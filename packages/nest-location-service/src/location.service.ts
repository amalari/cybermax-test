import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@cybermax-test-1/nest-database";
import { schema } from "@cybermax-test-1/database";
import { asc, desc, eq } from "drizzle-orm";

export type InsertLocationServiceInput = schema.InsertLocation & { area?: string, parentId?: number, id?: number}

interface NestedRelations {
  with: {
    parent?: NestedRelations | true;
    children?: NestedRelations | true;
  };
}

const withRelations = (depth: number): NestedRelations => {
  if (depth <= 1) {
    return {
      with: {
        children: true,
      },
    };
  }

  return {
    with: {
      children: withRelations(depth - 1),
    },
  };
}
@Injectable()
export class LocationService {
  constructor(private readonly drizzleService: DrizzleService) {}
  getAll() {
    return this.drizzleService.db.query.locations.findMany();
  }
  findByLocationNumber(locationNumber: string){
    return this.drizzleService.db.query.locations.findFirst({
      where: eq(schema.locations.number, locationNumber)
    });
  }
  findById(id: number){
    return this.drizzleService.db.query.locations.findFirst({
      where: eq(schema.locations.id, id),
      columns: {
        area: true,
        building: true,
        id: true,
        name: true,
        number: true
      }
    });
  }
  async findByIdWithRelations(id: number){
    const highestLevel = await this.drizzleService.db.query.locations.findFirst({
      orderBy: desc(schema.locations.level),
      columns: {
        level: true
      }
    })
   
    return this.drizzleService.db.query.locations.findFirst({
      ...withRelations(highestLevel?.level ?? 0),
      where: eq(schema.locations.id, id),
    })
  }
  upsert(input: InsertLocationServiceInput) {
    return this.drizzleService.db.insert(schema.locations)
      .values(input)
      .onConflictDoUpdate({
        target: schema.locations.id,
        set: input,
      });
  }
  async bulkUpdateLocationAreas(locationsToUpdate: InsertLocationServiceInput[]) {
    return this.drizzleService.db.transaction(async (trx) => {
      for (const loc of locationsToUpdate) {
        await trx.update(schema.locations)
          .set({ number: loc.number })
          .where(eq(schema.locations.id, loc.id!));
      }
    })
  }
  delete(id: number) {
    return this.drizzleService.db.delete(schema.locations)
      .where(eq(schema.locations.id, id))
      .returning()
  }
  async hasChildren(parentId: number) {
    const childLocation = await this.drizzleService.db.query.locations.findFirst({
      where: eq(schema.locations.parentId, parentId)
    })
    return Boolean(childLocation)
  }
  async findAll() {
    const highestLevel = await this.drizzleService.db.query.locations.findFirst({
      orderBy: desc(schema.locations.level),
      columns: {
        level: true
      }
    })
    if(!highestLevel) return []
    return this.drizzleService.db.query.locations.findMany({
      columns: {
        area: true,
        building: true,
        id: true,
        name: true,
        number: true
      },
      orderBy: asc(schema.locations.number)
    })
  }
}
