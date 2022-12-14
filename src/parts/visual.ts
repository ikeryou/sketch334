import destVt from '../glsl/base.vert';
import destFg from '../glsl/dest.frag';
import { Func } from '../core/func';
import { Canvas } from '../webgl/canvas';
import { Object3D } from 'three/src/core/Object3D';
import { Update } from '../libs/update';
import { Mesh } from 'three/src/objects/Mesh';
import { PlaneGeometry } from 'three/src/geometries/PlaneGeometry';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { Vector3 } from 'three/src/math/Vector3';
import { Capture } from '../webgl/capture';
import { Util } from '../libs/util';
import { MousePointer } from '../core/mousePointer';
import { Item } from './item';
import { Tween } from '../core/tween';
import { Conf } from '../core/conf';



export class Visual extends Canvas {

  private _con:Object3D;
  private _mainCap:Capture;
  private _dest:Mesh;
  private _item:Array<Item> = [];

  constructor(opt: any) {
    super(opt);

    Tween.instance.set(document.querySelector('html'), {
      backgroundColor: Conf.instance.BG_COLOR.getStyle(),
    });
    Tween.instance.set(document.querySelector('.l-text'), {
      color: Conf.instance.TXT_COLOR.getStyle(),
    })

    this._mainCap = new Capture(2);

    for(let i = 0; i < 30; i++) {
      const item = new Item({
        id:i,
      });
      this._mainCap.add(item);
      this._item.push(item);
    }

    this._con = new Object3D();
    this.mainScene.add(this._con);

    this._dest = new Mesh(
      new PlaneGeometry(1, 1),
      new ShaderMaterial({
        vertexShader:destVt,
        fragmentShader:destFg,
        transparent:true,
        uniforms:{
          tCross:{value:this._mainCap.texture(0)},
          tNormal:{value:this._mainCap.texture(1)},
          mouse:{value:new Vector3()},
          time:{value:0},
          test:{value:0.75},
        }
      })
    );
    this._con.add(this._dest);

    this._resize();
  }


  protected _update(): void {
    super._update();

    const mx = MousePointer.instance.easeNormal.x;
    const my = MousePointer.instance.easeNormal.y;

    const uni = this._getUni(this._dest);
    uni.test.value = Func.instance.val(0.65, 0.75);
    uni.time.value += 1;
    uni.mouse.value.set(Util.instance.map(mx, 0, 1, -1, 1), Util.instance.map(my, 0, 0.99, -0.5, 0.5));

    if (this.isNowRenderFrame()) {
      this._render()
    }
  }


  private _render(): void {
    // 重なりチェック用 同じ色にしておく
    this._item.forEach((val) => {
      val.changeMode(true);
    });
    this.renderer.setClearColor(0xffffff, 0);
    this._mainCap.render(this.renderer, this.cameraOrth, 0);

    // 通常 色戻す
    this._item.forEach((val) => {
      val.changeMode(false);
    });
    this.renderer.setClearColor(Conf.instance.BG_COLOR, 1);
    this._mainCap.render(this.renderer, this.cameraOrth, 1);

    this.renderer.setClearColor(0xffffff, 0);
    this.renderer.render(this.mainScene, this.cameraOrth);
  }


  public isNowRenderFrame(): boolean {
    return this.isRender && Update.instance.cnt % 1 == 0
  }


  _resize(): void {
    super._resize();

    const w = Func.instance.sw();
    const h = Func.instance.sh();

    this.renderSize.width = w;
    this.renderSize.height = h;

    this._updateOrthCamera(this.cameraOrth, w, h);
    this._updatePersCamera(this.cameraPers, w, h);

    let pixelRatio: number = window.devicePixelRatio || 1;

    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(w, h);
    this.renderer.clear();

    this._mainCap.setSize(w, h, pixelRatio);
    this._dest.scale.set(w, h, 1);
  }
}
