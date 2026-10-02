#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/75751bdc4b3802588313742cc7b5671dd4acf80049423a305df0a4a04a4b1892/contract';
import endContract from '../../snapshots/75751bdc4b3802588313742cc7b5671dd4acf80049423a305df0a4a04a4b1892/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/7d238473a722416649917dd8ab23eb039ddcfbd21399f424d35925c2db78d4a0/contract';
import startContract from '../../snapshots/7d238473a722416649917dd8ab23eb039ddcfbd21399f424d35925c2db78d4a0/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'daily_activities',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('date', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('streak_counted', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('task_count', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('user_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'habit_completions',
        columns: [
          col('completed_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('date', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('habit_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'habits',
        columns: [
          col('category', 'text', {
            notNull: true,
            default: lit('Produktivitas'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('frequency', 'text', {
            notNull: true,
            default: lit('DAILY'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('user_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'daily_activities',
        constraint: 'daily_activities_user_id_date_key',
        columns: ['user_id', 'date'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'habit_completions',
        constraint: 'habit_completions_habit_id_date_key',
        columns: ['habit_id', 'date'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'daily_activities',
        index: 'daily_activities_user_id_date_idx_ad901aac',
        columns: ['user_id', 'date'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'daily_activities',
        index: 'daily_activities_user_id_idx_6c952402',
        columns: ['user_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'habit_completions',
        index: 'habit_completions_habit_id_date_idx_ff43a48f',
        columns: ['habit_id', 'date'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'habit_completions',
        index: 'habit_completions_habit_id_idx_86c467ac',
        columns: ['habit_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'habits',
        index: 'habits_user_id_idx_6c952402',
        columns: ['user_id'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'daily_activities',
        foreignKey: {
          name: 'daily_activities_user_id_fkey',
          columns: ['user_id'],
          references: { schema: 'public', table: 'profiles', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'habit_completions',
        foreignKey: {
          name: 'habit_completions_habit_id_fkey',
          columns: ['habit_id'],
          references: { schema: 'public', table: 'habits', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'habits',
        foreignKey: {
          name: 'habits_user_id_fkey',
          columns: ['user_id'],
          references: { schema: 'public', table: 'profiles', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.enableRowLevelSecurity({ schema: 'public', table: 'daily_activities' }),
      this.enableRowLevelSecurity({ schema: 'public', table: 'habit_completions' }),
      this.enableRowLevelSecurity({ schema: 'public', table: 'habits' }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
