import { Injectable } from '@angular/core';
import { members } from 'src/app/mock-data/members.mock';

@Injectable({
  providedIn: 'root'
})
export class MemberService {

  constructor() { }

  getMembers() {
    return members;
  }

  getMemberById(id: number) {
    return members.find((member) => member.id === id);
  }
}
