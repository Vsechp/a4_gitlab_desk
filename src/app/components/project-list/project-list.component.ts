import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { GitlabService } from '../../services/gitlab.service';
import { GitlabProject } from '../../interfaces/gitlab.interfaces';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    RouterModule
  ]
})
export class ProjectListComponent implements OnInit {
  projects: GitlabProject[] = [];
  loading = false;
  error: string | null = null;
  private pixelIntervals: { [key: string]: number } = {};

  constructor(
    private gitlabService: GitlabService,
    private router: Router,
    private renderer: Renderer2,
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading = true;
    this.error = null;

    this.gitlabService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
        console.error('Error loading projects:', error);
      }
    });
  }

  handleProjectClick(projectId: number): void {
    if (projectId) {
      this.router.navigate(['/project', projectId]);
    }
  }

  handleMouseEnter(event: MouseEvent): void {
    const card = event.currentTarget as HTMLElement;
    if (!card) return;
  

    const container = this.renderer.createElement('div');
    this.renderer.addClass(container, 'pixel-container');
  
    
    const parent = card.parentNode as HTMLElement;
    if (parent) {
      this.renderer.appendChild(parent, container);

      this.renderer.setStyle(container, 'position', 'absolute');
      this.renderer.setStyle(container, 'left', card.offsetLeft + 'px');
      this.renderer.setStyle(container, 'top', card.offsetTop + 'px');
      this.renderer.setStyle(container, 'width', card.offsetWidth + 'px');
      this.renderer.setStyle(container, 'height', card.offsetHeight + 'px');
      this.renderer.setStyle(container, 'z-index', '-100'); 
    }
  

    for (let i = 0; i < 80; i++) {
      this.createPixel(container);
    }
  

    this.pixelIntervals[(card.dataset['projectId'] || '').toString()] = 1;
  }

  handleMouseLeave(event: MouseEvent): void {
    const card = event.currentTarget as HTMLElement;
    if (!card) return;

    delete this.pixelIntervals[(card.dataset['projectId'] || '').toString()];

    const container = card.querySelector('.pixel-container');
    if (container) {
      setTimeout(() => {
        if (card.contains(container)) {
          this.renderer.removeChild(card, container);
        }
      }, 4100);
    }
  }

  private createPixel(container: HTMLElement): void {
    const colors = ['text-flow-primary', 'text-flow-secondary', 'text-flow-tertiary'];
    const pixel = this.renderer.createElement('div');
    this.renderer.addClass(pixel, 'pixel');
    this.renderer.addClass(pixel, colors[Math.floor(Math.random() * colors.length)]);

    
    const x = Math.random() * 200 - 50; // от -50% до 150%
    const y = Math.random() * 200 - 50; // от -50% до 150%

    this.renderer.setStyle(pixel, 'left', `${x}%`);
    this.renderer.setStyle(pixel, 'top', `${y}%`);

    this.renderer.appendChild(container, pixel);

  }
} 