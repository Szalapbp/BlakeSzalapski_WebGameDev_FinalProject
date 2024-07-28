console.log('script is running');
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
            gravity:{y: 300}
        }
    }
};

const game = new Phaser.Game(config);
let player;
let enemy;
let egg;
let rngPlatform;
let platform;
let cursors;
let keys ={};
let gameStarted = false;
let gameOverText;


function preload(){
    this.load.image('goose', 'Assets/Jump.png');
    this.load.image('egg', 'Assets/Egg.png');
    this.load.image('platform', 'Assets/Platform.png');
};

function create(){
    player = this.physics.add.sprite(
        this.physics.world.bounds.width / 2,
        this.physics.world.bounds.height -45,
        'goose'
    );

    platform = this.physics.add.staticSprite(
        this.physics.world.bounds.width / 2,
        this.physics.world.bounds.height - 10,
        'platform'
    )

    
    player.setCollideWorldBounds(true);
    
    cursors = this.input.keyboard.createCursorKeys();
    keys.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    keys.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.physics.add.collider(player, platform, playerBounce, null, this); 

};

function playerBounce(player){
    player.setVelocityY(-300);
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

};