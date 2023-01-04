import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firebaseAuth } from 'src/database/db.firebase';
import { ProjectCreateDto } from 'src/dto/project.dto';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

@Injectable()
export class AuthService {
  async signInWithGoogle() {
    try {
      const auth = firebaseAuth;
      auth.languageCode = 'th';

      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
      provider.addScope('https://www.googleapis.com/auth/userinfo.email');
      provider.addScope('https://www.googleapis.com/auth/userinfo.profile');

      const result = await signInWithPopup(auth, provider);
      const credential = await GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      return {
        statusCode: 200,
        message: 'Sign in with google',
        data: { auth, provider },
      };
    } catch (e) {
      console.log(e);
      return {
        statusCode: 400,
        message: 'Authentication error',
        error: e.message,
      };
    }
  }

  async signOutWihtGoogle() {
    try {
      const auth = firebaseAuth;
      await signOut(auth);
      return { statusCode: 200, message: 'Sign out successful' };
    } catch (e) {
      console.log(e);
      return {
        statusCode: e.code,
        message: 'Project create error',
        error: e.message,
      };
    }
  }
}
