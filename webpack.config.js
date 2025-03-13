// Work with file and directory paths in a cross platform manner
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  entry: {
    // Input is the JS output of typescript compilation
    content: "./src/content/content.ts",
    background: "./src/background/background.ts",
    popup: "./src/popup/popup.ts",
  },
  output: {
    // Use a relative output path to place files inside dist/src
    filename: (pathData) => {
      if (pathData.chunk.name === "popup") {
        return `src/popup/${pathData.chunk.name}.js`; // Outputs to dist/src/popup/[entry].js
      } else if (pathData.chunk.name === "content") {
        return `src/content/${pathData.chunk.name}.js`; // Outputs to dist/src/content/[entry].js
      } else if (pathData.chunk.name === "background") {
        return `src/background/${pathData.chunk.name}.js`; // Outputs to dist/src/background/[entry].js
      } else {
        return `src/${pathData.chunk.name}.js`; // Default outputs to dist/src/[entry].js
      }
    },
    path: path.resolve(__dirname, "dist"),
  },
  resolve: {
    // Changes lookup order for import resolution
    extensions: [".ts", ".js", ".css"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/, // Handle .ts files
        use: "ts-loader", // Use ts-loader to compile TypeScript
        exclude: /node_modules/,
      },
      {
        test: /\.css$/, // For CSS files
        use: ["style-loader", "css-loader"], // Apply both loaders
      },
    ],
  },
  mode: "production",
  optimization: {
    minimize: true,
  },
};
