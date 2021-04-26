import Facebook from '../service/facebook';

export namespace ICWBExternalServices {
  export async function uploadToFacebook(params: any, attempts: number = 0) {
    Facebook.post(params.message, params.imageUrl)
      .then(async (res: any) => {
        console.log('Posted!!!');
        await Facebook.comment(res.id, params.rankMessage)
          .then(async (commentRes: any) => {
            console.log('Rank posten on the post!!');

            const permaps = 'Mungkin'
            await Facebook.comment(commentRes.id, permaps)
              .then(async () => {
                console.log('Permaps!');                
              })
              .catch(console.log);
          })
          .catch(console.log);
      })
      .catch(async (err) => {
        console.log(`Error when Uploading: ${JSON.stringify(err)}`);
        if (attempts < 4) {
          await uploadToFacebook(params, ++attempts);
        }
        else {
          console.log(`BotProcess: All attempts failed. Just gonna wait for another task.`);
        }
      });
  }
}
