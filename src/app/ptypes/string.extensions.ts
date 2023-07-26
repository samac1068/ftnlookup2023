interface String {
  substr(start: number, length: number): string;
}

String.prototype.substr = function(start: number, length?: number): string {
  if(length != null) {
    let stop: number = start + length - 1;
    return this.substring(start, stop);
  } else {
    return this.substring(start);
  }
};
