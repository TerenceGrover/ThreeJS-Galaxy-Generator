import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { AdditiveBlending, CurveUtils, PointLightShadow } from 'three'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

//Textures
const texLoad = new THREE.TextureLoader()
const star = texLoad.load('./textures/particles/1.png')

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

//Galaxy
const param = {
    count : 10000, 
    radius : 3, 
    size:.05, 
    branches : 3, 
    curve : 1.5, 
    randomness : .6, 
    randPower : 3, 
    inColor : '#ff6030', 
    outColor : '#1b3983'
}
let[geometry, material,points] = [null,null,null]

const generateGalaxy = () =>{

    if(geometry != null){
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }

    geometry = new THREE.BufferGeometry()

    const positions = new Float32Array(param.count * 3)
    const colors = new Float32Array(param.count * 3)
    const inCol = new THREE.Color(param.inColor)
    const outCol = new THREE.Color(param.outColor)

    for(let i = 0; i <param.count; i++){
        let j = i * 3

        // Position
        const radius = Math.random() * param.radius
        const angle = ((i % param.branches) / param.branches) * Math.PI * 2
        const curve = radius * param.curve

        const randomX = Math.pow((Math.random()), param.randPower) * (Math.random() < .5 ? 1 : -1) * param.randomness * radius
        const randomY = Math.pow((Math.random()), param.randPower) * (Math.random() < .5 ? 1 : -1) * param.randomness * radius
        const randomZ = Math.pow((Math.random()), param.randPower) * (Math.random() < .5 ? 1 : -1) * param.randomness * radius

        positions[j] = radius * Math.cos(angle + curve) + randomX
        positions[j+1] = randomY
        positions[j+2] = radius * Math.sin(angle + curve)  + randomZ

        // Color
        const midCol = inCol.clone()
        midCol.lerp(outCol , (radius / param.radius) + (Math.random()-0.5) * 1.1)

        colors[j] = midCol.r
        colors[j + 1] = midCol.g
        colors[j + 2] = midCol.b
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions,3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors,3))

    //Material
    material = new THREE.PointsMaterial({
        map : star,
        size : param.size,
        sizeAttenuation : true,
        depthWrite:false,
        blending : THREE.AdditiveBlending,
        vertexColors : true,
    })

    points = new THREE.Points(
        geometry,
        material
    )

scene.add(points)
}

gui.add(param, 'count',0,25000,10).onFinishChange(generateGalaxy)
gui.add(param, 'size',0.001,0.1,0.001).onFinishChange(generateGalaxy)
gui.add(param, 'radius', .01,20,.01).onFinishChange(generateGalaxy)
gui.add(param, 'branches', 1,10,1).onFinishChange(generateGalaxy)
gui.add(param, 'curve', -3, 3,.001).onFinishChange(generateGalaxy)
gui.add(param, 'randomness', 0, 2,.001).onFinishChange(generateGalaxy)
gui.add(param, 'randPower', 1, 10,.1).onFinishChange(generateGalaxy)
gui.addColor(param, 'inColor').onFinishChange(generateGalaxy)
gui.addColor(param, 'outColor').onFinishChange(generateGalaxy)

generateGalaxy()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.01, 120)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // animation
    points.rotation.y =  - elapsedTime * .05
    points.rotation.x =  Math.cos(elapsedTime) * .005

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()