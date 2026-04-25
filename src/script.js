import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import RAPIER from '@dimforge/rapier3d'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { KTX2Loader} from 'three/examples/jsm/loaders/KTX2Loader.js'

gsap.registerPlugin(SplitText);

/* ===============================
   モバイル判定
================================= */
const isMobile = window.matchMedia('(max-width: 900px)').matches;
if (isMobile) {
  document.body.classList.add('is-mobile');
  document.documentElement.classList.add('is-mobile');
}

/* ===============================
   Three.js 初期化
================================= */
const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()
document.documentElement.style.setProperty('--scene-bg', '#cfd7af')
const blurOverlay = document.getElementById('blurOverlay');
const loadingOverlay = document.getElementById('loadingOverlay')
const loadingText = document.getElementById('loadingText');
gsap.set(loadingText, { yPercent: 0, opacity: 1 });
loadingText.textContent = '0%';
const loadingManager = new THREE.LoadingManager()

loadingManager.onProgress = (url, l, t) => {
  loadingText.textContent = Math.floor(l / t * 100) + '%';
  if (!loadingText.__revealed) {
    gsap.fromTo(loadingText, {
      yPercent: 110,
      opacity: 0
    }, {
      yPercent: 0,
      opacity: 1,
      duration: 0.6,
      ease: 'power2.out'
    });
    loadingText.__revealed = true;
  }
};

loadingManager.onLoad = () => {
  loadingText.textContent = '100%';

  gsap.set(loadingOverlay, { clipPath: 'inset(0% 0% 0% 0%)' });

  const tl = gsap.timeline();

  tl.to(loadingText, {
    yPercent: -120,
    opacity: 0,
    duration: 0.45,
    ease: 'power2.in'
  })
  .to(loadingOverlay, {
    clipPath: 'inset(0% 0% 100% 0%)',
    duration: 0.9,
    ease: 'power3.out'
  })
  .call(() => {
    animateIntroText();
  }, null, '-=0.55')
  .set(loadingOverlay, { display: 'none' })
  .call(() => {
    document.getElementById('scrollPrompt')?.classList.add('visible');
    introScrollLocked = false;
  }, null, '+=0.3');
};

let sectionAnimLock = false;
const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')
dracoLoader.setDecoderConfig({ type: 'js' })
const gltfLoader = new GLTFLoader(loadingManager)
gltfLoader.setDRACOLoader(dracoLoader)

function loadGLTF(url) {
  return new Promise((res, rej) => {
    gltfLoader.load(url, g => res(g), undefined, e => rej(e))
  })
}

async function loadAssets(){
  const [house,house_nonshadow,receiveShadow,benchi,car,cakes, emissive_parts,rantan,house_ray,human, human_base, glass, glass2, stone,sheep,smoke,ufo,ufo_move,star,background] = await Promise.all([
    loadGLTF('/cg/house_moc2_castShadow.glb'),
    loadGLTF('/cg/house_moc2_nonShadow3.glb'),
    loadGLTF('/cg/house_moc2_recieve_ShadowBase2.glb'),
    loadGLTF('/cg/move_obj/benchi2.glb'),
    loadGLTF('/cg/move_obj/car2.glb'),  
    loadGLTF('/cg/move_obj/cakes2.glb'),
    loadGLTF('/cg/house_moc2_Emission.glb'),
    loadGLTF('/cg/house_moc2_Emission_parts.glb'),
    loadGLTF('/cg/house_ray2.glb'),
    loadGLTF('/cg/human_w_ani_10.glb'),
    loadGLTF('/cg/human_base2.glb'),
    loadGLTF('/cg/glass_move.glb'),
    loadGLTF('/cg/glass2_move.glb'),
    loadGLTF('/cg/stone.glb'),
    loadGLTF('/cg/sheep_animation_f3.glb'),
    loadGLTF('/cg/smoke_anime.glb'),
    loadGLTF('/cg/UFO.glb'),
    loadGLTF('/cg/UFO_move.glb'),
    loadGLTF('/cg/star.glb'),
    loadGLTF('/cg/background.glb'),
  ])
  return { house, house_nonshadow, receiveShadow, benchi, car, cakes, emissive_parts, rantan, house_ray, human, human_base, glass, glass2, stone,sheep,smoke, ufo, ufo_move,star, background }
}


//*====================================
const sizes = { width: window.innerWidth, height: window.innerHeight }
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1))
})

//cam
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
scene.add(camera)
camera.layers.disableAll();
camera.layers.enable(0);
function hideWithLayer(obj) {
  obj.layers.set(1);
}
function showWithLayer(obj) {
  obj.layers.set(0);
}

//render
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true })
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1))
renderer.setClearColor('#cfd7af')
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.outputColorSpace = THREE.SRGBColorSpace

let shadowsEnabled = true;
function setShadowsEnabled(flag) {
  if (shadowsEnabled === flag) return;
  shadowsEnabled = flag;
  renderer.shadowMap.enabled = flag;
  renderer.shadowMap.needsUpdate = true;
}

// KTX2ローダーの設定
const ktx2Loader = new KTX2Loader()
ktx2Loader.setTranscoderPath('/basis/') // transcoderのパス
ktx2Loader.detectSupport(renderer)

gltfLoader.setKTX2Loader(ktx2Loader)

//*====================================
const cameraLookAtTarget = new THREE.Vector3(0, 1.5, 0);

// 各セクションごとのカメラの位置と注視点を定義
const sectionCameraStates = [
  { position: { x: 0, y: 3.5, z: 6 }, lookAt: { x: 0, y: 1.7, z: 0 } },
  { position: { x: 3, y: 3.5, z: 4 }, lookAt: { x: -2.5, y: 1, z: -0.8 } },
  { position: { x: 2.5, y: 3, z:4 }, lookAt: { x: -1.5, y: 1, z:0 } },
  { position: { x: -0.8, y: 1.2, z: 1 }, lookAt: { x: -0.5, y: 1.2, z: 0 } },
  { position: { x: 0, y: 1.8, z: 6 }, lookAt: { x: -1.5, y: 1.8, z: 0 } },
  { position: { x: 2, y: 3.5, z: 6 }, lookAt: { x: -2, y: 1.5, z: 0 } }
];

// const sectionCameraStates = [
//   { position: { x: 0, y: 3.5, z: 6 }, lookAt: { x:  0, y:  1.7, z: 0 } },
//   { position: { x: 3, y: 3.5, z: 4 }, lookAt:  { x: -2.5, y: 1, z: -0.8 } },
//   { position: { x: 2.5, y: 3, z: 4 }, lookAt:  { x: -1.5, y: 1, z: 0 } },
//   { position: { x: -0.8, y: 1.2, z: 1 }, lookAt:  { x: -0.5, y: 1.2, z: 0 } },
//   { position: { x: 0, y: 1.8, z: 6 }, lookAt:  { x: -1.5, y: 1.8, z: 0 } },
//   { position: { x: 2, y: 3.5, z: 6 }, lookAt:  { x: -2, y: 1.5, z: 0 } }
// ];

// モバイル専用カメラ位置 - オブジェクトを画面上部中央に配置
const sectionCameraStatesMobile = [
  // section 0 (Intro) - 人物を中央上部に
  { position: { x:  0, y:  3, z: 7 }, lookAt:  { x: 0, y: 1.8, z: 1 } },
  // section 1 (About me) - 人物を中央上部に
  { position: { x: 4, y: 3, z: 10 }, lookAt:  { x: 1.5, y: 1, z: 3.7 } },
  // section 2 (CG/VR) - 家を中央上部に
  { position:  { x:4, y: 3.5, z: 9 }, lookAt:  { x: 1.75, y: 1.3, z: 4} },
  // section 3 (BARISTA) - 家を中央上部に
  { position: { x: -1.15, y: 1.7, z: 1.2 }, lookAt:  { x: 0.4, y: 0, z: -1.25 } },
  // section 4 (Interactive Art) - 家を中央上部に (夜景)
  { position: { x: 0.5, y: 1, z: 10 }, lookAt:  { x: 0.38, y: 0.8, z: 8 } },
  // section 5 (Contact) - 家を中央上部に (夜景)
  { position:  { x: 4, y: 3, z: 10 }, lookAt:  { x: 1.5, y: 1, z: 3.7 } },
];

// 現在のデバイスに応じたカメラ状態を取得する関数
function getCameraStatesForDevice() {
  return isMobile ?  sectionCameraStatesMobile : sectionCameraStates;
}

let houseGroup = new THREE.Group()
let ufoGroup = new THREE.Group()
const humanGroup = new THREE.Group()

let introScrollLocked = true

let mixer = null
let mixer_glass = null
let mixer_glass2 = null
let mixer_dglass2 = null
let mixer_dglass = null
let mixer_stone=null
let mixer_dstone = null
let mixer_dstone2=null
let mixer_back=null
let mixer_ufo=null
let mixer_sheep=null
let mixer_smoke=null
let mixer_smoke2=null
let mixer_smoke3=null
let bgAction = null
let bgAction_R = null
let houseRayRoot = null;
let houseEmissiveWindow=null
let houseMat=null;
let emissiveMats=null;
let dirLight = null;
let amblight=null
let houselight=null
let ufolight=null
let ufodirlight=null
let starRoot=null;
let ufoRotateRoot=null;
let ufoRotateAnimation=null;
let ufoRoot=null;
let houseCreateshadow=null;
const benchiGroup= new THREE.Group()
let carmove=null
let sheepmove=null
let smokemove=null
let smokemove2=null
let smokemove3=null
let smokeani=null
let smokemat=null
let smokeAction1 = null;
let smokeAction2 = null;
let smokeAction3 = null;
let smokeDelayId1 = null;
let smokeDelayId2 = null;
let currentAbductKey = null;
let backmat=null
const starGroup = new THREE.Group();
const stars = [];
const starSpeeds = [];
const starGroup2 = new THREE.Group();
let starmat=null
let rantanMat=null

const moverHome = {
  car:   { pos: new THREE.Vector3(-1.25, -3, -0.3), scale: new THREE.Vector3(0.4, 0.4, 0.4) },
  sheep: { pos: new THREE.Vector3( 0.7,  -3,  0.0), scale: new THREE.Vector3(0.4, 0.4, 0.4) },
  bench: { pos: new THREE.Vector3(-0.65, -3,  0.5), scale: new THREE.Vector3(1,   1,   1  ) },
};

const allHumanActs=[];
let introSplits = [];
let humanRayTargets = [];
let isShadowPrewarmed = false;

function playAction(action, duration = 0.3) {
    const prevAction = currentAction;
    currentAction = action;

    if (prevAction) {
        prevAction.crossFadeTo(currentAction, duration, true);
        currentAction.reset().play();
    } else {
        currentAction.reset().play();
    }
}

function enableShadowRecursively(o, { cast = true, receive = true } = {}) {
  o.traverse(obj => {
    if (obj.isMesh) {
      obj.castShadow = cast
      obj.receiveShadow = receive
    }
  })
}

// --- sheep アニメーション制御
const sheepActions = [];
let sheepSeqAbort = false;

function setupSheepActionsByName(sheepGltf) {
    const clips = sheepGltf.animations;
    const clipsat = clips.find(c => c.name === 'eat1');
    const clipeat2 = clips.find(c => c.name === 'eat2');
    const clipstand = clips.find(c => c.name === '[保留アクション].002');

    sheepActions[0] = mixer_sheep.clipAction(clipsat);
    sheepActions[1] = mixer_sheep.clipAction(clipeat2);
    sheepActions[2] = mixer_sheep.clipAction(clipstand);
  }

function playSheepClip(action, { repeat = 0, timeScale = 1, startAtEnd = false } = {}) {
  return new Promise((resolve) => {
    action.reset();
    action.timeScale = timeScale;
    action.setLoop(THREE.LoopRepeat, repeat);
    action.clampWhenFinished = true;
    if (startAtEnd && timeScale < 0) {
      action.time = action.getClip().duration;
    }
    action.play();
    const onFinished = (e) => {
      if (e.action === action) {
        mixer_sheep.removeEventListener('finished', onFinished);
        resolve();
      }
    };
    mixer_sheep.addEventListener('finished', onFinished);
  });
}

async function runSheepSequence() {
  sheepSeqAbort = false;
  while (!sheepSeqAbort) {
    await playSheepClip(sheepActions[2], { repeat: 2, timeScale: 1 });
    if (sheepSeqAbort) break;
    await playSheepClip(sheepActions[0], { repeat: 0, timeScale: 1 });
    if (sheepSeqAbort) break;
    await playSheepClip(sheepActions[1], { repeat: 9, timeScale: 1 });
    if (sheepSeqAbort) break;
    await playSheepClip(sheepActions[0], { repeat: 0, timeScale: -1, startAtEnd: true });
    if (sheepSeqAbort) break;
    await playSheepClip(sheepActions[2], { repeat: 2, timeScale: 1 });
    if (sheepSeqAbort) break;
  }
}

function startSheepSequence() {
  if (!sheepActions.length) return;
  sheepSeqAbort = false;
  runSheepSequence();
}

