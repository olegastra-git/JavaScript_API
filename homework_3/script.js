'use strict';

// 1. rename file "key.js.example" to "key.js"
// 2. add your api key

class Loader {
    static #test = false;
    static #username = '588786';
    static #apiKey = iEYiPtJOkacTqf0OWx_L0Aix4s2ByGbMbSNbyoPIsMc;
    static #defaultSize = 'small'; // raw, regular, small, ...
    static #timeSleep = 1000;

    static #randomPhotoEl = document.querySelector('#photo-random');
    static #likedPhotoEl = document.querySelector('#photo-liked');
    static #loaderEl = document.querySelector('.loader');
    static #errorEl = document.querySelector('.error');

    static #getElement(data, type) {
        let likes = 0;
        const storageEl = this.#getLikes()[data.id];
        if (storageEl) {
            likes = storageEl.userLikes ? storageEl.userLikes.length : 0;
        }
        return [
            `<div class="photo">`,
            `<div class="likes">${likes}</div>`,
            `<img src="${data.urls[this.#defaultSize]}" alt="${data.alt_description}"/>`,
            `<div class="author">${data.user.name}</div>`,
            `<div class="control" data-type="${type}" data-id="${data.id}">`,
            type === 'random' ? `<button class="like">Like</button>` : '',
            type === 'random' ? `<button class="next">Next</button>` : '<button class="dislike">Dislike</button>',
            `</div>`,
            `</div>`
        ].join('');
    }

    static #loading = false;
    static #changer = null;
    static #changeLoading(value) {
        clearInterval(this.#changer);
        this.#loading = value;
        if (value) {
            this.#loaderEl.classList.remove('hide');
        } else {
            this.#loaderEl.classList.add('hide');
        }
    }
    static #changeError(message = '') {
        this.#errorEl.innerHTML = message;
        if (message) {
            this.#errorEl.classList.remove('hide');
        } else {
            this.#errorEl.classList.add('hide');
        }
    }

    static #currentPhoto = null;
    static async #getRandom() {
        if (this.#loading) {
            throw new Error('Данные в процессе загрузки');
        }
        try {
            this.#changeLoading(true);
            if (this.#test) { // TODO for test
                return this.#testData();
            } else {
                const response = await fetch(`https://api.unsplash.com/photos/random?client_id=${this.#apiKey}`);
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return await response.json();
            }
        } catch (err) {
            throw err;
        }  finally {
            setTimeout(() => {
                this.#changeLoading(false);
                this.#changeError();
            }, this.#timeSleep);
        }
    }
    static async renderRandom() {
        try {
            const data = await this.#getRandom();
            const image = this.#getElement(data, 'random');
            this.#currentPhoto = image ? data : null;
            this.#randomPhotoEl.innerHTML = image || '';
        } catch (err) {
            this.#changeError(err.message);
        }
    }

    static #getLikes() {
        return JSON.parse(localStorage.getItem('likedPhotos') || '{}') || {};
    }
    static like() {
        const data = this.#getLikes();
        let current = data[this.#currentPhoto.id];
        if (!current) {
            data[this.#currentPhoto.id] = current = this.#currentPhoto;
        }
        if (!current.userLikes) {
            current.userLikes = [];
        }
        current.userLikes = Array.from(new Set([this.#username, ...current.userLikes]));
        localStorage.setItem('likedPhotos', JSON.stringify(data));
        this.#addLikedPhoto(this.#currentPhoto);
        this.renderRandom();
    }
    static dislike(idPhoto) {
        const data = this.#getLikes();
        const element = this.#likedPhotoEl.querySelector(`[data-id="${idPhoto}"]`);
        if (element) {
            element.parentElement.remove();
        }
        if (data[idPhoto]) {
            if (data[idPhoto].userLikes) {
                const idx = data[idPhoto].userLikes.findIndex(e => e === this.#username);
                if (idx >= 0) {
                    data[idPhoto].userLikes.splice(idx, 1);
                }
                if (data[idPhoto].userLikes.length === 0) {
                    delete data[idPhoto];
                }
            }
            localStorage.setItem('likedPhotos', JSON.stringify(data));
        }
    }
    static #addLikedPhoto(data) {
        this.#likedPhotoEl.insertAdjacentHTML('beforeend', this.#getElement(data, 'saved'));
    }
    static renderLikes() {
        try {
            Object.values(this.#getLikes())
                .filter(e => e.userLikes && e.userLikes.includes(this.#username))
                .forEach(e => this.#addLikedPhoto(e));
        } catch (err) {
            this.#changeError(err.message);
            console.error(err);
        } finally {
            this.#changeLoading(false);
        }
    }

    static #testData() {
        return {
            "id": "wfH7b-1pf6g",
            "slug": "a-very-tall-building-with-lots-of-windows-wfH7b-1pf6g",
            "created_at": "2023-07-02T13:19:11Z",
            "updated_at": "2024-02-23T06:50:14Z",
            "promoted_at": "2024-02-20T15:48:36Z",
            "width": 2014,
            "height": 3026,
            "color": "#f3f3f3",
            "blur_hash": "LWE|0h4Tsnt7%2W=WCofbHj@bHf6",
            "description": null,
            "alt_description": "a very tall building with lots of windows",
            "breadcrumbs": [],
            "urls": {
                "raw": "https://images.unsplash.com/photo-1688303900989-6d64cb56c1e7?ixid=M3w1NzA4MDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MDg3NDM2OTR8&ixlib=rb-4.0.3",
                "full": "https://images.unsplash.com/photo-1688303900989-6d64cb56c1e7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w1NzA4MDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MDg3NDM2OTR8&ixlib=rb-4.0.3&q=85",
                "regular": "https://images.unsplash.com/photo-1688303900989-6d64cb56c1e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzA4MDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MDg3NDM2OTR8&ixlib=rb-4.0.3&q=80&w=1080",
                "small": "https://images.unsplash.com/photo-1688303900989-6d64cb56c1e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzA4MDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MDg3NDM2OTR8&ixlib=rb-4.0.3&q=80&w=400",
                "thumb": "https://images.unsplash.com/photo-1688303900989-6d64cb56c1e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzA4MDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MDg3NDM2OTR8&ixlib=rb-4.0.3&q=80&w=200",
                "small_s3": "https://s3.us-west-2.amazonaws.com/images.unsplash.com/small/photo-1688303900989-6d64cb56c1e7"
            },
            "links": {
                "self": "https://api.unsplash.com/photos/a-very-tall-building-with-lots-of-windows-wfH7b-1pf6g",
                "html": "https://unsplash.com/photos/a-very-tall-building-with-lots-of-windows-wfH7b-1pf6g",
                "download": "https://unsplash.com/photos/wfH7b-1pf6g/download?ixid=M3w1NzA4MDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MDg3NDM2OTR8",
                "download_location": "https://api.unsplash.com/photos/wfH7b-1pf6g/download?ixid=M3w1NzA4MDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MDg3NDM2OTR8"
            },
            "likes": 70,
            "liked_by_user": false,
            "current_user_collections": [],
            "sponsorship": null,
            "topic_submissions": {
                "cool-tones": {"status": "approved", "approved_on": "2024-02-12T07:41:28Z"},
                "monochromatic": {"status": "approved", "approved_on": "2023-09-11T11:32:50Z"},
                "travel": {"status": "rejected"},
                "architecture-interior": {"status": "rejected"},
                "textures-patterns": {"status": "approved", "approved_on": "2023-07-10T13:08:05Z"},
                "wallpapers": {"status": "rejected"},
                "street-photography": {"status": "rejected"}
            },
            "user": {
                "id": "n2bNKm9EAXw",
                "updated_at": "2024-02-23T15:02:28Z",
                "username": "danielstiel",
                "name": "Daniel Stiel",
                "first_name": "Daniel",
                "last_name": "Stiel",
                "twitter_username": null,
                "portfolio_url": null,
                "bio": "capturing stories\r\n",
                "location": "Rotterdam",
                "links": {
                    "self": "https://api.unsplash.com/users/danielstiel",
                    "html": "https://unsplash.com/@danielstiel",
                    "photos": "https://api.unsplash.com/users/danielstiel/photos",
                    "likes": "https://api.unsplash.com/users/danielstiel/likes",
                    "portfolio": "https://api.unsplash.com/users/danielstiel/portfolio",
                    "following": "https://api.unsplash.com/users/danielstiel/following",
                    "followers": "https://api.unsplash.com/users/danielstiel/followers"
                },
                "profile_image": {
                    "small": "https://images.unsplash.com/profile-1693899711622-b4a44d29ba26image?ixlib=rb-4.0.3&crop=faces&fit=crop&w=32&h=32",
                    "medium": "https://images.unsplash.com/profile-1693899711622-b4a44d29ba26image?ixlib=rb-4.0.3&crop=faces&fit=crop&w=64&h=64",
                    "large": "https://images.unsplash.com/profile-1693899711622-b4a44d29ba26image?ixlib=rb-4.0.3&crop=faces&fit=crop&w=128&h=128"
                },
                "instagram_username": "danielstielphotos",
                "total_collections": 5,
                "total_likes": 54,
                "total_photos": 99,
                "total_promoted_photos": 5,
                "accepted_tos": true,
                "for_hire": true,
                "social": {
                    "instagram_username": "danielstielphotos",
                    "portfolio_url": null,
                    "twitter_username": null,
                    "paypal_email": null
                }
            },
            "exif": {
                "make": null,
                "model": null,
                "name": null,
                "exposure_time": null,
                "aperture": null,
                "focal_length": null,
                "iso": null
            },
            "location": {
                "name": "Tokyo, Japan",
                "city": null,
                "country": "Japan",
                "position": {"latitude": 35.676192, "longitude": 139.650311}
            },
            "meta": {"index": true},
            "public_domain": false,
            "tags": [{
                "type": "landing_page", "title": "pattern", "source": {
                    "ancestry": {
                        "type": {"slug": "wallpapers", "pretty_slug": "HD Wallpapers"},
                        "category": {"slug": "design", "pretty_slug": "Design"},
                        "subcategory": {"slug": "pattern", "pretty_slug": "Pattern"}
                    },
                    "title": "Hd pattern wallpapers",
                    "subtitle": "Download free pattern wallpapers",
                    "description": "Choose from a curated selection of pattern wallpapers for your mobile and desktop screens. Always free on Unsplash.",
                    "meta_title": "Pattern Wallpapers: Free HD Download [500+ HQ] | Unsplash",
                    "meta_description": "Choose from hundreds of free pattern wallpapers. Download HD wallpapers for free on Unsplash.",
                    "cover_photo": {
                        "id": "ruJm3dBXCqw",
                        "slug": "pink-and-green-abstract-art-ruJm3dBXCqw",
                        "created_at": "2019-05-12T14:42:55Z",
                        "updated_at": "2024-02-19T05:08:45Z",
                        "promoted_at": "2019-05-13T07:56:41Z",
                        "width": 4000,
                        "height": 6000,
                        "color": "#a6d9f3",
                        "blur_hash": "LTM6}kLyn$+xNxw{s:WB+~WBkWSz",
                        "description": null,
                        "alt_description": "pink and green abstract art",
                        "breadcrumbs": [{
                            "slug": "backgrounds",
                            "title": "HQ Background Images",
                            "index": 0,
                            "type": "landing_page"
                        }, {
                            "slug": "colors",
                            "title": "Color Backgrounds",
                            "index": 1,
                            "type": "landing_page"
                        }, {
                            "slug": "tie-dye",
                            "title": "Tie Dye Backgrounds",
                            "index": 2,
                            "type": "landing_page"
                        }],
                        "urls": {
                            "raw": "https://images.unsplash.com/photo-1557672172-298e090bd0f1?ixlib=rb-4.0.3",
                            "full": "https://images.unsplash.com/photo-1557672172-298e090bd0f1?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb",
                            "regular": "https://images.unsplash.com/photo-1557672172-298e090bd0f1?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max",
                            "small": "https://images.unsplash.com/photo-1557672172-298e090bd0f1?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max",
                            "thumb": "https://images.unsplash.com/photo-1557672172-298e090bd0f1?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max",
                            "small_s3": "https://s3.us-west-2.amazonaws.com/images.unsplash.com/small/photo-1557672172-298e090bd0f1"
                        },
                        "links": {
                            "self": "https://api.unsplash.com/photos/pink-and-green-abstract-art-ruJm3dBXCqw",
                            "html": "https://unsplash.com/photos/pink-and-green-abstract-art-ruJm3dBXCqw",
                            "download": "https://unsplash.com/photos/ruJm3dBXCqw/download",
                            "download_location": "https://api.unsplash.com/photos/ruJm3dBXCqw/download"
                        },
                        "likes": 9297,
                        "liked_by_user": false,
                        "current_user_collections": [],
                        "sponsorship": null,
                        "topic_submissions": {
                            "textures-patterns": {
                                "status": "approved",
                                "approved_on": "2020-04-06T14:20:11Z"
                            }
                        },
                        "user": {
                            "id": "ogQykx6hk_c",
                            "updated_at": "2024-02-19T07:49:11Z",
                            "username": "pawel_czerwinski",
                            "name": "Pawel Czerwinski",
                            "first_name": "Pawel",
                            "last_name": "Czerwinski",
                            "twitter_username": "pm_cze",
                            "portfolio_url": "http://paypal.me/pmcze",
                            "bio": "Questions about how you can use the photos? help.unsplash.com/en/collections/1463188-unsplash-license 👍",
                            "location": "Poland",
                            "links": {
                                "self": "https://api.unsplash.com/users/pawel_czerwinski",
                                "html": "https://unsplash.com/@pawel_czerwinski",
                                "photos": "https://api.unsplash.com/users/pawel_czerwinski/photos",
                                "likes": "https://api.unsplash.com/users/pawel_czerwinski/likes",
                                "portfolio": "https://api.unsplash.com/users/pawel_czerwinski/portfolio",
                                "following": "https://api.unsplash.com/users/pawel_czerwinski/following",
                                "followers": "https://api.unsplash.com/users/pawel_czerwinski/followers"
                            },
                            "profile_image": {
                                "small": "https://images.unsplash.com/profile-1592328433409-d9ce8a5333eaimage?ixlib=rb-4.0.3&crop=faces&fit=crop&w=32&h=32",
                                "medium": "https://images.unsplash.com/profile-1592328433409-d9ce8a5333eaimage?ixlib=rb-4.0.3&crop=faces&fit=crop&w=64&h=64",
                                "large": "https://images.unsplash.com/profile-1592328433409-d9ce8a5333eaimage?ixlib=rb-4.0.3&crop=faces&fit=crop&w=128&h=128"
                            },
                            "instagram_username": "pmcze",
                            "total_collections": 7,
                            "total_likes": 39063,
                            "total_photos": 2110,
                            "total_promoted_photos": 1729,
                            "accepted_tos": true,
                            "for_hire": false,
                            "social": {
                                "instagram_username": "pmcze",
                                "portfolio_url": "http://paypal.me/pmcze",
                                "twitter_username": "pm_cze",
                                "paypal_email": null
                            }
                        }
                    }
                }
            }, {"type": "search", "title": "tokyo"}, {"type": "search", "title": "japan"}, {
                "type": "search",
                "title": "urban"
            }, {"type": "search", "title": "night city view"}, {"type": "search", "title": "tokyo night"}, {
                "type": "landing_page", "title": "background", "source": {
                    "ancestry": {"type": {"slug": "backgrounds", "pretty_slug": "Backgrounds"}},
                    "title": "Hq background images",
                    "subtitle": "Download free backgrounds",
                    "description": "Browse our beautiful selection of free background images–all submitted by our community of talented contributors and completely free to download and use.",
                    "meta_title": "Best 100+ Free Background Images [HD] | Download your next background photo on Unsplash",
                    "meta_description": "Download the perfect background images. Find over 100+ of the best free background images. Free for commercial use ✓ No attribution required ✓ Copyright-free ✓",
                    "cover_photo": {
                        "id": "fMUIVein7Ng",
                        "slug": "closeup-photo-of-black-and-red-building-fMUIVein7Ng",
                        "created_at": "2017-05-15T23:49:10Z",
                        "updated_at": "2024-02-17T23:02:23Z",
                        "promoted_at": "2017-05-16T09:06:41Z",
                        "width": 3847,
                        "height": 5583,
                        "color": "#c0d9d9",
                        "blur_hash": "LtJ@tjEyjFj[lov~Rja{-Cx]bbWC",
                        "description": "After getting many photos for a project, I am also trying to get images to share with the Unsplash community. Here’s an attempt at abstracting a detail of the amazing architecture of CCPV.",
                        "alt_description": "closeup photo of black and red building",
                        "breadcrumbs": [{
                            "slug": "images",
                            "title": "1,000,000+ Free Images",
                            "index": 0,
                            "type": "landing_page"
                        }, {
                            "slug": "feelings",
                            "title": "Feelings Images",
                            "index": 1,
                            "type": "landing_page"
                        }, {
                            "slug": "cool",
                            "title": "Cool Images & Photos",
                            "index": 2,
                            "type": "landing_page"
                        }],
                        "urls": {
                            "raw": "https://images.unsplash.com/photo-1494891848038-7bd202a2afeb?ixlib=rb-4.0.3",
                            "full": "https://images.unsplash.com/photo-1494891848038-7bd202a2afeb?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb",
                            "regular": "https://images.unsplash.com/photo-1494891848038-7bd202a2afeb?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max",
                            "small": "https://images.unsplash.com/photo-1494891848038-7bd202a2afeb?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max",
                            "thumb": "https://images.unsplash.com/photo-1494891848038-7bd202a2afeb?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max",
                            "small_s3": "https://s3.us-west-2.amazonaws.com/images.unsplash.com/small/photo-1494891848038-7bd202a2afeb"
                        },
                        "links": {
                            "self": "https://api.unsplash.com/photos/closeup-photo-of-black-and-red-building-fMUIVein7Ng",
                            "html": "https://unsplash.com/photos/closeup-photo-of-black-and-red-building-fMUIVein7Ng",
                            "download": "https://unsplash.com/photos/fMUIVein7Ng/download",
                            "download_location": "https://api.unsplash.com/photos/fMUIVein7Ng/download"
                        },
                        "likes": 1952,
                        "liked_by_user": false,
                        "current_user_collections": [],
                        "sponsorship": null,
                        "topic_submissions": {
                            "architecture-interior": {
                                "status": "approved",
                                "approved_on": "2020-04-06T14:20:14Z"
                            },
                            "color-of-water": {"status": "approved", "approved_on": "2022-04-21T15:04:21Z"},
                            "wallpapers": {"status": "approved", "approved_on": "2020-04-06T14:20:09Z"}
                        },
                        "premium": false,
                        "plus": false,
                        "user": {
                            "id": "hnq0aaqF_Qo",
                            "updated_at": "2024-02-16T07:23:23Z",
                            "username": "scottwebb",
                            "name": "Scott Webb",
                            "first_name": "Scott",
                            "last_name": "Webb",
                            "twitter_username": null,
                            "portfolio_url": "https://scottwebb.me/",
                            "bio": "If you like my work and you'd like to support me, you can consider a donation 👉  http://www.paypal.me/scottrwebb | Donation goal for a new lens: $351.01 of $449 | Thank you Jay D. 🙏",
                            "location": "London, Ontario, Canada",
                            "links": {
                                "self": "https://api.unsplash.com/users/scottwebb",
                                "html": "https://unsplash.com/@scottwebb",
                                "photos": "https://api.unsplash.com/users/scottwebb/photos",
                                "likes": "https://api.unsplash.com/users/scottwebb/likes",
                                "portfolio": "https://api.unsplash.com/users/scottwebb/portfolio",
                                "following": "https://api.unsplash.com/users/scottwebb/following",
                                "followers": "https://api.unsplash.com/users/scottwebb/followers"
                            },
                            "profile_image": {
                                "small": "https://images.unsplash.com/profile-1598557047185-d94f7fc56f69image?ixlib=rb-4.0.3&crop=faces&fit=crop&w=32&h=32",
                                "medium": "https://images.unsplash.com/profile-1598557047185-d94f7fc56f69image?ixlib=rb-4.0.3&crop=faces&fit=crop&w=64&h=64",
                                "large": "https://images.unsplash.com/profile-1598557047185-d94f7fc56f69image?ixlib=rb-4.0.3&crop=faces&fit=crop&w=128&h=128"
                            },
                            "instagram_username": "scottwebb",
                            "total_collections": 46,
                            "total_likes": 4449,
                            "total_photos": 804,
                            "total_promoted_photos": 387,
                            "accepted_tos": true,
                            "for_hire": true,
                            "social": {
                                "instagram_username": "scottwebb",
                                "portfolio_url": "https://scottwebb.me/",
                                "twitter_username": null,
                                "paypal_email": null
                            }
                        }
                    }
                }
            }, {"type": "search", "title": "tokyo at night"}, {
                "type": "search",
                "title": "night cityscape"
            }, {"type": "search", "title": "night time"}, {
                "type": "search",
                "title": "shibuya"
            }, {"type": "search", "title": "timesquare"}, {
                "type": "search",
                "title": "tokyo night view"
            }, {"type": "search", "title": "tokyo street"}, {
                "type": "search",
                "title": "night city photography"
            }, {"type": "search", "title": "street photography"}, {
                "type": "search",
                "title": "urban city"
            }, {"type": "search", "title": "skyscraper"}, {
                "type": "landing_page", "title": "windows", "source": {
                    "ancestry": {
                        "type": {"slug": "wallpapers", "pretty_slug": "HD Wallpapers"},
                        "category": {"slug": "desktop", "pretty_slug": "Desktop"},
                        "subcategory": {"slug": "windows", "pretty_slug": "Windows"}
                    },
                    "title": "Hd windows wallpapers",
                    "subtitle": "Download free windows wallpapers",
                    "description": "Choose from a curated selection of Windows wallpapers for your mobile and desktop screens. Always free on Unsplash.",
                    "meta_title": "Windows Wallpapers: Free HD Download [500+ HQ] | Unsplash",
                    "meta_description": "Choose from hundreds of free Windows wallpapers. Download HD wallpapers for free on Unsplash.",
                    "cover_photo": {
                        "id": "R9OS29xJb-8",
                        "slug": "sand-landscape-R9OS29xJb-8",
                        "created_at": "2017-07-13T23:38:01Z",
                        "updated_at": "2024-02-14T16:13:05Z",
                        "promoted_at": "2017-07-15T02:49:56Z",
                        "width": 3456,
                        "height": 2304,
                        "color": "#f3d9c0",
                        "blur_hash": "LdPGHfMyRjj@B@WXfka}M{affQfk",
                        "description": "Ergh Jebbi",
                        "alt_description": "sand landscape",
                        "breadcrumbs": [{
                            "slug": "images",
                            "title": "1,000,000+ Free Images",
                            "index": 0,
                            "type": "landing_page"
                        }, {
                            "slug": "feelings",
                            "title": "Feelings Images",
                            "index": 1,
                            "type": "landing_page"
                        }, {
                            "slug": "cool",
                            "title": "Cool Images & Photos",
                            "index": 2,
                            "type": "landing_page"
                        }],
                        "urls": {
                            "raw": "https://images.unsplash.com/photo-1499988921418-b7df40ff03f9?ixlib=rb-4.0.3",
                            "full": "https://images.unsplash.com/photo-1499988921418-b7df40ff03f9?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb",
                            "regular": "https://images.unsplash.com/photo-1499988921418-b7df40ff03f9?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max",
                            "small": "https://images.unsplash.com/photo-1499988921418-b7df40ff03f9?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max",
                            "thumb": "https://images.unsplash.com/photo-1499988921418-b7df40ff03f9?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max",
                            "small_s3": "https://s3.us-west-2.amazonaws.com/images.unsplash.com/small/photo-1499988921418-b7df40ff03f9"
                        },
                        "links": {
                            "self": "https://api.unsplash.com/photos/sand-landscape-R9OS29xJb-8",
                            "html": "https://unsplash.com/photos/sand-landscape-R9OS29xJb-8",
                            "download": "https://unsplash.com/photos/R9OS29xJb-8/download",
                            "download_location": "https://api.unsplash.com/photos/R9OS29xJb-8/download"
                        },
                        "likes": 2574,
                        "liked_by_user": false,
                        "current_user_collections": [],
                        "sponsorship": null,
                        "topic_submissions": {
                            "wallpapers": {
                                "status": "approved",
                                "approved_on": "2020-04-06T14:20:09Z"
                            }
                        },
                        "premium": false,
                        "plus": false,
                        "user": {
                            "id": "zpgEV0k9XAA",
                            "updated_at": "2023-09-13T04:31:35Z",
                            "username": "m______________e",
                            "name": "Mark Eder",
                            "first_name": "Mark",
                            "last_name": "Eder",
                            "twitter_username": null,
                            "portfolio_url": "http://www.markeder.photography",
                            "bio": null,
                            "location": "Vienna",
                            "links": {
                                "self": "https://api.unsplash.com/users/m______________e",
                                "html": "https://unsplash.com/@m______________e",
                                "photos": "https://api.unsplash.com/users/m______________e/photos",
                                "likes": "https://api.unsplash.com/users/m______________e/likes",
                                "portfolio": "https://api.unsplash.com/users/m______________e/portfolio",
                                "following": "https://api.unsplash.com/users/m______________e/following",
                                "followers": "https://api.unsplash.com/users/m______________e/followers"
                            },
                            "profile_image": {
                                "small": "https://images.unsplash.com/profile-1488557507434-790fb0197775?ixlib=rb-4.0.3&crop=faces&fit=crop&w=32&h=32",
                                "medium": "https://images.unsplash.com/profile-1488557507434-790fb0197775?ixlib=rb-4.0.3&crop=faces&fit=crop&w=64&h=64",
                                "large": "https://images.unsplash.com/profile-1488557507434-790fb0197775?ixlib=rb-4.0.3&crop=faces&fit=crop&w=128&h=128"
                            },
                            "instagram_username": "m_______________________e",
                            "total_collections": 0,
                            "total_likes": 19,
                            "total_photos": 14,
                            "total_promoted_photos": 6,
                            "accepted_tos": false,
                            "for_hire": false,
                            "social": {
                                "instagram_username": "m_______________________e",
                                "portfolio_url": "http://www.markeder.photography",
                                "twitter_username": null,
                                "paypal_email": null
                            }
                        }
                    }
                }
            }, {
                "type": "landing_page", "title": "blue", "source": {
                    "ancestry": {
                        "type": {"slug": "wallpapers", "pretty_slug": "HD Wallpapers"},
                        "category": {"slug": "colors", "pretty_slug": "Color"},
                        "subcategory": {"slug": "blue", "pretty_slug": "Blue"}
                    },
                    "title": "Hd blue wallpapers",
                    "subtitle": "Download free blue wallpapers",
                    "description": "Choose from a curated selection of blue wallpapers for your mobile and desktop screens. Always free on Unsplash.",
                    "meta_title": "Blue Wallpapers: Free HD Download [500+ HQ] | Unsplash",
                    "meta_description": "Choose from hundreds of free blue wallpapers. Download HD wallpapers for free on Unsplash.",
                    "cover_photo": {
                        "id": "DbwYNr8RPbg",
                        "slug": "white-clouds-and-blue-skies-DbwYNr8RPbg",
                        "created_at": "2018-03-30T20:31:32Z",
                        "updated_at": "2024-02-19T11:04:40Z",
                        "promoted_at": "2018-04-01T02:25:27Z",
                        "width": 4433,
                        "height": 7880,
                        "color": "#0c8ca6",
                        "blur_hash": "LrErCEM|R*WC~VNGWBWV-pWCWVj[",
                        "description": "AQUA",
                        "alt_description": "white clouds and blue skies",
                        "breadcrumbs": [{
                            "slug": "backgrounds",
                            "title": "HQ Background Images",
                            "index": 0,
                            "type": "landing_page"
                        }, {
                            "slug": "colors",
                            "title": "Color Backgrounds",
                            "index": 1,
                            "type": "landing_page"
                        }, {
                            "slug": "light-blue",
                            "title": "Light Blue Backgrounds",
                            "index": 2,
                            "type": "landing_page"
                        }],
                        "urls": {
                            "raw": "https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?ixlib=rb-4.0.3",
                            "full": "https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb",
                            "regular": "https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max",
                            "small": "https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max",
                            "thumb": "https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max",
                            "small_s3": "https://s3.us-west-2.amazonaws.com/images.unsplash.com/small/photo-1522441815192-d9f04eb0615c"
                        },
                        "links": {
                            "self": "https://api.unsplash.com/photos/white-clouds-and-blue-skies-DbwYNr8RPbg",
                            "html": "https://unsplash.com/photos/white-clouds-and-blue-skies-DbwYNr8RPbg",
                            "download": "https://unsplash.com/photos/DbwYNr8RPbg/download",
                            "download_location": "https://api.unsplash.com/photos/DbwYNr8RPbg/download"
                        },
                        "likes": 7202,
                        "liked_by_user": false,
                        "current_user_collections": [],
                        "sponsorship": null,
                        "topic_submissions": {
                            "textures-patterns": {
                                "status": "approved",
                                "approved_on": "2020-06-12T13:12:52Z"
                            }
                        },
                        "premium": false,
                        "plus": false,
                        "user": {
                            "id": "BrQR9ZNLFVg",
                            "updated_at": "2024-01-31T01:18:56Z",
                            "username": "resul",
                            "name": "Resul Mentes 🇹🇷",
                            "first_name": "Resul",
                            "last_name": "Mentes 🇹🇷",
                            "twitter_username": "resulmentess",
                            "portfolio_url": "http://resulmentes.com",
                            "bio": ".",
                            "location": "Sakarya,Türkiye",
                            "links": {
                                "self": "https://api.unsplash.com/users/resul",
                                "html": "https://unsplash.com/@resul",
                                "photos": "https://api.unsplash.com/users/resul/photos",
                                "likes": "https://api.unsplash.com/users/resul/likes",
                                "portfolio": "https://api.unsplash.com/users/resul/portfolio",
                                "following": "https://api.unsplash.com/users/resul/following",
                                "followers": "https://api.unsplash.com/users/resul/followers"
                            },
                            "profile_image": {
                                "small": "https://images.unsplash.com/profile-1579609671436-8ac276f87e50image?ixlib=rb-4.0.3&crop=faces&fit=crop&w=32&h=32",
                                "medium": "https://images.unsplash.com/profile-1579609671436-8ac276f87e50image?ixlib=rb-4.0.3&crop=faces&fit=crop&w=64&h=64",
                                "large": "https://images.unsplash.com/profile-1579609671436-8ac276f87e50image?ixlib=rb-4.0.3&crop=faces&fit=crop&w=128&h=128"
                            },
                            "instagram_username": "resulmentess",
                            "total_collections": 2,
                            "total_likes": 33,
                            "total_photos": 59,
                            "total_promoted_photos": 2,
                            "accepted_tos": true,
                            "for_hire": true,
                            "social": {
                                "instagram_username": "resulmentess",
                                "portfolio_url": "http://resulmentes.com",
                                "twitter_username": "resulmentess",
                                "paypal_email": null
                            }
                        }
                    }
                }
            }],
            "tags_preview": [{
                "type": "landing_page", "title": "pattern", "source": {
                    "ancestry": {
                        "type": {"slug": "wallpapers", "pretty_slug": "HD Wallpapers"},
                        "category": {"slug": "design", "pretty_slug": "Design"},
                        "subcategory": {"slug": "pattern", "pretty_slug": "Pattern"}
                    },
                    "title": "Hd pattern wallpapers",
                    "subtitle": "Download free pattern wallpapers",
                    "description": "Choose from a curated selection of pattern wallpapers for your mobile and desktop screens. Always free on Unsplash.",
                    "meta_title": "Pattern Wallpapers: Free HD Download [500+ HQ] | Unsplash",
                    "meta_description": "Choose from hundreds of free pattern wallpapers. Download HD wallpapers for free on Unsplash.",
                    "cover_photo": {
                        "id": "ruJm3dBXCqw",
                        "slug": "pink-and-green-abstract-art-ruJm3dBXCqw",
                        "created_at": "2019-05-12T14:42:55Z",
                        "updated_at": "2024-02-19T05:08:45Z",
                        "promoted_at": "2019-05-13T07:56:41Z",
                        "width": 4000,
                        "height": 6000,
                        "color": "#a6d9f3",
                        "blur_hash": "LTM6}kLyn$+xNxw{s:WB+~WBkWSz",
                        "description": null,
                        "alt_description": "pink and green abstract art",
                        "breadcrumbs": [{
                            "slug": "backgrounds",
                            "title": "HQ Background Images",
                            "index": 0,
                            "type": "landing_page"
                        }, {
                            "slug": "colors",
                            "title": "Color Backgrounds",
                            "index": 1,
                            "type": "landing_page"
                        }, {
                            "slug": "tie-dye",
                            "title": "Tie Dye Backgrounds",
                            "index": 2,
                            "type": "landing_page"
                        }],
                        "urls": {
                            "raw": "https://images.unsplash.com/photo-1557672172-298e090bd0f1?ixlib=rb-4.0.3",
                            "full": "https://images.unsplash.com/photo-1557672172-298e090bd0f1?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb",
                            "regular": "https://images.unsplash.com/photo-1557672172-298e090bd0f1?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max",
                            "small": "https://images.unsplash.com/photo-1557672172-298e090bd0f1?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max",
                            "thumb": "https://images.unsplash.com/photo-1557672172-298e090bd0f1?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max",
                            "small_s3": "https://s3.us-west-2.amazonaws.com/images.unsplash.com/small/photo-1557672172-298e090bd0f1"
                        },
                        "links": {
                            "self": "https://api.unsplash.com/photos/pink-and-green-abstract-art-ruJm3dBXCqw",
                            "html": "https://unsplash.com/photos/pink-and-green-abstract-art-ruJm3dBXCqw",
                            "download": "https://unsplash.com/photos/ruJm3dBXCqw/download",
                            "download_location": "https://api.unsplash.com/photos/ruJm3dBXCqw/download"
                        },
                        "likes": 9297,
                        "liked_by_user": false,
                        "current_user_collections": [],
                        "sponsorship": null,
                        "topic_submissions": {
                            "textures-patterns": {
                                "status": "approved",
                                "approved_on": "2020-04-06T14:20:11Z"
                            }
                        },
                        "user": {
                            "id": "ogQykx6hk_c",
                            "updated_at": "2024-02-19T07:49:11Z",
                            "username": "pawel_czerwinski",
                            "name": "Pawel Czerwinski",
                            "first_name": "Pawel",
                            "last_name": "Czerwinski",
                            "twitter_username": "pm_cze",
                            "portfolio_url": "http://paypal.me/pmcze",
                            "bio": "Questions about how you can use the photos? help.unsplash.com/en/collections/1463188-unsplash-license 👍",
                            "location": "Poland",
                            "links": {
                                "self": "https://api.unsplash.com/users/pawel_czerwinski",
                                "html": "https://unsplash.com/@pawel_czerwinski",
                                "photos": "https://api.unsplash.com/users/pawel_czerwinski/photos",
                                "likes": "https://api.unsplash.com/users/pawel_czerwinski/likes",
                                "portfolio": "https://api.unsplash.com/users/pawel_czerwinski/portfolio",
                                "following": "https://api.unsplash.com/users/pawel_czerwinski/following",
                                "followers": "https://api.unsplash.com/users/pawel_czerwinski/followers"
                            },
                            "profile_image": {
                                "small": "https://images.unsplash.com/profile-1592328433409-d9ce8a5333eaimage?ixlib=rb-4.0.3&crop=faces&fit=crop&w=32&h=32",
                                "medium": "https://images.unsplash.com/profile-1592328433409-d9ce8a5333eaimage?ixlib=rb-4.0.3&crop=faces&fit=crop&w=64&h=64",
                                "large": "https://images.unsplash.com/profile-1592328433409-d9ce8a5333eaimage?ixlib=rb-4.0.3&crop=faces&fit=crop&w=128&h=128"
                            },
                            "instagram_username": "pmcze",
                            "total_collections": 7,
                            "total_likes": 39063,
                            "total_photos": 2110,
                            "total_promoted_photos": 1729,
                            "accepted_tos": true,
                            "for_hire": false,
                            "social": {
                                "instagram_username": "pmcze",
                                "portfolio_url": "http://paypal.me/pmcze",
                                "twitter_username": "pm_cze",
                                "paypal_email": null
                            }
                        }
                    }
                }
            }, {"type": "search", "title": "tokyo"}, {"type": "search", "title": "japan"}],
            "views": 823589,
            "downloads": 3796,
            "topics": [{
                "id": "iXRd8cmpUDI",
                "title": "Cool Tones",
                "slug": "cool-tones",
                "visibility": "featured"
            }, {
                "id": "3bnm95isIxE",
                "title": "Monochromatic",
                "slug": "monochromatic",
                "visibility": "hidden"
            }, {
                "id": "iUIsnVtjB0Y",
                "title": "Textures & Patterns",
                "slug": "textures-patterns",
                "visibility": "featured"
            }]
        };
    }
}

window.addEventListener('DOMContentLoaded', () => {
    Loader.renderRandom();
    Loader.renderLikes();
});
document.addEventListener('click', ({target}) => {
    const buttons = {
        like: target.matches('.like'),
        dislike: target.matches('.dislike'),
        next: target.matches('.next'),
    };
    const action = Object.entries(buttons)
        .map(([name, value]) => ({name, value}))
        .find(e => e.value === true);

    if (action) {
        const data = target.parentElement.dataset;
        switch (action.name) {
            case 'like':
                Loader.like();
                break;
            case 'dislike':
                Loader.dislike(data.id);
                break;
            case 'next':
                Loader.renderRandom();
                break;
        }
    }
});