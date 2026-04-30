type Result =
  | {
      success: null;
      defaultValue: '';
    }
  | {
      success: true;
      defaultValue: '';
    }
  | {
      success: false;
      message: string;
      defaultValue: string;
    };

export const contact = (
  _previousState: Result,
  _: FormData,
): Promise<Result> => {
  return Promise.resolve().then(() => ({
    success: true,
    defaultValue: '',
  }));
};
