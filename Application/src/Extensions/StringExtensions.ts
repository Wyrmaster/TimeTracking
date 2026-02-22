export {};

function format (this: string, ...args: string[]):string {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  let str:string = this;

  for (let i = 0; i < args.length; i++) {
    str = str.replace(new RegExp('\\{' + i + '\\}', 'g'), args[i]);
  }

  return str;
}

declare global {
  interface String {
    format(...args: string[]): string;
  }
}

String.prototype.format = format;