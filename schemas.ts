import { Guid } from "guid-typescript";

export interface i_MainSchema {
    Files:i_File[];
}

export interface i_File {
    FullPath:string;
    Name:String;
    Id:string;
    ThumbPath?:string;
    Tags:string[];
}