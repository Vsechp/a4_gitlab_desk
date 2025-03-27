import { Component, OnInit, Renderer2, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Router } from '@angular/router';

interface AppLink {
  title: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    RouterModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private pixelIntervals: { [key: string]: number } = {};
  
  appLinks: AppLink[] = [
    {
      title: 'Projects',
      icon: 'folder',
      route: 'projects'
    },
    {
      title: 'Statistics',
      icon: 'bar_chart',
      route: 'statistics'
    },
    {
      title: 'History',
      icon: 'history',
      route: 'history'
    },
    {
      title: 'Settings',
      icon: 'settings',
      route: 'settings'
    }
  ];

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private el: ElementRef
  ) {}

  ngOnInit(): void {
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
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
  
    this.pixelIntervals[(card.dataset['appId'] || '').toString()] = 1;
  }

  handleMouseLeave(event: MouseEvent): void {
    const card = event.currentTarget as HTMLElement;
    if (!card) return;

    delete this.pixelIntervals[(card.dataset['appId'] || '').toString()];

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