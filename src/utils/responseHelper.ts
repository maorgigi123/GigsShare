// src/utils/responseHelper.ts
export interface IResponse<T> {
    data: T;
    isError: boolean;
    messageDesc: string;
    messageCode: number;
  }
  
  export const createResponse = <T>(
    data: T,
    isError = false,
    messageDesc = "Success",
    messageCode = 0
  ): IResponse<T> => {
    return { data, isError, messageDesc, messageCode };
  };
  