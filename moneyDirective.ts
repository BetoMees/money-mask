import { Directive, forwardRef, HostListener, Input, ElementRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: 'input[money]',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MoneyDirective), multi: true },
  ],
})
export class MoneyDirective {
  private MASK: string;
  private _decimal: number;
  private _type: string;
  private _inputValue: string;
  private _inputDefault = null;
  private _response: string;
  private _canNegative = false;
  private _isNegative = false;
  private _inputRef: ElementRef;
  private _addThousand = true;

  @Input() public set inputDefault(value: string) {
    this._inputDefault = typeof value === 'string' ? value : null;
  }

  @Input() public set addThousand(value: boolean) {
    this._addThousand = Boolean(value);
  }

  @Input() public set negative(value: boolean) {
    this._canNegative = Boolean(value);
  }

  @Input() public set money(value: string) {
    if (value === 'amount') {
      this._type = 'amount';
      this._decimal = 0;
    } else {
      this._decimal = !isNaN(parseInt(value)) ? parseInt(value) : 2;
      this.MASK = this.toFixed('0');
    }
  }

  constructor(e: ElementRef) {
    this._inputRef = e;
    this._inputRef.nativeElement.setAttribute('style', 'text-align: right;');
  }

  @HostListener('click', ['$event'])
  public onFocus(e: MouseEvent): void {
    if (this._inputValue === undefined || this._inputValue === null) {
      this._inputValue = this.set('0');
      this.init();
    }
  }

  @HostListener('input', ['$event'])
  public onInput(e: any): void {
    const el: HTMLInputElement = e.target as HTMLInputElement;
    const data: string = e.data?.length > 1 ? this.makeClean(e.data) : null;

    // if is empty clean the controllers and return null
    if (el.value.length === 0) {
      this._inputValue = this.set(null);
      this._response = this.set(null);
      this.init();

      // if input has one element
    } else if (data === null) {
      if (e.data === '-' || e.data === '+') {
        this._isNegative = e.data === '-' ? !this._isNegative : false;
      } else if (!isNaN(parseInt(e.data)) || e.data == null) {
        this._inputValue = this.set(this.checkNegative(el.value));
      }
      this.init();

      // if pasted input
    } else if (data?.length >= 1) {
      this._inputValue = this.set(this.checkNegative(this.removeChars(el.value)));
      this.init();

      // invalid input has no change
    } else {
      el.value = this._inputValue;
    }
  }

  public onChange = (_: any) => {};
  public onTouch = () => {};

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  public async writeValue(inputValue: string | number) {
    if (inputValue === undefined || inputValue === null) {
      this._inputValue = this.set(null);
    } else {
      inputValue = this.removeChars(inputValue);
      inputValue = this.checkNegative(inputValue);
      this._inputValue = this.set(this.toFixed(inputValue));
    }
    this.init(false);
  }

  private set(inputValue) {
    return inputValue === null && this._inputDefault != null ? this._inputDefault : inputValue;
  }

  private init(returnValue = true) {
    if (this._inputValue != null && (this._type === undefined || this._type === null)) {
      const inputValue = this.removeDots(this._inputValue);
      this._response = this.set(this.applyDecimal(inputValue));
      this._inputValue = this.set(this.applyMask(inputValue));
    }

    if (this._inputValue != null && this._type === 'amount') {
      this._response = this.set(this.removeDots(this._inputValue));
      this._inputValue = this.set(this.applyThousandMask(this._response));
    }

    this._inputRef.nativeElement.value = this.makeNegative(this._inputValue);
    if (returnValue) this.onChange(parseFloat(this.makeNegative(this._response)));
  }

  private checkNegative(inputValue: string): string {
    this._isNegative = inputValue?.indexOf('-') === 0;

    return this.removeHyphen(inputValue);
  }

  private makeNegative(inputValue: string): string {
    return this._isNegative && this._canNegative && parseFloat(inputValue.replace(',', '.')) != 0
      ? '-'.concat(inputValue)
      : inputValue;
  }

  public makeClean(inputValue: string): string {
    return this.removeHyphen(this.removeDots(this.removeChars(inputValue)));
  }

  private toFixed(inputValue: string): string {
    const value = parseFloat(inputValue);
    return isNaN(value) ? null : value.toFixed(this._decimal).replace('.', ',');
  }

  private applyMask(inputValue: string): string {
    if (inputValue.length > this._decimal) {
      inputValue = this.applyDecimal(inputValue);

      // Keep Mask 0.00
    } else {
      const pos = this.MASK.length - inputValue.length;
      inputValue = this.MASK.substring(0, pos).concat(inputValue);
      return inputValue;
    }

    inputValue = this.toFixed(inputValue);
    inputValue = this.applyThousandMask(inputValue);
    return inputValue;
  }

  private applyDecimal(inputValue: string): string {
    if (this._decimal > 0) {
      const pos = inputValue.length - this._decimal;
      inputValue = inputValue.substring(0, pos).concat('.', inputValue.substr(pos, this._decimal));
    }
    return inputValue;
  }

  private applyThousandMask(inputValue: string): string {
    if (this._addThousand) {
      if (this._decimal == 0) {
        inputValue = this.applyHundreds(inputValue);
      } else {
        const decimal = inputValue.split(',');
        if (decimal.length > 1 && decimal[0].length > 3) {
          inputValue = this.applyHundreds(decimal[0]);
          return inputValue.concat(',', decimal[1]);
        }
      }
    }
    return inputValue;
  }

  private applyHundreds(inputValue: string): string {
    if (inputValue.length > 3) {
      const pos = inputValue.length - 3;
      const Thousand = inputValue.substring(0, pos);
      const Hundreds = inputValue.substring(pos, inputValue.length);
      return this.applyHundreds(Thousand).concat('.', Hundreds);
    }
    return inputValue;
  }

  public removeDots(inputValue: string): string {
    return inputValue ? inputValue.replaceAll('.', '').replaceAll(',', '') : null;
  }

  public removeHyphen(inputValue: string): string {
    return inputValue ? inputValue.replaceAll('-', '') : null;
  }

  public removeChars(inputValue: string | number): string {
    if (typeof inputValue === 'number') {
      return String(inputValue);
    }
    for (let i = inputValue?.length; i >= 0; i--) {
      if (
        isNaN(parseInt(inputValue[i])) &&
        inputValue[i] != '.' &&
        inputValue[i] != ',' &&
        inputValue[i] != '-'
      ) {
        inputValue = inputValue.replace(inputValue[i], '');
      }
    }
    return inputValue;
  }
}
