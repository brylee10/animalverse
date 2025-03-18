enum SpriteType {
  Flappy = "flappy",
  Zelda = "zelda",
  Sonic = "sonic",
  Pikachu = "pikachu",
  Mario = "mario",
  Kirby = "kirby",
  Tiger = "tiger",
  Bird = "bird",
  Ant = "ant",
  Cow = "cow",
  Fish = "fish",
}

interface ShowSpriteMessage {
  action: "showSprite";
  sprite: SpriteType;
  animalCnt: number;
  speed: number;
  movement: Movement;
  height: number;
}

interface UpdateAlarmsMessage {
  action: "updateAlarms";
}

type Message = ShowSpriteMessage | UpdateAlarmsMessage;

enum Movement {
  AroundScreen = "aroundScreen",
  Bottom = "bottom",
  Top = "top",
}

interface Position {
  x: number;
  y: number;
}

interface EdgePositions {
  start: Position;
  end: Position;
}

interface SyncStorage {
  sprite: SpriteType;
  startTime: string;
  endTime: string;
  intervalMinutes: number;
  animalCnt: number;
  spriteverseOn: boolean;
  speed: number;
  height: number;
  movement: Movement;
  nextAppearanceSec: number;
}

const NEXT_APPEARANCE_SEC_KEY = "nextAppearanceSec";

const allSyncKeys: (keyof SyncStorage)[] = [
  "sprite",
  "startTime",
  "endTime",
  "intervalMinutes",
  "animalCnt",
  "spriteverseOn",
  "speed",
  "movement",
  "height",
  NEXT_APPEARANCE_SEC_KEY,
];

const ALARM_NAME = "animal_appearance";
const DEFAULT_INTERVAL_MINUTES = 5;

const defaultSyncStorage: SyncStorage = {
  sprite: SpriteType.Flappy,
  startTime: new Date().toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }),
  endTime: "",
  intervalMinutes: DEFAULT_INTERVAL_MINUTES,
  animalCnt: 5,
  spriteverseOn: true,
  speed: 100,
  movement: Movement.AroundScreen,
  height: 50,
  nextAppearanceSec: DEFAULT_INTERVAL_MINUTES * 60,
};

interface SpriteConfig {
  width: number;
  height: number;
  frames: number;
  frameRate: number;
  spriteUrl: string;
}

// Map sprite types to their configurations
const animalConfigs: Record<SpriteType, SpriteConfig> = {
  [SpriteType.Flappy]: {
    width: 34,
    height: 24,
    frames: 3,
    frameRate: 6,
    spriteUrl: "src/assets/flappy.svg",
  },
  [SpriteType.Tiger]: {
    width: 74,
    height: 45,
    frames: 7,
    frameRate: 15,
    spriteUrl: "src/assets/tiger.svg",
  },
  [SpriteType.Bird]: {
    // 0.7 aspect ratio
    width: 36,
    height: 52,
    frames: 10,
    frameRate: 12,
    spriteUrl: "src/assets/bird.svg",
  },
  [SpriteType.Ant]: {
    width: 57,
    height: 50,
    frames: 4,
    frameRate: 12,
    spriteUrl: "src/assets/ant.svg",
  },
  [SpriteType.Cow]: {
    width: 69,
    height: 50,
    frames: 8,
    frameRate: 15,
    spriteUrl: "src/assets/cow.svg",
  },
  [SpriteType.Fish]: {
    width: 109,
    height: 50,
    frames: 11,
    frameRate: 11,
    spriteUrl: "src/assets/fish.svg",
  },
  [SpriteType.Zelda]: {
    width: 55.9,
    height: 60,
    frames: 10,
    frameRate: 11,
    spriteUrl: "src/assets/zelda.svg",
  },
  [SpriteType.Sonic]: {
    width: 41,
    height: 50,
    frames: 22,
    frameRate: 15,
    spriteUrl: "src/assets/sonic.svg",
  },
  [SpriteType.Pikachu]: {
    width: 60,
    height: 44,
    frames: 4,
    frameRate: 11,
    spriteUrl: "src/assets/pikachu.svg",
  },
  [SpriteType.Mario]: {
    width: 53.25,
    height: 50,
    frames: 4,
    frameRate: 12,
    spriteUrl: "src/assets/mario.svg",
  },
  [SpriteType.Kirby]: {
    width: 33.2,
    height: 39,
    frames: 17,
    frameRate: 12,
    spriteUrl: "src/assets/kirby.svg",
  },
};

export {
  SpriteType,
  Movement,
  Message,
  SyncStorage,
  allSyncKeys,
  ShowSpriteMessage,
  UpdateAlarmsMessage,
  defaultSyncStorage,
  Position,
  EdgePositions,
  SpriteConfig,
  animalConfigs,
  ALARM_NAME,
  NEXT_APPEARANCE_SEC_KEY,
};
