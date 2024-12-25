import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));

(window as any).MonacoEnvironment = {
  getWorkerUrl: function (moduleId: string, label: string) {
    if (label === 'typescript' || label === 'javascript') {
      return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
        importScripts('${location.origin}/assets/monaco/vs/language/typescript/ts.worker.js');
      `)}`;
    }
    if (label === 'html') {
      return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
        importScripts('${location.origin}/assets/monaco/vs/language/html/html.worker.js');
      `)}`;
    }
    if (label === 'css') {
      return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
        importScripts('${location.origin}/assets/monaco/vs/language/css/css.worker.js');
      `)}`;
    }
    if (label === 'json') {
      return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
        importScripts('${location.origin}/assets/monaco/vs/language/json/json.worker.js');
      `)}`;
    }
    return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
      importScripts('${location.origin}/assets/monaco/vs/editor/editor.worker.js');
    `)}`;
  },
};
