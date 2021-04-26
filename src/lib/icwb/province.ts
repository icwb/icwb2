import _ from 'lodash';
import seed from '../../data/seed/initial_provinces_seed.json';

class ICWBProvince implements TProvince {
  id: string;
  name: string;
  state: TProvinceState;

  public static initialize(data: TProvince) {
    return new this(data);
  }

  constructor(data: any) {
    data.state.canDeclareIndependence = true;
    data.state.independenceArmor = 0;

    this.id = data.id;
    this.name = data.name;
    this.state = data.state;
  }

  prepare() {
    this.state.action = 'IDLE';
  }

  setInvader() {
    this.state.action = 'ATTACK';
  }

  setDefender() {
    this.state.action = 'DEFEND';
  }

  setWarzone() {
    this.state.action = 'WARZONE';
  }

  getClaimedProvinces() {
    return this.state.claimedProvincesId;
  }

  resetState() {
    //@ts-ignore
    this.state = getProvinceById(this.id)?.state!;
  }
}

const getProvinceById = (id: string) => {
  return seed.find(prov => prov.id == id);
}

export default ICWBProvince;

export interface TProvince {
  id?: string;
  name?: string;
  state?: TProvinceState;
}

export interface TProvinceState {
  action?: 'IDLE' | 'ATTACK' | 'DEFEND' | 'WARZONE' | 'OWNERATTACK' | 'OWNERDEFEND' | 'DECLARE_FREEDOM';
  canInvade?: boolean;
  invasionCount?: number;
  invasionTarget?: string;
  claimedProvincesId?: string[];
  neighbors?: string[];
  areaInvaded?: boolean;
  areaClaimedBy?: string;
  canDeclareIndependence?: boolean;
  independenceArmor?: number;
  previousOwnerColor?: string;
  mainColor?: string;
  currentColor?: string;
  centroid?: { x: number, y: number };
}
