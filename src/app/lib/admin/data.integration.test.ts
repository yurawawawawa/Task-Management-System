import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, beforeEach, afterEach, describe, it, expect, vi } from 'vitest';

// An isolated, in-memory PostgreSQL provided by the existing Prisma toolchain.
// Never connects to DATABASE_URL, Supabase, or the user's live database.
const state = vi.hoisted(() => ({ connection: undefined as PGlite | undefined, authorized: true }));
type TestQuery = { text: string; values: unknown[] };
vi.mock('./sql', () => ({
  sql: (parts: TemplateStringsArray, ...values: unknown[]) => ({text:parts.reduce((s,p,i)=>s+(i ? `$${i}` : '')+p,''),values}),
  readJson: async (q:TestQuery) => {
    const result = await state.connection!.query<{payload:string}>(q.text,q.values);
    return JSON.parse(result.rows[0].payload);
  },
  execute: async (q:TestQuery) => state.connection!.query(q.text,q.values),
}));
vi.mock('./auth', () => ({ requireAdmin: vi.fn(async () => {
  if (!state.authorized) throw new Error('Forbidden');
  return {id:'00000000-0000-4000-8000-000000000001',role:'ADMIN'};
}) }));
import { getOverview, getUsers, getUserDetail, getLogs, getHealth, getBilling } from './data';
import { recordActivity, recordOperation, recordAudit, withApiTelemetry } from './telemetry';
const first = '00000000-0000-4000-8000-000000000001';
const second = '00000000-0000-4000-8000-000000000002';
const third = '00000000-0000-4000-8000-000000000003';

beforeAll(async () => {
  state.connection = new PGlite();
  await state.connection.exec(`
    CREATE ROLE anon; CREATE ROLE authenticated;
    CREATE TABLE public.profiles (id uuid PRIMARY KEY, name text NOT NULL, email text NOT NULL,
      created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    CREATE TABLE public.projects (id uuid PRIMARY KEY, user_id uuid REFERENCES public.profiles, created_at timestamptz DEFAULT now());
    CREATE TABLE public.tasks (id uuid PRIMARY KEY, user_id uuid REFERENCES public.profiles, project_id uuid REFERENCES public.projects,
      status text DEFAULT 'TODO', created_at timestamptz DEFAULT now());
    CREATE TABLE public.habits (id uuid PRIMARY KEY, user_id uuid REFERENCES public.profiles, created_at timestamptz DEFAULT now());
  `);
  await state.connection.exec(readFileSync(new URL('../../../../migrations/admin-control-center.sql', import.meta.url),'utf8'));
  await state.connection.exec(`
    INSERT INTO public.profiles (id,name,email,role,created_at) VALUES
      ('${first}','Alice Admin','alice@example.test','ADMIN',now()-interval '40 days'),
      ('${second}','Bob User','bob@example.test','USER',now()-interval '2 days'),
      ('${third}','Carol User','carol@example.test','USER',now());
    UPDATE public.profiles SET role='ADMIN' WHERE id='${first}';
    INSERT INTO trekly_admin.activity_events (user_id,event_type,entity_type,created_at) VALUES
      ('${first}','TASK_CREATED','task',now()), ('${first}','TASK_COMPLETED','task',now()),
      ('${second}','HABIT_CREATED','habit',now()-interval '2 days'),
      ('${third}','PROJECT_CREATED','project',now()-interval '10 days'),
      ('${third}','USER_LOGIN','user',now()), ('${second}','FUTURE_NON_MEANINGFUL','user',now());
    INSERT INTO public.projects (id,user_id) VALUES ('${first}','${first}'),('${second}','${second}');
    INSERT INTO public.tasks (id,user_id,project_id,status) VALUES ('${first}','${first}','${first}','TODO'),('${second}','${first}','${first}','DONE');
    INSERT INTO public.habits (id,user_id) VALUES ('${first}','${second}');
  `);
});
beforeEach(async () => {
  state.authorized = true;
  vi.stubEnv('TREKLY_ADMIN_TELEMETRY_ENABLED','true');
  await state.connection!.exec('BEGIN');
});
afterEach(async () => { await state.connection!.exec('ROLLBACK'); vi.unstubAllEnvs(); vi.restoreAllMocks(); });
afterAll(async () => { await state.connection?.close(); });

