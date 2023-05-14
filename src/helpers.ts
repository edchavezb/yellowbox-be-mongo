import express from "express";

export function extractArrayQueryParam(
    req: express.Request,
    paramName: string
  ) {
    const param = req.query[paramName];  
    if (Array.isArray(param)) {
      return param as string[];
    } else if (param){
      return [param] as string[]
    }
    return [];
  }