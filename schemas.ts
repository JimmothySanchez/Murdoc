import { Guid } from "guid-typescript";

export interface i_MainSchema {
    Files:i_File[];
    TagOptions:string[];
}

export interface i_File {
    Path:string;
    Name:String;
    ID:string;
    Thumbnail?:string;
    Tags:string[];
    Meta:i_Meta
}

export interface i_Meta{
    Codec?:string;
    Resolution?:string;
    Duration:number;
    FileSize?:number;
}

export interface i_Configuration{
    dbLocation:string;
    filePaths:string[];
    thumbPath:string;
    videoExtensions:string[];
    simultaneousGenCount:number;
}