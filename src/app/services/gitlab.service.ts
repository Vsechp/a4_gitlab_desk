import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, firstValueFrom } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { GitlabProject, GitlabTreeItem } from '../interfaces/gitlab.interfaces';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GitlabService {
  private apiUrl = environment.gitlaburl;
  private token = environment.gitlabtoken;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Accept': 'application/json'
    });
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Произошла ошибка при подключении к GitLab';
    
    if (error.status === 0) {
      errorMessage = 'Не удается подключиться к серверу GitLab. Проверьте соединение.';
      console.error('Network error:', error);
      console.error('Full error details:', {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        headers: error.headers,
        error: error.error
      });
    } else if (error.status === 401) {
      errorMessage = 'Ошибка аутентификации. Проверьте токен GitLab.';
      console.error('Authentication error:', {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        headers: error.headers,
        error: error.error
      });
    } else if (error.status === 403) {
      errorMessage = 'Доступ запрещен. Проверьте права доступа токена.';
      console.error('Permission error:', error);
    } else if (error.status === 404) {
      errorMessage = 'Ресурс не найден.';
      console.error('Not found error:', error);
    } else {
      console.error('GitLab API Error:', error);
      if (error.error && typeof error.error === 'object') {
        errorMessage = error.error.message || errorMessage;
      }
    }

    return throwError(() => ({ message: errorMessage, status: error.status }));
  }

  getProjects(): Observable<GitlabProject[]> {
    console.log('Requesting projects with URL:', this.apiUrl);
    console.log('Using headers:', this.getHeaders().keys());
    
    const params = {
      membership: 'true',
      per_page: '100',
      order_by: 'last_activity_at',
      sort: 'desc'
    };

    return this.http.get<GitlabProject[]>(`${this.apiUrl}/projects`, {
      headers: this.getHeaders(),
      params
    }).pipe(
      retry(2),
      catchError(this.handleError.bind(this))
    );
  }

  getProjectDetails(projectId: number): Observable<GitlabProject> {
    return this.http.get<GitlabProject>(`${this.apiUrl}/projects/${projectId}`, {
      headers: this.getHeaders()
    }).pipe(
      retry(2),
      catchError(this.handleError.bind(this))
    );
  }

  getProjectTree(projectId: number, path: string = ''): Observable<GitlabTreeItem[]> {
    const params = {
      path,
      per_page: '100',
      recursive: 'false'
    };

    return this.http.get<GitlabTreeItem[]>(`${this.apiUrl}/projects/${projectId}/repository/tree`, {
      headers: this.getHeaders(),
      params
    }).pipe(
      retry(2),
      catchError(this.handleError.bind(this))
    );
  }

  getFileContent(projectId: number, filePath: string): Observable<string> {
    return this.http.get(`${this.apiUrl}/projects/${projectId}/repository/files/${encodeURIComponent(filePath)}/raw`, {
      headers: this.getHeaders(),
      responseType: 'text'
    }).pipe(
      retry(2),
      catchError(this.handleError.bind(this))
    );
  }
  
    getProjectCommits(projectId: number): Observable<any[]> {
      return this.http.get<any[]>(`${this.apiUrl}/projects/${projectId}/repository/commits`, {
        headers: this.getHeaders()
      }).pipe(
        retry(2),
        catchError(this.handleError.bind(this))
      );
    }
  
    getProjectMergeRequests(projectId: number): Observable<any[]> {
      return this.http.get<any[]>(`${this.apiUrl}/projects/${projectId}/merge_requests`, {
        headers: this.getHeaders()
      }).pipe(
        retry(2),
        catchError(this.handleError.bind(this))
      );
    
    }

// Сохраняет новые URL и токен
updateConfig(gitlabUrl: string, accessToken: string): void {
  this.apiUrl = gitlabUrl;
  this.token = accessToken;
  console.log('GitlabService config updated:', { gitlabUrl, accessToken });
}

// Тестирует подключение, например, запрашивая информацию о пользователе
// Возвращает Observable<any>, чтобы можно было подписаться или использовать firstValueFrom
// Вы можете изменить URL на любой другой "тестовый" endpoint
testConnection(): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/user`, {
    headers: this.getHeaders()
  }).pipe(
    retry(2),
    catchError(this.handleError.bind(this))
  );
}

// Получаем список пользователей GitLab
getUsers(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/users`, {
    headers: this.getHeaders()
  }).pipe(
    retry(2),
    catchError(this.handleError.bind(this))
  );
}
}