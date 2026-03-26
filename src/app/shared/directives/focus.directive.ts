import { Directive, ElementRef, Renderer2, OnInit, Input } from '@angular/core';

@Directive({
  selector: '[appFocus]',
  standalone: false
})
export class FocusDirective implements OnInit {
  @Input() appFocus = false;

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    if (this.appFocus) {
      setTimeout(() => {
        this.el.nativeElement.focus();
      }, 100);
    }
  }
}
