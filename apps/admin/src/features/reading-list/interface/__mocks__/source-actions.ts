type ActionState = {
  error?: string;
};

export const createSource = (
  _prev: ActionState,
  _formData: FormData,
): Promise<ActionState> => {
  return Promise.resolve({});
};

export const updateSource = (
  _id: number,
  _prev: ActionState,
  _formData: FormData,
): Promise<ActionState> => {
  return Promise.resolve({});
};

export const deleteSource = (_id: number): Promise<ActionState> => {
  return Promise.resolve({});
};
