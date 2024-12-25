import { Injectable } from '@angular/core';
import * as monaco from 'monaco-editor';
import { Observable, Subject, throwError } from 'rxjs';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';
import { HttpClient } from '@angular/common/http';
import { catchError, debounceTime } from 'rxjs/operators';

export interface CompileRequest {
  language: string;
  code: string;
  testCases: any[];
}

export interface CompileResponse {
  success: boolean;
  error: string;
  output: string;
  timestamp: Date;
}

export interface WebSocketMessage {
  type: string;
  code?: string;
  userId?: string;
  position?: { lineNumber: number, column: number };
  updatedCode?: string;
  operation?: 'insert' | 'delete';
  color?: string;
  timestamp?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MonacoEditorService {
  loadContent(selectedLanguage: string, isMultiFile: boolean) {
    throw new Error('Method not implemented.');
  }
  private editor!: monaco.editor.IStandaloneCodeEditor;
  private socket$: WebSocketSubject<WebSocketMessage>;
  private codeUpdate$: Subject<WebSocketMessage> = new Subject<WebSocketMessage>();
  private isConnected = false;
  private isLocalChange = false;
  private sessionId: string = this.generateSessionId();
 

  
  constructor(private http: HttpClient) {
    this.socket$ = this.createWebSocket();
  }

  private createWebSocket(): WebSocketSubject<WebSocketMessage> {
    const url = `ws://localhost:8085/code-updates?sessionId=${encodeURIComponent(this.sessionId)}`;

    const socket$ = webSocket<WebSocketMessage>(url);

    socket$.subscribe(
      (message: WebSocketMessage) => {
        if (message.type === 'code-update' && message.code) {
          this.codeUpdate$.next(message);
        }
        
      },
      (err) => {
        console.error('WebSocket error:', err);
        this.handleWebSocketError();
      },
      () => {
        console.log('WebSocket connection closed');
        this.isConnected = false;
      }
    );

    return socket$;
  }

  private generateSessionId(): string {
    return "1234"; 
  }

 
  

  private handleWebSocketError(): void {
    if (!this.isConnected) {
      setTimeout(() => {
        console.log('Attempting to reconnect WebSocket...');
        this.socket$ = this.createWebSocket();
      }, 2000);
    }
  }

  initializeEditor(element: HTMLElement, language: string = 'java'): void {
    this.editor = monaco.editor.create(element, {
      value: '',
      language: language,
      theme: 'vs-dark',
      automaticLayout: true
    });

    this.codeUpdate$.pipe(
      debounceTime(300)
    ).subscribe({
      next: (message: WebSocketMessage) => this.applyRemoteCodeUpdate(message),
      error: (err) => console.error('Code update error:', err)
    });

    this.editor.onDidChangeModelContent((event) => {
      if (!this.isLocalChange) {
        const code = this.getCode();
        if (code) {
          const change = event.changes[0];
          const startLine = change.range.startLineNumber;
          const updatedLine = this.editor.getModel()?.getLineContent(startLine) || '';

          const position = {
            lineNumber: startLine,
            column: 1
          };

          const operation = updatedLine === '' ? 'delete' : 'insert';
          const timestamp = new Date().toISOString();
          this.socket$.next({
            type: 'code-update',
            code: code,  
            position: position,
            updatedCode: updatedLine,
            operation: operation,
          timestamp: timestamp
          }); 
        }
      }
      this.isLocalChange = false;
    });
  }

  private applyRemoteCodeUpdate(message: WebSocketMessage): void {
    if (this.editor) {
      const model = this.editor.getModel();
      const currentValue = model?.getValue();

      if (currentValue !== message.code && model) {
        const editOperations: monaco.editor.IIdentifiedSingleEditOperation[] = [{
          range: model.getFullModelRange(),
          text: message.code || ''
        }];

        this.isLocalChange = true;
        model.pushEditOperations([], editOperations, () => null);
      }
    } else {
      console.error('Editor is not initialized.');
    }
  }

  

  

  setLanguage(language: string): void {
    const model = this.editor.getModel();
    if (model) {
      monaco.editor.setModelLanguage(model, language);
    } else {
      console.error('Editor model is not available.');
    }
  }

  getCode(): string {
    if (this.editor) {
      return this.editor.getValue();
    } else {
      console.error('Editor is not initialized.');
      return '';
    }
  }

  compileCode(request: CompileRequest): Observable<CompileResponse> {
    return this.http.post<CompileResponse>('http://localhost:8085/api/compile', request, { withCredentials: true }).pipe(
      catchError((error: any) => {
        console.error('Compile code error:', error);
        return throwError(() => new Error('Compilation failed'));
      })
    );
  }

  loadCode(newCode: string): void {
    this.applyRemoteCodeUpdate({ code: newCode, type: 'code-update' });
  }
}
