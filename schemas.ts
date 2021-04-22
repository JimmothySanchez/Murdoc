import { Guid } from "guid-typescript";

export interface i_MainSchema {
    Files:i_File[];
    TagOptions:string[];
}

export interface i_File {
    FullPath:string;
    Name:String;
    Id:string;
    ThumbPath?:string;
    Tags:string[];
    GeneratingThumb:boolean;
}

export interface i_Configuration{
    filePaths:string[];
    thumbPath:string;
    videoExtensions:string[];
    simultaneousGenCount:number;
}