import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Pipe({
  name: 'driveLink',
  standalone: true
})
export class DriveLinkPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string, ...args: unknown[]): SafeUrl {
    var str = value.split("/view")[0] + "/preview";
    return this.sanitizer.bypassSecurityTrustResourceUrl(str);
  }

}
