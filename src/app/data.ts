/* The prototype's data: local, synchronous, deterministic. Generated once per load. */
import { generateVisitors, type Visitor } from '@/data';

export const VISITORS: Visitor[] = generateVisitors();
const BY_ID = new Map(VISITORS.map((v) => [v.id, v]));

export function findVisitor(id: string | undefined): Visitor | undefined {
  return id ? BY_ID.get(id) : undefined;
}