function stopSheepSequence() {
  sheepSeqAbort = true;
  sheepActions.forEach((a) => a.stop());
}

function animateIntroText() {
  const targets = gsap.utils.toArray('.intro-text-container .reveal-text');
  introSplits = [];
  gsap.set('.intro-text-container', { autoAlpha: 1 });
  targets.forEach((el, i) => {
    const split = new SplitText(el, { type: 'lines,chars', linesClass: 'line' });
    introSplits.push(split);
    gsap.set(split.lines, { overflow: 'hidden' });
    gsap.set(split.chars, { yPercent: 110, opacity: 1 });
    gsap.to(split.chars, {
      yPercent: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
      stagger: 0.04, delay: i * 0.18
    });
  });
}

function animateIntroTextOut() {
  if (!introSplits.length) return;
  introSplits.forEach((split, i) => {
    gsap.to(split.chars, {
      yPercent: -110,
      duration: 0.5,
      ease: 'power2.in',
      stagger: 0.015,
      delay: i * 0.1,
    });
  });
}

function animateIntroTextIn() {
  if (!introSplits.length) return;
  introSplits.forEach((split, i) => {
    gsap.set(split.chars, { yPercent: 110, opacity: 1 });
    gsap.to(split.chars, {
      yPercent: 0,
      opacity: 1,
      duration: 0.65,
      ease: 'power3.out',
      stagger: 0.02,
      delay: i * 0.15,
    });
  });
}





//========================================================

let humanAnimationTimeline = null;
let houseAnimationTimeline = null;
let currentAction = null;
let nextAction = null;

function initScene({house, house_nonshadow, receiveShadow, benchi, car, cakes, emissive_parts, rantan,house_ray, human, human_base, glass, glass2, stone,sheep,smoke, ufo, ufo_move,star, background}) {

  backmat=new THREE.MeshStandardMaterial({color:new THREE.Color(0.5, 0.45, 0.4),roughness:1,metalness:0})
  background.scene.traverse(o => {
    if (o.isMesh) {
      o.material = backmat;
      o.material.needsUpdate = true;
    }
  });
  background.scene.position.set(-0.03,0.95, -0.3)
  background.scene.scale.set(0.95,0.95,0.95)
  enableShadowRecursively(background.scene, { cast: false, receive: true })
  scene.add(background.scene)

  houseCreateshadow=house.scene;
  houseCreateshadow.scale.set(0.4, 0.4, 0.4)
  houseCreateshadow.position.set(0.25, -3, -0.9)
  houseCreateshadow.rotation.y = Math.PI / 20
  enableShadowRecursively(houseCreateshadow, { cast:true, receive: false })
  houseCreateshadow.name = 'house';
  house_nonshadow.scene.name = 'house_nonshadow';
  receiveShadow.scene.name = 'house_receiveShadow';

  houseMat=new THREE.MeshBasicMaterial({colorWrite:false, depthWrite:false,transparent:true,opacity:1})
  houseCreateshadow.traverse((obj) => {
            if (obj.isMesh) {
              obj.material = houseMat;
            }
        });

  house_nonshadow.scene.scale.set(0.4, 0.4, 0.4)
  house_nonshadow.scene.position.set(0.25, -3, -0.9)
  house_nonshadow.scene.rotation.y = Math.PI / 20
  enableShadowRecursively(house_nonshadow.scene, { cast: false, receive: false })

  receiveShadow.scene.scale.set(0.4, 0.4, 0.4)
  receiveShadow.scene.position.set(0.25, -3, -0.9)
  receiveShadow.scene.rotation.y = Math.PI / 20
  enableShadowRecursively(receiveShadow.scene, { cast: true, receive: true })

  emissiveMats = new THREE.MeshLambertMaterial({emissive:0xffffaa,emissiveIntensity:1,opacity:1.0,transparent:true})
  houseEmissiveWindow=emissive_parts.scene;
  houseEmissiveWindow.scale.set(0.4, 0.4, 0.4)
  houseEmissiveWindow.position.set(0.25, -3, -0.9)
  houseEmissiveWindow.rotation.y = Math.PI / 20
  enableShadowRecursively(houseEmissiveWindow, { cast: false, receive: false })
  houseEmissiveWindow.traverse((obj) => { 
            if (obj.isMesh) {
              obj.material = emissiveMats;
              obj.material.transparent = true;
              obj.material.opacity=0
            }
  });

  rantanMat=new THREE.MeshLambertMaterial({color:0x8C8C8C,emissive:0xFFFFE9,emissiveIntensity:0,})
  rantan.scene.traverse((obj) => {
    if (obj.isMesh) {
      obj.material = rantanMat;
    }
  });
  rantan.scene.scale.set(0.4,0.4,0.4)
  rantan.scene.position.set(0.25, -3, -0.9)
  rantan.scene.rotation.y = Math.PI / 20
  enableShadowRecursively(rantan.scene, { cast: false, receive: false })
  houseGroup.add(rantan.scene)

  smokemat=new THREE.MeshLambertMaterial({opacity:1.0,transparent:true})
  smoke.scene.traverse((obj) => {
    if (obj.isMesh) {
      obj.material = smokemat;
    }
  });
  smokeani=smoke.animations
  smoke.scene.scale.set(0.4,0.4,0.4)
  smoke.scene.position.set(0.14,-1.95,-1)
  smokemove=smoke.scene
  smokemove2=smoke.scene.clone()
  smokemove2.rotation.y = Math.PI / 3
  smokemove3=smoke.scene.clone()
  smokemove3.rotation.y = -Math.PI / 3
  enableShadowRecursively(smokemove, { cast: false, receive: false })

  benchi.scene.scale.set(0.4, 0.4, 0.4)
  benchi.scene.rotation.y = Math.PI / 20
  enableShadowRecursively(benchi.scene)

  car.scene.scale.set(0.4, 0.4, 0.4)
  car.scene.position.set(-1.25, -3, -0.3)
  car.scene.rotation.y = Math.PI / 20
  carmove=car.scene
  enableShadowRecursively(carmove)
  houseGroup.add(carmove)

  cakes.scene.scale.set(0.4, 0.4, 0.4)
  cakes.scene.rotation.y = Math.PI / 20
  enableShadowRecursively(cakes.scene, { cast: false, receive: false })
  benchiGroup.add(benchi.scene,cakes.scene)
  benchiGroup.position.set(-0.65,-3,0.5)
  houseGroup.add(benchiGroup)

  sheepmove=sheep.scene
  const sheep2=SkeletonUtils.clone(sheep.scene)
  sheepmove.scale.set(0.4,0.4,0.4)
  sheepmove.position.set(0.7,-3,0.1)
  enableShadowRecursively(sheepmove, { cast: true, receive: false })
  
  sheep2.position.set(1,-3,-0.-0.5)
  sheep2.scale.set(0.35,0.35,0.35)
  sheep2.rotation.y = Math.PI / 6
  houseGroup.add(sheepmove)
  houseGroup.add(sheep2)

  house_ray.scene.scale.set(0.4, 0.4, 0.4)
  house_ray.scene.position.set(0.25, -3, -0.9)
  house_ray.scene.rotation.y = Math.PI / 20
  house_ray.scene.visible = false; 

  houseGroup.add(houseCreateshadow, house_nonshadow.scene,receiveShadow.scene, houseEmissiveWindow,smokemove,smokemove2,smokemove3, car.scene, house_ray.scene)

  scene.add(houseGroup)
  houseRayRoot = house_ray.scene;

  ufoRoot= ufo.scene
  ufoRotateRoot=ufo_move.scene
  ufoRotateAnimation=ufo_move.animations
  ufodirlight = new THREE.SpotLight(0xffffff, 5, 5, Math.PI / 10, 0.1, 1);
  ufodirlight.position.set(0, -0.5, 0);
  ufodirlight.target.position.set(0, -5, 0);
  ufodirlight.visible=true;
  ufodirlight.intensity=0;
  ufoGroup.add(ufodirlight);
  ufoGroup.add(ufodirlight.target);

  ufoGroup.add(ufoRoot, ufoRotateRoot)
  ufoGroup.scale.set(0.5, 0.5, 0.5)
  ufoGroup.position.set(2, 10.0, -0.9)
  ufoGroup.visible=false;

  houselight=new THREE.PointLight(0xfcf1ca,0, 10,2)
  houselight.position.set(-0.05, 1.5, 0.25);
  houselight.visible=true;
  houselight.intensity=0
  scene.add(houselight);
  scene.add(ufoGroup)

  starmat=new THREE.MeshLambertMaterial({emissive:0xFFFFE0,emissiveIntensity:1,opacity:0,transparent:true})

  star.scene.traverse((obj) => {
            if (obj.isMesh) {
              obj.material.dispose();
              obj.material = starmat;
            }
        });

  function setupStars(starGltf) {
    const positions = [
      { x:  -0.8, y: 2.5, z: -0.5 },
      { x:  -0.8, y: 2.8, z: -0.5 },
      { x: -2, y: 2, z: -1 },
      { x:  1.5, y: 2.5, z: -0.5 },
    ];
    const scales = [0.5, 0.6, 0.5,0.7];

    positions.forEach((pos, i) => {
      const star = i === 0 ?  starGltf. scene : starGltf.scene.clone();
      star.position.set(pos.x, pos. y, pos.z);
      star.scale.set(scales[i], scales[i], scales[i]);
      starGroup.add(star);
      stars.push(star);
      starSpeeds.push(0);
    });
    
    scene.add(starGroup);
  }

  setupStars(star);

  function makeStars(starGltf, count =50) {
    const range = {
      x: { min: -20, max: 4 },
      y: { min: 0, max: 5 },
      z: { min: -1, max:-10 }
    };
  
    for (let i = 0; i < count; i++) {
      const star = i === 0 ? starGltf. scene :  starGltf. scene.clone();
      const x = THREE.MathUtils. randFloat(range. x.min, range.x.max);
      const y = THREE.MathUtils.randFloat(range.y.min, range.y.max);
      const z = THREE.MathUtils.randFloat(range.z.min, range.z. max);
      star.position. set(x, y, z);
      const scale = THREE.MathUtils.randFloat(0.05, 0.3);
      star.scale.set(scale, scale, scale);
      starGroup2.add(star);
    }
    scene.add(starGroup2);
  }
  makeStars(star);

  human.scene.position.set(0, 0.85, 0)
  human.scene.scale.set(1.2, 1.2, 1.2)
  enableShadowRecursively(human.scene, { cast: true, receive: true })
  humanGroup.add(human.scene)

  human_base.scene.position.set(0, 0.96, 0)
  human_base.scene.scale.set(1.2, 1.2, 1.2)
  enableShadowRecursively(human_base.scene, { cast: true, receive: true })
  humanGroup.add(human_base.scene)

  const ray_mat = new THREE.MeshBasicMaterial({ transparent: true, opacity:1 });
  const human_ray_geo=new THREE.BoxGeometry(0.35,0.35,0.2)
  const human_ray_mesh = new THREE.Mesh(human_ray_geo, ray_mat);
  human_ray_mesh.position.set(0,2.4, 0.1);
  human_ray_mesh.name = 'human_ray_mesh';
  human_ray_mesh.visible = false;
  humanGroup.add(human_ray_mesh);

  const backpack_ray_geo=new THREE.BoxGeometry(0.7,0.5,0.2)
  const backpack_ray_mesh = new THREE.Mesh(backpack_ray_geo, ray_mat);
  backpack_ray_mesh.position.set(0, 2.3, -0.2);
  backpack_ray_mesh.name = 'backpack_ray_mesh';
  backpack_ray_mesh.visible = false; 
  humanGroup.add(backpack_ray_mesh);

  const lod_ray_geo=new THREE.BoxGeometry(0.2,0.8,0.15)
  const lod_ray_mesh = new THREE.Mesh(lod_ray_geo, ray_mat);
  lod_ray_mesh.position.set(-0.2, 2.8, -0.2);
  lod_ray_mesh.name = 'lod_ray_mesh';
  lod_ray_mesh.visible =false; 
  humanGroup.add(lod_ray_mesh);

  const glassmat=new THREE.MeshStandardMaterial({color:0x5b904a,roughness:1,metalness:0,opacity:1,transparent:true})
  glass.scene.position.set(0, 0.85, -0.1)
  glass2.scene.position.set(-0.5, 0.9, -0.1)
  glass.scene.traverse((obj) => {
              if (obj.isMesh) {
                obj.material.dispose();
                obj.material = glassmat;
              }
          });
  glass2.scene.traverse((obj) => {
    if (obj.isMesh) {
      obj.material.dispose();
      obj.material = glassmat;
    }
  });
  const duplicate_glass = glass.scene.clone(); 
  duplicate_glass.position.set(-0.7, 0.85, -0.1);
  const duplicate_glass2 = glass2.scene.clone(); 
  duplicate_glass2.position.set(0.2, 0.85, -0.1);
  duplicate_glass2.scale.set(0.6, .6, .6);
  enableShadowRecursively(glass.scene, { cast: true, receive: true })
  enableShadowRecursively(glass2.scene, { cast: true, receive: true })
  enableShadowRecursively(duplicate_glass, { cast: true, receive: true })
  enableShadowRecursively(duplicate_glass2, { cast: true, receive: true })
  enableShadowRecursively(stone.scene, { cast: true, receive: true })
  stone.scene.position.set(0.05,0.8,0)
  stone.scene.scale.set(1,1,1)
  const duplicate_stone = stone.scene.clone();
  duplicate_stone.position.set(-0.05,0.8,0);
  const duplicate_stone2 = stone.scene.clone();
  duplicate_stone2.position.set(-0.8,0.8,0);

  const floor = world.createRigidBody(
    RAPIER.RigidBodyDesc.fixed()
    .setTranslation(0, -3, 0)
  )

  world.createCollider(
    RAPIER.ColliderDesc.cuboid(5, 0.5, 5)
      .setRestitution(0.1)
      .setFriction(0.9),
    floor
  )

  // camera.position.set(0, 3.5, 6)
  // camera.lookAt(new THREE.Vector3(0, 1.5, 0))
  const initialCamState = getCameraStatesForDevice()[0];
  camera.position.set(initialCamState. position.x, initialCamState.position.y, initialCamState.position. z);
  camera.lookAt(new THREE.Vector3(initialCamState.lookAt.x, initialCamState.lookAt.y, initialCamState.lookAt.z));
  cameraLookAtTarget. set(initialCamState.lookAt. x, initialCamState.lookAt. y, initialCamState.lookAt. z);

  amblight = new THREE.AmbientLight(0xffffff, 2.3)
  scene.add(amblight);
  dirLight = new THREE.DirectionalLight(0xffffff, 2.5)
  dirLight.position.set(6, 15, 8)
  dirLight.castShadow = true
  dirLight.shadow.mapSize.set(512,512)

  dirLight.shadow.camera.left = -2.5
  dirLight.shadow.camera.right = 2.5
  dirLight.shadow.camera.top = 2.5
  dirLight.shadow.camera.bottom = -2.5
  dirLight.shadow.camera.near = 15
  dirLight.shadow.camera.far = 30
  dirLight.shadow.radius = 5

  scene.add(dirLight)
  scene.add(humanGroup)

  backpack_ray_mesh.name = 'backpack_ray_mesh';
  human_ray_mesh.name = 'human_ray_mesh';
  lod_ray_mesh.name = 'lod_ray_mesh';

  humanRayTargets = [human_ray_mesh, backpack_ray_mesh, lod_ray_mesh];

  mixer = new THREE.AnimationMixer(human.scene)
  mixer_glass = new THREE.AnimationMixer(glass.scene)
  mixer_glass2 = new THREE.AnimationMixer(glass2.scene)
  mixer_dglass = new THREE.AnimationMixer(duplicate_glass)
  mixer_dglass2 = new THREE.AnimationMixer(duplicate_glass2)
  mixer_stone = new THREE.AnimationMixer(stone.scene)
  mixer_dstone = new THREE.AnimationMixer(duplicate_stone)
  mixer_dstone2 = new THREE.AnimationMixer(duplicate_stone2)
  mixer_back = new THREE.AnimationMixer(background.scene)
  mixer_ufo = new THREE.AnimationMixer(ufoRotateRoot)
  mixer_sheep = new THREE.AnimationMixer(sheepmove)
  setupSheepActionsByName(sheep);
  mixer_smoke = new THREE.AnimationMixer(smokemove)
  mixer_smoke2 = new THREE.AnimationMixer(smokemove2)
  mixer_smoke3 = new THREE.AnimationMixer(smokemove3)

  if (background.animations && background.animations.length > 0) {
    bgAction = mixer_back.clipAction(background.animations[0]);
    bgAction.setLoop(THREE.LoopOnce, 1);
    bgAction.clampWhenFinished = true;
  } else {
    console.warn('background.glb に animations が含まれていません');
  }

  if(human.animations && human.animations.length){
    const helloSAction = mixer.clipAction(human.animations[1]);
    helloSAction.setLoop(THREE.LoopOnce,1)
    helloSAction.clampWhenFinished = true
    allHumanActs.push(helloSAction);

    const helloRAction = mixer.clipAction(human.animations[4]);
    helloRAction.setLoop(THREE.LoopRepeat, Infinity)
    allHumanActs.push(helloRAction);

    const helloEAction = mixer.clipAction(human.animations[0]);
    helloEAction.setLoop(THREE.LoopOnce,1)
    helloEAction.clampWhenFinished = true;
    allHumanActs.push(helloEAction);

    const walkStartAction = mixer.clipAction(human.animations[3]);
    walkStartAction.setLoop(THREE.LoopOnce,1)
    walkStartAction.clampWhenFinished = true
    allHumanActs.push(walkStartAction);

    const walkAction = mixer.clipAction(human.animations[2]);
    walkAction.setLoop(THREE.LoopRepeat, Infinity)
    allHumanActs.push(walkAction);

    currentAction = allHumanActs[0];
    currentAction.play();

    mixer.addEventListener('finished', e => {
        if (e.action === allHumanActs[0]) {
            playAction(allHumanActs[1]);
        }
        if (e.action === allHumanActs[2]) {
            playAction(allHumanActs[3]);
            humanGroup.add(glass.scene, glass2.scene, duplicate_glass, duplicate_glass2, stone.scene, duplicate_stone, duplicate_stone2);
            
            mixer_glass.clipAction(glass.animations[0]).setLoop(THREE.LoopRepeat, Infinity).play();

            setTimeout(() => {
              mixer_stone.clipAction(stone.animations[0]).setLoop(THREE.LoopRepeat, Infinity).play();
            }, 300);

            setTimeout(() => {
              mixer_dstone.clipAction(stone.animations[0]).setLoop(THREE.LoopRepeat, Infinity).play();
            }, 900);

            setTimeout(() => {
              mixer_dstone2.clipAction(stone.animations[0]).setLoop(THREE.LoopRepeat, Infinity).play();
            }, 1200);

            setTimeout(() => {
              mixer_glass2.clipAction(glass2.animations[0]).setLoop(THREE.LoopRepeat, Infinity).play();
            }, 500);

            setTimeout(() => {
              mixer_dglass.clipAction(glass.animations[0]).setLoop(THREE.LoopRepeat, Infinity).play();
            }, 700);
            
            setTimeout(() => {
              mixer_dglass2.clipAction(glass2.animations[0]).setLoop(THREE.LoopRepeat, Infinity).play();
            }, 600);

            gsap.to(glassmat, {opacity:1, duration:2, delay:0.4});
        }
        if (e.action === allHumanActs[3]) {
            playAction(allHumanActs[4]);
        }
    });
  }

  renderer.compile(scene, camera);
  const prevVisible = houseGroup.visible;
  houseGroup.visible = true;
  houseGroup.position.y = -1000;
  renderer.render(scene, camera);
  houseGroup.position.y = -5;
  houseGroup.visible = prevVisible;

  human_setupAnimations();
  house_setupAnimations();
}

