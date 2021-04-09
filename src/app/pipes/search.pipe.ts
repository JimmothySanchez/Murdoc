import { Pipe, PipeTransform } from '@angular/core';
import { i_File } from '../../../schemas';

@Pipe({
  name: 'search',
  pure: false
})
export class SearchPipe implements PipeTransform {

  transform(items: i_File[], pipeFilter: i_File): unknown {
    let rtrnitems=items;
    if (!items || !pipeFilter) {
      return items;
    }
    if(pipeFilter.Name!==null&&pipeFilter.Name!==""&&pipeFilter.Name!==undefined) 
    {
      rtrnitems= rtrnitems.filter(item => item.Name.toUpperCase().indexOf(pipeFilter.Name.toUpperCase()) !== -1)
    }
    if(pipeFilter.Tags!==null&&pipeFilter.Tags!==undefined&&pipeFilter.Tags.length>=1)
    {
      rtrnitems = rtrnitems.filter(item => pipeFilter.Tags.every(filtTag=> item.Tags!==null&& item.Tags.length>=1&& item.Tags.includes(filtTag)));
    } 
    return rtrnitems;
  }

}
