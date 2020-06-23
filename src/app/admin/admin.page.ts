import { Component, OnInit } from '@angular/core';
import { LoginService } from '../login.service';
import { ChartDataSets } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { UtilsService } from '../utils.service';
import { AdminServiceService } from '../admin-service.service';
import { UserService } from '../user.service';
import * as firebase from 'firebase';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
declare let alertify: any;
@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit
{

  user: any;

  //user role
  roleCate: any;

  // chart configuration
  chartData: ChartDataSets[] = [{ data: [], label: 'Stock price' }];
  chartLabels: Label[];

  // all articles
  allArticles: any;

  // all users
  allUsers: any;

  // most reaction articles
  mostVotedArticles: any;
  //newest articles
  newestArticles: any;

  // active user field or articles field is actived
  isArticleField: boolean = true;
  isUserField: boolean = false;

  // active each article in articles field
  isMostVotedActive: boolean = true;
  isNewestActive: boolean = false;

  // Options
  chartOptions = {
    title: {
      display: true,
      text: 'Total Article Per Month'
    },
    // down chart by scroll
    pan: {
      enabled: true,
      mode: 'xy'
    },
    // zoom chart by scroll + Ctrl
    zoom: {
      enabled: true,
      mode: 'xy'
    }
  };
  chartColors: Color[] = [
    {
      borderColor: '#000000',
      backgroundColor: []
    }
  ];
  chartType = 'bar';
  showLegend = false;
  constructor(private __loginService: LoginService, private __utilsService: UtilsService, private __adminService: AdminServiceService, private __userService: UserService, private __router: Router)
  {
    // get chart data 
    this.getDataChart();

    // get user infor
    this.user = this.__loginService.getUser();

    // get all article
    this.getAllArticles();

    // get all users
    this.getAllUsers();
  }

  ngOnInit()
  {
  }

  getDataChart()
  {
    this.chartLabels = [];
    this.chartData[0].data = [];
    let dataArr = [10, 20, 7, 35, 50];
    let colorBarArr = [];
    for (const item of dataArr) {
      this.chartData[0].data.push(item)
      this.chartLabels.push((+new Date().getMonth() + 1).toString())
      colorBarArr.push(this.__utilsService.randomColor());
    }
    this.chartColors[0].backgroundColor = colorBarArr;
  }

  // delete user
  async deleteUser(userID)
  {

    let response = await this.__adminService.deleteUser(userID);
    let userIndex = -1;
    for (let i = 0; i < this.allUsers.length; i++) {
      const element = this.allUsers[i];
      if (element.id == userID) userIndex = i;
    }
    this.allUsers.splice(userIndex, 1);
    alertify.success(response)
  }

  async getAllArticles()
  {
    this.allArticles = await this.__adminService.getAllArticle();
    this.getMostVotedArticles(this.allArticles);
    this.newsetPost(this.allArticles);
  }

  async getAllUsers()
  {
    this.allUsers = await this.__userService.getAllUser();
    this.roleCate = await this.__adminService.getRoleCate();
    this.roleCate.splice(2, 1)

    // delete admin account in array

    this.allUsers.forEach(user =>
    {
      firebase.storage().ref(user.storageURL).getDownloadURL().then(url =>
      {
        user.storageURL = url;
      })
    });
  }

  // change role  of user
  async changeRole(event, userID)
  {
    let roleID = event.target.value;
    let roleResult = '';
    this.roleCate.forEach(role =>
    {
      if (role.id == roleID) roleResult = role.value;
    });

    for (const user of this.allUsers) {
      if (user.id == userID) {
        if (roleID == '28Xz4H7ydHe9DenatLSf') user.role = 'NU'
        else user.role = 'CA'
      }
    }
    let response = await this.__adminService.changeRole(roleID, roleResult, userID);

    alertify.success(response)
  }

  // add new user by admin
  addNewUserByAdmin(f: NgForm)
  {
    let { username, email, password, gender } = f.value;
    let isExisted = false;
    this.allUsers.forEach(user =>
    {
      if (user.email == email) {
        isExisted = true
        return;
      }
    });

    if (isExisted) {
      alertify.error('Người dùng đã tồn tại')
      return;
    }
    else {
      if (username == '' || gender == '') {
        alertify.error('Bạn cần nhập đầy đủ thông tin')
        return;
      }

      firebase.firestore().collection('User').add({
        username: username,
        roleID: '',
        role: 'NU',
        gender: gender,
        email: email,
        avatar: '',
        briefIntro: '',
        isVerified: false,
      }).then(() =>
      {
        alertify.success('Tạo mới một người dùng thành công');
        firebase.auth().createUserWithEmailAndPassword(email, password).then(() =>
        {
          this.sendVerifyEmail();
        })
      }).catch(err => alertify.error(err.message));
    }

  }

  sendVerifyEmail()
  {
    firebase.auth().currentUser.sendEmailVerification();
  }

  getMostVotedArticles(articles)
  {
    this.mostVotedArticles = [...articles];
    this.mostVotedArticles.sort((nextArticle, prevArticle) =>
    {
      if (nextArticle.voted > prevArticle.voted) return -1;
      else return 1;
    }).reverse();
  }

  newsetPost(articles)
  {
    this.newestArticles = [...articles];
    this.newestArticles.sort((nextArticle, prevArticle) =>
    {
      if (+nextArticle.createdDate > +prevArticle.createdDate) return -1;
    });
    this.newestArticles.forEach(article =>
    {
      article.createdDate = new Date(article.createdDate).toLocaleDateString();
    });
  };

  activeDisplayArticle(nameOfArticleTypeActived)
  {
    if (this.isMostVotedActive == nameOfArticleTypeActived) {
      this.isMostVotedActive = true;
      this.isNewestActive = false;
    } else {
      this.isNewestActive = true;
      this.isMostVotedActive = false;
    }
  }

  activeField(fieldName)
  {
    if (this.isArticleField == fieldName) {
      this.isArticleField = true;
      this.isUserField = false;
    } else {
      this.isUserField = true;
      this.isArticleField = false;
      this.isNewestActive = false;
      this.isMostVotedActive = false;
    }
  }

}