const hoverTooltipEl = document.getElementById('hoverTooltip');
let lastPointer = { x: 0, y: 0 };
function setTooltipContent(title = 'Human', desc = 'hovering...') {
  const content = hoverTooltipEl?.querySelector('.hover-tooltip__content');
  if (!content) return;
  content.innerHTML = `<strong>${title}</strong><div class="hover-tooltip__desc">${desc}</div>`;
}
function showTooltip(x, y) {
  if (!hoverTooltipEl) return;
  hoverTooltipEl.style.left = `${x}px`;
  hoverTooltipEl.style.top = `${y}px`;
  hoverTooltipEl.classList.add('visible');
  hoverTooltipEl.setAttribute('aria-hidden', 'false');
}
function hideTooltip() {
  if (!hoverTooltipEl) return;
  hoverTooltipEl.classList.remove('visible');
  hoverTooltipEl.setAttribute('aria-hidden', 'true');
}

function prewarmShadowsOnce(light) {
  if (isShadowPrewarmed || !light) return;
  isShadowPrewarmed = true;
  const oldSize = light.shadow.mapSize.clone();
  light.shadow.mapSize.set(256, 256);
  renderer.shadowMap.needsUpdate = true;
  renderer.render(scene, camera);
  requestAnimationFrame(() => {
    light.shadow.mapSize.copy(oldSize);
    renderer.shadowMap.needsUpdate = true;
  });
}

async function start() {
  try {
    const assets = await loadAssets()
    initScene(assets)
    prewarmShadowsOnce(dirLight);
    prewarmUfoOnce();
    initRippleIndicators();

    gsap.to(loadingOverlay, {
      opacity: 1,
      duration: 0.1
    })
    tick()
  } catch (err) {
    console.error('Asset loading failed:', err)
    loadingText.textContent = 'Error'
  }
}

let isUfoPrewarmed = false;
function prewarmUfoOnce() {
  if (isUfoPrewarmed || !ufoGroup) return;
  isUfoPrewarmed = true;

  const prevVisible = ufoGroup.visible;
  const prevPos = ufoGroup.position.clone();
  
  ufoGroup.visible = true;
  ufoGroup.position.set(0, -1000, 0);
  
  if (ufodirlight) ufodirlight.visible = true;
  if (ufolight) ufolight.visible = true;
  if (houselight) houselight.visible = true;
  
  renderer.render(scene, camera);
  
  ufoGroup.visible = prevVisible;
  ufoGroup.position.copy(prevPos);
}

start()

function human_setupAnimations() {
  if (humanGroup) {
    humanAnimationTimeline = gsap.timeline({ paused: true })
      .to(humanGroup.position, {
        y: -5,
        duration: 1,
        ease: "power2.inOut"
      }, 0)
      .to(humanGroup.rotation, {
        y: Math.PI * 2,
        duration: 1,
        ease: "power2.inOut"
      }, "<");
  }
}

function house_setupAnimations() {
  if(houseGroup) {
    houseAnimationTimeline = gsap.timeline({ paused: true })
      .to(houseGroup.position, {
        y: 3.9,
        duration: 0.85,
        ease: "power2.inOut"
      }, 0)
      .to(houseGroup.rotation, {
        y: Math.PI * 2,
        duration: 0.85,
        ease: "power2.inOut"
      }, "<");
  }
}

/* ===============================
   Section Navigation
================================= */
const sectionDivs = Array.from(document.querySelectorAll('.section-text'))
const navEl = document.getElementById('mainNav')
const navUL = navEl.querySelector('ul')
let currentSectionIndex = 0
let previousSectionIndex = 0;
let passedIntro = false
let ufoMoveTl = null; 
let ufoMoveDelay = null;
const ufoHomePos = new THREE.Vector3(2, 10, -0.9);
let cameraMoveTl = null;

const navItems = sectionDivs.slice(1).map((div, i) => {
  const h1 = div.querySelector('h1')
  const li = document.createElement('li')
  li.textContent =
  h1?.textContent === 'Works →CG/VR' ? 'CG/VR' :
    h1?.textContent === 'Works →BARISTA' ? 'BARISTA' :
      h1?.textContent === 'INTERACTIVE ART' ? 'IA' :
        h1?.textContent === 'Thanks for visiting my portfolio' ? 'Contact' :
            h1?.textContent || `Section ${i + 1}`
  li.dataset.index = (i + 1).toString()
  navUL.appendChild(li)
  return li
})

const navIndicator = document. createElement('div');
navIndicator.className = 'nav-indicator';
navUL.appendChild(navIndicator);

// インジケーターの位置を更新する関数
function updateNavIndicator(index) {
  // index は 1-based (section1, section2, ...)
  const navIndex = index - 1; // 0-based for navItems array
  // モバイル専用: 黒いボックスは中央固定、文字列だけスライド
  if (isMobile) {
    if (navIndex < 0 || navIndex >= navItems.length) {
      navIndicator.style.opacity = '0';
      navUL.style.transform = 'translateX(0px)';
      return;
    }

    const activeItem = navItems[navIndex];
    if (!activeItem) return;

    const containerRect = navEl.getBoundingClientRect();
    const containerCenter = containerRect.width / 2;

    // UL を動かしてアクティブ項目の中心を画面中央へ
    const itemCenter = activeItem.offsetLeft + activeItem.offsetWidth / 2;
    const rawShift = containerCenter - itemCenter;

    const ulWidth = navUL.scrollWidth;
    const minShift = containerCenter - ulWidth;                 // 右はみ出し防止
    const maxShift = containerCenter - activeItem.offsetWidth;  // 左はみ出し防止
    const shift = Math.max(minShift, Math.min(maxShift, rawShift));

    navUL.style.transform = `translateX(${shift}px)`;

    // インジケータは中央固定、幅だけ更新
    const padding = 20;
    navIndicator.style.left = '50%';
    navIndicator.style.top = '50%';
    navIndicator.style.transform = 'translate(-50%, -50%)';
    navIndicator.style.width = `${activeItem.offsetWidth + padding}px`;
    navIndicator.style.height = '32px';
    navIndicator.style.opacity = '1';
    return;
  }
  if (navIndex < 0 || navIndex >= navItems.length) {
    // イントロセクションではインジケーターを非表示
    navIndicator. style.opacity = '0';
    return;
  }
  
  const activeItem = navItems[navIndex];
  if (! activeItem) return;
  
  const itemRect = activeItem.getBoundingClientRect();
  const ulRect = navUL.getBoundingClientRect();
  
  const left = itemRect.left - ulRect.left;
  const width = itemRect.width;
  const height = itemRect.height;
  
  navIndicator.style. left = `${left}px`;
  navIndicator.style.width = `${width}px`;
  navIndicator.style.height = `${height}px`;
  navIndicator.style. top = `${(activeItem.offsetTop)}px`;
  navIndicator.style. opacity = '1';
  
  // セクション4,5では白いスタイルに
  if (index >= 4) {
    navIndicator.classList.add('is-light');
  } else {
    navIndicator.classList. remove('is-light');
  }
}