describe('admin SQL on isolated PostgreSQL', () => {
  it('counts distinct meaningful users, excludes login, and reads actual product records', async () => {
    const data = await getOverview();
    expect(data.users.total).toBe(3);
    expect(data.users.today).toBe(1);
    expect(data.active).toEqual({now:1,dau:1,wau:2,mau:3});
    expect(data.product).toEqual({projects:2,tasks:2,completed:1,habits:1,activeProjects:1});
    expect(data.growth).toHaveLength(30);
    expect(data.growth.reduce((sum,row)=>sum+row.signups,0)).toBe(2);
    expect(data.trackingStartedAt).toBeTruthy();
  });
  it('searches, filters and sorts without interpolating search into SQL', async () => {
    expect((await getUsers(new URLSearchParams('q=alice'))).users[0]).toMatchObject({id:first,role:'ADMIN',projects:1,tasks:2,completed_tasks:1});
    expect((await getUsers(new URLSearchParams('role=USER'))).total).toBe(2);
    expect((await getUsers(new URLSearchParams('activity=active'))).total).toBe(3);
    expect((await getUsers(new URLSearchParams('activity=inactive'))).total).toBe(0);
    expect((await getUsers(new URLSearchParams('sort=oldest'))).users[0].id).toBe(first);
    expect((await getUsers(new URLSearchParams('sort=activity'))).users[0].id).toBe(first);
    for (const q of ["' OR 1=1 --",'%', '_', '\\']) expect((await getUsers(new URLSearchParams({q}))).total).toBe(0);
    expect((await getUsers(new URLSearchParams('page=2'))).users).toHaveLength(0);
  });
  it('paginates without overlapping users', async () => {
    await state.connection!.exec(`INSERT INTO public.profiles (id,name,email) SELECT gen_random_uuid(),'New '||n,'new'||n||'@example.test' FROM generate_series(1,25) n`);
    const page1 = await getUsers(new URLSearchParams());
    const page2 = await getUsers(new URLSearchParams('page=2'));
    expect(page1.total).toBe(28); expect(page1.users).toHaveLength(20); expect(page2.users).toHaveLength(8);
    expect(new Set([...page1.users,...page2.users].map(user=>user.id)).size).toBe(28);
  });
  it('returns only safe user detail and meaningful last-active', async () => {
    const data = await getUserDetail(third);
    expect(data.user?.last_active).not.toBe(data.activity[0].created_at);
    expect(Object.keys(data.user!)).toEqual(expect.arrayContaining(['name','email','role','last_active']));
    expect(JSON.stringify(data)).not.toMatch(/password|refresh_token|user_metadata/);
    expect((await getUserDetail('00000000-0000-4000-8000-999999999999')).user).toBeNull();
  });
  it('records bounded operational status without sensitive request details and keeps response intact', async () => {
    const response = new Response('private response', {status:401});
    const handler = withApiTelemetry<[Request]>('auth.login.POST', async () => response);
    expect(await handler(new Request('http://localhost/api/auth/login?password=secret'))).toBe(response);
    const operations = await getLogs('operations');
    expect(operations.total).toBe(3); // API + AUTH + SECURITY categories, not three requests
    expect(JSON.stringify(operations)).not.toMatch(/secret|private response|password/);
    const overview = await getOverview();
    expect(overview.operations).toMatchObject({requests:1,failedRequests:1,serverFailures:0,authFailures:1,securityEvents:1});
  });
  it('computes health from observations without double-counting AUTH 5xx', async () => {
    await recordOperation({category:'API',operation:'tasks.GET',outcome:'SUCCESS',status:200,durationMs:12});
    await recordOperation({category:'API',operation:'auth.login.POST',outcome:'FAILURE',status:503});
    await recordOperation({category:'AUTH',operation:'auth.login.POST',outcome:'FAILURE',status:503});
    const health = await getHealth();
    expect(health.api).toBeTruthy(); expect(health.auth).toBeNull(); expect(health.failures).toBe(1);
    expect(health.database).toBe('reachable');
    expect((await getLogs('errors')).total).toBe(2);
  });
  it('audits privileged reads and manual promotions with their target', async () => {
    await getUserDetail(second);
    const logs = await getLogs('audit');
    expect(logs.rows).toContainEqual(expect.objectContaining({operation:'VIEW_USER_DETAIL',user_id:first,target_id:second}));
    expect(logs.rows).toContainEqual(expect.objectContaining({operation:'DATABASE_ROLE_CHANGED_ADMIN',target_id:first}));
  });
  it('never invents paid/free/revenue metrics', async () => {
    const result = await getBilling();
    expect(result.available).toBe(false);
    expect(result.reason).toContain('Unavailable');
    expect(result).not.toHaveProperty('revenue');
  });
  it('authorizes every data accessor, not just pages', async () => {
    state.authorized = false;
    for (const call of [()=>getOverview(),()=>getUsers(new URLSearchParams()),()=>getUserDetail(first),()=>getLogs('audit'),()=>getHealth(),()=>getBilling()]) {
      await expect(call()).rejects.toThrow('Forbidden');
    }
  });
  it('forces USER on insert even if a signup trigger supplies ADMIN', async () => {
    const result = await state.connection!.query<{role:string}>("INSERT INTO public.profiles(id,name,email,role) VALUES(gen_random_uuid(),'Attempt','attempt@example.test','ADMIN') RETURNING role");
    expect(result.rows[0].role).toBe('USER');
  });
  it('locks client roles out of telemetry, audit and role updates', async () => {
    const result = await state.connection!.query<{schema_access:boolean;role_write:boolean;rls_count:number}>(`
      SELECT has_schema_privilege('authenticated','trekly_admin','USAGE') AS schema_access,
        has_column_privilege('authenticated','public.profiles','role','UPDATE') AS role_write,
        (SELECT count(*)::int FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='trekly_admin' AND c.relkind='r' AND c.relrowsecurity) AS rls_count`);
    expect(result.rows[0]).toEqual({schema_access:false,role_write:false,rls_count:4});
    await state.connection!.exec('SAVEPOINT client_access; SET LOCAL ROLE authenticated');
    await expect(state.connection!.query('SELECT * FROM trekly_admin.audit_logs')).rejects.toThrow(/permission denied/);
    await state.connection!.exec('ROLLBACK TO SAVEPOINT client_access');
  });
  it('rejects role escalation even if a future policy accidentally grants role UPDATE', async () => {
    await state.connection!.exec(`GRANT SELECT,UPDATE ON public.profiles TO authenticated;
      CREATE POLICY test_update ON public.profiles FOR ALL TO authenticated USING(true) WITH CHECK(true);
      SAVEPOINT unsafe_policy; SET LOCAL ROLE authenticated;`);
    await expect(state.connection!.query(`UPDATE public.profiles SET role='ADMIN' WHERE id='${second}'`)).rejects.toThrow('Profile role cannot be changed by a client');
    await state.connection!.exec('ROLLBACK TO SAVEPOINT unsafe_policy');
  });
  it('supports null telemetry fields and disables writes until migration is enabled', async () => {
    await recordActivity(first,'TASK_UPDATED','task');
    await recordAudit(first,'TEST_READ');
    vi.stubEnv('TREKLY_ADMIN_TELEMETRY_ENABLED','false');
    await recordActivity(first,'TASK_DELETED','task');
    await recordOperation({category:'ERROR',operation:'ignored',outcome:'FAILURE'});
    expect((await getLogs('errors')).total).toBe(0);
    const detail = await getUserDetail(first);
    expect(detail.activity.some(row=>row.event_type==='TASK_UPDATED')).toBe(true);
    expect(detail.activity.some(row=>row.event_type==='TASK_DELETED')).toBe(false);
  });
  it('keeps business operations successful when optional telemetry fails, while audit fails closed', async () => {
    const spy = vi.spyOn(console,'warn').mockImplementation(()=>{});
    await state.connection!.exec('SAVEPOINT down; DROP TABLE trekly_admin.operation_events');
    const response = await withApiTelemetry('tasks.POST', async () => new Response(null,{status:201}))();
    expect(response.status).toBe(201); expect(spy).toHaveBeenCalled();
    await state.connection!.exec('ROLLBACK TO SAVEPOINT down');
    await state.connection!.exec('SAVEPOINT audit_down; DROP TABLE trekly_admin.audit_logs');
    await expect(getOverview()).rejects.toThrow();
    await state.connection!.exec('ROLLBACK TO SAVEPOINT audit_down');
  });
});
