#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/7d238473a722416649917dd8ab23eb039ddcfbd21399f424d35925c2db78d4a0/contract';
import endContract from '../../snapshots/7d238473a722416649917dd8ab23eb039ddcfbd21399f424d35925c2db78d4a0/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/eb4ad87e1d0baa4720acab12423522c52342388a5ebd8eba8528dbde99310bea/contract';
import startContract from '../../snapshots/eb4ad87e1d0baa4720acab12423522c52342388a5ebd8eba8528dbde99310bea/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.enableRowLevelSecurity({ schema: 'public', table: 'profiles' }),
      this.enableRowLevelSecurity({ schema: 'public', table: 'project_members' }),
      this.enableRowLevelSecurity({ schema: 'public', table: 'projects' }),
      this.enableRowLevelSecurity({ schema: 'public', table: 'tasks' }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