// 初期位置を設定
setTimeout(() => {
  updateNavIndicator(currentSectionIndex);
}, 100);

// リサイズ時にインジケーター位置を更新
window.addEventListener('resize', () => {
  updateNavIndicator(currentSectionIndex);
});

function dropMoversAndReset(targetKeys = []) {
  const movers = {
    car:   { obj: carmove,     home: moverHome.car },
    sheep: { obj: sheepmove,   home: moverHome.sheep },
    bench: { obj: benchiGroup, home: moverHome.bench },
  };
  const keys = targetKeys.length ? targetKeys : Object.keys(movers);
  const dropY = -3;
  const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });

  keys.forEach(key => {
    const m = movers[key];
    if (!m?.obj) return;

    const isMoving =
      gsap.isTweening(m.obj.position) ||
      gsap.isTweening(m.obj.scale) ||
      gsap.isTweening(m.obj.rotation);

    const pos = m.obj.position;
    const scl = m.obj.scale;
    const home = m.home;
    const isDisplaced =
      pos.distanceTo(home.pos) > 0.01 ||
      Math.abs(scl.x - home.scale.x) > 0.01 ||
      Math.abs(scl.y - home.scale.y) > 0.01 ||
      Math.abs(scl.z - home.scale.z) > 0.01;

    if (!isMoving && !isDisplaced) return;

    gsap.killTweensOf(m.obj.position);
    gsap.killTweensOf(m.obj.scale);
    gsap.killTweensOf(m.obj.rotation);

    tl.to(m.obj.position, { y: dropY, duration: 0.35 }, 0)
      .to(m.obj.rotation, { x: "+=0.15", z: "+=0.08", duration: 0.35 }, "<")
      .to(m.obj.scale, {
        x: home.scale.x,
        y: home.scale.y,
        z: home.scale.z,
        duration: 0.55
      }, "<")
      .to(m.obj.position, {
        x: home.pos.x,
        y: home.pos.y,
        z: home.pos.z,
        duration: 0.55,
        ease: "bounce.out"
      }, 0.35)
      .to(m.obj.rotation, {
        x: "-=0.15",
        z: "-=0.08",
        duration: 0.35
      }, "<");
  });

  return tl;
}

const ufodistination = [
  { x: -1.15, y: 2.3, z: 0 },
  { x: 0.7, y: 2.3, z: 0 },
  { x: -0.65, y: 2.3, z: 0.5 }
]
const ufoRoot_1 = [
  { x: -2, y: 3, z: -2 },
  { x: 1.7, y: 5, z: -3 },
  { x: -0.5, y: 3.5, z: 0.5 }
]
const ufoRoot_2 = [
  { x: -1.5, y: 4.5, z: -3 },
  { x: 1.2, y: 2.5, z: -0 },
  { x: 0.3, y: 3, z: 0.5 }
]

const ufoRoot_3 = [
  { x: -2.3, y: 3.3, z: -3 },
  { x: 1, y: 2.5, z: -0 },
  { x: -0.3, y: 5, z: -5 }
]

function creatUfoAni(){
  if (ufoMoveTl) ufoMoveTl.kill();
  const randomIndex = Math.floor(Math.random() * ufodistination.length);
  const targetPos1 = ufoRoot_1[Math.floor(Math.random() * ufodistination.length)];
  const targetPos2 = ufoRoot_2[Math.floor(Math.random() * ufodistination.length)];
  const targetPos3 = ufodistination[randomIndex];
  const targetPos4 = ufoRoot_3[Math.floor(Math.random() * ufodistination.length)];
  const targetPos5 = ufoRoot_1[Math.floor(Math.random() * ufodistination.length)];
  const targetPos6 = ufoRoot_1[Math.floor(Math.random() * ufodistination.length)];
  

  const moverKeys = ['car', 'sheep', 'bench'];
  currentAbductKey = moverKeys[randomIndex];
  
  ufoGroup.visible = true;
  ufodirlight.intensity = 5;

  const tl=gsap.timeline({
    
    onComplete:()=>{
      if (currentSectionIndex >= 2) {
        creatUfoAni();
      }
    }
  })
  if(randomIndex===0){
    tl.to(ufoGroup.position,{
      x:targetPos1.x, y:targetPos1.y, z:targetPos1.z,
      duration:2, ease:'power2.Out'
      })
      .to(ufoGroup.position,{
        x:targetPos2.x, y:targetPos2.y, z:targetPos2.z,
        duration:0.6, ease:'power2.Out'
      })
      .to(ufoGroup.position,{
        x:targetPos4.x, y:targetPos4.y, z:targetPos4.z,
        duration:0.4, ease:'power2.Out'
      } )
      .to(ufoGroup.position,{
        x:targetPos5.x, y:targetPos5.y, z:targetPos5.z,
        duration:0.4, ease:'power2.Out'
      } )
    
      .to(ufoGroup.position,{
        x:targetPos3.x, y:targetPos3.y, z:targetPos3.z,
        duration:0.4, ease:'power2.Out'
      })
      .to(carmove.position,{
        y:-1.85,
        duration:1,
        ease:'power2.in',
        delay:0.25,
      })
      .to(carmove.scale,{
        x:0, y:0, z:0,
        duration:0.7,
        delay:0.25,
        ease:'power2.in',
        onComplete:()=>{
          carmove.position.set(targetPos3.x, -4, targetPos3.z);
        }
      },"<")
      .to(ufoGroup.position,{
        x:targetPos6.x, y:targetPos6.y, z:targetPos6.z,
        duration:0.4, ease:'power2.Out',delay:1
      } )
      .to(carmove.position,{
        y:-3,
        duration:0.5,
        delay:1,
      })
      .to(carmove.scale,{
        x:0.4, y:0.4, z:0.4,
        duration:0.5,
        delay:1,
      },"<")
    
  }else if(randomIndex===1){
    tl.to(ufoGroup.position,{
    x:targetPos1.x,
    y:targetPos1.y,
    z:targetPos1.z,
    duration:2,
    ease:'power2.Out'
    })
    .to
    (ufoGroup.position,{
      x:targetPos2.x,
      y:targetPos2.y,
      z:targetPos2.z,
      duration:0.6,
      ease:'power2.Out'
    })
    .to(ufoGroup.position,{
        x:targetPos4.x, y:targetPos4.y, z:targetPos4.z,
        duration:0.4, ease:'power2.Out'
      } )
        .to(ufoGroup.position,{
        x:targetPos5.x, y:targetPos5.y, z:targetPos5.z,
        duration:0.4, ease:'power2.Out'
      } )
    .to(ufoGroup.position,{
      x:targetPos3.x,
      y:targetPos3.y,
      z:targetPos3.z,
      duration:0.4,
      ease:'power2.Out'
    })
    .to(sheepmove.position,{
        y:-1.7,
        duration:2,
        
        ease:'power2.in',
        delay:0.25,
      })
    .to(sheepmove.scale,{
        x:0,
        y:0,
        z:0,
        delay:0.25,
        duration:2,
        ease:'power2.in',
        onComplete:()=>{
          sheepmove.position.x=targetPos3.x
          sheepmove.position.y=-4
          sheepmove.position.z=targetPos3.z
        }
      },"<")
      .to(ufoGroup.position,{
        x:targetPos6.x, y:targetPos6.y, z:targetPos6.z,
        duration:0.4, ease:'power2.Out',delay:1
      } )
    .to(sheepmove.position,{
        y:-3,
        duration:0.5,
        
      })
    .to(sheepmove.scale,{
        x:0.4,
        y:0.4,
        z:0.4,
        duration:0.5,
        
      },"<")
  }else if(randomIndex===2){
    tl.to(ufoGroup.position,{
    x:targetPos1.x,
    y:targetPos1.y,
    z:targetPos1.z,
    duration:2,
    ease:'power2.Out'
    })
    .to(ufoGroup.position,{
        x:targetPos4.x, y:targetPos4.y, z:targetPos4.z,
        duration:0.4, ease:'power2.Out'
      } )
    .to
    (ufoGroup.position,{
      x:targetPos2.x,
      y:targetPos2.y,
      z:targetPos2.z,
      duration:0.6,
      ease:'power2.Out'
    })
      .to(ufoGroup.position,{
        x:targetPos5.x, y:targetPos5.y, z:targetPos5.z,
        duration:0.4, ease:'power2.Out'
      } )
    .to(ufoGroup.position,{
      x:targetPos3.x,
      y:targetPos3.y,
      z:targetPos3.z,
      duration:0.4,
      ease:'power2.Out'
    })
    .to(benchiGroup.position,{
        y:10,
        duration:2,
        ease:'power2.in',
        delay:0.25,
      })
    .to(benchiGroup.scale,{
        x:0,
        y:0,
        z:0,
        duration:0.7,
        ease:'power2.in',
        delay:0.25,
        onComplete:()=>{
          benchiGroup.position.x=targetPos3.x
          benchiGroup.position.y=-4
          benchiGroup.position.z=targetPos3.z
        }
      },"<")
      .to(ufoGroup.position,{
        x:targetPos6.x, y:targetPos6.y, z:targetPos6.z,
        duration:0.4, ease:'power2.Out',delay:1
      } )
      
    .to(benchiGroup.position,{
        y:-3,
        duration:0.5,
        delay:1,
      })
    .to(benchiGroup.scale,{
        x:1,
        y:1,
        z:1,
        duration:0.5,
        delay:1,
      },"<")
  }
    
  ufoMoveTl = tl;
  return tl;
}

function stopUfoAni() {
  if (ufoMoveTl) { ufoMoveTl.kill(); ufoMoveTl = null; }
  if (ufoMoveDelay) { ufoMoveDelay.kill(); ufoMoveDelay = null; }
  gsap.killTweensOf(ufoGroup.position);
  ufoGroup.position.copy(ufoHomePos);
  ufoGroup.visible = false;
  ufodirlight.intensity = 0;
}

// Ripple configs
const rippleConfigs = {
  human: {
    getWorldPos: () => {
      if (!humanGroup) return null;
      const pos = new THREE.Vector3(0, 2.3, 0.1);
      humanGroup.localToWorld(pos);
      return pos;
    },
    sections: [1]
  },
  backpack: {
    getWorldPos: () => {
      if (!humanGroup) return null;
      const pos = new THREE.Vector3(0, 2.3, -0.5);
      humanGroup.localToWorld(pos);
      return pos;
    },
    sections: [1]
  },
  lod: {
    getWorldPos: () => {
      if (!humanGroup) return null;
      const pos = new THREE.Vector3(-0.25, 2.9, -0.2);
      humanGroup.localToWorld(pos);
      return pos;
    },
    sections: [1]
  },
  house_car: {
    getWorldPos: () => {
      if (! houseGroup || !carmove) return null;
      const pos = carmove.position.clone();
      pos. y += 0.25;
      return pos. add(new THREE.Vector3(0, houseGroup.position.y, 0));
    },
    sections: [2, 3]
  },
  house_coffee: {
    getWorldPos: () => {
      if (!houseGroup) return null;
      const pos = new THREE.Vector3(-0.25,-2.8, -0.1);
      houseGroup. localToWorld(pos);
      return pos;
    },
    sections: [2, 3]
  },
  house_sheep: {
    getWorldPos: () => {
      if (!houseGroup || !sheepmove) return null;
      const pos = sheepmove.position.clone();
      pos.y += 0.2;
      pos.x += 0.1;
      return pos.add(new THREE.Vector3(0, houseGroup.position. y, 0));
    },
    sections: [2, 3]
  },
  house_drink: {
    getWorldPos: () => {
      if (!houseGroup) return null;
      const pos = new THREE.Vector3(-0.62,-2.82, 0.52);
      houseGroup. localToWorld(pos);
      return pos;
    },
    sections: [3]
  },
  house_cake: {
    getWorldPos: () => {
      if (!houseGroup) return null;
      const pos = new THREE.Vector3(-0.58,-2.75, -0.1);
      houseGroup. localToWorld(pos);
      return pos;
    },
    sections: [3]
  }
};

const rippleElements = {};

function initRippleIndicators() {
  document.querySelectorAll('.hover-point[data-ripple]').forEach(el => {
    const key = el.dataset.ripple;
    rippleElements[key] = {
      el: el,
      visible: false,
      worldPos: null
    };
  });
  if (isMobile) hideAllRipples();
}

