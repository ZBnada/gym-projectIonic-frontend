import { Component, OnInit, signal } from '@angular/core';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  personOutline,
  calendarOutline,
  peopleOutline,
  home,
  people,
  person,
  calendar,
  personAdd,
} from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  imports: [IonIcon, IonTabButton, IonTabBar, IonTabs],
})
export class TabsPage implements OnInit {
  currentTab = signal<string>('members');
  constructor() {
    addIcons({
      home,
      homeOutline,
      peopleOutline,
      calendarOutline,
      personOutline,
      people,
      person,
      calendar,
      personAdd
    });
  }

  ngOnInit() {}

  getCurrentTab(event: { tab: string }) {
    console.log(event.tab);

    this.currentTab.set(event.tab);
  }
}
