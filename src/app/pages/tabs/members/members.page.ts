import { Component, inject, OnInit, signal } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonRow,
  IonCol,
  IonSelect,
  IonSelectOption,
  IonList,
  IonItemDivider,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addCircle, chevronForwardCircle, menuOutline, notifications } from 'ionicons/icons';
import { MemberComponent } from "../../../components/member/member.component";
import { MemberService } from 'src/app/services/member/member.service';
import { Member } from 'src/app/interfaces/member.interface';

@Component({
  selector: 'app-members',
  templateUrl: './members.page.html',
  styleUrls: ['./members.page.scss'],
  imports: [
    IonIcon,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonSearchbar,
    IonRow,
    IonCol,
    IonSelect,
    IonSelectOption,
    IonList,
    IonItemDivider,
    MemberComponent
],
})
export class MembersPage implements OnInit {

  members = signal<Member[]>([]);
  private memberService = inject(MemberService);

  constructor() {
    addIcons({
      menuOutline,
      notifications,
      addCircle,
      chevronForwardCircle,
    });
  }

  ngOnInit() {
    this.getMembers();
  }

  getMembers() {
    this.members.set(this.memberService.getMembers());
  }
}
