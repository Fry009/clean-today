import { Employee } from '@core/entities/types';
import { EmployeeRepository } from '@core/ports/repositories';

import { db } from '../storage/dexieClient';

export class LocalEmployeeRepository implements EmployeeRepository {
  async getEmployee(id: string): Promise<Employee | undefined> {
    return db.employees.get(id);
  }
}
