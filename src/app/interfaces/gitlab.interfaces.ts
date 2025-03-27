export interface GitlabNamespace {
  id: number;
  name: string;
  full_path: string;
}

export interface GitlabProject {
  id: number;
  name: string;
  description: string | null;
  avatar_url: string | null;
  namespace: GitlabNamespace;
  star_count: number;
  forks_count: number;
  last_activity_at: string;
}

export interface GitlabTreeItem {
  id: string;
  name: string;
  type: 'tree' | 'blob';
  path: string;
  mode: string;
}

export interface GitlabFile {
  id: string;
  name: string;
  type: string;
  path: string;
  mode: string;
} 