function showRipple(key) {
  const ripple = rippleElements[key];
  if (!ripple) return;
  const config = rippleConfigs[key];
  if (!config) return;
  const pos = config.getWorldPos();
  if (!pos) return;
  ripple.worldPos = pos.clone();
  ripple.visible = true;
  ripple.el.classList.add('visible');
}

function hideRipple(key) {
  const ripple = rippleElements[key];
  if (!ripple) return;
  ripple.visible = false;
  ripple.el.classList.remove('visible');
  ripple.el.classList.remove('is-hovered');
  ripple.worldPos = null;
}

function hideAllRipples() {
  Object.keys(rippleElements).forEach(key => hideRipple(key));
}

function showRipplesForSection(sectionIndex) {
  if (isMobile) return;
  hideAllRipples();
  Object.entries(rippleConfigs).forEach(([key, config]) => {
    if (config.sections.includes(sectionIndex)) {
      showRipple(key);
    }
  });
}

function updateAllRipplePositions() {
  if (isMobile) return;
  Object.entries(rippleElements).forEach(([key, ripple]) => {
    if (! ripple.visible || !ripple.el) return;
    const config = rippleConfigs[key];
    if (config) {
      const newPos = config.getWorldPos();
      if (newPos) {
        ripple.worldPos = newPos;
      }
    }
    if (! ripple.worldPos) {
      ripple. el.style.opacity = '0';
      return;
    }
    const screenPos = ripple.worldPos. clone().project(camera);
    if (screenPos.z > 1) {
      ripple.el.style.opacity = '0';
      return;
    }
    const x = (screenPos.x * 0.5 + 0.5) * sizes.width;
    const y = (-screenPos.y * 0.5 + 0.5) * sizes.height;
    ripple.el. style.left = `${x}px`;
    ripple. el.style.top = `${y}px`;
    ripple.el.style.opacity = '';
  });
}

function hideRippleTemporarily(key) {
  const ripple = rippleElements[key];
  if (ripple && ripple.el) {
    ripple.el.classList.add('is-hovered');
  }
}

function restoreRipple(key) {
  const ripple = rippleElements[key];
  if (ripple && ripple.el) {
    ripple.el.classList.remove('is-hovered');
  }
}

const sectionSplits = new Map();

function animateSectionText(sectionEl) {
  if (!sectionEl) return;
  const key = sectionEl.id || sectionEl;

  if (!sectionSplits.has(key)) {
    const targets = sectionEl.querySelectorAll('.reveal-text');
    const items = [];
    targets.forEach(el => {
      const tag = el.tagName.toLowerCase();
      if (tag === 'p') {
        const split = new SplitText(el, { type: 'lines', linesClass: 'line' });
        gsap.set(split.lines, { overflow: 'hidden', yPercent: 110, opacity: 1 });
        items.push({ isParagraph: true, split });
      } else {
        const split = new SplitText(el, { type: 'lines,chars', linesClass: 'line' });
        gsap.set(split.lines, { overflow: 'hidden' });
        gsap.set(split.chars, { yPercent: 110, opacity: 1 });
        items.push({ isParagraph: false, split });
      }
    });
    sectionSplits.set(key, items);
  }

  const items = sectionSplits.get(key);
  const allLines = items.flatMap(it => it.isParagraph ? it.split.lines : []);
  const allChars = items.flatMap(it => it.isParagraph ? [] : it.split.chars);
  gsap.killTweensOf([...allLines, ...allChars]);

  const tl = gsap.timeline().addLabel('start');

  items.forEach((item, idx) => {
    const at = idx === 0 ? 'start' : `start+=${idx * 0.05}`;
    if (item.isParagraph) {
      tl.fromTo(
        item.split.lines,
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.75,
          ease: 'power3.out',
          stagger: 0.08
        },
        at
      );
    } else {
      tl.fromTo(
        item.split.chars,
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.04
        },
        at
      );
    }
  });

  // section5 の contact-container も入場時に必ずフェードインさせる
  if (sectionEl.id === 'section5') {
    const contactContainer = sectionEl.querySelector('.contact-container');
    if (contactContainer) {
      gsap.set(contactContainer, { opacity: 0, y: 24 });
      tl.fromTo(
        contactContainer,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        'start'
      );
    }
  }
}

function resetSectionButton(sectionEl) {
  const btn = sectionEl?.querySelector('.view-more-btn');
  if (!btn) return;
  gsap.set(btn, { autoAlpha: 0, opacity: 0, y: 0, scale: 0.9 });
}
function animateSectionButton(sectionEl) {
  const btn = sectionEl?.querySelector('.view-more-btn');
  if (!btn) return;
  gsap.killTweensOf(btn);

  gsap.timeline()
    .fromTo(
      btn,
      { autoAlpha: 0, opacity: 0, y: 24, scale: 0.9 },
      {
        y: 0,
        scale: 1,
        duration: 0.45,
        ease: 'power3.out',
        opacity: 0,
        autoAlpha: 0,
        overwrite: 'auto',
      }
    )
    .to(
      btn,
      {
        autoAlpha: 1,
        opacity: 1,
        duration: 0.25,
        ease: 'power1.out',
        overwrite: 'auto',
      },
      '-=0.2'
    );
}

function animateSectionButtonOut(sectionEl) {
  const btn = sectionEl?.querySelector('.view-more-btn');
  if (!btn) return;
  gsap.killTweensOf(btn);
  gsap.to(btn, {
    autoAlpha: 0,
    opacity: 0,
    y: -16,
    scale: 0.94,
    duration: 0.25,
    ease: 'power2.in',
    overwrite: 'auto',
    onComplete: () => gsap.set(btn, { autoAlpha: 0, opacity: 0 }),
  });
}

function updateBackgroundColor(sectionIndex) {
  if (! backmat) return;
  
  const colorMap = {
    0: { r: 1, g: 1, b: 1 },
    1: { r: 0.49, g: 0.42, b: 0.20},
    2: {r: 0.3, g: 0.47, b: 0.3 },
    3: { r: 0.3, g: 0.45, b: 0.5},
    4: { r:  0.18, g: 0.30, b: 0.39 },
    5: { r:  0.18, g: 0.30, b: 0.39 }
  };
  
  const target = colorMap[sectionIndex];
  if (target) {
    gsap.to(backmat.color, {
      r: target.r,
      g: target.g,
      b: target.b,
      duration: 1
    });
  }
}

function startSmokeAnimations() {
  if (smokeDelayId1) clearTimeout(smokeDelayId1);
  if (smokeDelayId2) clearTimeout(smokeDelayId2);

  if (smokemat) {
    gsap.killTweensOf(smokemat);
    gsap.to(smokemat, { opacity: 1, duration: 1 });
  }

  if (! smokeani || smokeani.length === 0) return;

  if (!smokeAction1) {
    smokeAction1 = mixer_smoke.clipAction(smokeani[0]);
    smokeAction1.timeScale = 0.25;
    smokeAction1.setLoop(THREE.LoopRepeat, Infinity);
  }
  if (!smokeAction2) {
    smokeAction2 = mixer_smoke2.clipAction(smokeani[0]);
    smokeAction2.timeScale = 0.25;
    smokeAction2.setLoop(THREE.LoopRepeat, Infinity);
  }
  if (!smokeAction3) {
    smokeAction3 = mixer_smoke3.clipAction(smokeani[0]);
    smokeAction3.timeScale = 0.25;
    smokeAction3.setLoop(THREE. LoopRepeat, Infinity);
  }

  smokeAction1.reset(). play();

  smokeDelayId1 = setTimeout(() => {
    smokeAction2.reset().play();
  }, 2666);

  smokeDelayId2 = setTimeout(() => {
    smokeAction3. reset().play();
  }, 5332);
}

function stopSmokeAnimations() {
  if (smokeDelayId1) { clearTimeout(smokeDelayId1); smokeDelayId1 = null; }
  if (smokeDelayId2) { clearTimeout(smokeDelayId2); smokeDelayId2 = null; }

  if (smokemat) {
    gsap.killTweensOf(smokemat);
    gsap.to(smokemat, {
      opacity: 0,
      duration: 1,
      onComplete: () => {
        if (smokeAction1) smokeAction1.stop(). reset();
        if (smokeAction2) smokeAction2. stop().reset();
        if (smokeAction3) smokeAction3.stop(). reset();
      }
    });
  }
}

