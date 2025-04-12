import { Toast } from 'primeng/toast';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,Toast],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {


  ngOnInit(){

     const theme = localStorage.getItem('theme') || 'light';

    const element = document.querySelector('html');
    if (element) {
      if (theme === 'dark') {
        element.classList.add('dark');
      }
      else {
        element.classList.remove('dark');
      }
    }

  }
}
