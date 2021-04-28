import _ from 'lodash';
import moment from 'moment-timezone';
import shuffleArray from 'shuffle-array';

import ICWBCanvas from './canvas';
import ICWBDB from './db';
import ICWBProvince, { TProvince } from './province';
import { Random } from './../helper';
import { ScheduleEveryHour, ScheduleEveryNMinutes } from '../service/cron';
import { ICWBExternalServices } from './external';

class ICWBMain {
  history: any[] = [];
  dumpLog: any[] = [];
  standingProvincesCount: number = 0;
  independenceProbability: number = 0.4;

  canvas: ICWBCanvas;
  provincesData: ICWBProvince[];
  provincesId: string[];
  event: ICWBEvent;

  constructor() {
    this.canvas = new ICWBCanvas();
    this.provincesData = [];
    this.provincesId = [];
    this.event = {
      date: moment('2030-01-01').tz('Universal').toISOString()
    };
  }

  public initialize(provincesData: TProvince[], event: any) {
    for(let i = 0; i < provincesData.length; i++) {
      const province = provincesData[i];
      this.provincesData.push(ICWBProvince.initialize(province));
      this.provincesId.push(province.id!);
    }

    this.event = ("data" in event) ? _.cloneDeep(event.data) : this.event;
    this.standingProvincesCount = this.provincesData.length;
    this.canvas.updateProvinceData(this.provincesData);
    this.canvas.render(); // Apparently sometime it's not rendering
    setTimeout(() => this.canvas.render(), 1000) // So I call it 2x with a delay of 1s
  }

  public async beginTask() {
    console.log('Begin!');

    ScheduleEveryNMinutes(1, async () => {
      if(this.standingProvincesCount === 1) { return; }

      if(this.provincesData.length > 34) {
        console.log('SOMETHING IS WRONG');
        return;
      }

      await this.startInvasion();

      const imgData = this.canvas.getCanvasData();
      const imageUrl = await ICWBDB.uploadImageToFirebase(imgData);
      await ICWBExternalServices.uploadToFacebook(
        {
          imageUrl,
          message: this.event.message,
          rankMessage: this.getRankMessage()
        }
      );
      await this.uploadDatas();
    });
  }

