import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { GitlabService } from '../../services/gitlab.service';
import { GitlabProject, GitlabTreeItem } from '../../interfaces/gitlab.interfaces';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatListModule,
    MatDividerModule
  ]
})
export class ProjectDetailComponent implements OnInit {
  loading = false;
  loadingTree = false;
  error: string | null = null;
  treeError: string | null = null;
  project: GitlabProject | null = null;
  tree: GitlabTreeItem[] = [];
  currentPath: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private gitlabService: GitlabService
  ) {}

  ngOnInit() {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId) {
      this.loadProject(Number(projectId));
    } else {
      this.error = 'Проект не найден';
    }
  }

  loadProject(id: number) {
    this.loading = true;
    this.error = null;
    
    this.gitlabService.getProjectDetails(id).subscribe({
      next: (project) => {
        this.project = project;
        this.loading = false;
        this.loadProjectTree();
      },
      error: (error) => {
        this.loading = false;
        if (error.status === 404) {
          this.error = 'Проект не найден';
          setTimeout(() => this.router.navigate(['/projects']), 3000);
        } else {
          this.error = 'Ошибка при загрузке проекта';
        }
      }
    });
  }

  loadProjectTree(path: string = '') {
    this.loadingTree = true;
    this.treeError = null;
    
    if (!this.project?.id) return;

    this.gitlabService.getProjectTree(this.project.id, path).subscribe({
      next: (items) => {
        this.tree = this.sortTreeItems(items);
        this.loadingTree = false;
        this.currentPath = path;
      },
      error: () => {
        this.loadingTree = false;
        this.treeError = 'Ошибка при загрузке файлов';
      }
    });
  }

  sortTreeItems(items: GitlabTreeItem[]): GitlabTreeItem[] {
    return items.sort((a, b) => {
      // Folders first
      if (a.type === 'tree' && b.type !== 'tree') return -1;
      if (a.type !== 'tree' && b.type === 'tree') return 1;
      // Then alphabetically
      return a.name.localeCompare(b.name);
    });
  }

  handleItemClick(item: GitlabTreeItem) {
    if (item.type === 'tree') {
      const newPath = this.currentPath ? `${this.currentPath}/${item.name}` : item.name;
      this.loadProjectTree(newPath);
    }
  }

  navigateUp() {
    const pathParts = this.currentPath.split('/');
    pathParts.pop();
    const newPath = pathParts.join('/');
    this.loadProjectTree(newPath);
  }

  getFileIcon(type: string): string {
    switch (type) {
      case 'tree': return 'folder';
      case 'blob':
        return 'description';
      default:
        return 'insert_drive_file';
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
} 