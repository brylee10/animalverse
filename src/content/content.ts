import {
  AnimalConfig,
  animalConfigs,
  Movement,
  AnimalType,
  EdgePositions,
  Message,
  Position,
} from "../types";

chrome.runtime.onMessage.addListener(function (
  message: Message,
  sender,
  sendResponse
) {
  if (message.action === "showAnimal") {
    createAndAnimateAnimalType(
      message.animal,
      message.animalCnt,
      message.speed,
      message.movement,
      message.height
    );
  }
});

function createAndAnimateAnimalType(
  animalType: AnimalType,
  animalCnt: number,
  speed: number,
  movement: Movement,
  height: number
): void {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  // all animals start from the same side per render, more organized
  const startFromLeft = Math.random() < 0.5;
  const scale = height / animalConfigs[animalType].height;
  const scaledWidth = animalConfigs[animalType].width * scale;
  for (let i = 0; i < animalCnt; i++) {
    let edgePositions: EdgePositions;

    switch (movement) {
      case Movement.Bottom:
        edgePositions = getBottomEdgePoints(
          windowWidth,
          windowHeight,
          height,
          scaledWidth,
          startFromLeft
        );
        break;
      case Movement.Top:
        edgePositions = getTopEdgePoints(
          windowWidth,
          scaledWidth,
          startFromLeft
        );
        break;
      default:
        edgePositions = getRandomEdgePoints(
          windowWidth,
          windowHeight,
          scaledWidth,
          startFromLeft
        );
        break;
    }
    const startCenter = edgePositions.start;
    const endCenter = edgePositions.end;

    // space out the animals a bit
    setTimeout(() => {
      createAnimal(startCenter, endCenter, i, animalType, speed, height);
    }, i * Math.random() * 500 + 200 * i);
  }
}

function createAnimal(
  startPos: Position,
  endPos: Position,
  index: number,
  animalType: AnimalType,
  speed: number,
  height: number
): void {
  const config = animalConfigs[animalType];
  const origHeight = config.height;
  const scale = height / origHeight;
  const scaledWidth = config.width * scale;

  // animal container
  const animalContainer = document.createElement("div");
  animalContainer.id = `animal-container-${index}`;
  animalContainer.className = "animal-container";
  animalContainer.style.position = "fixed";
  animalContainer.style.zIndex = "9999";
  animalContainer.style.pointerEvents = "none";
  animalContainer.style.width = `${scaledWidth}px`;
  animalContainer.style.height = `${height}px`;
  animalContainer.style.overflow = "hidden";

  // animal sprite
  const animal = document.createElement("div");
  animal.id = `animal-${animalType}-${index}`;
  animal.className = `animal ${animalType}`;
  animal.style.width = `${scaledWidth * config.frames}px`;
  animal.style.height = `${height}px`;
  animal.style.backgroundImage = `url(${chrome.runtime.getURL(
    config.spriteUrl
  )})`;
  animal.style.backgroundRepeat = "no-repeat";
  animal.style.backgroundSize = `${scaledWidth * config.frames}px ${height}px`;

  animalContainer.appendChild(animal);
  document.body.appendChild(animalContainer);

  const variationX = (Math.random() - 0.5) * 15;
  const variationY = (Math.random() - 0.5) * 10;

  animalContainer.style.left = `${startPos.x + variationX}px`;
  animalContainer.style.top = `${startPos.y + variationY}px`;

  // calculate animation duration
  const distance = Math.sqrt(
    Math.pow(endPos.x - startPos.x, 2) + Math.pow(endPos.y - startPos.y, 2)
  );

  // birds have varied speed
  const baseSpeed = speed;
  const randomSpeed = baseSpeed + (Math.random() - 0.5) * 3; // Smaller variation for better formation
  const animationDuration = distance / randomSpeed;

  // Add flip class for right-to-left movement
  if (endPos.x < startPos.x) {
    animalContainer.style.transform = "scaleX(-1)";
  }

  animal.animate(
    [
      { backgroundPosition: "0px 0px" },
      // left shifts the next frame into view
      { backgroundPosition: `-${scaledWidth * config.frames}px 0px` },
    ],
    {
      duration: (1000 / config.frameRate) * config.frames,
      iterations: Infinity,
      easing: "steps(" + config.frames + ")",
    }
  );

  // apply movement animation
  animalContainer.style.transition = `left ${animationDuration}s linear, top ${animationDuration}s linear`;

  // begin the transition after a small delay
  setTimeout(() => {
    animalContainer.style.left = `${endPos.x + variationX}px`;
    animalContainer.style.top = `${endPos.y + variationY}px`;
  }, 50);

  // remove animal after animation completes
  setTimeout(() => {
    if (animalContainer.parentNode === document.body) {
      document.body.removeChild(animalContainer);
    }
  }, animationDuration * 1000 + 500);
}

function getRandomEdgePoints(
  width: number,
  height: number,
  animalWidth: number,
  startFromLeft: boolean
): EdgePositions {
  const leftEdge = {
    x: -animalWidth,
    y: getRandomBetween(0.25, 0.75) * height,
  };
  const rightEdge = {
    x: width + animalWidth,
    y: getRandomBetween(0.25, 0.75) * height,
  };

  const start: Position = startFromLeft ? leftEdge : rightEdge;

  // only support right to left or left to right
  const end: Position = startFromLeft ? rightEdge : leftEdge;

  return { start, end };
}

// get bottom left or bottom right edge points
function getBottomEdgePoints(
  width: number,
  height: number,
  animalHeight: number,
  animalWidth: number,
  startFromLeft: boolean
): EdgePositions {
  // give the animal room to run!
  const bottomLeft = { x: -animalWidth, y: height - animalHeight };
  const bottomRight = { x: width + animalWidth, y: height - animalHeight };

  const start: Position = startFromLeft ? bottomLeft : bottomRight;
  const end: Position = startFromLeft ? bottomRight : bottomLeft;

  return { start, end };
}

function getTopEdgePoints(
  width: number,
  animalWidth: number,
  startFromLeft: boolean
): EdgePositions {
  const topLeft = { x: -animalWidth, y: 0 };
  const topRight = { x: width + animalWidth, y: 0 };

  const start: Position = startFromLeft ? topLeft : topRight;
  const end: Position = startFromLeft ? topRight : topLeft;

  return { start, end };
}

function getRandomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
