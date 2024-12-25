import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CompileRequest, CompileResponse, MonacoEditorService } from './monaco-editor.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true  
})
export class CodeEditorComponent implements OnInit {
  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;
  selectedFileContent: string = '';
  selectedLanguage: string = 'java';
  isMultiFile: boolean = false;
  loadFileStructure: any;
  compileResult: string = '';
  constructor(private monacoEditorService: MonacoEditorService) { }

  ngOnInit(): void {
    this.monacoEditorService.initializeEditor(this.editorContainer.nativeElement, this.selectedLanguage);
    this.loadFileStructure();
  }

  
  onLanguageChange(event: any): void {
    const newLanguage = event.target.value;
    this.selectedLanguage = newLanguage;
    this.isMultiFile = (newLanguage === 'angular' || newLanguage === 'react');
    this.monacoEditorService.setLanguage(newLanguage);
    this.loadFileStructure();
  }

  onCompile(): void {
    const code = this.monacoEditorService.getCode();

    if (code) {
      const compileRequest: CompileRequest = {
        language: this.selectedLanguage.toLowerCase(),
        code: code,
        testCases: [] 
      };

      this.monacoEditorService.compileCode(compileRequest).subscribe(
        (response: CompileResponse) => {
          console.log('Response from backend:', response);
          if (response.success) {
            this.compileResult = response.output || 'Compilation successful with no output.';
          } else {
            this.compileResult = response.error || 'Unknown error during compilation.';
          }
        },
        (error: { message: string }) => {
          console.error('Error during compilation:', error);
          this.compileResult = 'Error during compilation: ' + error.message;
        }
      );
    } else {
      console.error('No code to compile or editor is not initialized.');
    }
  }


  

 
}
