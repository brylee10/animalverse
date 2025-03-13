enum AnimalType {
  Flappy = "flappy",
  Tiger = "tiger",
  Bird = "bird",
  Ant = "ant",
  Cow = "cow",
  Fish = "fish",
}

interface ShowAnimalMessage {
  action: "showAnimal";
  animal: AnimalType;
  animalCnt: number;
  speed: number;
  movement: Movement;
  height: number;
}

interface UpdateAlarmsMessage {
  action: "updateAlarms";
}

type Message = ShowAnimalMessage | UpdateAlarmsMessage;

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
  animal: AnimalType;
  startTime: string;
  endTime: string;
  intervalMinutes: number;
  animalCnt: number;
  animalverseOn: boolean;
  speed: number;
  height: number;
  movement: Movement;
}

const allSyncKeys: (keyof SyncStorage)[] = [
  "animal",
  "startTime",
  "endTime",
  "intervalMinutes",
  "animalCnt",
  "animalverseOn",
  "speed",
  "movement",
  "height",
];

const defaultSyncStorage: SyncStorage = {
  animal: AnimalType.Flappy,
  startTime: new Date().toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }),
  endTime: "",
  intervalMinutes: 5,
  animalCnt: 5,
  animalverseOn: true,
  speed: 100,
  movement: Movement.AroundScreen,
  height: 50,
};

interface AnimalConfig {
  width: number;
  height: number;
  frames: number;
  frameRate: number;
  spriteUrl: string;
}

// Map animal types to their configurations
const animalConfigs: Record<AnimalType, AnimalConfig> = {
  [AnimalType.Flappy]: {
    width: 34,
    height: 24,
    frames: 3,
    frameRate: 6,
    spriteUrl: "src/assets/flappy.svg",
  },
  [AnimalType.Tiger]: {
    width: 74,
    height: 45,
    frames: 7,
    frameRate: 15,
    spriteUrl: "src/assets/tiger.svg",
  },
  [AnimalType.Bird]: {
    // 0.7 aspect ratio
    width: 36,
    height: 52,
    frames: 10,
    frameRate: 12,
    spriteUrl: "src/assets/bird.svg",
  },
  [AnimalType.Ant]: {
    width: 57,
    height: 50,
    frames: 4,
    frameRate: 12,
    spriteUrl: "src/assets/ant.svg",
  },
  [AnimalType.Cow]: {
    width: 69,
    height: 50,
    frames: 8,
    frameRate: 15,
    spriteUrl: "src/assets/cow.svg",
  },
  [AnimalType.Fish]: {
    width: 109,
    height: 50,
    frames: 11,
    frameRate: 11,
    spriteUrl: "src/assets/fish.svg",
  },
};

export {
  AnimalType,
  Movement,
  Message,
  SyncStorage,
  allSyncKeys,
  ShowAnimalMessage,
  UpdateAlarmsMessage,
  defaultSyncStorage,
  Position,
  EdgePositions,
  AnimalConfig,
  animalConfigs,
};
