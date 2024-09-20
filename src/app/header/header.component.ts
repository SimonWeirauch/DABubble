import { Component, EventEmitter, Output, Input, inject } from '@angular/core';
import { ChatComponent } from '../chat/chat.component';
import { UserService } from '../user.service';
import { CommonModule, NgStyle } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DialogShowUserProfilComponent } from '../dialog-show-user-profil/dialog-show-user-profil.component';
import { AuthService } from '../shared-services/auth.service';
import { Router } from '@angular/router';
import { Conversation } from '../../models/conversation.class';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ChatComponent, CommonModule, NgStyle],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent  {
  authService = inject(AuthService);
  hovered: boolean = false;
  dropdownOpen: boolean = false;
  router = inject(Router);
  
  @Output() search: EventEmitter<string> = new EventEmitter<string>();
  
  @Output() openOwnConversation = new EventEmitter<Conversation>();
  @Output() showWorkspace = new EventEmitter<boolean>();
  @Input() isWSVisible: boolean;


  
  constructor(public us: UserService, public dialog: MatDialog) {}


  /**
 * Function to toggle the dropdown
 */
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }


  /**
 * Function to logout the user
 */
  logout() {
    this.authService.logout();
    this.authService.redirectToLogin();
  }


  /**
 * Function to handle search event
 * @param event The event containing the search value
 */
  onSearch(event: any): void {
    this.search.emit(event.target.value);
  }


  /**
 * Function to view the workspace
 */
  viewWorkspace(){
    this.showWorkspace.emit(true)
  }


  /**
 * Function to open the profile dialog
 * @param event The event triggering the function
 */
  openProfileDialog(event: Event) {
    this.hovered = false;
    event.stopPropagation();
    this.toggleDropdown();
    const dialogRef = this.dialog.open(DialogShowUserProfilComponent, {
      data: { user: this.us.loggedUser }
    });
    dialogRef.afterClosed().subscribe((conversation) => {
      if(conversation){
        this.openOwnConversation.emit(conversation)
      }
    })
  }

}
