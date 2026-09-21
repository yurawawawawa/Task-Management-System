#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/5aa70b7976f6e639900791596d033542a088b487146e72a2c4d21d66c8f39dc7/contract';
import startContract from '../../snapshots/5aa70b7976f6e639900791596d033542a088b487146e72a2c4d21d66c8f39dc7/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/eb4ad87e1d0baa4720acab12423522c52342388a5ebd8eba8528dbde99310bea/contract';
import endContract from '../../snapshots/eb4ad87e1d0baa4720acab12423522c52342388a5ebd8eba8528dbde99310bea/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'project_members',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('profile_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('project_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('role', 'text', {
            notNull: true,
            default: lit('MEMBER'),
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'tasks',
        column: col('assignee_id', 'uuid', { codecRef: { codecId: 'pg/uuid@1' } }),
      }),
      this.addUnique({
        schema: 'public',
        table: 'project_members',
        constraint: 'project_members_project_id_profile_id_key',
        columns: ['project_id', 'profile_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'project_members',
        index: 'project_members_profile_id_idx_ff36b76a',
        columns: ['profile_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'project_members',
        index: 'project_members_project_id_idx_6ad92603',
        columns: ['project_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'tasks',
        index: 'tasks_assignee_id_idx_d45afe9c',
        columns: ['assignee_id'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'project_members',
        foreignKey: {
          name: 'project_members_project_id_fkey',
          columns: ['project_id'],
          references: { schema: 'public', table: 'projects', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'project_members',
        foreignKey: {
          name: 'project_members_profile_id_fkey',
          columns: ['profile_id'],
          references: { schema: 'public', table: 'profiles', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'tasks',
        foreignKey: {
          name: 'tasks_assignee_id_fkey',
          columns: ['assignee_id'],
          references: { schema: 'public', table: 'profiles', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
