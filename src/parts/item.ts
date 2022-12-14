import { MyObject3D } from "../webgl/myObject3D";
import { Mesh } from 'three/src/objects/Mesh';
import { Object3D } from 'three/src/core/Object3D';
import { Util } from "../libs/util";
import { Color } from 'three/src/math/Color';
import { Vector2 } from 'three/src/math/Vector2';
import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial';
// import { PlaneGeometry } from 'three/src/geometries/PlaneGeometry';
import { CircleGeometry } from 'three/src/geometries/CircleGeometry';
// import { AdditiveBlending, NormalBlending } from 'three/src/constants';
import { Func } from "../core/func";
import { Tween } from "../core/tween";
import { Conf } from "../core/conf";

export class Item extends MyObject3D {

  private _id:number;
  private _con:Object3D;
  private _mesh:Mesh;
  private _col:Color;
  private _col2:Color;

  constructor(opt:any) {
    super()

    this._id = opt.id;

    this._col = new Color();
    this._col2 = new Color(0xff0000);

    this._con = new Object3D();
    this.add(this._con);

    this._mesh = new Mesh(
      new CircleGeometry(0.5, 64),
      new MeshBasicMaterial({
        transparent: true,
        color: this._col,
      })
    );
    this._con.add(this._mesh);

    this._start(this._id * 0.05);
  }


  public changeMode(isCross:boolean):void {
    const mat =  this._mesh.material as MeshBasicMaterial;
    if(isCross) {
      mat.opacity = 0.5;
      mat.color = this._col2;
      // mat.blending = AdditiveBlending;
    } else {
      mat.opacity = 1;
      mat.color = this._col;
      // mat.blending = NormalBlending;
    }
  }


  private _start(d:number = 0):void {
    this._col = Util.instance.randomArr(Conf.instance.COLOR).clone();

    const sw = Func.instance.sw();
    const sh = Func.instance.sh();

    this._mesh.scale.x = Math.max(sw, sh) * Util.instance.random(0.4, 0.8) * 0.5;
    // this._mesh.scale.y = Math.max(sw, sh) * Util.instance.random(0.1, 0.1) * 1;
    this._mesh.scale.y = this._mesh.scale.x;

    const pA = new Vector2(
      Util.instance.range(sw * 1),
      sh * 0.5 + Math.max(this._mesh.scale.x, this._mesh.scale.y)
    );

    const pB = new Vector2(
      Util.instance.range(sw * 1),
      sh * -0.75 - Math.max(this._mesh.scale.x, this._mesh.scale.y)
    );

    if(Util.instance.hit(2)) {
      pA.y *= -1;
      pB.y *= -1;
    }

    const dx = pA.x - pB.x;
    const dy = pA.y - pB.y;
    const rot = Util.instance.degree(Math.atan2(dy, dx)) + 0;
    this._mesh.rotation.z = Util.instance.radian(rot);

    const time = 1.5;
    // const d = Util.instance.random(0, 1);
    Tween.instance.a(this.position, {
      x:[pA.x, pA.clone().lerp(pB, Util.instance.random(0.25, 0.75)).x],
      y:[pA.y, pA.clone().lerp(pB, Util.instance.random(0.25, 0.75)).y],
    }, time, d, Tween.ExpoEaseInOut, null, null, () => {
      Tween.instance.a(this.position, {
        x:pB.x,
        y:pB.y,
      }, time, 0.75, Tween.ExpoEaseInOut, null, null, () => {
        this._start();
      })
    });

    const sc = 0.1;
    Tween.instance.a(this._con.position, {
      x:[pA.x * sc, pB.x * sc],
      y:[pA.y * sc, pB.y * sc],
    }, time * 5, d, Tween.EaseNone);
  }


  protected _update():void {
  }


  protected _resize(): void {
    super._resize();
  }
}