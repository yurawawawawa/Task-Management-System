'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Plus, Users, CheckCircle2, Circle, MoreHorizontal } from 'lucide-react';
import { addTask, addCollaborator, updateTaskStatus } from './actions';

export default function ProjectDetailClient({ project, user }: { project: any, user: any }) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newCollabEmail, setNewCollabEmail] = useState('');
  const [loadingTask, setLoadingTask] = useState(false);
  const [loadingCollab, setLoadingCollab] = useState(false);
  const [error, setError] = useState('');
  
  const [assigneeId, setAssigneeId] = useState('');

  const completedTasks = project.tasks.filter((t: any) => t.status === 'DONE').length;
  const totalTasks = project.tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setLoadingTask(true);
    setError('');
    try {
      await addTask(project.id, newTaskTitle, assigneeId || undefined);
      setNewTaskTitle('');
      setAssigneeId('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingTask(false);
    }
  };

  const handleAddCollab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollabEmail.trim()) return;
    setLoadingCollab(true);
    setError('');
    try {
      await addCollaborator(project.id, newCollabEmail);
      setNewCollabEmail('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingCollab(false);
    }
  };

  const toggleTask = async (task: any) => {
    const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    try {
      await updateTaskStatus(task.id, newStatus);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pt-8">
      <Link href="/dashboard" className="inline-flex items-center min-h-[44px] md:min-h-0 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to projects
      </Link>

      <div className="bg-white p-8 rounded-2xl border border-border shadow-sm mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">{project.name}</h1>
        <p className="text-muted-foreground text-sm mb-6 max-w-2xl">{project.description || 'No description provided.'}</p>
        
        {/* Progress Bar */}
        <div className="mb-2">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium text-foreground">Project Progress</span>
            <span className="text-sm font-bold text-foreground">{progress}%</span>
          </div>
          <div className="w-full bg-muted-hover rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">{completedTasks} of {totalTasks} tasks completed</p>
        </div>
      </div>

      {error && (
        <div className="bg-danger-muted text-danger p-4 rounded-xl text-sm mb-8 border border-danger-border font-medium flex items-start">
          <span className="shrink-0 mr-2">s,?</span>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-4">Tasks & Sections</h2>
            
            <form onSubmit={handleAddTask} className="flex flex-col gap-3 mb-6">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Write a new task or part..."
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-primary focus:bg-white text-foreground transition-all placeholder:text-muted-foreground/80"
              />
              <div className="flex gap-3">
                <select 
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="px-4 py-2 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-primary flex-1"
                >
                  <option value="">Unassigned</option>
                  <option value={project.userId}>Me ({project.user.name})</option>
                  {project.members.map((m: any) => (
                    <option key={m.profile.id} value={m.profile.id}>{m.profile.name}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={loadingTask || !newTaskTitle.trim()}
                  className="inline-flex items-center justify-center bg-primary text-primary-foreground px-6 py-2 rounded-xl font-medium text-sm hover:bg-primary-hover transition-all disabled:opacity-50 whitespace-nowrap"
                >
                  {loadingTask ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                  Add Task
                </button>
              </div>
            </form>

            <div className="space-y-3">
              {project.tasks.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">No tasks yet. Break down your project into parts above.</p>
              ) : (
                project.tasks.map((task: any) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border border-border rounded-xl hover:border-primary/20 hover:bg-muted/30 transition-all">
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleTask(task)} className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-full">
                        {task.status === 'DONE' ? (
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>
                      <div>
                        <p className={`text-sm font-medium ${task.status === 'DONE' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {task.title}
                        </p>
                        {task.assignee && (
                          <p className="text-xs text-muted-foreground">Assigned to: {task.assignee.name}</p>
                        )}
                      </div>
                    </div>
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-foreground" />
              <h2 className="text-lg font-bold text-foreground">Collaborators</h2>
            </div>
            
            <form onSubmit={handleAddCollab} className="flex gap-2 mb-6">
              <input
                type="email"
                value={newCollabEmail}
                onChange={(e) => setNewCollabEmail(e.target.value)}
                placeholder="collab@example.com"
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-primary focus:bg-white text-foreground"
              />
              <button
                type="submit"
                disabled={loadingCollab || !newCollabEmail.trim()}
                className="bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover transition-all disabled:opacity-50"
              >
                {loadingCollab ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Invite'}
              </button>
            </form>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                    {project.user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{project.user.name}</p>
                    <p className="text-xs text-muted-foreground">Owner</p>
                  </div>
                </div>
              </div>
              
              {project.members.map((member: any) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-foreground font-bold text-xs uppercase">
                      {member.profile.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{member.profile.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
