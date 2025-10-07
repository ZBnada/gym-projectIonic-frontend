import { IonButton, IonText, IonIcon } from '@ionic/angular/standalone';
import { Component, input, OnInit } from '@angular/core';

@Component({
  selector: 'app-action-button',
  templateUrl: './action-button.component.html',
  styleUrls: ['./action-button.component.scss'],
  imports: [IonButton, IonText, IonIcon],
})
export class ActionButtonComponent implements OnInit {
  iconColor = input<string>('medium');
  icon = input<string>();
  buttonName = input<string>();

  constructor() {}

  ngOnInit() {}
}
