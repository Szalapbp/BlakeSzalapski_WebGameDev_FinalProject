
let initialWorldHeight = 640 * 10;
let worldHeight = initialWorldHeight;
let worldTop = 0;
let highestY = 0;

const config ={
    type: Phaser.AUTO,
    parent: 'game', 
    width: 400, 
    height: 640, 
    scale:{
        mode:Phaser.Scale.NONE, 
        autoCenter: Phaser.Scale.CENTER_BOTH
    }, 
    scene: {
        key: 'MadJumper',
        preload,
        create, 
        update
    },
    physics:{
        default: "arcade",
        arcade: {
            gravity:{y: 1000}//this is the gravity level I saw most fit for the game, it helps the movements stay quick and allows the game to be a bit more challenging
        }
    }
};

const game = new Phaser.Game(config);
let player;
let hazard;
let startingPlatform;
let platforms;
let cursors;
let keys ={};
let camera;
let gameOver = false;
let gameOverText;
let platformHeight = 20;
let spacing = 150;
let lastPlatformY = 0;
let previousY = 0;
let hazardSpacing = Phaser.Math.Between(100, 150 );
let platformCounter = 0;
let platformCounterText;
let jumpSFX;
let explosionSFX;





function preload(){
    this.load.image('goose', 'Assets/Jump.png');
    this.load.image('egg', 'Assets/Egg.png');
    this.load.image('platform', 'Assets/Platform.png');
    this.load.spritesheet('blast', 'Assets/EggBlast.png', {
        frameWidth: 64, frameHeight: 64
    });
    this.load.audio('jumpSFX', 'Assets/jumpSFX.mp3');
    this.load.audio('explosionSFX', 'Assets/Explosion.mp3');
};

function create(){

   //player sprite
    player = this.physics.add.sprite(
        this.physics.world.bounds.width / 2,
        this.physics.world.bounds.height -45,
        'goose'
    );
   

    //static platform that the player always spawns on
    startingPlatform = this.physics.add.staticSprite(
        this.physics.world.bounds.width / 2,
        this.physics.world.bounds.height - 10,
        'platform'
    )
//Explosion animation
    this.anims.create({
        key:'EggExplosion',
        frames: this.anims.generateFrameNumbers('blast'),
        frameRate: 15,
        repeat: 0
    });

    jumpSFX = this.sound.add('jumpSFX');
    explosionSFX = this.sound.add('explosionSFX');

    platforms = this.physics.add.staticGroup();
    hazards = this.physics.add.group();

    createInitialPlatforms.call(this);

    
    player.setCollideWorldBounds(true);
    
    cursors = this.input.keyboard.createCursorKeys();
    keys.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    keys.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    //collision for player and the different platforms and hazards
    this.physics.add.collider(player, startingPlatform, playerBounce, null, this); 
    this.physics.add.collider(player, platforms, playerBounce, null, this);
    this.physics.add.collider(player, hazards, hazardCollision, null, this);

    //Camera that follows the players highest point
    camera = this.cameras.main;
    camera.setBounds(0, 0, config.width, worldHeight);
    

    previousY = player.y
//container for the game over text when the player loses
    gameOverText = this.add.text(
        config.width / 2,
        camera.scrollY,
        'GAME OVER',{
            fontSize: '64px'
        }
    )
//text container for the level text
    platformCounterText = this.add.text(
        10,
        10, 
        'Levels: 0',
        {
            fontSize: '32px'
        }
    );
    platformCounterText.setScrollFactor(0);


    gameOverText.setVisible(false);
    gameOverText.setOrigin(.5);

    highestY = player.y;

    

};

//makes the player bounce off of the platforms at a set velocity
function playerBounce(player, platform){
    player.setVelocityY(-550);
    if(!gameOver){
        jumpSFX.play();
    }
}

//creates the initial platforms which the player spawns on so that the player
//does not spawn mid air.
function createInitialPlatforms(){
    lastPlatformY = config.height - spacing;
    for(let i = 0; i < 3; i++){
        let x = Phaser.Math.Between(50, config.width - 50);
        let y = lastPlatformY;
        addPlatform.call(this, x, y);
    }
   
}

