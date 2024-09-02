import { Injectable } from '@angular/core';
import { Firestore, collection, query, where, orderBy, onSnapshot, addDoc, getDocs } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private firestore: Firestore, private authService: AuthService, private storage: Storage) { }

  // Get messages and listen for real-time updates
  getMessages(roomId: string, callback: (messages: any[]) => void) {
    try {
      const messagesRef = collection(this.firestore, 'message-table');
      const q = query(messagesRef, where('room_id', '==', roomId), orderBy('timestamp', 'asc'));
      
      // Listen for real-time updates
      return onSnapshot(q, (querySnapshot) => {
        const messages = querySnapshot.docs.map(doc => doc.data());
        callback(messages);
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw new Error('Error fetching messages');
    }
  }

  // Send a new message to a specific room
  async sendMessage(messageContent: string, currentUserId: string, fileUrl?: string) {
    try {
      const roomRef = collection(this.firestore, 'chat-room-table');
      const roomQuery = query(roomRef, where('room_id', '==', "0"));
      const roomSnapshot = await getDocs(roomQuery);
      const room = roomSnapshot.docs[0].data();
      var senderName = "";

      this.authService._user_name.subscribe((user_name) => {
        senderName = user_name;
      });

      const roomId = room['room_id'];
      const user1 = room['user_1'];
      const user2 = room['user_2'];

      const users = [user1, user2];
      const receiverId = users.find(user => user !== currentUserId);

      const messagesRef = collection(this.firestore, 'message-table');
      await addDoc(messagesRef, {
        room_id: roomId,
        sender_id: currentUserId,
        receiver_id: receiverId,
        message_content: messageContent,
        sender_name: senderName,
        file_url: fileUrl || '', // Include the file URL if provided
        timestamp: new Date() // Add a timestamp for sorting and tracking
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Error sending message');
    }
  }

  // Upload file to Firebase Storage and return the download URL
  async uploadFile(file: File): Promise<string> {
    try {
      const fileName = `${new Date().getTime()}_${file.name}`;
      const fileRef = ref(this.storage, `chat-attachments/${fileName}`);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Error uploading file');
    }
  }
}
