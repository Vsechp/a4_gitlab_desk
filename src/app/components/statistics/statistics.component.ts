import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { firstValueFrom } from 'rxjs';
import { GitlabService } from '../../services/gitlab.service';
import { Chart, ChartConfiguration, ChartOptions } from 'chart.js/auto';
import { Router, RouterModule } from '@angular/router';

interface CommitData {
  year: number;
  month: number;
  count: number;
}

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatButtonToggleModule,
    RouterModule
  ],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('activityChart') chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  totalProjects = 0;
  totalCommits = 0;
  activeUsers = 0;
  mergeRequests = 0;
  loading = true;
  error: string | null = null;
  currentView: 'yearly' | 'monthly' = 'yearly';
  chartType: 'commits' | 'projects' = 'commits';
  private pixelIntervals: { [key: string]: number } = {};
  
  private activityChart?: Chart;
  private commitsByYear: Record<number, number> = {};
  private projectsByYear: Record<number, number> = {};
  private commitsByMonth: CommitData[] = [];
  private projectsByMonth: Record<string, number> = {};
  
  // Обновленные цвета для графиков
  private chartColors = {
    primary: 'rgb(236, 72, 153)',   // flow-primary
    secondary: 'rgb(219, 39, 119)', // darker shade
    tertiary: 'rgb(244, 114, 182)', // lighter shade
    background: 'rgba(236, 72, 153, 0.2)',
    border: 'rgb(236, 72, 153)',
    gridLines: 'rgba(255, 255, 255, 0.1)',
    text: '#8E8E8E'
  };
  
  constructor(
    private gitlabService: GitlabService,
    private router: Router,
    private renderer: Renderer2,
    private el: ElementRef
  ) {}

  ngOnInit() {
    this.loadStatistics();
  }
  
  ngAfterViewInit() {
    // После инициализации представления автоматически создастся график
    setTimeout(() => {
      if (!this.loading && !this.error && this.chartCanvas) {
        this.createActivityChart();
      }
    }, 300);
  }
  
  ngOnDestroy() {
    // Уничтожаем график при уничтожении компонента
    if (this.activityChart) {
      this.activityChart.destroy();
    }
  }

  async loadStatistics(): Promise<void> {
    try {
      const projects = await firstValueFrom(this.gitlabService.getProjects());
      const users = await firstValueFrom(this.gitlabService.getUsers());
      
      this.totalProjects = projects.length;
      this.activeUsers = users.filter((user: any) => user.state === 'active').length;
      
      let totalCommits = 0;
      let totalMRs = 0;

      // Инициализируем массивы для хранения данных
      this.commitsByYear = {};
      this.projectsByYear = {};
      this.commitsByMonth = [];
      this.projectsByMonth = {};

      // Обработка данных проектов
      for (const project of projects) {
        try {
          // Получаем коммиты и MR для каждого проекта
          const [commits, mrs] = await Promise.all([
            firstValueFrom(this.gitlabService.getProjectCommits(project.id)),
            firstValueFrom(this.gitlabService.getProjectMergeRequests(project.id))
          ]);
          
          totalCommits += commits.length;
          totalMRs += mrs.length;

          // Обрабатываем данные по коммитам
          for (const commit of commits) {
            const date = new Date(commit.created_at);
            const year = date.getFullYear();
            const month = date.getMonth();
            
            // Для годового представления
            if (!this.commitsByYear[year]) {
              this.commitsByYear[year] = 0;
            }
            this.commitsByYear[year]++;
            
            // Для месячного представления
            this.commitsByMonth.push({
              year,
              month,
              count: 1
            });
          }

          // Обрабатываем данные по проектам
          const projectDate = new Date(project.last_activity_at || new Date().toISOString());
          const projectYear = projectDate.getFullYear();
          const projectMonth = projectDate.getMonth();
          const projectMonthKey = `${projectYear}-${projectMonth}`;
          
          // Для годового представления
          if (!this.projectsByYear[projectYear]) {
            this.projectsByYear[projectYear] = 0;
          }
          this.projectsByYear[projectYear]++;
          
          // Для месячного представления
          if (!this.projectsByMonth[projectMonthKey]) {
            this.projectsByMonth[projectMonthKey] = 0;
          }
          this.projectsByMonth[projectMonthKey]++;
          
        } catch (error) {
          console.error('Error processing project:', error);
        }
      }

      // Агрегируем данные по месяцам
      const aggregatedCommitsByMonth: Record<string, number> = {};
      for (const commit of this.commitsByMonth) {
        const key = `${commit.year}-${commit.month}`;
        if (!aggregatedCommitsByMonth[key]) {
          aggregatedCommitsByMonth[key] = 0;
        }
        aggregatedCommitsByMonth[key] += commit.count;
      }
      
      // Преобразуем агрегированные данные обратно в массив для удобства сортировки
      this.commitsByMonth = Object.entries(aggregatedCommitsByMonth).map(([key, count]) => {
        const [year, month] = key.split('-').map(Number);
        return { year, month, count };
      }).sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      });

      this.totalCommits = totalCommits;
      this.mergeRequests = totalMRs;
      this.loading = false;

      // Создаем график после загрузки данных
      setTimeout(() => {
        if (this.chartCanvas) {
          this.createActivityChart();
        }
      }, 300);
    } catch (error) {
      console.error('Error loading statistics:', error);
      this.error = 'Ошибка при загрузке статистики';
      this.loading = false;
    }
  }

  // Переключение между типами данных (коммиты/проекты)
  toggleChartDataType(type: 'commits' | 'projects'): void {
    this.chartType = type;
    this.updateChart();
  }

  // Переключение между режимами отображения (годовое/месячное)
  toggleChartViewMode(mode: 'yearly' | 'monthly'): void {
    this.currentView = mode;
    this.updateChart();
  }
  
  // Обновление графика при изменении параметров
  private updateChart(): void {
    if (!this.activityChart) {
      this.createActivityChart();
      return;
    }
    
    const chartData = this.getChartData();
    
    this.activityChart.data.labels = chartData.labels;
    this.activityChart.data.datasets[0].label = chartData.title;
    this.activityChart.data.datasets[0].data = chartData.data;
    
    this.activityChart.update();
  }

  // Pixel effect methods
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
  
    this.pixelIntervals[(card.getAttribute('data-stat-id') || '').toString()] = 1;
  }

  handleMouseLeave(event: MouseEvent): void {
    const card = event.currentTarget as HTMLElement;
    if (!card) return;

    delete this.pixelIntervals[(card.getAttribute('data-stat-id') || '').toString()];

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

  isDarkMode(): boolean {
    return document.documentElement.classList.contains('dark');
  }
  
  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  // Получение данных для графика в зависимости от выбранных параметров
  private getChartData(): { labels: string[], data: number[], title: string } {
    let labels: string[] = [];
    let data: number[] = [];
    let title: string = '';
    
    const monthNames = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    
    if (this.currentView === 'yearly') {
      // Годовое представление
      const dataSource = this.chartType === 'commits' ? this.commitsByYear : this.projectsByYear;
      const years = Object.keys(dataSource).map(y => parseInt(y, 10)).sort((a, b) => a - b);
      
      if (years.length === 0) {
        // Если данных нет, добавляем текущий год с нулевым значением
        const currentYear = new Date().getFullYear();
        labels.push(currentYear.toString());
        data.push(0);
      } else {
        // Обеспечиваем наличие всех годов в диапазоне
        const minYear = Math.min(...years);
        const maxYear = Math.max(...years);
        
        for (let year = minYear; year <= maxYear; year++) {
          labels.push(year.toString());
          data.push(dataSource[year] || 0);
        }
      }
      
      title = this.chartType === 'commits' ? 'Коммиты по годам' : 'Проекты по годам';
    } else {
      // Месячное представление
      if (this.chartType === 'commits') {
        const sortedCommits = [...this.commitsByMonth].sort((a, b) => {
          return a.year === b.year ? a.month - b.month : a.year - b.year;
        });
        
        if (sortedCommits.length === 0) {
          // Если данных нет, добавляем текущий месяц с нулевым значением
          const now = new Date();
          labels.push(`${monthNames[now.getMonth()]} ${now.getFullYear()}`);
          data.push(0);
        } else {
          // Ограничиваем количество отображаемых месяцев до 12 последних
          const lastMonths = sortedCommits.slice(-12);
          
          for (const item of lastMonths) {
            labels.push(`${monthNames[item.month]} ${item.year}`);
            data.push(item.count);
          }
        }
      } else {
        const sortedEntries = Object.entries(this.projectsByMonth)
          .map(([key, count]) => {
            const [year, month] = key.split('-').map(Number);
            return { year, month, count };
          })
          .sort((a, b) => {
            return a.year === b.year ? a.month - b.month : a.year - b.year;
          });
        
        if (sortedEntries.length === 0) {
          // Если данных нет, добавляем текущий месяц с нулевым значением
          const now = new Date();
          labels.push(`${monthNames[now.getMonth()]} ${now.getFullYear()}`);
          data.push(0);
        } else {
          // Ограничиваем количество отображаемых месяцев до 12 последних
          const lastMonths = sortedEntries.slice(-12);
          
          for (const item of lastMonths) {
            labels.push(`${monthNames[item.month]} ${item.year}`);
            data.push(item.count);
          }
        }
      }
      
      title = this.chartType === 'commits' ? 'Коммиты по месяцам' : 'Проекты по месяцам';
    }
    
    return { labels, data, title };
  }

  private createActivityChart(): void {
    if (!this.chartCanvas || !this.chartCanvas.nativeElement) {
      console.error('Chart canvas element not found');
      return;
    }
    
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('Canvas context not available');
      return;
    }
    
    // Если график уже существует, уничтожаем его
    if (this.activityChart) {
      this.activityChart.destroy();
    }
    
    const chartData = this.getChartData();
    
    // Создаем градиенты для графика в соответствии с цветовой схемой проекта
    const primaryGradient = ctx.createLinearGradient(0, 0, 0, 400);
    primaryGradient.addColorStop(0, 'rgba(236, 72, 153, 0.8)'); // flow-primary с прозрачностью
    primaryGradient.addColorStop(1, 'rgba(236, 72, 153, 0.1)');
    
    // Настройки графика
    const chartOptions: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animations: {
        tension: {
          duration: 1000,
          easing: 'easeInOutQuart',
          from: 0.3,
          to: 0.4
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#e2e8f0',
          titleFont: {
            size: 14,
            weight: 'bold',
            family: "'Montserrat', sans-serif"
          },
          bodyFont: {
            size: 14,
            family: "'Montserrat', sans-serif"
          },
          padding: 12,
          cornerRadius: 8,
          displayColors: true,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          caretSize: 6,
          caretPadding: 8,
          callbacks: {
            title: (items) => {
              return this.currentView === 'yearly' 
                ? `${items[0].label} год` 
                : `${items[0].label}`;
            },
            label: (context) => {
              const label = context.dataset.label || '';
              const value = context.parsed.y;
              return `${label}: ${value}`;
            }
          }
        },
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: this.isDarkMode() ? '#94a3b8' : '#64748b',
            font: {
              family: "'Montserrat', sans-serif",
              size: 12
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: this.isDarkMode() ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.1)'
          },
          ticks: {
            precision: 0,
            color: this.isDarkMode() ? '#94a3b8' : '#64748b',
            font: {
              family: "'Montserrat', sans-serif",
              size: 12
            },
            callback: (value) => value
          }
        }
      }
    };
    
    // Конфигурация графика
    const chartConfig: ChartConfiguration = {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: chartData.title,
          data: chartData.data,
          borderColor: 'rgb(236, 72, 153)', // flow-primary
          backgroundColor: primaryGradient,
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgb(236, 72, 153)', // flow-primary
          pointBorderColor: '#ffffff',
          pointHoverBackgroundColor: 'rgb(219, 39, 119)', // darker shade
          pointHoverBorderColor: '#ffffff',
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: chartOptions
    };
    
    try {
      // Создаем новый график
      this.activityChart = new Chart(ctx, chartConfig);
      console.log('Chart created successfully');
    } catch (error) {
      console.error('Error creating chart:', error);
    }
  }
}