function updateActiveState(newIndex, oldIndex) {
  if (sectionAnimLock) return;
  sectionAnimLock = true;
  

  const prevEl = sectionDivs[oldIndex];
  const newEl = sectionDivs[newIndex];
  // const targetState = sectionCameraStates[newIndex];
  const targetState = getCameraStatesForDevice()[newIndex];

  // ぼかし背景の表示/非表示
  if (blurOverlay) {
    if (newIndex >= 1 && newIndex <= 5) {
      blurOverlay.classList.add('visible');
    } else {
      blurOverlay.classList.remove('visible');
    }
  }

  if (prevEl && oldIndex !== newIndex) {
    animateSectionButtonOut(prevEl);
  }

  let outDone = oldIndex === newIndex;
  let camDone = false;
  let inDone = false;
  const unlock = () => {
    if (outDone && camDone && inDone) sectionAnimLock = false;
  };

  navItems.forEach((li, i) => li.classList.toggle('active', (i + 1) === newIndex));
  navEl.classList.toggle('hidden', newIndex === 0);

  navItems.forEach(li => li.addEventListener('click', () => {
    if (sectionAnimLock) return;
    if (introScrollLocked && currentSectionIndex === 0) return
    previousSectionIndex = currentSectionIndex;
    currentSectionIndex = parseInt(li.dataset.index)
    updateActiveState(currentSectionIndex, previousSectionIndex)
    // インジケーター位置を即座に更新
    updateNavIndicator(currentSectionIndex);
  }))

// インジケーター位置を更新
updateNavIndicator(newIndex);
  
  navEl.classList.toggle('hidden', newIndex === 0);
  if (newIndex >= 1) passedIntro = true;

  if (prevEl && oldIndex !== newIndex) {
    prevEl.classList.add('active');
    prevEl.style.pointerEvents = 'none';

    const outTl = animateSectionTextOut(prevEl);
    if (outTl) {
      outTl.eventCallback('onComplete', () => {
        prevEl.classList.remove('active');
        outDone = true;
        unlock();
      });
    } else {
      prevEl.classList.remove('active');
      outDone = true;
    }
  }

  if (newEl) {
    newEl.classList.remove('active');
    resetSectionButton(newEl);
  }

  if (targetState) {
    if (cameraMoveTl) cameraMoveTl. kill();

    cameraMoveTl = gsap.timeline({
      onComplete: () => {
        camDone = true;
        if (newEl) {
          newEl.classList.add('active');
          newEl.style. pointerEvents = 'auto';
          animateSectionText(newEl);
          animateSectionButton(newEl);
        }
        inDone = true;
        unlock();
      }
    });

    cameraMoveTl.to(camera. position, {
      x: targetState.position.x,
      y: targetState. position.y,
      z: targetState.position.z,
      duration: 1.2,
      ease: 'power2. inOut',
    }, 0);

    cameraMoveTl. to(cameraLookAtTarget, {
      x: targetState.lookAt.x,
      y: targetState. lookAt.y,
      z: targetState.lookAt. z,
      duration: 1.2,
      ease: 'power2. inOut',
    }, 0);
  } else {
    camDone = true;
    if (newEl) {
      newEl. classList.add('active');
      newEl.style.pointerEvents = 'auto';
      animateSectionText(newEl);
      animateSectionButton(newEl);
    }
    inDone = true;
    unlock();
  }

  if (oldIndex === 0 && newIndex >= 1) animateIntroTextOut();
  if (newIndex === 0 && oldIndex >= 1) animateIntroTextIn();

  updateBackgroundColor(newIndex);

  if (newIndex >= 2 && oldIndex === 1) {
    startSmokeAnimations();
  }
  if (newIndex === 1 && oldIndex >= 2) {
    stopSmokeAnimations();
  }
  if (newIndex === 0 && oldIndex >= 2) {
    stopSmokeAnimations();
  }

  if (newIndex >= 2 && oldIndex === 1) {
    startSheepSequence();
  }
  if (newIndex === 1 && oldIndex > 1) {
    stopSheepSequence();
  }

  if (newIndex === 4 && oldIndex < 4) {
    setShadowsEnabled(false);
    requestAnimationFrame(() => {
      const tl = gsap.timeline();
      gsap.killTweensOf([dirLight, amblight, houselight, emissiveMats]);

      gsap.to(emissiveMats, { opacity: 1, duration: 0.5 ,});
      gsap.to(rantanMat, { emissiveIntensity: 1, duration: 0.5 });
      
      tl.to(dirLight, {
        intensity: 0,
        duration: 0.5,
        ease: 'power1.in',
      })
      .to(amblight, {
        intensity: 0.3,
        duration: 0.5,
      }, 0.2)
      .to(houseMat, { opacity: 0, duration: 1 })
      .to(houselight, {
        intensity: 0.5,
        duration: 0.5,
      }, 0.3)
      .add(() => {
        requestAnimationFrame(() => {
          ufoGroup.visible = true;
          ufodirlight.intensity = 5;
          requestAnimationFrame(() => {
            creatUfoAni();
          });
        });
      }, 0.8);
    });
    gsap.to(starmat, { opacity: 1, duration: 1});
      
  }else if(newIndex < 4 && oldIndex >= 4){
    
    const tl = gsap.timeline();
    gsap.killTweensOf([dirLight, amblight, houselight, emissiveMats]);
    setShadowsEnabled(true);
    stopUfoAni();
    gsap.to(emissiveMats, { opacity: 0, duration: 0.5 });
    gsap.to(rantanMat, { emissiveIntensity: 0, duration: 0.5 });

    gsap.to(ufoGroup.position,{
      y: 10,
      x: 0,
      z: -0.9,
      duration:1,
      onComplete: () => {
        ufoGroup.visible = false;
      }
    })
    gsap.to(ufoGroup.position,{
      y: 10,
      x: 0,
      z: -0.9,
      duration:1,
      onComplete: () => {
        ufoGroup.visible = false;
      }
    })
    tl.to(amblight,{
      intensity:2.0,
      duration:0.5,
    })
    .to(houselight, {
      intensity: 0,
      duration: 0.2,
    },"<")
    .to(dirLight,{
      intensity:2.1,
      duration:1,
      
    })
    .to(houseMat, { opacity: 0, duration: 0.5 },"<")

    gsap.to(starmat, { opacity: 0, duration: 1});

  }else if(newIndex ===5 && oldIndex ===4){
    stopUfoAni();
    gsap.killTweensOf([dirLight, amblight, houselight, emissiveMats]);
    gsap.to(ufoGroup.position,{
      y: 10,
      x: 0,
      z: -0.9,
      duration:1,
      onComplete: () => {
        ufoGroup.visible = false;
      }
    })
  }else if(newIndex ===4 && oldIndex ===5){
    ufoGroup.position.set(0,10,-0.9)
    setTimeout(() => {
      ufoGroup.visible = true;
    }, 200);
    creatUfoAni();
  }else if(newIndex ===5 && oldIndex <4){
    const tl = gsap.timeline();
    gsap.killTweensOf([dirLight, amblight, houselight, emissiveMats]);

    gsap.to(emissiveMats, { opacity: 1, duration: 0.5 });
    gsap.to(rantanMat, { emissiveIntensity: 1, duration: 0.5 });
    tl.to(dirLight, {
      intensity: 0,
      duration: 0.5,
      ease: 'power1.out',
    })
    .to(amblight, {
      intensity: 0.3,
      duration: 0.2,
    }, 0.2)
    .to(houseMat, { opacity: 0, duration: 1 })
    .to(houselight, {
      intensity: 1,
      duration: 0.2,
    },"<")

    gsap.to(starmat, { opacity: 1, duration: 1});
  }
  if (oldIndex === 4 && newIndex !== 4) {
    dropMoversAndReset(currentAbductKey ? [currentAbductKey] : []);
    currentAbductKey = null;
  }

  if (bgAction) {
    const clipDuration = bgAction.getClip().duration;
    if (newIndex >= 2 && oldIndex === 1) {
      bgAction.paused = false;
      bgAction.timeScale = 1;
      bgAction.time = 0;
      bgAction.setLoop(THREE.LoopOnce, 1);
      bgAction.clampWhenFinished = true;
      bgAction.play();
    }
    if (newIndex === 1 && oldIndex >= 2) {
      bgAction.paused = false;
      bgAction.timeScale = -1;
      bgAction.time = clipDuration;
      bgAction.setLoop(THREE.LoopOnce, 1);
      bgAction.clampWhenFinished = true;
      bgAction.play();
    }
  }

  if (humanAnimationTimeline) {
    if (newIndex>1 && oldIndex === 1 ) {
      humanAnimationTimeline.play();

      setTimeout(() => {
        if (currentAction) {
          currentAction.reset().stop();
          hideWithLayer(humanGroup);
        }
      }, 1000);  
  
    } else if (oldIndex > 1 && newIndex === 1 ) {
      humanAnimationTimeline.reverse();
      showWithLayer(humanGroup);
      currentAction.reset().play();
    }
  }

  if(ufoRotateAnimation&&ufoRotateAnimation.length > 0){
    if(newIndex >= 4 && oldIndex <4){
      const ufoAction = mixer_ufo.clipAction(ufoRotateAnimation[0]);
      ufoAction.paused = false;
      ufoAction.setLoop(THREE.LoopRepeat, Infinity)
      
      gsap.to(ufoAction, {
        timeScale: 1,
        duration: 1,
        ease: "power2.in",
      });
      ufoAction.play();
    }else if(newIndex <4 && 4<=oldIndex){
      const ufoAction = mixer_ufo.clipAction(ufoRotateAnimation[0]);
      
      gsap.to(ufoAction, {
        timeScale: 0,
        duration: 1,
        ease: "power2.out",
        onComplete: () => {
           ufoAction.paused = true;
        }
      });
    }
  }

  if(houseAnimationTimeline) {
    if(newIndex === 1 && oldIndex ===0){
      hideWithLayer(houseGroup);
    }
    if (newIndex >1 && oldIndex === 1 ) {
      setTimeout(() => {
        showWithLayer(houseGroup);
        houseAnimationTimeline.play();
      }, 500);
    }
    else if (newIndex === 1 && oldIndex >= 2 ) {
      houseAnimationTimeline.reverse();
      currentAction.reset().play();
      setTimeout(() => {
        hideWithLayer(houseGroup);
      }, 500);
    }
  }

  hideTooltip();

  updateBackgroundColor(newIndex);

  if (oldIndex === 0 && newIndex >= 1) animateIntroTextOut();
  if (newIndex === 0 && oldIndex >= 1) animateIntroTextIn();
  
  if (allHumanActs.length > 0) {
      if (newIndex === 1 && currentAction === allHumanActs[1]) {
          playAction(allHumanActs[2]);
      }
      else if (newIndex === 0 && currentAction !== allHumanActs[0] && currentAction !== allHumanActs[1]) {
          playAction(allHumanActs[1]);
      }
  }

  if (newIndex >= 1 && newIndex <= 3) {
    const showRippleDelay = targetState ?  1200 : 0;
    setTimeout(() => {
      showRipplesForSection(newIndex);
    }, showRippleDelay);
  } else {
    hideAllRipples();
  }
}

let isScrolling = false
window.addEventListener('wheel', e => {
  if (isOpeningModal) return
  if (introScrollLocked && currentSectionIndex === 0) return
  if (sectionAnimLock) return;
  if (isScrolling) return
  isScrolling = true
  previousSectionIndex = currentSectionIndex;

  if (e.deltaY > 0) {
    if (currentSectionIndex < sectionDivs.length - 1) currentSectionIndex++
  } else {
    const canBack = (currentSectionIndex === 1 && !passedIntro)
    if (currentSectionIndex > 1 || canBack) currentSectionIndex--
  }

  if (previousSectionIndex !== currentSectionIndex) {
    updateActiveState(currentSectionIndex, previousSectionIndex);
  }
  
  setTimeout(() => isScrolling = false, 800)
})

/* ------------------------------
   モバイル向けスワイプでセクション移動
-------------------------------- */
let touchStartY = null;
let touchStartX = null;
const SWIPE_THRESHOLD = 60;

function handleSectionChange(direction) {
  if (isOpeningModal) return;
  // モーダルが開いている場合はセクション移動しない
  if (detailPage.classList. contains('is-visible')) return;
  if (introScrollLocked && currentSectionIndex === 0) return;
  if (sectionAnimLock) return;

  previousSectionIndex = currentSectionIndex;

  if (direction === 'down') {
    if (currentSectionIndex < sectionDivs.length - 1) currentSectionIndex++;
  } else if (direction === 'up') {
    const canBack = currentSectionIndex === 1 && ! passedIntro;
    if (currentSectionIndex > 1 || canBack) currentSectionIndex--;
  }

  if (previousSectionIndex !== currentSectionIndex) {
    updateActiveState(currentSectionIndex, previousSectionIndex);
  }
}

window.addEventListener('touchstart', e => {
  if (! isMobile) return;
  // モーダルが開いている場合はセクション移動用のタッチを記録しない
  if (detailPage.classList.contains('is-visible')) return;
  if (isOpeningModal) return;
  if (e.touches.length !== 1) return;
  touchStartY = e. touches[0].clientY;
  touchStartX = e. touches[0].clientX;
});

window.addEventListener('touchend', e => {
  if (! isMobile) return;
  // モーダルが開いている場合はセクション移動しない
  if (detailPage.classList.contains('is-visible')) return;
  if (isOpeningModal) return;
  if (touchStartY === null) return;
  
  const touchEndY = e.changedTouches[0].clientY;
  const touchEndX = e.changedTouches[0].clientX;
  const deltaY = touchEndY - touchStartY;
  const deltaX = touchEndX - touchStartX;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    touchStartY = null;
    touchStartX = null;
    return;
  }

  if (deltaY <= -SWIPE_THRESHOLD) handleSectionChange('down');
  else if (deltaY >= SWIPE_THRESHOLD) handleSectionChange('up');

  touchStartY = null;
  touchStartX = null;
});

navItems.forEach(li => li.addEventListener('click', () => {
  if (sectionAnimLock) return;
  if (introScrollLocked && currentSectionIndex === 0) return
  previousSectionIndex = currentSectionIndex;
  currentSectionIndex = parseInt(li.dataset.index)
  updateActiveState(currentSectionIndex, previousSectionIndex)
}))

updateActiveState(currentSectionIndex, previousSectionIndex)

/* ===============================
   Raycaster Hover
================================= */
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
let prevMouseX = 0;
let prevMouseY = 0;
let mouseSpeed = 0;
let starspeed=0;

canvas.addEventListener('pointermove', e => {
  if (isMobile) {
    hideTooltip();
    return;
  }

  lastPointer.x = e.clientX;
  lastPointer.y = e.clientY;

  const rect = canvas.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

 if (currentSectionIndex === 1 && humanGroup. visible) {
  const hitsHuman = humanRayTargets.length
    ? raycaster.intersectObjects(humanRayTargets, false)
    : [];

  if (hitsHuman.length > 0) {
    const hitName = hitsHuman[0].object.name;

    if (hitName === 'human_ray_mesh') {
      setTooltipContent('英語力','日常英会話ができます');
      hideRippleTemporarily('human');
    } else if (hitName === 'backpack_ray_mesh') {
      setTooltipContent('旅行好き', 'お祭りに参加しに行きます');
      hideRippleTemporarily('backpack');
    }else if (hitName === 'lod_ray_mesh') {
      setTooltipContent('釣り', 'お祭りに参加しに行きます');
      hideRippleTemporarily('lod');
    }

    showTooltip(lastPointer.x, lastPointer. y - 20);
    return;
  } else {
    hideTooltip();
    restoreRipple('human');
    restoreRipple('backpack');
    restoreRipple('lod');
    return;
  }
}

 if (currentSectionIndex >= 4 && stars. length > 0) {
  const hitStar = raycaster.intersectObjects(stars, true);
  const dx = mouse.x - prevMouseX;
  const dy = mouse. y - prevMouseY;
  mouseSpeed = Math.sqrt(dx * dx + dy * dy);
  prevMouseX = mouse. x;
  prevMouseY = mouse. y;

  if (hitStar.length > 0) {
    let hitObject = hitStar[0]. object;
    let foundIndex = -1;
    while (hitObject) {
      foundIndex = stars.indexOf(hitObject);
      if (foundIndex !== -1) break;
      hitObject = hitObject.parent;
    }
    
    if (foundIndex !== -1) {
      const direction = dx >= 0 ? 1 : -1;
      starSpeeds[foundIndex] += mouseSpeed * 100 * direction;
      const maxSpeed = 300;
      starSpeeds[foundIndex] = Math. max(-maxSpeed, Math. min(maxSpeed, starSpeeds[foundIndex]));
    }
    
    setTooltipContent('⭐ Star', 'マウスで回転！');
    showTooltip(lastPointer. x, lastPointer.y - 20);
    return;
  } else {
    hideTooltip();
  }
}
  if (currentSectionIndex >= 2 && 3 >= currentSectionIndex && houseRayRoot) {
  const hitsHouse = raycaster.intersectObject(houseRayRoot, true);
  
  if (hitsHouse. length > 0) {
    const hitName = hitsHouse[0].object.name;
    
    if (hitName === 'ray_car') {
      setTooltipContent('車', '普通自動車免許を所持しています。');
      hideRippleTemporarily('house_car');
    } else if (hitName === 'ray_machine') {
      setTooltipContent('エスプレッソ抽出', '１日に5~7kgほどの<br>コーヒー豆を処理していました。');
      hideRippleTemporarily('house_coffee');
    } else if (hitName === 'ray_coffee') {
      setTooltipContent('ドリンク', 'ラテアートやカクテルなどの様々なドリンクを作れます。');
      hideRippleTemporarily('house_drink');
    } else if (hitName === 'ray_sheep') {
      setTooltipContent('羊', '羊・ヤギの牧場で働いていました。');
      hideRippleTemporarily('house_sheep');
    } else if (hitName === 'ray_cake') {
      setTooltipContent('ケーキ', 'カフェではケーキを作り販売していました。');
      hideRippleTemporarily('house_cake');
    }
    
    showTooltip(lastPointer.x, lastPointer.y - 20);
    return;
  } else {
    hideTooltip();
    restoreRipple('house_car');
    restoreRipple('house_coffee');
    restoreRipple('house_sheep');
    restoreRipple('house_drink');
    restoreRipple('house_cake');
    return;
  }
}
})

