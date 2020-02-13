import THREE from "three";

import {
  LoadingManager,
  TextureLoader
} from "three";

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

export interface Format {
  fbx: string,
  gltf: string,
  obj: string
}

export const FORMATS: Format = {
  fbx: "FBX",
  gltf: "GLTF",
  obj: "OBJ"
};

interface Object3DOptions {
  model: string,
  format?: string,
  textures?: string[],
  onLoadProgress?: (item: string, loaded: number, total: number) => void,
  setLoadURLModifier?: (url: string) => string
}

export class Object3D {
  protected model: string;
  private loader: GLTFLoader | FBXLoader | OBJLoader;
  public objectLoaderType: string;

  private loadingManager: THREE.LoadingManager;
  private textureLoader: THREE.TextureLoader;
  private textures: THREE.Texture[] | THREE.Texture;

  constructor(opts: Object3DOptions) {
    this.model = opts.model;

    switch (opts.format) {
      case FORMATS.fbx: this.loader = new FBXLoader(); break;
      case FORMATS.gltf: this.loader = new GLTFLoader(); break;
      case FORMATS.obj: this.loader = new OBJLoader(); break;
      default: this.loader = new OBJLoader();
    }

    this.objectLoaderType = opts.format || FORMATS.obj;

    this.loadingManager = new LoadingManager();
    this.loadingManager.onProgress = opts.onLoadProgress || function() {};
    this.loadingManager.setURLModifier(opts.setLoadURLModifier);

    this.textureLoader = new TextureLoader(this.loadingManager);

    this.textures = Object3D.LoadTexture(this.textureLoader, opts.textures || []);
  }

  public static LoadTexture(textureLoader: TextureLoader, texturePath: string | string[]) {
    if (texturePath instanceof Array) {
      return texturePath.map(path => textureLoader.load(path));
    } else {
      return textureLoader.load(texturePath);
    }
  }

  private load(callback: (obj: THREE.Object3D) => void) {
    this.loader.load(this.model, (model: any) => {
      model.traverse((child: THREE.Object3D) => {
        callback(child);
      });
    });
  }
}
