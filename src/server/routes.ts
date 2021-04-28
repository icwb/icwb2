import { ExpressAppRoute } from './index';
import ICWB from '../lib/icwb';
import ICWBDB from '../lib/icwb/db';
import { ICWBExternalServices } from '../lib/icwb/external';

export const routes: ExpressAppRoute[] = [
  {
    path: '/',
    mode: 'GET',
    handler: (req, res) => {
      res.header({ 'Content-Type': 'application/json' });
      res.json({ 'ping': 'pong' });
    }
  },
  {
    path: '/icwb/start',
    mode: 'POST',
    handler: async (req, res) => {
      wrapXApiSecretValidation({ req, res }, async () => {
        await ICWB.beginTask();

        res
          .status(200)
          .header({ 'Content-Type': 'application/json' })
          .json({
            data: {
              success: 'true'
            }
          });
      });
    }
  },
  {
    path: '/icwb/trigger-invasion',
    mode: 'POST',
    handler: async (req, res) => {
      wrapXApiSecretValidation({ req, res }, async () => {
        await ICWB.startInvasion();

        const imgData = ICWB.canvas.getCanvasData();
        const imageUrl = await ICWBDB.uploadImageToFirebase(imgData);
        await ICWBExternalServices.uploadToFacebook(
          {
            imageUrl,
            message: ICWB.event.message,
            rankMessage: ICWB.getRankMessage()
          }
        );
        await ICWB.uploadDatas();

        const data = {
          message: 'Invasion Triggered',
          eventData: ICWB.event,
          provinces: ICWB.provincesData
        }

        ICWB.history.push(data);

        res
          .status(200)
          .header({ 'Content-Type': 'application/json' })
          .json({
            data
          });
      });
    }
  },
  {
    path: '/icwb/reset',
    mode: 'POST',
    handler: async (req, res) => {
      wrapXApiSecretValidation({ req, res }, async () => {
        await ICWBDB.resetDatas();
        await ICWBDB.fetchDatas()
          .then(res => {
            ICWB.initialize(res[0].data, res[1].data);
          })
          .catch(res.status(200).json);

        res
          .status(200)
          .header({ 'Content-Type': 'application/json' })
          .json({
            data: {
              success: 'true'
            }
          });
      }, req.headers['x-api-reset'] === process.env.X_API_RESET);
    }
  },
  {
    path: '/icwb/provinces',
    mode: 'GET',
    handler: (req, res) => {
      wrapXApiSecretValidation({ req, res }, async () => {
        res
          .status(200)
          .header({ 'Content-Type': 'application/json' })
          .json({
            data: {
              provinces: ICWB.provincesData
            }
          });
      });
    }
  },
  {
    path: '/icwb/provinces/:id',
    mode: 'GET',
    handler: (req, res) => {
      wrapXApiSecretValidation({ req, res }, async () => {
        res
          .status(200)
          .header({ 'Content-Type': 'application/json' })
          .json({
            data: {
              province: ICWB.getProvinceById(req.params.id),
              index: ICWB.getProvinceIndexById(req.params.id)
            }
          });
      });
    }
  },
  {
    path: '/icwb/events',
    mode: 'GET',
    handler: (req, res) => {
      wrapXApiSecretValidation({ req, res }, async () => {
        res
          .status(200)
          .header({ 'Content-Type': 'application/json' })
          .json({
            data: {
              eventHistory: ICWB.history
            }
          });
      });
    }
  },
  {
    path: '/icwb/images',
    mode: 'GET',
    handler: (req, res) => {
      const image = Buffer.from(ICWB.canvas.getCanvasData(), 'base64');

      res
        .status(200)
        .header({
          'Content-Type': 'image/png',
          'Content-Length': image.length
        })
        .end(image);
    }
  }
];

const wrapXApiSecretValidation = ({req, res}: any, method: Function, additionalCondition: boolean = true) => {
  if(req.headers['x-api-secret'] == process.env.X_API_SECRET && additionalCondition) {
    try {
      method();
    }
    catch (err) {
      Create500(res, 'Internal Server Error', err);
    }
  }
  else {
    Create403(res);
  }
}

const Create500 = (response: any, message: string, additionals: object = {}) => {
  response
    .status(500)
    .header({ 'Content-Type': 'application/json' })
    .json({
      error: 500,
      errorMessage: message,
      ...additionals
    });
};

const Create403 = (response: any, additionals: object = {}) => {
  response
    .status(403)
    .header({ 'Content-Type': 'application/json' })
    .json({
      error: 403,
      errorMessage: 'Unauthorized Access',
      ...additionals
    });
};
