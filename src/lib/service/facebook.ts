import { Facebook } from 'fb-ts';
import FBConfig from '../../config/facebook';

class FacebookAPI {
  private FB: Facebook;
  private pageId: string | number;

  recentPostId: string = '';
  recentUploadResponse: any = {};

  constructor() {
    this.pageId = FBConfig.pageId!;

    this.FB = new Facebook({
      accessToken: FBConfig.token!,
      appId: FBConfig.appId!,
      appSecret: FBConfig.appSecret!
    });
  }

  post(text: string, imageUrl?: string, comment?: string) {
    return new Promise((resolve, reject) => {
      let endPoint = 'photos';
      let body = {};

      let fullEndPoint = `${this.resolvePageId()}/${endPoint}`;
      if (imageUrl == null) {
        endPoint = 'feed';
        body = { message: text };
      }
      else if (text == '' && !(imageUrl == null)) {
        body = { url: imageUrl };
      }
      else {
        body = { url: imageUrl, caption: text };
      }
      this.FB.api(fullEndPoint, "post", body, this.callbackHandler(resolve, reject, comment));
    });
  }

  comment(postId: string, text: string) {
    return new Promise((resolve, reject) => {
      const body = { message: text };
      const endPoint = `${postId}/comments`;
      this.FB.api(endPoint, "post", body, this.callbackHandler(resolve, reject));
    });
  }

  private callbackHandler(resolve, reject, comment?) {
    return (res) => {
      if (!res || res.error) {
        reject(this.generateErrorObject(res));
        return;
      }
      this.recentUploadResponse = res;
      this.recentPostId = res.post_id;

      if(comment) {
        this.comment(this.recentPostId, comment);
      }

      resolve(res);
    }
  }

  private resolvePageId() {
    return this.pageId.toString();
  }

  private generateErrorObject(res: any) {
    return {
      message: 'Error while posting',
      err: !res ? 'No response from server.' : res.error
    };
  }
}

//@ts-ignore
export default new FacebookAPI();
