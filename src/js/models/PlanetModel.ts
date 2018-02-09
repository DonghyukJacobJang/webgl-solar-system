import BasicModel from './BasicModel';

export default class PlanetModel extends BasicModel {
  public textureNormal?: string;
  public textureSpecular?: string;

  public moons?: object;
  public rings?: object;
}
