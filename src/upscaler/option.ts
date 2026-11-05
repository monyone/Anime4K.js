export type ResolutionMode = {
  type: 'native';
} | {
  type: 'display';
};

export const ResolutionMode = {
  Native(): ResolutionMode {
    return { type: 'native' };
  },
  Display(): ResolutionMode {
    return { type: 'display' };
  },
  Default(): ResolutionMode {
    return this.Native();
  }
};

export type AttachOption = {
  resolution?: ResolutionMode;
};