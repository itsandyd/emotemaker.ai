declare module 'instagram-web-api' {
  export interface InstagramApiOptions {
    username: string;
    password: string;
  }

  export interface UploadPhotoOptions {
    photo: string;
    caption: string;
    post: 'feed' | 'story';
  }

  export class InstagramApi {
    constructor(options: InstagramApiOptions);
    login(): Promise<void>;
    uploadPhoto(options: UploadPhotoOptions): Promise<any>;
  }

  export default InstagramApi;
}
