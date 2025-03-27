import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ProjectListComponent } from './components/project-list/project-list.component';
import { ProjectDetailComponent } from './components/project-detail/project-detail.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { HistoryComponent } from './components/history/history.component';
import { SettingsComponent } from './components/settings/settings.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HomeComponent,
    title: 'Главная - GitLab Projects Explorer'
  },
  {
    path: 'projects',
    component: ProjectListComponent,
    title: 'Проекты - GitLab Projects Explorer'
  },
  {
    path: 'project/:id',
    component: ProjectDetailComponent,
    title: 'Детали проекта - GitLab Projects Explorer'
  },
  {
    path: 'statistics',
    component: StatisticsComponent,
    title: 'Статистика - GitLab Projects Explorer'
  },
  {
    path: 'history',
    component: HistoryComponent,
    title: 'История - GitLab Projects Explorer'
  },
  {
    path: 'settings',
    component: SettingsComponent,
    title: 'Настройки - GitLab Projects Explorer'
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];