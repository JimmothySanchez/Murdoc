import { Pipe, PipeTransform } from '@angular/core';
import { i_File } from '../../../schemas';

@Pipe({
  name: 'search',
  pure: false
})
export class SearchPipe implements PipeTransform {

  transform(items: any[], filter: i_File): unknown {
    if (!items || !filter) {
      return items;
    }
    if(filter.Name===null||filter.Name===""||filter.Name===undefined)
    {
      return items;
    }
    return items.filter(item => item.Name.toUpperCase().indexOf(filter.Name.toUpperCase()) !== -1);
  }

}