  public async startInvasion(noIndependence: boolean = false) {
    if(this.standingProvincesCount === 1) { return; }
    this.provincesPrepare();

    const provinceCanDeclareIndependence = Math.random() < this.independenceProbability;
    if(provinceCanDeclareIndependence && this.standingProvincesCountIsWithin(6, 20) && noIndependence == false) {
      const candidates = this.provincesData.filter(province => {
        return province.state.canDeclareIndependence && province.state.canInvade == false;
      });

      if(candidates.length > 1) {
        const selected = candidates[Random.Floor(0, candidates.length)];
        const owner = this.getProvinceById(selected.state.areaClaimedBy!);
        selected.resetState();
        selected.state.action = 'DECLARE_FREEDOM';
        selected.state.canDeclareIndependence = false;
        selected.state.independenceArmor = 3;
        
        const idOnOwnerIndex = owner?.state.claimedProvincesId?.indexOf(selected.id);
        owner?.state.claimedProvincesId?.splice(idOnOwnerIndex!, 1);
        owner?.state.claimedProvincesId?.forEach(owned => {
          const prov = this.getProvinceById(owned);
          prov!.state.action = 'OWNERDEFEND';
        });

        this.canvas.render(); // Apparently sometime it's not rendering
        await new Promise(y => setTimeout(y, 1000));
        this.canvas.render(); // So I call it 2x with a delay of 1s

        const imageData = this.canvas.getCanvasData();

        const message = this.createFreedomMessage(selected, owner!);

        this.event = {
          independence: selected.id,
          provincesLeft: this.getStandingProvinces().length,
          date: moment(this.event.date).add(1, 'M').toISOString(),
          imgData: imageData,
          message
        }

        this.independenceProbability /= 2;
        this.standingProvincesCount = this.getStandingProvinces().length;

        return;
      }
      else {
        await this.startInvasion(true);
        return;
      }
    }

    let invader: ICWBProvince | null = null;
    let defender: ICWBProvince | null = null;
    let targetArea: ICWBProvince | null = null;
    let attackArea: ICWBProvince | null = null;
    let conditionValid = false;

    while (!conditionValid) {
      const shuffledProvincesId = this.standingProvincesCount > 2 ? this.shuffleProvinceId() : this.provincesId;
      const attackAreaIndex = Random.Floor(0, shuffledProvincesId.length);
      attackArea = this.getProvinceById(shuffledProvincesId[attackAreaIndex]);
      invader = this.getProvinceById(attackArea?.state.areaClaimedBy!);

      const nearbyTarget = (attackArea?.state.neighbors!)
        .map(targetId => {
          const target = this.getProvinceById(targetId);
          return target!;
        });
      const targetAreaLog = this.pickTargetByLeastDefenderClaimedAreaCount(nearbyTarget);
      targetArea = targetAreaLog[0];
      // targetArea = nearbyTarget[Random.Floor(0, nearbyTarget.length)];
      defender = this.getProvinceById(targetArea?.state.areaClaimedBy!);

      if (
        invader?.id === defender?.id
        || invader?.state.canInvade == false
      ) {
        continue;
      }

      if (invader instanceof ICWBProvince
        && defender instanceof ICWBProvince
        && targetArea instanceof ICWBProvince
        && attackArea instanceof ICWBProvince
      ) {
        conditionValid = true;
      }
      else {
        continue;
      }
    }

    invader?.setInvader();
    defender?.setDefender();

    invader?.state?.claimedProvincesId?.forEach(owned => {
      const prov = this.getProvinceById(owned);
      prov!.state.action = 'OWNERATTACK';
    });

    defender?.state?.claimedProvincesId?.forEach(owned => {
      const prov = this.getProvinceById(owned);
      prov!.state.action = 'OWNERDEFEND';
    });

    targetArea?.setWarzone();

    const invasionSuccessProbability = 0.7;
    const invasionSucceeded = (() => {
      if(defender?.state?.canDeclareIndependence === false && !defender?.state?.areaInvaded) {
        return !(defender?.state.independenceArmor! > 0);
      }
      else {
        return Math.random() < invasionSuccessProbability;
      }
    })();
    this.updateProvinceData(invader!, defender!, targetArea!, invasionSucceeded);

    this.canvas.updateProvinceData(this.provincesData);

    this.canvas.render(invasionSucceeded); // Apparently sometime it's not rendering
    await new Promise(y => setTimeout(y, 1000));
    this.canvas.render(invasionSucceeded); // So I call it 2x with a delay of 1s
    
    const imageData = this.canvas.getCanvasData();

    const message = this.createMessage({
      invader: <ICWBProvince>invader!,
      defender: <ICWBProvince>defender!,
      warzone: <ICWBProvince>targetArea!,
      invasionSucceeded,
    });

    this.event = {
      invader: invader!.id,
      defender: defender!.id,
      warzone: targetArea!.id,
      provincesLeft: this.getStandingProvinces().length,
      date: moment(this.event.date).add(1, 'M').toISOString(),
      imgData: imageData,
      message
    }

    this.standingProvincesCount = this.getStandingProvinces().length;
  }

  public getProvinceById(provinceId: string): ICWBProvince | null {
    const result = this.provincesData.find(province => province.id === provinceId);
    return result ? result : null;
  }

  public getProvinceIndexById(provinceId: string): number | null {
    const result = this.provincesData.findIndex(province => province.id === provinceId);
    return result ? result : null;
  }

  private shuffleProvinceId() {
    return shuffleArray(this.provincesId);
  }

  private provincesPrepare() {
    for (let i = 0; i < this.provincesData.length; i++) {
      const province = this.provincesData[i];
      province.prepare();
    }
  }

  /** This cheese makes the run much shorter, but it also makes
   * the provinces less likely to ping-pong the area around. */
  private pickTargetByLeastDefenderClaimedAreaCount(targetCandidates: ICWBProvince[]): any {
    const candidates = targetCandidates.map(candidate => {
      const defender = this.getProvinceById(candidate.state.areaClaimedBy!);
      return {
        id: candidate.id,
        claimedAreaCount: defender?.getClaimedProvinces()?.length,
      }
    });
    const sorted = _.sortBy(candidates, ['claimedAreaCount']);

    return [this.getProvinceById(sorted[0].id), candidates, sorted];
  }

