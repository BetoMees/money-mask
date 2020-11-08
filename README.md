# Money-Mask
Angular 10 directive to mask money and amount

## Usage

Use `money` into your input.
```html
<input type="text" [(ngModel)]="price" money />
```
## Examples

Use `money="number"` to set decimal digit count `default:2`.
```html
<input type="text" [(ngModel)]="price" money="3" />
```

Use `money="amount"` to set the **amount** optional with no decimal point.
```html
<input type="text" [(ngModel)]="amount" money="amount" />
```

Use `negative="true"` to enable negavive numbers `default:false`.
```html
<input type="text" [(ngModel)]="price" money [negative]="true" />
```

Use `addThousand="false"` to disable Thousand point `default:true`.
```html
<input type="text" [(ngModel)]="price" money [addThousand]="false" />
```

Use `inputDefault="number"` to set default value when the input is clean `default:null`.
```html
<input type="text" [(ngModel)]="price" money inputDefault="0" />
```

Use `decimalMarker="string"` to set decimal marker `default:","`.
```html
<input type="text" [(ngModel)]="price" decimalMarker="." />
```

Use `thousandMarker="string"` to set thousand marker `default:"."`.
```html
<input type="text" [(ngModel)]="price" thousandMarker="," />
```