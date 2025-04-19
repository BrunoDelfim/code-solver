interface WindowSize {
  WIDTH: number;
  HEIGHT: number;
}

interface WindowConfig {
  MAIN: WindowSize;
  SOLUTION: WindowSize;
  API_KEY: WindowSize;
  ABOUT: WindowSize;
}

interface AppConfig {
  VERSION: string;
}

interface Constants {
  APP: AppConfig;
  WINDOW: WindowConfig;
}

export const CONSTANTS: Constants = {
  APP: {
    VERSION: '1.0.3'
  },
  WINDOW: {
    MAIN: {
      WIDTH: 800,
      HEIGHT: 600
    },
    SOLUTION: {
      WIDTH: 800,
      HEIGHT: 600
    },
    API_KEY: {
      WIDTH: 500,
      HEIGHT: 300
    },
    ABOUT: {
      WIDTH: 400,
      HEIGHT: 200
    }
  }
}; 