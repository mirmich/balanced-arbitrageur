import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-bot-bar',
  templateUrl: './bot-bar.component.html',
  styleUrls: ['./bot-bar.component.css'],
})
export class BotBarComponent implements OnInit {
  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {}

  checkoutForm = this.formBuilder.group({
    name: '',
    comment: '',
  });

  onSubmit(): void {
    console.log('Your comment is ' + this.checkoutForm.value);
    this.checkoutForm.reset();
  }
}
