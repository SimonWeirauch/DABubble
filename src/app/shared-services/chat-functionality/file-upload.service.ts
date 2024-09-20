import { inject, Injectable } from '@angular/core';
import { Storage } from '@angular/fire/storage';
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { Observable, Subject } from 'rxjs';
import { User } from '../../../models/user.class';
import { Conversation } from '../../../models/conversation.class';
import { Channel } from '../../../models/channel.class';
import { Thread } from '../../../models/thread.class';
import { ChannelThread } from '../../../models/channelThread.class';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  uploadProgress$!: Observable<number>;
  downloadURL$!: Observable<string>;

  private fileUploadErrorSubject = new Subject<string>();
  fileUploadError$ = this.fileUploadErrorSubject.asObservable();

  private fileUploadErrorSubjectThread = new Subject<string>();
  fileUploadErrorThread$ = this.fileUploadErrorSubjectThread.asObservable();

  downloadURL: string = ''
  downloadURLThread: string = ''

  private storage: Storage = inject(Storage);

  fileUploading: boolean = false;
  fileUploadingThread: boolean = false;

  /**
   * Selects a file and passes it to the uploadFile function
   * @param event Fileselection 
   * @param user User that selected the file 
   * @param chat Conversation, channel or thread in witch the files has been selected 
   * @param thread Variable to check if the file was selected in a thread
   */
  onFileSelected(event: any, user: User, chat: Conversation | Channel | Thread | ChannelThread, thread?: string) {
    const selectedFile: File = event.target.files[0];
    if (thread) {
      this.uploadFile(selectedFile, user, chat, thread);
    } else {
      this.uploadFile(selectedFile, user, chat);
    }
  }

  /**
   * Upload the selected file to the firebase database
   * @param file Selected file 
   * @param user User that selected the file 
   * @param chat Conversation, channel or thread in witch the files has been selected 
   * @param thread Variable to check if the file was selected in a thread
   * @returns 
   */
  async uploadFile(file: File, user: User, chat: Conversation | Channel | Thread | ChannelThread, thread?: string) {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 500 * 1024; // 500 KB

    if (!validTypes.includes(file.type)) {
      if (thread) {
        this.fileUploadErrorSubjectThread.next('Nur PDF-Dateien und Bilder (JPEG, PNG, GIF) sind erlaubt.');
      } else {
        this.fileUploadErrorSubject.next('Nur PDF-Dateien und Bilder (JPEG, PNG, GIF) sind erlaubt.');
      }
      return;
    }

    if (file.size > maxSize) {
      if (thread) {
        this.fileUploadErrorSubjectThread.next('Die Datei darf nicht größer als 500 KB sein.');
      } else {
        this.fileUploadErrorSubject.next('Die Datei darf nicht größer als 500 KB sein.');
      }
      return;
    }

    const filePath = this.defineUploadPath(file, user, chat);
    const fileRef = ref(this.storage, filePath);
    const uploadFile = uploadBytesResumable(fileRef, file);

    uploadFile.on('state_changed',
      (snapshot) => {
        if (thread) {
          this.fileUploadingThread = true;
        } else {
          this.fileUploading = true;
        }
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      },
      (error) => {
        if (thread) {
          this.fileUploadErrorSubjectThread.next('Fehler beim Hochladen der Datei.');
        } else {
          this.fileUploadErrorSubject.next('Fehler beim Hochladen der Datei.');
        }
      },
      async () => {
        const url = await getDownloadURL(fileRef);
        if (thread) {
          this.fileUploadingThread = false;
          this.downloadURLThread = url;
        } else {
          this.downloadURL = url;
          this.fileUploading = false;
        }
      }
    );
  }

  /**
   * Defines the upload path within the firebase database
   * @param file Selected file 
   * @param user User that selected the file 
   * @param chat Conversation, channel or thread in witch the files has been selected 
   * @returns 
   */
  defineUploadPath(file: File, user: User, chat: Conversation | Channel | Thread | ChannelThread) {
    const randomNumber = Math.random();
    let filePath: string ='';
    if ('threadId' in chat) {
      filePath = `messageFiles/${user.userId}/${chat.threadId}/${randomNumber}/${file.name}`;
    } else if ('channelId' in chat) {
      filePath = `messageFiles/${user.userId}/${chat.channelId}/${randomNumber}/${file.name}`;
    } else if ('conversationId' in chat) {
      filePath = `messageFiles/${user.userId}/${chat.conversationId}/${randomNumber}/${file.name}`;
    }
    return filePath
  }

  /**
   * Deletes the file from the firebase database and message textarea preview
   * @param thread Variable to check if the file was selected in a thread
   */
  async deletePreview(thread?: string) {
    if (this.downloadURL || this.downloadURLThread) {
      try {

        if (thread) {
          const fileRef = ref(this.storage, this.downloadURLThread);
          await deleteObject(fileRef);
          this.downloadURLThread = '';
        } else {
          const fileRef = ref(this.storage, this.downloadURL);
          await deleteObject(fileRef);
          this.downloadURL = '';
        }
      } catch (error) {
        if (thread) {
          this.fileUploadErrorSubjectThread.next('Fehler beim Hochladen der Datei.');
        } else {
          this.fileUploadErrorSubject.next('Fehler beim Hochladen der Datei.');
        }
      }
    }
  }

  /**
   * Checks if the uploaded file is a image 
   * @param fileUrl the upload URL of the uploaded file
   * @returns 
   */
  isImage(fileUrl: string): boolean {
    const url = new URL(fileUrl);
    const path = url.pathname;
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    const extension = path.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(extension || '');
  }
}