canvas.addEventListener('pointerleave', () => {
  if (isMobile) return;
  hideTooltip();
})

/* ===============================
   Animation_tick
================================= */
const clock = new THREE.Clock()
let previousTime = 0
const ROTATE_LAMBDA = 4
function tick() {
  const elapsed = clock.getElapsedTime()
  const dt = elapsed - previousTime
  previousTime = elapsed
  if (mixer) mixer.update(dt)
  if (mixer_glass) mixer_glass.update(dt)
  if (mixer_glass2) mixer_glass2.update(dt)
  if (mixer_dglass) mixer_dglass.update(dt)
  if (mixer_dglass2) mixer_dglass2.update(dt)
  if (mixer_stone) mixer_stone.update(dt)
  if (mixer_dstone) mixer_dstone.update(dt)
  if (mixer_dstone2) mixer_dstone2.update(dt)
  if (mixer_back) mixer_back.update(dt)
  if (mixer_ufo) mixer_ufo.update(dt)
  if (mixer_sheep) mixer_sheep.update(dt)
  if (mixer_smoke) mixer_smoke.update(dt)
  if (mixer_smoke2) mixer_smoke2.update(dt)
  if (mixer_smoke3) mixer_smoke3.update(dt)

  camera.lookAt(cameraLookAtTarget);
  world.step()

  if (!isMobile) {
    stars.forEach((star, i) => {
      if (Math.abs(starSpeeds[i]) > 0.01) {
        star.rotation.y += starSpeeds[i] * dt;
        starSpeeds[i] *= 0.98;
      }
    });
  }

  updateAllRipplePositions();

  renderer.render(scene, camera)
  requestAnimationFrame(tick)
}
tick()

/* 以下（モーダル／カード生成部分）*/
const modalContentMap = {
  cgvr: [
    {
      type: 'image',
      src: '/img/noimage.jpg',
      title: '新型エレベーター アーバンエースHF/ VR 作成',
      badges: ['UE4','3dsMax','Ai', 'Ps'],
      meta: '役割：モデリング/VR 制作全般',
      body: 'デザイナー深沢直人氏デザインによる7 年ぶりの標準型エレベーターを、デザイン検討するため、UnrealEngineで制作。VR 上で実際にエレベーターに乗り、かご内の着せ替えが行える他、ボタンを操作しエレベーターの一連の操作が可能。原寸大モックアップ制作の代わりであったため、よりリアルな質感を追及。現実と遜色ないと評価を得る。<br><a href="https://www.hbs.co.jp/products/elevator/renewal/ua-hf/" target="_blank" rel="noopener noreferrer">詳細はこちら</a>'
    },
    {
      type: 'image',
      src: '/img/noimage.jpg',
      title: 'エスカレーター/ エレベーターカタログ用CG 作成',
      badges: ['3dsMax','Vray','MentalRay', 'Ai', 'Ps', ],
      meta: '役割：モデリング、レンダリング、レタッチ',
      body: '日立ビルシステム標準エレベーター/ エスカレーター用カタログのCG作成。CAD 図面をいただき、そこから高解像度のCG を作成・レタッチし納品しておりました。<br><a href="https://www.hbs.co.jp/support/catalog/pdf/ou_re_573q_202409.pdf" target="_blank" rel="noopener noreferrer">カタログ詳細はこちら</a>'
    },
    {
      type: 'image',
      src: '/img/noimage.jpg',
      title: 'エレベーター 顧客プレゼン用CG 作成',
      badges: ['Ai', 'Ps', '3dsMax'],
      meta: '役割：モデリング、レンダリング、レタッチ',
      body: '各顧客に向けたプレゼンテーション用の、エレベーター/ エスカレーター完成イメージのCG パースの作成・レイアウトを制作。<br><a href="https://www.hbs.co.jp/case/" target="_blank" rel="noopener noreferrer">実例はこちら</a>'
    },
    {
      type: 'youtube',
      src: 'https://www.youtube.com/embed/IQ2QbXGeLt4?si=sGp09sRnheI_DdL4',
      title: '焚火VR',
      badges: ['Unity', '3dsMax', 'Substance','Ai', 'Ps', 'C#' ],
      meta: 'Meta Quest2用スタンドアローンアプリ<br>役割：モデリング / テクスチャ / スキニング / VR操作作成 他',
      body: 'プレイヤーは好きなキャンプサイトを選び、薪割りから焚き火を楽しむことができる。リアルな体験を楽しめるように、質感やギミックにこだわり、モデルから作成。このVR は、普段キャンプに行けない人やキャンプ道具を販売している会社でのプロモーション用、また、キャンプサイトをPRするためなどに使用することを目的としている。<br>より快適に楽しむため、モデルやテクスチャの軽量化、操作性の向上を図っている。'
    },
    {
      type: 'youtube',
      src: 'https://www.youtube.com/embed/cLrJQm-jV8E?si=l1TgI5SIp1XroZsU',
      title: 'ヨガ体験教室VR',
      badges: ['Unity', '3dsMax', 'Ai', 'Ps', 'C#' ],
      meta: 'Meta Quest2用スタンドアローンアプリ<br>役割：モデリング / テクスチャ / VR操作作成 他',
      body: 'VolumetricVideoを活用し、ヨガ体験教室をVRで作成。プレイヤーは好きな環境でプレイでき、自身の身長に合わせて出現するヨガのポーズ補助（手や足を置く場所など）により、より正確なポーズをとることができる。<br><a href="/img/yogaVR.pptx.pdf" target="_blank" rel="noopener noreferrer">📄 詳細PDFはこちら</a>'
    },
    {
      type: 'video',  // 新しいタイプ
      src: '/movies/three_01.mp4',
      title: 'Three.js_gravityBall',
      badges: ['Three.js'],
      body: 'Three.js で物理演算を使用し、マウスに反応するボールを作成。よりインタラクティブにwebサイトを楽しんでもらうための試み。'
    },
    {
      type: 'video', 
      src: '/movies/portfolio.mp4',
      title: 'このPortfolioサイト',
      badges: ['Three.js', '3dsMax', 'Substance', 'Ai(copilot)', 'Ai', 'Ps', 'C#' ],
      body: 'モデリングやテクスチャリングによる軽量化を図り、スクリプトによるオブジェクトへのイベント処理などを行う。AIを活用し、Webページの作成を行う。'
    },
    {
      type: 'video',  // 新しいタイプ
      src: '/movies/three_02.mp4',
      title: 'Three.js_gravityBall',
      badges: ['Three.js', 'rapier'],
      body: 'Three.js で物理演算を使用し、スクロールにより重力、無重力の場を表現し、マウスに反応するボールを作成。よりインタラクティブにwebサイトを楽しんでもらうための試み。'
    },
    {
      type: 'video',  // 新しいタイプ
      src: '/movies/three_03.mp4',
      title: 'Three.js_Galaxy',
      badges: ['Three.js', 'rapier'],
      body: 'Three.jsでスピンしたラインにパーティクルを作成、調整し擬似的な銀河を表現。'
    },
  ],
  barista: [
    {
      type: 'image',
      src: '/pict/4.jpg',
      title: 'ラテアート：リーフ',
    },
    {
      type: 'image',
      src: '/pict/6.jpg',
      title: 'ラテアート：スワン',
    },
    {
      type: 'image',
      src: '/pict/2.jpg',
      title: 'ストロベリーシェイク',
    },
    {
      type: 'video', 
      src: '/pict/cafe.mp4',
      title: 'カフェにて業務風景',
    },
    {
      type: 'image',
      src: '/pict/3.jpg',
      title: 'ラテアート',
    },
    {
      type: 'image',
      src: '/pict/5.jpg',
      title: 'ラテアート：リーフ',
    },
    {
      type: 'image',
      src: '/pict/1.jpg',
      title: 'ラテアート：うさぎ',
    },
    {
      type: 'image',
      src: '/pict/7.jpg',
      title: 'アメリカーノ',
    },
    {
      type: 'image',
      src: '/pict/8.jpg',
      title: 'ラテアート：ハート',
    },
    {
      type: 'image',
      src: '/pict/9.jpg',
      title: 'チャイラテ',
    },
    {
      type: 'image',
      src: '/pict/10.jpg',
      title: 'ラテアート：リーフ',
    },
    {
      type: 'image',
      src: '/pict/11.jpg',
      title: 'シュークリーム',
    },
    
  ],
  interactive: [
    {
      type: 'video',  
      src: '/movies/rain.mp4',  
      title: '光の雨',
      badges: ['TouchDesigner'],
      meta: '赤外線センサーを利用したインタラクティブ映像',
      body: '赤外線センサーにより、反射板をつけたオブジェクトを移動させると光の雨が反応'
    },
    {
      type: 'video', 
      src: '/movies/move_triangle.mp4', 
      title: 'オーディオスペクトラム_動く地面',
      badges: ['TouchDesigner'],
      body: '入力された音響に反応して、地面の振幅範囲が変動'
    },
    {
      type: 'video',  
      src: '/movies/oilpaint.mp4', 
      title: '動く油絵',
      badges: ['TouchDesigner'],
      body: 'Lidarセンサー取得した距離データをもとに、オイルペイント風の画を作成できる'
    },
    {
      type: 'video',  
      src: '/movies/waving_stick.mp4',  
      title: '波立つ棒',
      badges: ['TouchDesigner'],
      body: 'Lidarセンサーやマウス位置を利用し、棒が波立つ'
    },
    {
      type: 'video',  
      src: '/movies/particle_noise.mp4', 
      title: 'パーティクル',
      badges: ['TouchDesigner'],
    },
    {
      type: 'video',  // 新しいタイプ
      src: '/movies/handtrack_paint.mp4', 
      title: 'ハンドトラッキングペイント',
      badges: ['TouchDesigner'],
      body: 'ハンドトラッキングツールを利用し、様々な手の動きでペイントできる'
    },
    {
      type: 'video',  // 新しいタイプ
      src: '/movies/sound_visu.mp4', 
      badges: ['TouchDesigner'],
      title: 'オーディオスペクトラム',
      body: 'オーディオ入力により、変形、色、光の強さが変化する'
    },
    {
      type: 'video',  // 新しいタイプ
      src: '/movies/model_wire.mp4', 
      title: '3Dモデルのワイヤー表現',
      badges: ['TouchDesigner'],
      body: '3Dモデルをワイヤーで表現し、回転させる'
    },
    {
      type: 'video',
      src: '/movies/particleGPU.mp4', 
      title: '3GPUを利用したパーティクル処理',
      badges: ['TouchDesigner'],
    },
    {
      type: 'video',  // 新しいタイプ
      src: '/movies/lidar_sea.mp4', 
      title: '波とボールのゲーム',
      badges: ['TouchDesigner'],
      body: '水の表現を作り、その中に光るボールを出現させ、タッチを促す。１歳児向けに開発'
    },
    {
      type: 'video',  // 新しいタイプ
      src: '/movies/three_01.mp4',
      title: 'Three.js_gravityBall',
      badges: ['Three.js'],
      body: 'Three.js で物理演算を使用し、マウスに反応するボールを作成。よりインタラクティブにwebサイトを楽しんでもらうための試み。'
    },
    {
      type: 'video',  // 新しいタイプ
      src: '/movies/three_02.mp4',
      title: 'Three.js_gravityBall',
      badges: ['Three.js', 'rapier'],
      body: 'Three.js で物理演算を使用し、スクロールにより重力、無重力の場を表現し、マウスに反応するボールを作成。よりインタラクティブにwebサイトを楽しんでもらうための試み。'
    },
    {
      type: 'video',  // 新しいタイプ
      src: '/movies/three_03.mp4',
      title: 'Three.js_Galaxy',
      badges: ['Three.js', 'rapier'],
      body: 'Three.jsでスピンしたラインにパーティクルを作成、調整し擬似的な銀河を表現。'
    },

  ]
}

const badgeClassMap = {
  'Ai': 'ai',
  'Ps': 'ps',
  'UE4': 'ue',
  '3dsMax': 'max',
  'Unity': 'unity',
  'Substance': 'substance',
  'C#': 'csharp',
  'TouchDesigner': 'touchdesigner',
  'Three.js': 'three',
}

