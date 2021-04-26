import canvas from 'canvas';
import { orderedColorIds } from '../../config/icwb/provinces';
import ICWBProvince from './province';
import IDN_1 from '../../data/map/IDN_1.json';

class ICWBCanvas {
  private _canvas: canvas.Canvas;
  private _context: canvas.CanvasRenderingContext2D;
  private _provincesData: ICWBProvince[];
  private _invasionSucceeded?: boolean;

  constructor() {
    this._canvas = canvas.createCanvas(2200, 840);
    this._context = this._canvas.getContext('2d');
    this._provincesData = [];
  }

  public getCanvas() {
    return this._canvas;
  }

  public getRenderingContext() {
    return this._context;
  }

  public updateProvinceData(provinceData: ICWBProvince[]) {
    this._provincesData = provinceData;
  }

  public async render(invasionSucceeded?: boolean) {
    this._invasionSucceeded = invasionSucceeded;

    const provinces = this.getEveryProvinceColor();
    const scale = 44;
    const xOffset = -93;
    const yOffset = -7;

    this._context.clearRect(0, 0, 2200, 840);
    this._context.fillStyle = 'rgb(140, 184, 255)';
    this._context.fillRect(0, 0, 2200, 840);
    this._context.scale(1, -1);

    this.drawProvince(provinces, xOffset, yOffset, scale);
  }

  private drawProvince(colors: any, xOffset: number, yOffset: number, scale: number) {
    const geoJson = IDN_1.features;

    for (let i = 0; i < geoJson.length; i++) {
      const feature = geoJson[i];
      const coordinates = feature.geometry.coordinates;
      for (let j = 0; j < coordinates.length; j++) {
        const polygon = feature.geometry.type === 'MultiPolygon' ? coordinates[j][0] : coordinates[j];
        for (let k = 0; k < polygon.length; k++) {
          const coord = polygon[k];
          if (k === 0) {
            this._context.beginPath();
            this._context.moveTo((coord[0] + xOffset) * scale, (coord[1] + yOffset) * scale);
          } else if (k === polygon.length - 1) {
            this._context.lineTo((coord[0] + xOffset) * scale, (coord[1] + yOffset) * scale);
            this._context.closePath();
          } else {
            this._context.lineTo((coord[0] + xOffset) * scale, (coord[1] + yOffset) * scale);
          }
        }
        const province = this.getProvinceById(colors.provinceIds[i]);

        this.fillProvince(province!);
        this._context.fill();

        this.strokeProvince(province!);
        this._context.stroke();
      }
    }
  }

  private fillProvince(province: ICWBProvince) {
    if (province.state.action === 'WARZONE') {
      if(this._invasionSucceeded) {
        const gradient = this._context.createLinearGradient(-1000, -1000, 1000, 1000);
        const attackerColor = this.getProvinceById(province.state.areaClaimedBy!)?.state.mainColor;
        const victimColor = province.state.previousOwnerColor;
        const limit = 256;
        for (let i = 0; i < limit; i++) {
          let incr = i * 2;
          let incr2 = i * 2 + 1;
          gradient.addColorStop(incr / (limit * 2), victimColor!);
          gradient.addColorStop(incr2 / (limit * 2), attackerColor!);
        }
        this._context.fillStyle = gradient;
      }
      else {
        this._context.fillStyle = province.state.currentColor!;
      }
    }
    else {
      this._context.fillStyle = province.state.currentColor!;
    }
  }

  private strokeProvince(province: ICWBProvince) {
    if (province.state.action === 'WARZONE') {
      this._context.lineWidth = 3;
      this._context.strokeStyle = 'red';
    }
    else if (province.state.action === 'OWNERATTACK' || province.state.action === 'DECLARE_FREEDOM') {
      this._context.lineWidth = 3;
      this._context.strokeStyle = 'lime';
    }
    else if (province.state.action === 'OWNERDEFEND') {
      this._context.lineWidth = 3;
      this._context.strokeStyle = 'blue';
    }
    else {
      this._context.lineWidth = 1;
      this._context.strokeStyle = 'black';
    }
  }

  getEveryProvinceColor() {
    // Pake provinceIds yang udah di remap karena urutan provinsi di shp file berbeda dengan 
    // urutan ID Provinsi di database. Ku lebih suka assign ID nya kek gini dari pada harus 
    // manual ganti urutan Provincenya di database
    const provinceIds = orderedColorIds;
    const colors: string[] = [];

    // Get color from each province data
    for(const province of this._provincesData) {
      const colorIndex = provinceIds.indexOf(province.id);
      colors[colorIndex] = province.state.mainColor!;
    }

    return {
      colors,
      provinceIds,
    };
  }

  public getCanvasData() {
    return this._canvas.toDataURL().replace(/^data:image\/png;base64,/, '');
    // return this._canvas.toDataURL();
  }

  private getProvinceById(provinceId: string): ICWBProvince | null {
    const result = this._provincesData.find(province => province.id === provinceId);
    return result ? result : null;
  }
}

export default ICWBCanvas;
