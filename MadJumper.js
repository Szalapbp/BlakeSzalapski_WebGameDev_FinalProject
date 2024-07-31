console.log('script is running');
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
        preload,
        create, 
        update
    },
    physics:{
        default: "arcade",
        arcade: {
            gravity:{y: 1000}
        }
    }
};

const game = new Phaser.Game(config);
let player;
let enemy;
let egg;
let startingPlatform;
let platforms;
let cursors;
let keys ={};
let camera;
let gameStarted = false;
let gameOverText;
let platformHeight = 20;
let spacing = 150;
let lastPlatformY = 0;
let previousY = 0;





function preload(){
    this.load.image('goose', 'Assets/Jump.png');
    this.load.image('egg', 'Assets/Egg.png');
    this.load.image('platform', 'Assets/Platform.png');
    this.load.spritesheet('blast', 'Assets/EggBlast.png');
};

function create(){
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

    platforms = this.physics.add.staticGroup();

    createInitialPlatforms.call(this);

    
    player.setCollideWorldBounds(true);
    
    cursors = this.input.keyboard.createCursorKeys();
    keys.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    keys.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    //collision for player and the different platforms
    this.physics.add.collider(player, startingPlatform, playerBounce, null, this); 
    this.physics.add.collider(player, platforms, playerBounce, null, this);

    //Camera that follows the players highest point
    camera = this.cameras.main;
    camera.setBounds(0, 0, config.width, worldHeight);
    

    previousY = player.y

    gameOverText = this.add.text(
        this.physics.world.bounds.width / 2,
        highestY,
        'GAME OVER',{
            fontSize: '64px'
        }

    )
    gameOverText.setVisible(false);
    gameOverText.setOrigin(.5);

};

//makes the player bounce off of the platforms at a set velocity
function playerBounce(player, platform){
    player.setVelocityY(-550);
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
    return platform;

}

//Extends the height of the world as the player progresses upward ont he platforms.
function extendWorldBounds() {
   let extendAmount = config.height;
   worldTop -= extendAmount;
   worldHeight += extendAmount;

   this.physics.world.setBounds(0, worldTop, config.width, worldHeight);
   camera.setBounds(0, worldTop, config.width, worldHeight);

   addNewPlatforms.call(this);
}



function update(){
if(!gameStarted){
    gameStarted = true;
}
player.body.setVelocityX(0);
if(cursors.right.isDown || keys.d.isDown){
    player.body.setVelocityX(200);
}
if(cursors.left.isDown || keys.a.isDown){
    player.body.setVelocityX(-200);
}


 let targetCameraY = highestY - 400;
    camera.scrollY = targetCameraY;

    console.log(`Highest Y: ${highestY}`);
    console.log(`player y: ${player.y}`);

    if (player.y < highestY || highestY === 0){
        highestY = player.y;
    }

if (player.y < camera.scrollY + config.height / 4 ) {
    extendWorldBounds.call(this);
}

let currentMaxPlatformY = platforms.getChildren().reduce((max, platform) => Math.max(max, platform.y), 0);
if (player.y < currentMaxPlatformY - spacing) {
    extendWorldBounds.call(this);
}

previousY = player.y;


if(player.y >= highestY + 250){
    gameOverText.setVisible(true);
    player.setVelocityY(0);
}
}



//Function called to randomly place the addPlatform function results at
//specified distances from eachother as the player moves up.

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

