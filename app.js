import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader' 
import GUI from 'lil-gui'
import gsap from 'gsap'
import fragmentShader from './shaders/fragment.glsl'
import vertexShader from './shaders/vertexParticles.glsl'
 
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer'
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass'
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass'
import {GlitchPass} from 'three/examples/jsm/postprocessing/GlitchPass'
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass'

import { CustomPass } from './CustomPass'


import dna from './dna-02.glb'

export default class Sketch {
	constructor(options) {
		
		this.scene = new THREE.Scene()
		
		this.container = options.dom
		
		this.width = this.container.offsetWidth
		this.height = this.container.offsetHeight
		
		
		// // for renderer { antialias: true }
		this.renderer = new THREE.WebGLRenderer({ antialias: true })
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
		this.renderTarget = new THREE.WebGLRenderTarget(this.width, this.height)
		this.renderer.setSize(this.width ,this.height )
		this.renderer.setClearColor(0x000000, 1)
		this.renderer.useLegacyLights = true
		this.renderer.outputEncoding = THREE.sRGBEncoding
 

		 
		this.renderer.setSize( window.innerWidth, window.innerHeight )

		this.container.appendChild(this.renderer.domElement)
 


		this.camera = new THREE.PerspectiveCamera( 70,
			 this.width / this.height,
			 0.01,
			 100
		)
 
		this.camera.position.set(0, 0, 4) 
		this.controls = new OrbitControls(this.camera, this.renderer.domElement)
		this.time = 0


		this.dracoLoader = new DRACOLoader()
		this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
		this.gltf = new GLTFLoader()
		this.gltf.setDRACOLoader(this.dracoLoader)






		this.isPlaying = true


		this.gltf.load(dna, gltf => {
		 
			// this.scene.add(gltf.scene)
 

			this.geometry = gltf.scene.children[0].geometry

			this.geometry.center()
			this.settings()
			this.initpost()
			this.addObjects()		 
			this.resize()
			
			this.setupResize()
		 
			this.render()
			
		})	



 

 
	}

	initpost() {
		this.renderScene = new RenderPass(this.scene, this.camera)
	
		this.bloomPass = new UnrealBloomPass(new THREE.Vector2(this.width, this.height), 1.4, 0.87, 0.01)
 

		this.composer = new EffectComposer(this.renderer)
		this.composer.addPass(this.renderScene)
		 


		this.effect1 = new ShaderPass(CustomPass)
		this.composer.addPass(this.effect1)
		this.composer.addPass(this.bloomPass)


	}

	settings() {
		let that = this
		this.settings = {
			progress: 0,
			bloomThreshold: 0.6,
			bloomStrength: .87,
			bloomRadius: 0.01
		}
		this.gui = new GUI()
		this.gui.add(this.settings, 'progress', 0, 1, 0.01)
		this.gui.add(this.settings, 'bloomThreshold', 0, 1, 0.01)
		this.gui.add(this.settings, 'bloomStrength', 0, 1, 0.01)
		this.gui.add(this.settings, 'bloomRadius', 0, 1, 0.01)

	}

	setupResize() {
		window.addEventListener('resize', this.resize.bind(this))
	}

	resize() {
		this.width = this.container.offsetWidth
		this.height = this.container.offsetHeight
		this.renderer.setSize(this.width, this.height)
		this.composer.setSize(this.width, this.height)

		this.camera.aspect = this.width / this.height


		// this.imageAspect = 853/1280
		// let a1, a2
		// if(this.height / this.width > this.imageAspect) {
		// 	a1 = (this.width / this.height) * this.imageAspect
		// 	a2 = 1
		// } else {
		// 	a1 = 1
		// 	a2 = (this.height / this.width) / this.imageAspect
		// } 


		// this.material.uniforms.resolution.value.x = this.width
		// this.material.uniforms.resolution.value.y = this.height
		// this.material.uniforms.resolution.value.z = a1
		// this.material.uniforms.resolution.value.w = a2

		this.camera.updateProjectionMatrix()



	}


	addObjects() {
		let that = this
		this.material = new THREE.ShaderMaterial({
			extensions: {
				derivatives: '#extension GL_OES_standard_derivatives : enable'
			},
			side: THREE.DoubleSide,
			uniforms: {
				time: {value: 0},
				uColor1: {value: new THREE.Color(0x612574)},
				uColor2: {value: new THREE.Color(0x293583)},
				uColor3: {value: new THREE.Color(0x1954ec)},
				resolution: {value: new THREE.Vector4()},
				progress: {value: 0}
			},
			vertexShader,
			fragmentShader,
			transparent: true,
			depthTest:false,
			depthWrite: false,
			blending: THREE.AdditiveBlending
		})
		
		this.number = this.geometry.attributes.position.array.length
 
		this.number  = 180000

 



		let positions = new Float32Array(this.number )
		let randoms = new Float32Array(this.number / 3)

		let colorRandoms = new Float32Array(this.number / 3)
		let animationOffset = new Float32Array(this.number / 3)



		let row = 100

		for (let i = 0; i < this.number / 3; i++) {
			randoms.set([Math.random()], i)
			colorRandoms.set([Math.random()], i)

			 



			let theta = 0.002 * Math.PI * 2 * (Math.floor(i / 100))
			let radius = 0.03 * ((i % 100) - 50)


			animationOffset.set([(i % 100) / 100], i)
			animationOffset.set([
				Math.floor(i /100) /600
			], i)



			let x = radius * Math.cos(theta)
			let z = radius * Math.sin(theta)
			let y = 0.01 * (Math.floor(i / 100)) - 2



			positions.set([x,y,z], i * 3)
		}

		// this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
		this.geometry.setAttribute('randoms', new THREE.BufferAttribute(randoms, 1))
		this.geometry.setAttribute('offset', new THREE.BufferAttribute(animationOffset, 1))

		this.geometry.setAttribute('colorRandoms', new THREE.BufferAttribute(colorRandoms, 1))



		// this.geometry = new THREE.PlaneGeometry(1,1,10,10)
		this.dna = new THREE.Points(this.geometry, this.material)
 
		this.scene.add(this.dna)
 
	}



	addLights() {
		const light1 = new THREE.AmbientLight(0xeeeeee, 0.5)
		this.scene.add(light1)
	
	
		const light2 = new THREE.DirectionalLight(0xeeeeee, 0.5)
		light2.position.set(0.5,0,0.866)
		this.scene.add(light2)
	}

	stop() {
		this.isPlaying = false
	}

	play() {
		if(!this.isPlaying) {
			this.isPlaying = true
			this.render()
		}
	}

	render() {
		if(!this.isPlaying) return
		this.time += 0.05
		this.material.uniforms.time.value = this.time
		this.material.uniforms.progress.value = this.settings.progress

		this.dna.rotation.y = this.time / 25



		this.bloomPass.threshold = this.settings.bloomThreshold;
		this.bloomPass.strength = this.settings.bloomStrength;
		this.bloomPass.radius = this.settings.bloomRadius;


		//this.renderer.setRenderTarget(this.renderTarget)
		// this.renderer.render(this.scene, this.camera)
		//this.renderer.setRenderTarget(null)

		this.composer.render()
 
		requestAnimationFrame(this.render.bind(this))
	}
 
}
new Sketch({
	dom: document.getElementById('container')
})
 