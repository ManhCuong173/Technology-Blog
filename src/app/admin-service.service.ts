import { Injectable } from '@angular/core';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class AdminServiceService
{

  currentArticleId = '';
  allArticles = [];
  roleCate = [];
  constructor()
  {
  }

  getAdminURL()
  {
    return new Promise((resolve, reject) =>
    {
      firebase.firestore().collection('User').where('email', '==', 'daomanhcuong173@gmail.com').get().then(snapshot =>
      {
        let { avatar } = snapshot.docs[0].data();
        let { id } = snapshot.docs[0];
        firebase.storage().ref(`/user_${id}/avatars/`).child(avatar).getDownloadURL().then(url =>
        {
          resolve(url)
        })
      })
    })
  }

  addArticle()
  {
    // add new document
    return new Promise((resolve, reject) =>
    {
      firebase.firestore().collection('Article').add({
        postParentID: `${new Date().getTime()}__${(Math.random() * 100).toString(16)}`,
        cateID: '',
        title: '',
        content: '',
        images: [],
        tags: [],
        voted: 0,
        numberComment: 0,
        createdDate: new Date().getTime(),
        updatedDate: ''
      }).then(snapshot =>
      {
        resolve('Khởi tạo thành công');
      }).catch(err => reject(err));
    })
  }

  deleteArticle(articleID)
  {
    return new Promise((resolve, reject) =>
    {
      // xoá article ở collection Article
      firebase.firestore().collection('Article').doc(articleID).delete().then(async () =>
      {
        //xoá thông báo ở collection Notification
        await this.deleteOldArticleInNotif(articleID);
        resolve();
      })
    })
  }

  deleteOldArticleInNotif(articleID)
  {
    return new Promise((resolve, reject) =>
    {
      firebase.firestore().collection('Notification').where('postID', '==', articleID).get().then(snapshot =>
      {
        let notificationArr = snapshot.docs;
        if (notificationArr.length) {
          notificationArr.forEach(notif =>
          {
            firebase.firestore().collection('Notification').doc(notif.id).delete();
          });
          resolve()
        };
      })
    })
  }

  getArticleId()
  {
    return new Promise((resolve, reject) =>
    {
      firebase.firestore().collection('Article').orderBy('createdDate', 'desc').limit(1).get().then(snapshot =>
      {
        this.currentArticleId = snapshot.docs[0].id;
        resolve(this.currentArticleId);
      }).catch(err => reject(err))
    })
  }

  getAllArticle()
  {
    return new Promise((resolve, reject) =>
    {
      firebase.firestore().collection('Article').get().then(snapshot =>
      {
        this.allArticles = [];
        snapshot.forEach(doc =>
        {
          let result = Object.assign(doc.data(), { id: doc.id })
          this.allArticles.push(result)
        })
        resolve(this.allArticles);
      }).catch(err => reject(err))
    })
  }
  getRoleCate()
  {
    return new Promise((resolve, reject) =>
    {
      firebase.firestore().collection('Role').get().then(snapshot =>
      {
        snapshot.docs.forEach(role =>
        {
          let result = Object.assign(role.data(), { id: role.id });
          this.roleCate.push(result)
        });

        resolve(this.roleCate)
      }).catch(err => { throw new Error(err) })
    })
  }

  changeRole(roleID, role, userID)
  {
    console.log(role)
    return new Promise((resolve, reject) =>
    {
      firebase.firestore().collection('User').doc(userID).update({ roleID: roleID, role: role }).then(() => resolve('Cập nhật thành công')).catch(err => reject(err))
    })
  }

  deleteUser(userID)
  {
    return new Promise((resolve, reject) =>
    {
      firebase.firestore().collection('User').doc(userID).delete().then(() =>
      {
        resolve('Xoá người dùng thành công')
      }).catch(err => { throw new Error(err) })
    })
  }
}
