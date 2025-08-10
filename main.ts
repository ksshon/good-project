// SpriteKind
namespace SpriteKind {
    export let Camera = SpriteKind.create()
    export let Grass = SpriteKind.create()
}

// Parameters
const PLAYER_GRAVITY = 550
const PLAYER_JUMP_STRENGTH = 200
const PLAYER_VX_DIVIDER = 1.5
const PLAYER_ANIM_INTERVAL = 500
const PLAYER_AX = 200
const PLAYER_AIR_VX = 80
const PLAYER_GROUND_VX = 30
const PLAYER_SQUISH_INTERVAL = 200

const CAMERA_SPEED = 2

const GRASS_AMOUNT = 200
const FLOWER_AMOUNT = 75

// Variable/Array Declaration
let grassImages = [assets.image`grass1`, assets.image`grass2`]
let flowerImages = [assets.image`flower1`, assets.image`flower2`, assets.image`flower3`, assets.image`flower4`, assets.image`flower5`]

let playerLadderMovementOverride = false

// Game Initialization
scene.setBackgroundImage(assets.image`background`)
tiles.setCurrentTilemap(assets.tilemap`tilemap`)
let loading = sprites.create(assets.image`loading`, SpriteKind.Player)

// Grass!
pause(1)
spawnFoliage(grassImages, GRASS_AMOUNT, 20)
spawnFoliage(flowerImages, FLOWER_AMOUNT, 17)

// Player Sprite
let player = sprites.create(assets.image`playerImage`, SpriteKind.Player)
player.z = 0
player.ay = PLAYER_GRAVITY
tiles.placeOnTile(player, tiles.getTileLocation(0, 30))

// Camera
let cameraObject = sprites.create(img`.`, SpriteKind.Camera)
tiles.placeOnTile(cameraObject, tiles.getTileLocation(0, 20))
scene.cameraFollowSprite(cameraObject)

// Functions
function setPlayerAX() {
    if (player.vx == 0) {
        player.ax = 0
    } else if (player.vx > 0) {
        player.ax = -PLAYER_AX
    } else if (player.vx < 0) {
        player.ax = PLAYER_AX
    }
}
function setPlayerControls() {
    if (playerLadderMovementOverride == true) {
        return;
    }
    if (player.isHittingTile(CollisionDirection.Bottom)) {
        controller.moveSprite(player, PLAYER_GROUND_VX, 0)
    } else {
        controller.moveSprite(player, PLAYER_AIR_VX, 0)
    }
}
function playerBounce() {
    animation.runImageAnimation(player, assets.animation`playerSquish`, PLAYER_SQUISH_INTERVAL, false)
    pause(PLAYER_SQUISH_INTERVAL)
    player.vy = -PLAYER_JUMP_STRENGTH
    player.startEffect(effects.ashes, 50)
}

function spawnFoliage(images: Array<Image>, amount: number, yOffset: number) {
    for (let i = 0; i < (randint(amount - 5, amount + 5)); i++) {
        let locationX = randint(0, 47)
        let grass = sprites.create(images[randint(0, images.length - 1)], SpriteKind.Grass)
        grass.setScale(randint(0.5, 0.9))
        tiles.placeOnTile(grass, tiles.getTileLocation(locationX, 0))
        while (grass.tileKindAt(TileDirection.Bottom, assets.tile`blankTile`)) {
            grass.y += 3
        }
        if (grass.tileKindAt(TileDirection.Bottom, assets.tile`ground1`) || grass.tileKindAt(TileDirection.Bottom, assets.tile`ground2`) || grass.tileKindAt(TileDirection.Bottom, assets.tile`ground3`) || grass.tileKindAt(TileDirection.Bottom, assets.tile`floatingMiddle1`) || grass.tileKindAt(TileDirection.Bottom, assets.tile`floatingMiddle2`)) {
            grass.x += randint(-5, 5)
        }
        grass.y += yOffset
        grass.z = randint(0, 1)
    }
}

// Game Events
game.onUpdate(function() {
    setPlayerAX()
    setPlayerControls()
})

game.onUpdateInterval(200, function () {
    cameraObject.setVelocity(CAMERA_SPEED * (player.x - cameraObject.x), CAMERA_SPEED * (player.y - cameraObject.y))
})

forever(function() {
    if (player.isHittingTile(CollisionDirection.Bottom)) {
         playerBounce()
     }
     pause(20)
})

scene.onOverlapTile(SpriteKind.Player, assets.tile`ladder`, function() {
    if (player.tileKindAt(TileDirection.Center, assets.tile`ladder`)) {
        playerLadderMovementOverride = true
        controller.moveSprite(player, 100, 100)
        player.ay = 20
    } else {
        playerLadderMovementOverride = false
        controller.moveSprite(player, PLAYER_AIR_VX, 0)
        if (controller.up.isPressed()) {
            player.vy = -200
        }
        player.ay = PLAYER_GRAVITY
    }
})