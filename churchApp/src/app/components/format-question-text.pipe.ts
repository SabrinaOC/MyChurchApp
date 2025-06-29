import { Pipe, PipeTransform } from '@angular/core';
import { marked } from 'marked';

@Pipe({
  name: 'formatQuestionText',
  standalone: true
})
export class FormatQuestionTextPipe implements PipeTransform {

  transform(value: string, ...args: unknown[]): unknown {
    return marked.parse(value);
  }

}
