import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import 'firebase/auth';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router'
import { NgForm } from '@angular/forms';
declare let alertify: any;

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit
{

  constructor(private storage: AngularFireStorage, private database: AngularFirestore, private __router: Router) { }

  disable = false;

  ngOnInit()
  {
  }

  signUp(formValues)
  {
    let { email, password, gender } = formValues;
    firebase.firestore().collection('User').add({
      username: '',
      roleID: '',
      role: 'NU',
      gender: gender,
      email: email,
      avatar: '',
      briefIntro: '',
      isVerified: false,
    }).then(() =>
    {
      firebase.auth().createUserWithEmailAndPassword(email, password).then(async () =>
      {
        await this.sendVerifyEmail();
        this.__router.navigate(['/signin'])
      }).catch(err => alertify.error(err.message));
    })
  }

  sendVerifyEmail()
  {
    firebase.auth().currentUser.sendEmailVerification();
  }

  // Submit FORM
  submitForm(f: NgForm)
  {
    if (f.value.password !== f.value.repassword) alertify.error('Password and Repassword is not same')
    this.signUp(f.value);
  }
}
