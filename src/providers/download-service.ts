import { Injectable } from '@angular/core';
import { Transfer, TransferObject } from '@ionic-native/transfer';
import { File } from '@ionic-native/file';
import _ from "lodash";

import { SafeHttpProvider } from "./safe-http";
import { NovelsService } from "./novels-service";
import { Chapter } from "../common/models/chapter";
import { Novel } from "../common/models/novel";

@Injectable()
export class DownloadService {

  fileTransfer: TransferObject;
  queue: DownloadItem[] = [];

  constructor(private http: SafeHttpProvider,
    private novelsService: NovelsService,
    private file: File,
    private transfer: Transfer) {
    console.log('Hello Downloads Service');

    this.fileTransfer = this.transfer.create();
  }

  // returns the list of all undowloaded chapters
  // call an api and match it with the downloaded files
  // remove the matched
  getUndownloadedChapters(novelId): Promise<any> {
    return this.novelsService
      .getNovelChapterList(novelId)
      .toPromise();
  }

  // add to queue
  addToQueue(novelId, chapters) {
    // add to queue
    let item = new DownloadItem({
      novel: novelId,
      chapters: chapters
    });
    this.queue.push(item);

    this.download(item);
  }

  download(downloadItem: DownloadItem) {
    let dataDir = this.file.dataDirectory;
    let url = `/api/Novels/${downloadItem.novel}/chapters/`;

    // create a folder for the novel if it doesn't have
    let novelDir = dataDir + downloadItem.novel + "/";
    this.createDir(downloadItem.novel)
      .then(entry => {
        this.retrieveChapters(downloadItem, url, novelDir);
      })
      .catch(err => {
        console.log("error creating directory", err);
      });
  }

  private retrieveChapters(downloadItem, url, novelDir) {
    // computation for progress
    let total = downloadItem.chapters.length;
    let currentlyFinished = 0;

    // iterate all and download
    _.each(downloadItem.chapters, chapter => {
      this.fileTransfer
        .download(`${url}${chapter}`,
        `${novelDir}${chapter}.json`)
        .then(entry => {
          console.log("download complete: ", entry.toURL());

          // update progress
          currentlyFinished += 1;
          downloadItem.progress = currentlyFinished / total;

          // if all chapters is finished
          if (downloadItem.progress === 1) {
            downloadItem.isFinished = true;
          }
        })
        .catch(err => {
          console.log("error downloading", err)
        });
    });
  }

  private createDir(novelId): Promise<any> {
    return new Promise((resolve, reject) => {
      let dataDir = this.file.dataDirectory;
      this.file
        .checkDir(dataDir, novelId.toString())
        .then(() => {
          // if directory exists, just do nothing
          resolve();
        })
        .catch(() => {
          // create the directory
          this.file
            .createDir(dataDir, novelId.toString(), false)
            .then(() => {
              resolve();
            })
            .catch(() => {
              reject();
            });
        });
    });

  }
}

export class DownloadItem {
  public novel: number;
  public chapters: Chapter[];
  public isFinished: boolean;
  public progress: number;

  constructor(init?: Partial<DownloadItem>) {
    Object.assign(this, init);
  }
}