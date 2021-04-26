import ICWB from './src/lib/icwb';
import ICWBDB from './src/lib/icwb/db';
import WebService from './src/server';
import { routes } from './src/server/routes';

async function App() {
  await ICWBDB.fetchDatas()
    .then(res => {
      console.log(res[0].data.length);
      ICWB.initialize(res[0].data, res[1].data);
    })
    .catch(console.error);

  const server = new WebService(parseInt(process.env.PORT!) || 8000);
  server.setRoutes(routes);
  server.listen();
}
setTimeout(App, 5000);
