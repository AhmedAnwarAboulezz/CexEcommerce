import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'validationHandler'
})
export class ValidationHandlerPipe implements PipeTransform {

  constructor(private translate: TranslateService) { }

  transform(value: any, ...args: unknown[]): string {
    value = JSON.stringify(value);

    let res = '';
    let customMessage = '';
    const pattern = /"(.*?)"/;
    const matches = value.match(pattern).length === 0 ? (value.match(pattern)[0]).replace('"', '') : value.match(pattern)[1];

    if (matches === 'maxlength') {
      customMessage = JSON.parse(value).maxlength.requiredLength;
    } else if (matches === 'minlength') {
      customMessage = JSON.parse(value).minlength.requiredLength;
    }

    this.translate.get(`${matches}_validation`).subscribe(translationWord => {
      res = translationWord + (customMessage ? '(' + customMessage + ')' : '');
    });

    return res;
  }
}
