import { Injectable } from '@angular/core';
import { Storage } from "@ionic/storage";
import _ from "lodash";

import { Novel } from '../common/models/novel';

@Injectable()
export class NovelsLocalService {

    private NOVELS: string = "novels";

    constructor(public storage: Storage) {
        console.log('Hello Novels Local Service');
    }

    get(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.storage.get(this.NOVELS)
                .then(novels => {
                    resolve(novels || []);
                })
                .catch(() => {
                    // if no novels yet
                    // return blank
                    resolve([]);
                });
        });
    }

    set(novels) {
        this.storage.set(this.NOVELS, novels);
    }

    add(novel: Novel): Promise<any> {
        return new Promise((resolve, reject) => {
            // check first if novel in list already
            this.isInList(novel)
                .then(() => resolve())
                .catch(() => {
                    this.get()
                        .then((novels) => {
                            novels.push(novel);
                            this.set(novels);
                        });
                });
        });
    }

    remove(novel: Novel): Promise<any> {
        return new Promise((resolve, reject) => {
            this.get()
                .then((novels) => {
                    _.novels.pull(novel);
                    this.set(novels);
                });
        });
    }

    isInList(novel): Promise<any> {
        return new Promise((resolve, reject) => {
            this.get()
                .then(novels => {
                    let inList = _.includes(novels, novel);
                    if (inList) {
                        resolve();
                    } else {
                        reject();
                    }
                })
                .catch(() => {
                    reject();
                });
        });
    }

    getNovels(novelIds: number[]): Promise<Array<Novel>> {
        console.log("NovelsLocalService::getNovels");
        return new Promise((resolve, reject) => {
            this.get()
                .then(novels => {
                    // map novels
                    let filtered = _.filter(novels, (novel: Novel) => {
                        return _.includes(novelIds, novel.id);
                    });

                    resolve(filtered);
                });
        });
    }
}