function createCardHTML(item, index, modalKey) {
  let mediaHTML;
  
  if (item.type === 'youtube') {
    mediaHTML = `<iframe src="${item.src}" title="${item.title}" loading="lazy" allowfullscreen></iframe>`;
  } else if (item. type === 'video') {
    // ローカル動画用
    mediaHTML = `
      <video 
        class="card-video"
        src="${item.src}" 
        ${item.poster ? `poster="${item.poster}"` : ''}
        muted 
        loop 
        playsinline
        preload="metadata"
      ></video>`;
  } else {
    mediaHTML = `<img src="${item.src}" alt="${item. title}" loading="lazy" />`;
  }

  const badgesHTML = (item.badges || [])
    .map(b => {
      const cls = badgeClassMap[b] ?  ` ${badgeClassMap[b]}` : '';
      return `<span class="badge${cls}" data-tool="${b}">${b}</span>`;
    })
    .join('');

  return `
<article class="work-card" data-card>
  <div class="card-media" data-media-type="${item.type}">${mediaHTML}</div>
  <div class="card-panel" data-panel>
    <div class="panel-content-wrapper">
      <div class="panel-summary" data-summary>
        <h3 class="work-title">${item. title}</h3>
        <div class="badge-row">${badgesHTML}</div>
      </div>
      <div class="panel-details">
        <p class="meta">${item.meta || ''}</p>
        <p>${item.body || ''}</p>
      </div>
    </div>
  </div>
</article>`;
}

function setModalContent(modalKey) {
  const grid = document.getElementById('worksGrid')
  if (!grid) return
  const data = modalContentMap[modalKey]
  if (!data) {
    grid.innerHTML = '<p>コンテンツがありません。</p>'
    return
  }
  grid.innerHTML = data.map((item, i) => createCardHTML(item, i, modalKey)).join('')
  initWorkCards()
}

function runStagger() {
  const detailPage = document.querySelector('.detail-page')
  const cards = detailPage.querySelectorAll('.work-card')
  const baseDelay = 0.15, step = 0.08
  cards.forEach((card, i) => {
    card.classList.remove('stagger-in')
    card.style.transitionDelay = '0s'
    requestAnimationFrame(() => {
      card.style.transitionDelay = (baseDelay + i * step) + 's'
      card.classList.add('stagger-in')
    })
  })
}

const transitionOverlay = document.querySelector('.transition-overlay')
const detailPage = document.querySelector('.detail-page')
let lastButtonClickedPosition = { x: 0, y: 0 }
let pressedButton = null
let currentPointerId = null
let clickShrunk = false
let isOpeningModal = false

const viewMoreButtons = document.querySelectorAll('.view-more-btn')
viewMoreButtons.forEach(btn => {
  btn.addEventListener('pointerenter', () => {
    if (detailPage.classList.contains('is-visible')) return
    if (isOpeningModal) return
    if (!btn.classList.contains('is-plus-hidden')) btn.classList.add('is-plus-hover')
  })
  btn.addEventListener('pointerleave', () => {
    if (detailPage.classList.contains('is-visible')) return
    if (pressedButton === btn) return
    btn.classList.remove('is-plus-hover')
  })
  btn.addEventListener('pointerdown', e => {
    if (e.button !== 0) return
    if (detailPage.classList.contains('is-visible') || isOpeningModal) return
    btn.setPointerCapture(e.pointerId)
    pressedButton = btn
    currentPointerId = e.pointerId
    btn.classList.remove('is-plus-hover')
    btn.classList.add('is-plus-hidden')
    gsap.to(btn, {
      duration: 0.14,
      scale: 0.6,
      ease: 'power3.out',
      onStart: () => btn.classList.add('is-pressed'),
      onComplete: () => clickShrunk = true
    })
    const rect = btn.getBoundingClientRect()
    lastButtonClickedPosition.x = rect.left + rect.width / 2
    lastButtonClickedPosition.y = rect.top + rect.height / 2
  })
  btn.addEventListener('pointerup', e => {
    if (e.pointerId !== currentPointerId) return
    currentPointerId = null
    startOverlayExpand()
  })
  btn.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (detailPage.classList.contains('is-visible') || isOpeningModal) return
      pressedButton = btn
      btn.classList.remove('is-plus-hover')
      btn.classList.add('is-plus-hidden', 'is-pressed')
      gsap.to(btn, {
        duration: 0.14,
        scale: 0.7,
        ease: 'power3.out',
        onComplete: () => clickShrunk = true
      })
      const rect = btn.getBoundingClientRect()
      lastButtonClickedPosition.x = rect.left + rect.width / 2
      lastButtonClickedPosition.y = rect.top + rect.height / 2
      const onKeyUp = ku => {
        if (ku.key === e.key) {
          document.removeEventListener('keyup', onKeyUp)
          startOverlayExpand()
        }
      }
      document.addEventListener('keyup', onKeyUp)
    }
  })
})

document.addEventListener('pointerup', e => {
  if (!pressedButton) return
  if (currentPointerId && e.pointerId === currentPointerId) {
    currentPointerId = null
    startOverlayExpand()
  }
})

function startOverlayExpand() {
  if (!pressedButton || isOpeningModal) return
  isOpeningModal = true
  const modalKey = pressedButton.dataset.modal
  setModalContent(modalKey)
  if (!clickShrunk) {
    gsap.killTweensOf(pressedButton)
    gsap.set(pressedButton, { scale: 0.85 })
    clickShrunk = true
  }
  transitionOverlay.style.left = `${lastButtonClickedPosition.x - 25}px`
  transitionOverlay.style.top = `${lastButtonClickedPosition.y - 25}px`
  transitionOverlay.style.transformOrigin = 'center center'
  const maxLen = Math.max(window.innerWidth, window.innerHeight)
  const neededScale = (maxLen / 25) * 1.25
  gsap.fromTo(transitionOverlay,
    { scale: 0 },
    {
      scale: neededScale,
      duration: 0.55,
      ease:  'power2.out',
      onStart: () => transitionOverlay.classList.add('is-active'),
      onComplete: () => {
        detailPage.classList.add('is-visible')
        detailPage.scrollTop = 0
        runStagger()
        isOpeningModal = false
        
        // 動画を自動再生
        playAllVideosInModal()
      }
    }
  )
  
}

detailPage.addEventListener('wheel', e => {
  e.stopPropagation()
  const isAtBottom = detailPage.scrollTop + detailPage.clientHeight >= detailPage.scrollHeight - 5
  if (e.deltaY > 0 && isAtBottom) {
    closeDetailPage()
  }
})

/* ==============================
   モーダルのスクロールで閉じる処理
================================= */
detailPage.addEventListener('wheel', e => {
  e. stopPropagation()
  const isAtBottom = detailPage.scrollTop + detailPage.clientHeight >= detailPage.scrollHeight - 5
  if (e.deltaY > 0 && isAtBottom) {
    closeDetailPage()
  }
})

// モバイル用:  タッチでスクロール終端を検知して閉じる
let detailTouchStartY = null;

detailPage.addEventListener('touchstart', e => {
  if (! isMobile) return;
  e.stopPropagation(); // セクション移動のイベントに伝播させない
  detailTouchStartY = e.touches[0]. clientY;
}, { passive: false });

detailPage.addEventListener('touchmove', e => {
  if (!isMobile) return;
  e.stopPropagation(); // セクション移動のイベントに伝播させない
}, { passive: true });

detailPage.addEventListener('touchend', e => {
  if (!isMobile) return;
  e.stopPropagation(); // セクション移動のイベントに伝播させない
  if (detailTouchStartY === null) return;
  
  const touchEndY = e.changedTouches[0].clientY;
  const deltaY = detailTouchStartY - touchEndY; // 正の値 = 上にスワイプ（下にスクロール）
  
  const isAtBottom = detailPage.scrollTop + detailPage.clientHeight >= detailPage. scrollHeight - 10;
  
  // 下方向にスクロールしようとして、かつ一番下にいる場合
  if (deltaY > 30 && isAtBottom) {
    closeDetailPage();
  }
  
  detailTouchStartY = null;
}, { passive: true });

// モバイル用:  タッチでスクロール終端を検知して閉じる
// let detailTouchStartY = null;
let detailLastScrollTop = 0;

detailPage. addEventListener('touchstart', e => {
  if (! isMobile) return;
  detailTouchStartY = e.touches[0]. clientY;
  detailLastScrollTop = detailPage. scrollTop;
}, { passive: true });

detailPage. addEventListener('touchend', e => {
  if (!isMobile) return;
  if (detailTouchStartY === null) return;
  
  const touchEndY = e.changedTouches[0].clientY;
  const deltaY = detailTouchStartY - touchEndY; // 正の値 = 上にスワイプ（下にスクロール）
  
  const isAtBottom = detailPage.scrollTop + detailPage. clientHeight >= detailPage.scrollHeight - 10;
  
  // 下方向にスクロールしようとして、かつ一番下にいる場合
  if (deltaY > 30 && isAtBottom) {
    closeDetailPage();
  }
  
  detailTouchStartY = null;
}, { passive: true });

// スクロール中にも終端チェック（より確実に）
let scrollEndTimer = null;
detailPage.addEventListener('scroll', () => {
  if (! isMobile) return;
  
  clearTimeout(scrollEndTimer);
  scrollEndTimer = setTimeout(() => {
    const isAtBottom = detailPage.scrollTop + detailPage. clientHeight >= detailPage.scrollHeight - 10;
    if (isAtBottom) {
      // 一番下に到達したことを示す視覚的フィードバック（オプション）
      // ここでは次のスワイプで閉じる準備ができている状態
    }
  }, 100);
}, { passive: true });

function closeDetailPage() {
  if (isOpeningModal || !detailPage.classList.contains('is-visible')) return
  isOpeningModal = true
  pauseAllVideosInModal()
  detailPage.classList.remove('is-visible')
  detailPage.querySelectorAll('.work-card').forEach(c => {
    c.classList.remove('stagger-in')
    c.style.transitionDelay = '0s'
  })
  gsap.to(transitionOverlay, {
    scale: 0,
    duration: 0.35,
    ease: 'power2.inOut',
    onComplete: () => {
      transitionOverlay.classList.remove('is-active')
      if (pressedButton) {
        gsap.set(pressedButton, { scale: 1 })
        pressedButton.classList.remove('is-pressed', 'is-plus-hidden', 'is-plus-hover')
      }
      pressedButton = null
      clickShrunk = false
      isOpeningModal = false
    }
  })
}

function playAllVideosInModal() {
  const videos = detailPage.querySelectorAll('.card-video')
  videos.forEach(video => {
    video.play().catch(err => {
      console.log('Video autoplay was prevented:', err)
    })
  })
}

function pauseAllVideosInModal() {
  const videos = detailPage.querySelectorAll('.card-video')
  videos.forEach(video => {
    video.pause()
    video.currentTime = 0
  })
}

function initWorkCards() {
  const cards = Array.from(document.querySelectorAll('[data-card]'));
  if (!cards.length) return;
  cards.forEach(card => {
    if (card._initialized) return;
    const details = card.querySelector('.panel-details');
    if (details) details.hidden = false;
    card.classList.add('expanded');
    card._initialized = true;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initWorkCards()
})

function animateSectionTextOut(sectionEl) {
  if (!sectionEl) return null;
  const key = sectionEl. id || sectionEl;
  const items = sectionSplits. get(key);
  
  const tl = gsap.timeline();
  tl.addLabel('out');

  // SplitTextで処理された要素のアニメーション
  if (items) {
    items.forEach((item, idx) => {
      const at = idx === 0 ?  'out' : `out+=${idx * 0.05}`;

      if (item.isParagraph) {
        tl.to(
          item.split. lines,
          {
            yPercent: -110,
            opacity:  0,
            duration: 0.6,
            ease:  'power2.in',
            stagger: 0.08
          },
          at
        );
      } else {
        tl. to(
          item.split.chars,
          {
            yPercent:  -110,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.in',
            stagger:  0.04
          },
          at
        );
      }
    });
  }

  // section5のcontact-containerを同時にフェードアウト
  if (sectionEl. id === 'section5') {
    const contactContainer = sectionEl.querySelector('.contact-container');
    if (contactContainer) {
      tl.to(
        contactContainer,
        {
          opacity: 0,
          y: -30,
          duration:  0.5,
          ease:  'power2.in'
        },
        'out' // h1と同じタイミングで開始
      );
    }
  }

  return tl;
}

/* ==============================
   Contact Form Handler
================================= */
const contactForm = document. querySelector('.contact-form');

if (contactForm) {
  contactForm. addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = contactForm.querySelector('.submit-btn');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<span>送信中...</span>';
    btn.disabled = true;
    
    try {
      const response = await fetch(contactForm.action, {
        method:  'POST',
        body: new FormData(contactForm),
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        btn.innerHTML = '<span>送信完了！ ✓</span>';
        contactForm.reset();
        
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.disabled = false;
        }, 3000);
      } else {
        throw new Error('送信に失敗しました');
      }
    } catch (error) {
      btn.innerHTML = '<span>エラー ✗</span>';
      
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }, 3000);
    }
  });
}