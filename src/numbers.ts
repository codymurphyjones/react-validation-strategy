export function isNumeric<T = unknown>(str: unknown) {
    if(typeof str === 'number') return true;
    if (typeof str != "string") return false;      
    return !isNaN(str as unknown as number) && 
           !isNaN(parseFloat(str)) 
  }