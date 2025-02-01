class ServiceResponse {
  status: number;
  message: string;
  error: serviceError;
  data: object | any;
  constructor(status: number) {
    this.status = status;
    this.message = status == 200 ? "Success" : "There is some error";
    this.error = status == 400 ? "Something went wrong" : null;
  }
  success(message: string, data?: any) {
    this.status = 200;
    this.message = message;
    this.data = data;
    this.error = null;
    return this;
  }
  setError(error: serviceError, message?: string) {
    this.error = error;
    this.status = 400;
    if (typeof error == "string" && !message) {
      this.message = error;
    } else if (message) {
      this.message = message;
    }
  }
  setMessage(message: string) {
    this.message = message;
    return this;
  }
  setDataKey(key: any, value: any) {
    if(!this.data) {
        this.data = {};
    }
    this.data[key] = value;
    return this;
  }
  setDataObject(dataObject: any) {
    this.data = dataObject;
    return this;
  }
  setData(...args: any[]) {
    if(args.length == 1 ){
        return this.setDataObject(args[0]);
    } else if(args.length == 2) {
        return this.setDataKey(args[0], args[1]);
    } else {
        throw new Error('wrong invocation')
    }
  }
  getResponse() {
    return {
      status: this.status,
      error: this.error,
      message: this.message,
      data: this.data,
    };
  }
}

export default ServiceResponse;
