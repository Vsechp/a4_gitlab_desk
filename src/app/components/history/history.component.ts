import { Component, OnInit, Renderer2, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GitlabService } from '../../services/gitlab.service';

// Импортируем firstValueFrom из 'rxjs'
import { firstValueFrom } from 'rxjs';

interface ActivityItem {
  id: number;
  type: string;
  title: string;
  projectName: string;
  author: string;
  date: string;
  icon: string;
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  activities: ActivityItem[] = [];
  loading: boolean = true;
  error: string | null = null;
  private pixelIntervals: { [key: string]: number } = {};

  constructor(
    private gitlabService: GitlabService,
    private renderer: Renderer2,
    private el: ElementRef
  ) {}

  async ngOnInit() {
    // вызываем асинхронный метод
    await this.loadHistory();
  }

  async loadHistory() {
    try {
      // 1) Преобразуем Observable в массив:
      const projects = await firstValueFrom(this.gitlabService.getProjects());
      
      // 2) Загружаем события для каждого проекта
      const allActivities: ActivityItem[] = [];
      
      for (const project of projects) {
        try {
          // 3) Ждём одновременно коммиты и MR
          const [commits, mergeRequests] = await Promise.all([
            firstValueFrom(this.gitlabService.getProjectCommits(project.id)),
            firstValueFrom(this.gitlabService.getProjectMergeRequests(project.id))
          ]);

          // 4) Преобразуем коммиты в список
          const commitActivities = commits.map((commit: any) => ({
            id: commit.id,
            type: 'commit',
            title: commit.title,
            projectName: project.name,
            author: commit.author_name,
            date: new Date(commit.created_at).toLocaleString(),
            icon: 'code'
          } as ActivityItem));

          // 5) Преобразуем MR в список
          const mrActivities = mergeRequests.map((mr: any) => ({
            id: mr.id,
            type: 'merge_request',
            title: mr.title,
            projectName: project.name,
            author: mr.author.name,
            date: new Date(mr.created_at).toLocaleString(),
            icon: 'merge_type'
          } as ActivityItem));

          // 6) Объединяем все активности
          allActivities.push(...commitActivities, ...mrActivities);
        } catch (error) {
          console.error(`Error loading activities for project ${project.id}:`, error);
        }
      }

      // 7) Сортируем все активности (новые сверху)
      this.activities = allActivities.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      this.loading = false;
    } catch (error) {
      this.error = 'Ошибка при загрузке истории';
      this.loading = false;
      console.error('Error loading history:', error);
    }
  }

  getActivityColor(type: string): string {
    switch (type) {
      case 'commit':
        return 'text-flow-primary';
      case 'merge_request':
        return 'text-amber-500';
      default:
        return 'text-gray-500';
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
  
    this.pixelIntervals[(card.dataset['activityId'] || '').toString()] = 1;
  }

  handleMouseLeave(event: MouseEvent): void {
    const card = event.currentTarget as HTMLElement;
    if (!card) return;

    delete this.pixelIntervals[(card.dataset['activityId'] || '').toString()];

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