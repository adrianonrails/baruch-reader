import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams, Platform, ModalController, ToastController } from "ionic-angular";
import { NovelsService } from "../../providers/novels-service";
import { Chapter } from "../../common/models/chapter";
import { StatusBar } from "@ionic-native/status-bar";
import { ReaderSettingsService } from "../../providers/reader-settings-service";
import { ChaptersService } from "../../providers/chapters-service";
import { LnLoadingController } from "../../common/ln-loading-controller";

@IonicPage()
@Component({
  selector: "ln-chapter-page",
  templateUrl: "ln-chapter-page.html",
})
export class LnChapterPage {
  navDisplay: string = "none";
  chapterDetailsHeader: any;
  chapter: Chapter;
  novelId: number;
  settings: any;
  isFromNextChapter: boolean;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public novelsService: NovelsService,
    private readerSettingsService: ReaderSettingsService,
    private chapterService: ChaptersService,
    private platform: Platform,
    private statusBar: StatusBar,
    private modalCtrl: ModalController,
    private loadingCtrl: LnLoadingController,
    private toastCtrl: ToastController) {
  }

  ionViewWillEnter() {
    // hide status bar
    this.toggleStatusBar(false);
  }

  ionViewWillLeave() {
    // show status bar
    this.toggleStatusBar(true);
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad LnChapterPage");
    let data = this.navParams.data;
    this.goToChapter(data.novelId, data.chapterNumber, false);
    this.novelId = data.novelId;
    this.settings = this.readerSettingsService.settings;
  }

  toggleNavBar(evt = null) {
    // check if tap comes from the edges and if horizontal scrolling is enabled
    // if it is hide the navbar
    if (evt &&
      evt.target.className.indexOf("navigation") > -1 &&
      this.settings.horizontalScrolling) {
      this.navDisplay = "none";
      return;
    }

    this.navDisplay = this.navDisplay == "none" ? "flex" : "none";
  }

  toggleStatusBar(show) {
    if (this.platform.is("mobile") ||
      this.platform.is("mobileweb") ||
      this.platform.is("phablet") ||
      this.platform.is("tablet")
    ) {
      show ? this.statusBar.show() : this.statusBar.hide();
    }
  }

  openSettingsModal() {
    this.toggleNavBar();
    let settingsModal = this.modalCtrl.create('LnReaderSettingsModal');
    settingsModal.onDidDismiss((settings) => {
      this.settings = settings ? settings : this.settings;
    });
    settingsModal.present();
  }

  goToChapter(novelId, chapterNumber, showLoading = true) {
    if (showLoading) {
      this.loadingCtrl.presentLoadingMessage("", true);
    }
    this.novelsService.getNovelChapter(novelId, chapterNumber)
      .then((chapter: Chapter) => {
        this.chapter = chapter;
        if (showLoading) {
          this.loadingCtrl.hideLoadingMessage();
        }
        this.markChapterAsRead();
      })
      .catch(err => {
        if (showLoading) {
          this.loadingCtrl.hideLoadingMessage();
        }
        let toast = this.toastCtrl.create({
          message: "No chapter to show.",
          duration: 2000,
          position: "bottom",
          dismissOnPageChange: true,
          showCloseButton: true
        });
        toast.present();
      });
  }

  nextChapter() {
    this.toggleNavBar();
    this.isFromNextChapter = false;
    this.goToChapter(this.novelId, this.chapter.number + 1);
  }

  prevChapter() {
    this.toggleNavBar();
    this.isFromNextChapter = false;
    this.goToChapter(this.novelId, this.chapter.number - 1);
  }

  markChapterAsRead() {
    this.chapterService
      .markAsRead(this.chapter.id)
      .then(() => console.log("MARKED AS READ", this.chapter.id))
      .catch((err) => console.log("UNABLE TO MARK AS READ", this.chapter.id));
  }
}
