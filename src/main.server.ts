import { bootstrapApplication } from '@angular/platform-browser';
import {  CodeEditorComponent} from './app/app.component';
import { config } from './app/app.config.server';

const bootstrap = () => bootstrapApplication(CodeEditorComponent, config);

export default bootstrap;
