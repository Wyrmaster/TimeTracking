export {};

function compare (this: Date, toCompare: Date): boolean {
  return this.getFullYear() == toCompare.getFullYear() && this.getMonth() == toCompare.getMonth() && this.getDate() == toCompare.getDate();
}

function format (this: Date): string {
  return `${this.getDate().toString().padStart(2, '0')}`
    + `/${(this.getMonth() + 1).toString().padStart(2, '0')}`
    + `/${this.getFullYear()}`
    + ` ${this.getHours().toString().padStart(2, '0')}:${this.getMinutes().toString().padStart(2, '0')}`;
}

declare global {
  interface Date {
    compare(toCompare: Date): boolean;
    format(): string;
  }
}

Date.prototype.compare = compare;
Date.prototype.format = format;