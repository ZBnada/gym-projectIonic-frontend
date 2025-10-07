import { Component, input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonCard,
  IonRow,
  IonCol,
} from '@ionic/angular/standalone';
import { Member } from 'src/app/interfaces/member.interface';
import { MemberPersonalDetailComponent } from '../member-personal-detail/member-personal-detail.component';
import { InfoCardComponent } from "../../widgets/info-card/info-card.component";

@Component({
  selector: 'app-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss'],
  imports: [
    IonCol,
    IonRow,
    IonCard,
    RouterLink,
    MemberPersonalDetailComponent,
    InfoCardComponent
],
})
export class MemberComponent implements OnInit {
  member = input<Member>();

  constructor() {}

  ngOnInit() {}
}
