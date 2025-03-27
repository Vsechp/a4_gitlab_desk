import { Component, OnInit, Renderer2, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GitlabService } from '../../services/gitlab.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  gitlabUrl: string = '';
  accessToken: string = '';
  loading: boolean = false;
  testStatus: 'none' | 'testing' | 'success' | 'error' = 'none';
  private pixelIntervals: { [key: string]: number } = {};

  constructor(
    private gitlabService: GitlabService,
    private snackBar: MatSnackBar,
    private renderer: Renderer2,
    private el: ElementRef
  ) {}

  ngOnInit() {
    // Загружаем текущие настройки
    this.gitlabUrl = localStorage.getItem('gitlabUrl') || '';
    this.accessToken = localStorage.getItem('gitlabToken') || '';
  }

  async saveSettings() {
    this.loading = true;
    
    try {
      // Сохраняем настройки
      localStorage.setItem('gitlabUrl', this.gitlabUrl);
      localStorage.setItem('gitlabToken', this.accessToken);

      // Обновляем сервис
      this.gitlabService.updateConfig(this.gitlabUrl, this.accessToken);

      // Тестируем подключение
      await this.testConnection();

      this.snackBar.open('Настройки успешно сохранены', 'Закрыть', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      this.snackBar.open('Ошибка при сохранении настроек', 'Закрыть', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
    } finally {
      this.loading = false;
    }
  }

  async testConnection() {
    this.testStatus = 'testing';
    
    try {
      await this.gitlabService.testConnection();
      this.testStatus = 'success';
    } catch (error) {
      console.error('Connection test failed:', error);
      this.testStatus = 'error';
      throw error;
    }
  }

  getTestStatusIcon(): string {
    switch (this.testStatus) {
      case 'testing':
        return 'sync';
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      default:
        return 'help';
    }
  }

  getTestStatusColor(): string {
    switch (this.testStatus) {
      case 'testing':
        return 'text-blue-500';
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  }

  // Методы для пиксельного эффекта
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
  
    this.pixelIntervals[(card.getAttribute('data-settings-id') || '').toString()] = 1;
  }

  handleMouseLeave(event: MouseEvent): void {
    const card = event.currentTarget as HTMLElement;
    if (!card) return;

    delete this.pixelIntervals[(card.getAttribute('data-settings-id') || '').toString()];

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