  private createMessage(params: ICWBInvasionResult) {
    const invaderName = params.invader?.name;
    const areaName = params.warzone?.name;
    const defenderName = params.defender?.name;
    const currentDate = moment(this.event.date).locale('id').format('MMMM YYYY');

    let message = `${currentDate}, ${invaderName} akan menduduki wilayah ${areaName}`;
    if (areaName !== defenderName) {
      message += ` yang sebelumnya dikuasai oleh ${defenderName}`;
    }
    message += '.';

    if(params.invasionSucceeded) {
      message += '\n' + `Wilayah telah berhasil diduduki`;
      if (params.defender?.getClaimedProvinces()?.length == 0) {
        message += '' + ` dan ${defenderName} telah dikalahkan`;
      }
      message += '.';
    }
    else {
      message += '\n' + `Wilayah gagal untuk diduduki.`;
    }

    const provincesStanding = this.getStandingProvinces();
    if (provincesStanding.length == 1) {
      message += '\n\n' + `Semua Provinsi di Indonesia telah dikuasai oleh ${invaderName}.`;
    }
    else {
      message += '\n\n' + `${provincesStanding.length} provinsi tersisa.`;
    }

    console.log(`${invaderName} invade area ${areaName} from ${defenderName}. ${provincesStanding.length} left.`);

    return message;
  }

  private createFreedomMessage(province: ICWBProvince, previousOwner: ICWBProvince) {
    const currentDate = moment(this.event.date).locale('id').format('MMMM YYYY');

    let message = `${currentDate}, ${province.name} berhasil terbebas dari ${previousOwner.name} dan meraih kemerdekaan!`;
    if(previousOwner.getClaimedProvinces()?.length == 0) {
      message += `\n${previousOwner.name} telah dikalahkan.`;
    }

    const provincesStanding = this.getStandingProvinces();
    message += '\n\n' + `${provincesStanding.length} provinsi tersisa.`;

    console.log(`${province.name} declare independence against ${previousOwner.name}. ${provincesStanding.length} left.`);

    return message;
  }

  public getRankMessage() {
    const ranks: any[] = [];
    const invaders = this.getStandingProvinces()
      .filter(province => {
        return province?.state.canInvade;
      });
    
    for(const invader of invaders) {
      ranks.push({
        name: invader?.name!,
        claimedAreaCount: invader?.getClaimedProvinces()!.length,
      });
    }

    const sorted = _.orderBy(ranks, ['claimedAreaCount'], ['desc']);

    let message = 'Top 10 Provinsi berdasarkan jumlah wilayah yang dikuasai:\n';
    for(let i = 0; i < Math.min(10, sorted.length); i++) {
      message += `${i+1}. ${sorted[i].name}: ${sorted[i].claimedAreaCount}\n`;
    }

    return message;
  }

  private updateProvinceData(invader: ICWBProvince, defender: ICWBProvince, warzone: ICWBProvince, invasionSucceeded: boolean) {
    const invaderIndex = this.provincesData.findIndex(val => val.id == invader.id);
    const defenderIndex = this.provincesData.findIndex(val => val.id == defender.id);
    const warzoneIndex = this.provincesData.findIndex(val => val.id == warzone.id);

    if (invasionSucceeded) {
      const rewardIndex = defender.state.claimedProvincesId?.indexOf(warzone.id);
      const reward = defender.state.claimedProvincesId?.splice(rewardIndex!, 1)[0];
      invader.state.claimedProvincesId?.push(reward!);

      if(warzone.id === invader.id)
        warzone.state.areaInvaded = false;
      else
        warzone.state.areaInvaded = true;

      warzone.state.areaClaimedBy = invader.id;
      warzone.state.previousOwnerColor = _.cloneDeep(warzone.state.currentColor);
      warzone.state.currentColor = invader.state.mainColor;

      if (defender.state.claimedProvincesId?.length! == 0) {
        defender.state.canInvade = false;
      }
    }
    else if(!defender.state.canDeclareIndependence) {
      defender.state.independenceArmor = Math.max(0, defender.state.independenceArmor! - 1);
    }

    this.provincesData[invaderIndex] = invader;
    this.provincesData[defenderIndex] = defender;
    this.provincesData[warzoneIndex] = warzone;
  }

  private standingProvincesCountIsWithin(min: number, max: number) {
    return (this.standingProvincesCount < max && this.standingProvincesCount > min);
  };

  private getStandingProvinces() {
    const provinces = this.provincesData.filter(province => province.state.canInvade === true);
    return provinces;
  }

  public async uploadDatas() {
    const mapped = this.provincesData.map(({ id, name, state }) => ({ id, name, state }))
    await ICWBDB.updateProvinceData(mapped);
    await ICWBDB.updateEventData(this.event);
  }
}

export default new ICWBMain();

export interface ICWBEvent {
  independence?: string;
  invader?: string;
  defender?: string;
  warzone?: string;
  provincesLeft?: number;
  message?: string;
  imgData?: string;
  date?: string;
}

export interface ICWBInvasionResult {
  warzone?: ICWBProvince;
  invader?: ICWBProvince;
  defender?: ICWBProvince;
  invasionSucceeded?: boolean;
}
