import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-collapse-content',
  templateUrl: './collapse-content.component.html',
  styleUrls: ['./collapse-content.component.scss']
})
export class CollapseContentComponent implements OnInit {

  showConetnt = false;
  
  @Input() title = '';
  @Input() customClass = '';
  @Input() withBoxShadow = false;
  @Output() collapsed: EventEmitter<boolean> = new EventEmitter(); // if you want to do an event after collapsed
  
  constructor() { }

  ngOnInit(): void {
  }

  collapse() {
    this.showConetnt = !this.showConetnt;
    this.showCollapsed();
    this.collapsed.emit(this.showConetnt);
  }

  showCollapsed() {
    setTimeout(() => {
      const accordions = document.querySelectorAll(".collapse-wrapper");
  
      const openAccordion = (accordion: any) => {
        accordion.style.height = accordion.scrollHeight + "px";
      };
  
      const closeAccordion = (accordion: any) => {
        accordion.style.height = '0';
      };
  
      accordions.forEach((accordion) => {
        const showContent = accordion.querySelector(".showContent");
        const content = accordion.querySelector(".contentCollapsed");
        
        if(showContent) {
          openAccordion(showContent);
        } else {
          closeAccordion(content);
        }
      }); 
    });
  }

}