//creates a blueprint for the platforms that are randomly generated and placed
//in a later function.
function addPlatform(x, y, width = 30){
    let platform = platforms.create(x, y, 'platform');
    let scale = width / platform.width;
    platform.setScale(scale, 1);
    platform.body.setOffset(0, 0)
    platform.refreshBody();
    platform.setSize(width, platformHeight);
    platform.setImmovable(true);
    platform.body.allowGravity = false;
    platform.setVisible(true);
    lastPlatformY = y;
    platform.body.checkCollision.down = false;
    return platform;

}
//function that places new platforms every given amount of y distance
function addNewPlatforms(){
    let currentY = lastPlatformY;
    while (currentY > worldTop){
        let platformCount = Phaser.Math.Between(1, 2);
        let platformPositions =[];
    
        for(let i = 0; i < platformCount; i++){
            let x;
            do{
                x = Phaser.Math.Between(50, config.width - 50);
            }
            while (platformPositions.some(pos => Math.abs(pos - x) < 100));
            platformPositions.push(x);
            addPlatform.call(this, x, currentY);
        }
        currentY -= spacing
    }
    lastPlatformY = currentY + spacing;
    }
//function for the blueprint of the eggs, this is later used by the addNewEggs function to place them
function addEgg(x, y){
    let hazard = hazards.create(x, y, 'egg');
    hazard.setSize(32,32);
    hazard.setImmovable(true);
    hazard.body.allowGravity = false;
    hazard.setVisible(true);
    return hazard;
}
//function for the addition of new explosive eggs on the map, generated very similarly to how the platforms are generated only at verying y spacing as well
function addNewEggs(){
    for(let i = 0; i < Phaser.Math.Between(1,3); i++){
    let currentY = lastPlatformY;
    while (currentY > worldTop){
        let x = Phaser.Math.Between(50, config.width - 50);
        addEgg.call(this, x, currentY);
        currentY -= hazardSpacing;
    }
    }
}

//Extends the height of the world as the player progresses upward ont he platforms.
function extendWorldBounds() {
   let extendAmount = config.height;
   worldTop -= extendAmount;
   worldHeight += extendAmount;

   this.physics.world.setBounds(0, worldTop, config.width, worldHeight);
   camera.setBounds(0, worldTop, config.width, worldHeight);

   addNewPlatforms.call(this);
   addNewEggs.call(this);
}

//destroys the player and the egg on impact as well as freezes the players position and plays the eggexplosion animation. This then sends you to the game over screen
function hazardCollision(player, hazard){
let blast = this.add.sprite(hazard.x, hazard.y, 'blast').play('EggExplosion');
blast.once('animationcomplete', () => blast.destroy());

hazard.destroy();
player.setVisible(false);
player.setVelocity(0);
player.setPosition(-200, -200);
player.setVelocityX(0);
player.setVelocityY(0);
player.setAccelerationX(0);
player.setAccelerationY(0);
player.allowGravity = false;
explosionSFX.play();


gameOverText.setVisible(true);
}



//surrounded this in the gameOver boolean so that it freezes the appropriate functions on game over.
function update(){
if(!gameOver){
    
//initializing the velocity for pressing directional keys
player.body.setVelocityX(0);
if(cursors.right.isDown || keys.d.isDown){
    player.body.setVelocityX(200);
}
if(cursors.left.isDown || keys.a.isDown){
    player.body.setVelocityX(-200);
}

//tracks the player, whenever the player goes above the highestY variable that it set previously, the camera begins to move up again with the character. It will not move down.
 let targetCameraY = highestY - 400;
    camera.scrollY = targetCameraY;

    if (player.y < highestY || highestY === 0){
        highestY = player.y;
    }

if (player.y < camera.scrollY + config.height / 4 ) {
    extendWorldBounds.call(this);
}

//generates more platforms as the player moves up in the world.
let currentMaxPlatformY = platforms.getChildren().reduce((max, platform) => Math.max(max, platform.y), 0);
if (player.y < currentMaxPlatformY - spacing) {
    extendWorldBounds.call(this);
}

previousY = player.y;

//counts the levels that the character has gone up based off of the spacing between the platforms vertically which is always the same.

let level = Math.floor(config.height - highestY / spacing);
    if(platformCounter < level){
        platformCounter = level;
        platformCounterText.setText('levels: ' + (platformCounter - 636));
    }

//game over upon player falling off of the screen. When the player falls off of the camera it sends you to game over and freezes the character.

if(player.y >= highestY + 250){
    gameOver = true;
    gameOverText.setVisible(true);
    player.setVisible(false);
    player.setVelocity(0);
    player.setPosition(player.x, player.y);
    player.setVelocityX(0);
    player.setVelocityY(0);
    player.setAccelerationX(0);
    player.setAccelerationY(0);
    player.allowGravity = false;
    gameOverText.setPosition(camera.scrollX + config.width / 2, camera.scrollY + config.height / 2);
    jumpSFX.stop();
    
    return;
}
}
}